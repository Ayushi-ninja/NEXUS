"""
Traffic API routes — /api/v1/traffic/...
Includes emergency vehicle detection, density calculation, signal optimization.
"""
import time
import random
from fastapi import APIRouter, Query
from typing import List
from api.schemas import (
    TrafficStatus, TrafficSignal, LaneDensity,
    EmergencyAlert, TrafficPrediction, Direction,
)
from services import traffic_service

router = APIRouter(prefix="/traffic", tags=["Traffic"])

# ── In-memory emergency state (shared with WebSocket broadcast) ──────────────
_emergency_state = {
    "active": False,
    "direction": None,
    "vehicle_type": "ambulance",
    "triggered_at": None,
    "estimated_clearance_secs": 30,
}


def get_emergency_state() -> dict:
    """Returns current emergency state. Called by WebSocket broadcast loop."""
    return _emergency_state


def _auto_clear_emergency():
    """Mark emergency as inactive if clearance time has passed."""
    if _emergency_state["active"] and _emergency_state["triggered_at"]:
        elapsed = time.time() - _emergency_state["triggered_at"]
        if elapsed >= _emergency_state["estimated_clearance_secs"]:
            _emergency_state["active"] = False
            _emergency_state["direction"] = None
            _emergency_state["triggered_at"] = None


# ── Signal optimization based on density ─────────────────────────────────────

def _calculate_green_time(density: float, emergency_active: bool) -> int:
    """
    Dynamic green time:
    - Emergency active → 120 sec priority
    - density > 80    → 60 sec
    - density > 50    → 40 sec
    - else            → 20 sec
    """
    if emergency_active:
        return 120
    if density > 80:
        return 60
    if density > 50:
        return 40
    return 20


# ── YOLO Emergency Detection Helper ──────────────────────────────────────────

EMERGENCY_VEHICLE_CLASSES = {
    "ambulance", "fire truck", "fire engine",
    "police car", "police vehicle", "emergency vehicle",
}


def detect_emergency_from_yolo(detected_class_names: list[str]) -> bool:
    """
    Pass in the list of class names detected by YOLOv8.
    Returns True if any emergency vehicle class is found.
    Usage in your YOLO pipeline:
        detected_names = [model.names[int(box.cls)] for box in results.boxes]
        if detect_emergency_from_yolo(detected_names):
            trigger_emergency_from_yolo("north")
    """
    normalized = {name.lower().strip() for name in detected_class_names}
    return bool(normalized & EMERGENCY_VEHICLE_CLASSES)


def trigger_emergency_from_yolo(direction: str = "north"):
    """
    Call this from your YOLO pipeline when an emergency vehicle is detected.
    This updates the shared state so the WebSocket broadcast reflects it immediately.
    """
    _emergency_state["active"] = True
    _emergency_state["direction"] = direction
    _emergency_state["vehicle_type"] = "ambulance"
    _emergency_state["triggered_at"] = time.time()
    _emergency_state["estimated_clearance_secs"] = 30


# ── Route handlers ────────────────────────────────────────────────────────────

@router.get("/status", response_model=TrafficStatus, summary="Full junction status snapshot")
async def traffic_status(junction_id: str = Query("JCT-001", description="Junction identifier")):
    """
    Returns a complete snapshot of the traffic junction including signal states,
    lane densities, vehicle counts and overall congestion level.
    """
    _auto_clear_emergency()
    return traffic_service.get_traffic_status(junction_id)


@router.get("/signals", response_model=List[TrafficSignal], summary="Current signal states for all directions")
async def traffic_signals():
    """
    Returns the current color, timer and total phase duration for each
    of the four directional traffic signals.
    """
    return traffic_service.get_signals()


@router.get("/density", response_model=List[LaneDensity], summary="Lane-level density metrics")
async def traffic_density():
    """
    Returns vehicle count, density percentage, average speed and congestion
    flag for each approach lane.
    """
    return traffic_service.get_density()


@router.post("/emergency", response_model=EmergencyAlert, summary="Trigger emergency vehicle priority")
async def trigger_emergency(
    direction: Direction = Query("north", description="Direction emergency vehicle is approaching from"),
):
    """
    Grants priority to an emergency vehicle approaching from the given direction.
    Sets green time to 120 seconds. Auto-clears after 30 seconds.
    """
    _emergency_state["active"] = True
    _emergency_state["direction"] = direction
    _emergency_state["vehicle_type"] = "ambulance"
    _emergency_state["triggered_at"] = time.time()
    _emergency_state["estimated_clearance_secs"] = 30

    return traffic_service.trigger_emergency(direction)


@router.delete("/emergency", summary="Manually clear emergency state")
async def clear_emergency():
    """Manually clears the active emergency state."""
    _emergency_state["active"] = False
    _emergency_state["direction"] = None
    _emergency_state["triggered_at"] = None
    # Also clear the traffic_service store so GET /emergency returns active=False
    from services.traffic_service import _EMERGENCY_STORE
    _EMERGENCY_STORE.clear()
    return {"status": "cleared", "message": "Emergency state manually cleared"}


@router.get("/emergency", response_model=EmergencyAlert, summary="Current emergency status")
async def get_emergency():
    """Returns the latest emergency alert status."""
    _auto_clear_emergency()
    return traffic_service.get_active_emergency()


@router.get("/predictions", response_model=List[TrafficPrediction], summary="AI-powered traffic predictions")
async def traffic_predictions():
    """
    Returns AI-generated near-term traffic predictions and signal timing
    recommendations for each approach direction.
    """
    return traffic_service.get_predictions()


@router.get("/forecast", summary="24-hour traffic density forecast")
async def traffic_forecast():
    """
    Returns a simulated 24-hour traffic density forecast.
    Peaks modelled on real-world commute patterns (8-10am, 5-8pm).
    """
    from datetime import datetime
    now_hour = datetime.now().hour

    forecast = []
    for h in range(24):
        if 8 <= h <= 10:
            base = 82 + random.randint(-8, 10)
        elif 17 <= h <= 20:
            base = 91 + random.randint(-5, 7)
        elif 12 <= h <= 14:
            base = 62 + random.randint(-8, 10)
        elif 23 <= h or h <= 5:
            base = 15 + random.randint(-5, 10)
        else:
            base = 38 + random.randint(-10, 15)

        forecast.append({
            "hour": h,
            "label": f"{h:02d}:00",
            "predicted_density": min(max(base, 5), 100),
            "is_current": h == now_hour,
            "is_peak": (8 <= h <= 10) or (17 <= h <= 20),
        })

    peak_hour = max(forecast, key=lambda x: x["predicted_density"])

    return {
        "forecast": forecast,
        "peak_hour": peak_hour["label"],
        "peak_density": peak_hour["predicted_density"],
        "recommendation": f"Pre-optimize signals before {peak_hour['label']} peak. "
                          f"Expected density: {peak_hour['predicted_density']}%",
        "generated_at": datetime.now().isoformat(),
    }