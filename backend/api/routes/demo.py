"""
Demo Mode API — /api/v1/demo/...
Orchestrates a timed, predictable hackathon demo sequence via background tasks.
Fires: congestion spike → AI insight → emergency → weather rain → clear → weather clear
"""
import asyncio
import time
from fastapi import APIRouter, BackgroundTasks
from datetime import datetime, timezone
from websocket.manager import manager, _sim_state
from utils.logger import get_logger

router = APIRouter(prefix="/demo", tags=["Demo"])
logger = get_logger(__name__)

_demo_running = False


async def _run_demo_sequence():
    global _demo_running
    _demo_running = True
    logger.info("Demo sequence started")

    try:
        # T+0: spike congestion to high
        for d in ["north", "south", "east", "west"]:
            _sim_state["densities"][d] = 78.0 + (10 if d in ["north", "east"] else 0)
        await manager.broadcast({
            "event": "demo_event",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": {"step": 1, "message": "Traffic density spike detected on approach corridors."},
        })
        await asyncio.sleep(8)

        # T+8: broadcast AI insight
        await manager.broadcast({
            "event": "ai_insight",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": {
                "insight_id": "DEMO-001",
                "category": "congestion",
                "priority": "high",
                "title": "Congestion Surge Detected",
                "description": "North/East approach density at 88%. Queue spillback imminent. Adaptive phase extension of 18s recommended to clear backlog within 6 minutes.",
                "affected_directions": ["north", "east"],
                "confidence": 0.94,
            },
        })
        await asyncio.sleep(10)

        # T+18: trigger emergency vehicle
        manager.trigger_emergency("north")
        await manager.broadcast({
            "event": "emergency_alert",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": {
                "active": True,
                "direction": "north",
                "vehicle_type": "ambulance",
                "priority_granted": True,
                "estimated_clearance_secs": 30,
                "message": "Ambulance detected 380m on NORTH approach. Priority corridor activated — cross-traffic held. ETA clearance: 28s.",
            },
        })
        await asyncio.sleep(15)

        # T+33: broadcast emergency AI insight
        await manager.broadcast({
            "event": "ai_insight",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": {
                "insight_id": "DEMO-002",
                "category": "emergency",
                "priority": "critical",
                "title": "Emergency Priority Corridor Active",
                "description": "Signal preemption engaged for north approach. Cross-traffic signal hold time: 30s. Downstream signals coordinated for unobstructed corridor.",
                "affected_directions": ["north"],
                "confidence": 0.99,
            },
        })
        await asyncio.sleep(20)

        # T+53: emergency clears, switch to rain weather
        manager.clear_emergency()
        manager.set_weather("rain", 1.3)
        await manager.broadcast({
            "event": "weather_update",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": {
                "condition": "rain",
                "multiplier": 1.3,
                "message": "Precipitation detected (14mm/hr). Signal timings extended ×1.3. Wet-surface advisory active.",
            },
        })
        await asyncio.sleep(8)

        # T+61: AI weather insight
        await manager.broadcast({
            "event": "ai_insight",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": {
                "insight_id": "DEMO-003",
                "category": "weather_adaptation",
                "priority": "high",
                "title": "Wet Surface — Yellow Phase Extended",
                "description": "Precipitation at 14mm/hr increases stopping distance by 40%. Yellow phase extended to 6s. All-red clearance interval added. Speed advisory posted at 30 km/h.",
                "affected_directions": ["north", "south", "east", "west"],
                "confidence": 0.97,
            },
        })
        await asyncio.sleep(20)

        # T+81: normalize density & clear weather
        for d in ["north", "south", "east", "west"]:
            _sim_state["densities"][d] = 35.0
        manager.set_weather("clear", 1.0)
        await manager.broadcast({
            "event": "weather_update",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": {
                "condition": "clear",
                "multiplier": 1.0,
                "message": "Weather cleared. Returning to standard signal timings. Network efficiency optimized.",
            },
        })
        await manager.broadcast({
            "event": "ai_insight",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": {
                "insight_id": "DEMO-004",
                "category": "signal_timing",
                "priority": "medium",
                "title": "Network Optimization Complete",
                "description": "Emergency corridor cleared. Weather normalized. Junction now operating at 94.2% efficiency. Green wave sync achieved on N/S arterial — 67% progression bandwidth.",
                "affected_directions": ["north", "south", "east", "west"],
                "confidence": 0.93,
            },
        })

    except Exception as e:
        logger.error("Demo sequence error: %s", e, exc_info=True)
    finally:
        _demo_running = False
        logger.info("Demo sequence complete")


@router.post("/start", summary="Start hackathon demo sequence")
async def start_demo(background_tasks: BackgroundTasks):
    """
    Triggers a timed, automated demo sequence:
    T+0s  → Congestion spike
    T+8s  → AI congestion insight
    T+18s → Ambulance emergency on North
    T+33s → AI emergency insight
    T+53s → Emergency clears, rain weather
    T+61s → AI weather insight
    T+81s → Normalize & green wave sync insight
    """
    global _demo_running
    if _demo_running:
        return {"status": "already_running", "message": "Demo sequence already in progress."}

    background_tasks.add_task(_run_demo_sequence)
    return {
        "status": "started",
        "message": "Demo sequence initiated. 90-second automated flow active.",
        "steps": [
            {"t": 0,  "event": "congestion_spike"},
            {"t": 8,  "event": "ai_insight_congestion"},
            {"t": 18, "event": "emergency_north"},
            {"t": 33, "event": "ai_insight_emergency"},
            {"t": 53, "event": "weather_rain"},
            {"t": 61, "event": "ai_insight_weather"},
            {"t": 81, "event": "normalize_clear"},
        ],
    }


@router.get("/status", summary="Check demo sequence status")
async def demo_status():
    return {
        "running": _demo_running,
        "sim_densities": _sim_state["densities"],
        "weather": _sim_state["weather_condition"],
        "emergency_active": _sim_state["emergency_active"],
    }


@router.post("/scenario", summary="Force a specific demo scenario")
async def trigger_scenario(scenario: str):
    """
    Force specific demo scenarios: 'traffic_spike', 'ambulance', 'rain_event', 'clear'
    """
    if scenario == "traffic_spike":
        for d in ["north", "south", "east", "west"]:
            _sim_state["densities"][d] = 85.0
        return {"status": "success", "message": "Traffic spike triggered."}
    elif scenario == "ambulance":
        manager.trigger_emergency("north")
        return {"status": "success", "message": "Ambulance triggered on north lane."}
    elif scenario == "rain_event":
        manager.set_weather("rain", 1.3)
        return {"status": "success", "message": "Rain weather event triggered."}
    elif scenario == "clear":
        for d in ["north", "south", "east", "west"]:
            _sim_state["densities"][d] = 35.0
        manager.clear_emergency()
        manager.set_weather("clear", 1.0)
        return {"status": "success", "message": "All conditions cleared."}
    else:
        return {"status": "error", "message": "Unknown scenario"}


@router.post("/reset", summary="Reset simulation to baseline")
async def reset_demo():
    """Reset all state to demo-ready baseline."""
    manager.clear_emergency()
    manager.set_weather("clear", 1.0)
    manager.set_demo_density(42.0)
    await manager.broadcast({
        "event": "system_reset",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "payload": {"message": "System reset. Demo baseline restored."},
    })
    return {"status": "reset", "message": "Simulation reset to baseline."}
