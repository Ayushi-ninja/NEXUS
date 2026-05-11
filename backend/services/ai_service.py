"""
AI recommendations service using Google Gemini — Enterprise-grade.
Generates context-aware, data-driven traffic management recommendations
with structured prompting and robust fallback.
"""
import uuid
import json
import random
from datetime import datetime, timezone
from typing import List, Optional
from api.schemas import AIRecommendation, Direction, TrafficStatus, WeatherData, EmergencyAlert
from config.settings import get_settings
from utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()

# ── Lazy Gemini initialization (google-genai SDK) ────────────────────────────
_genai_client = None

def _init_gemini():
    global _genai_client
    if _genai_client is not None:
        return
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not set — AI recommendations will use mock data.")
        return
    try:
        from google import genai
        _genai_client = genai.Client(api_key=settings.GEMINI_API_KEY)
        logger.info("Gemini AI client initialized (google-genai SDK, gemini-1.5-flash)")
    except ImportError:
        logger.warning("google-genai package not installed — falling back to mock data")
    except Exception as e:
        logger.error("Failed to initialize Gemini: %s", e)

_init_gemini()

# ── Rich mock recommendation pool ────────────────────────────────────────────
_MOCK_RECOMMENDATIONS = [
    {
        "category": "signal_timing",
        "priority": "high",
        "title": "Asymmetric Phase Optimization — North Corridor",
        "description": "Inbound flow density at 82.4% (saturated). Real-time queue modeling suggests a 14s green extension for North approach to prevent upstream spillback.",
        "affected_directions": ["north"],
        "suggested_action": "Extend North Phase 1 Green to 48s. Implement lead-lag left turn phasing to clear intersection core.",
        "expected_improvement_percent": 24.8,
    },
    {
        "category": "congestion",
        "priority": "medium",
        "title": "Predictive Bottleneck Mitigation — East Arterial",
        "description": "Downstream occupancy sensors indicate secondary congestion building. Proactive inflow gating recommended to maintain mainline progression.",
        "affected_directions": ["east"],
        "suggested_action": "Reduce East green bandwidth by 15%. Deploy VMS advisory: 'CONGESTION AHEAD — USE ALTERNATE ROUTE'.",
        "expected_improvement_percent": 14.2,
    },
    {
        "category": "weather_adaptation",
        "priority": "high",
        "title": "Precipitation Protocol — Safety Buffer Extension",
        "description": "Active rain sensors reporting 15mm/hr. Calculated friction coefficient reduced by 40%. Signal timing must account for increased braking distance.",
        "affected_directions": ["north", "south", "east", "west"],
        "suggested_action": "Enforce 6.5s Yellow phase + 2.5s All-Red clearance. Activate synchronized flashing caution beacons on all approaches.",
        "expected_improvement_percent": 38.5,
    },
    {
        "category": "emergency",
        "priority": "critical",
        "title": "Emergency Preemption — Priority Corridor Alpha",
        "description": "Class-1 Emergency vehicle identified 350m from junction. Signal controller must grant immediate right-of-way for secure passage.",
        "affected_directions": ["south"],
        "suggested_action": "Force-terminate current phase. Transition South approach to Green in <2s. Hold all pedestrian phases (Don't Walk).",
        "expected_improvement_percent": 98.0,
    },
    {
        "category": "signal_timing",
        "priority": "medium",
        "title": "Dynamic Cycle Compression — Low Demand",
        "description": "System-wide occupancy dropped below 15%. Transitioning to short-cycle mode to minimize delay for isolated arrivals.",
        "affected_directions": ["north", "south", "east", "west"],
        "suggested_action": "Reduce cycle length to 60s. Enable fully actuated mode: skip phases with zero vehicle presence.",
        "expected_improvement_percent": 32.1,
    },
]


async def get_ai_recommendations(
    traffic_status: Optional[TrafficStatus] = None,
    weather_data: Optional[WeatherData] = None,
    emergency_alert: Optional[EmergencyAlert] = None,
    limit: int = 3
) -> List[AIRecommendation]:
    """
    Generates AI-powered traffic recommendations using Gemini or mock fallback.
    """
    if not _genai_client or not settings.GEMINI_API_KEY:
        return _get_mock_recommendations(limit)

    try:
        context = _build_context(traffic_status, weather_data, emergency_alert)
        prompt = _build_prompt(context, limit)

        response = await _genai_client.aio.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
        )
        raw_text = response.text.strip()

        # Strip markdown code fences
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        raw_text = raw_text.strip()

        recommendations_data = json.loads(raw_text)

        return [
            AIRecommendation(
                recommendation_id=str(uuid.uuid4())[:8].upper(),
                timestamp=datetime.now(timezone.utc),
                **rec
            )
            for rec in recommendations_data[:limit]
        ]

    except Exception as e:
        logger.error("Gemini AI call failed: %s", e, exc_info=True)
        return _get_mock_recommendations(limit)


def _build_context(
    traffic_status: Optional[TrafficStatus],
    weather_data: Optional[WeatherData],
    emergency_alert: Optional[EmergencyAlert],
) -> dict:
    """Assemble structured context for the prompt."""
    ctx: dict = {}
    if traffic_status:
        ctx["traffic_telemetry"] = {
            "junction_id": traffic_status.junction_id,
            "occupancy_total": traffic_status.total_vehicles,
            "saturation_index": traffic_status.overall_congestion_percent,
            "flow_rate_per_min": traffic_status.throughput_per_minute,
            "controller_status": [s.model_dump() for s in traffic_status.signals],
            "lane_density_metrics": [d.model_dump() for d in traffic_status.density],
        }
    else:
        ctx["traffic_telemetry"] = "INSUFFICIENT_DATA"

    if weather_data:
        ctx["environmental_sensors"] = weather_data.model_dump()
    else:
        ctx["environmental_sensors"] = {"condition": "nominal", "visibility": "clear"}

    if emergency_alert and emergency_alert.active:
        ctx["active_priority_events"] = emergency_alert.model_dump()
    else:
        ctx["active_priority_events"] = "NULL"

    return ctx


def _build_prompt(context: dict, limit: int) -> str:
    """Construct an enterprise-grade structured prompt for Gemini."""
    return f"""You are **SmartCity Intelligence OS (v4.0)**, a mission-critical AI engine responsible for the real-time optimization of urban traffic infrastructure. You are currently monitoring a high-capacity 4-way intelligent junction.

### INPUT TELEMETRY DATA:
{json.dumps(context, indent=2, default=str)}

### OPERATIONAL OBJECTIVES:
1. **Maximize Throughput**: Minimize intersection delay and maximize vehicle progression.
2. **Safety First**: Proactively mitigate risks from weather and congestion spillback.
3. **Emergency Preemption**: Ensure 100% unimpeded passage for emergency vehicles.
4. **Adaptive Optimization**: Adjust cycle lengths and phase offsets based on dynamic demand.

### TASK:
Generate exactly **{limit}** data-driven, technical recommendations.

### JSON RESPONSE SCHEMA:
```json
[
  {{
    "category": "signal_timing" | "emergency" | "congestion" | "weather_adaptation",
    "priority": "low" | "medium" | "high" | "critical",
    "title": "<Technical, authoritative title — e.g., 'Phase 2 Green Extension Protocol'>",
    "description": "<Concise engineering justification referencing specific telemetry values. Use professional terminology like 'saturation flow', 'platoon arrival', 'spillback probability'.>",
    "affected_directions": ["north"|"south"|"east"|"west"],
    "suggested_action": "<Specific, actionable controller command with numeric parameters (e.g., 'Increase Phase 1 Green by 12s')>",
    "expected_improvement_percent": <float 5.0-95.0>,
    "confidence": <float 0.85-0.99>
  }}
]
```

### CONSTRAINTS:
- No prose. No conversational filler.
- Return ONLY the raw JSON array.
- Ensure technical accuracy for smart city infrastructure context."""


def _get_mock_recommendations(limit: int) -> List[AIRecommendation]:
    """Fallback when Gemini is unavailable — returns realistic mock data."""
    logger.debug("Generating %d mock AI recommendations", limit)
    pool = list(_MOCK_RECOMMENDATIONS)
    random.shuffle(pool)
    selected = pool[:min(limit, len(pool))]
    return [
        AIRecommendation(
            recommendation_id=str(uuid.uuid4())[:8].upper(),
            confidence=round(random.uniform(0.78, 0.97), 2),
            timestamp=datetime.now(timezone.utc),
            **rec,
        )
        for rec in selected
    ]
