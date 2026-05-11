"""
WebSocket connection manager — Production-grade.
Handles broadcasting real-time simulation events to all connected clients.
Includes realistic signal phases (green→yellow→red), emergency vehicle state,
weather adaptation, AI insight broadcasts, and connection health tracking.
"""
import asyncio
import json
import random
import time
import uuid
from datetime import datetime, timezone
from typing import Set, Dict, Any, Optional
from fastapi import WebSocket, WebSocketDisconnect
from utils.logger import get_logger
from config.settings import get_settings
from traffic_logic.signal_optimizer import (
    SignalOptimizer, LaneTelemetry, WeatherCondition as OptWeather,
)

logger = get_logger(__name__)
settings = get_settings()

# ── Constants ─────────────────────────────────────────────────────────────────
DIRECTIONS = ["north", "south", "east", "west"]
YELLOW_DURATION = 4          # seconds of yellow before switching to red
AI_INSIGHT_INTERVAL = 15     # broadcast an AI insight every N ticks
HEARTBEAT_INTERVAL = 30      # seconds between server-side heartbeats

WEATHER_MAP: Dict[str, OptWeather] = {
    "clear": OptWeather.CLEAR,
    "rain": OptWeather.RAIN,
    "fog": OptWeather.FOG,
    "storm": OptWeather.STORM,
    "snow": OptWeather.SNOW,
}

# ── Signal optimizer singleton ────────────────────────────────────────────────
_optimizer = SignalOptimizer()

# ── AI Detection integration ──────────────────────────────────────────────────
import cv2
from detection.yolo_detector import yolo_detector

# Path to the demo video used for real-time AI analytics simulation
DEMO_VIDEO_PATH = "static/demo_traffic.mp4"
_cap = cv2.VideoCapture(DEMO_VIDEO_PATH)

def _get_next_frame():
    """Read next frame from demo video, loop if EOF."""
    global _cap
    if not _cap.isOpened():
        _cap = cv2.VideoCapture(DEMO_VIDEO_PATH)
    
    ret, frame = _cap.read()
    if not ret:
        _cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        ret, frame = _cap.read()
    return frame

# ── Shared simulation state ───────────────────────────────────────────────────
_sim_state: Dict[str, Any] = {
    "densities": {"north": 45.0, "south": 38.0, "east": 62.0, "west": 30.0},
    "vehicle_counts": {"north": 22, "south": 19, "east": 31, "west": 15},
    # Signal phase tracking — supports green → yellow → red cycle per direction
    "signal_colors": {"north": "green", "south": "green", "east": "red", "west": "red"},
    "signal_timers": {"north": 20, "south": 20, "east": 24, "west": 24},
    "active_direction": "north",
    "phase_tick": 0,
    "emergency_active": False,
    "emergency_direction": None,
    "emergency_triggered_at": None,
    "weather_multiplier": 1.0,
    "weather_condition": "clear",
    "total_vehicles": 0,
    "avg_speed": 42,
    "throughput": 0,
    "tick_counter": 0,           # global tick counter for periodic events
}

# ── Pre-built AI insight templates for periodic broadcast ─────────────────────
_AI_INSIGHT_POOL = [
    {"category": "signal_timing", "title": "Adaptive Phase Extension", "description": "AI detected sustained high density. Extending green phase to clear backlog."},
    {"category": "congestion", "title": "Congestion Forming", "description": "Density rising above 70% threshold on approach lane. Consider pre-emptive phase switch."},
    {"category": "weather_adaptation", "title": "Weather Safety Adjustment", "description": "Wet-surface conditions detected. Yellow phase buffer extended for braking safety."},
    {"category": "signal_timing", "title": "Off-Peak Optimization", "description": "Low overall traffic detected. Switching to shorter cycle times for efficiency."},
    {"category": "congestion", "title": "Queue Spillback Warning", "description": "Vehicle queue approaching upstream intersection. Coordinated signal recommended."},
    {"category": "emergency", "title": "Priority Corridor Active", "description": "Emergency vehicle corridor established. Cross-traffic held until clearance."},
    {"category": "signal_timing", "title": "Green Wave Sync", "description": "Arterial coordination achieved. Vehicles experience reduced stops on primary corridor."},
    {"category": "weather_adaptation", "title": "Visibility Alert", "description": "Fog reducing visibility below 200m. Speed advisory and extended clearance intervals active."},
]


# ── Simulation helpers ────────────────────────────────────────────────────────

def _get_green_time(density: float) -> int:
    """Dynamic green time based on density — smoother curve."""
    base = 15 + int((density / 100) * 50)
    return max(15, min(65, base))


def _apply_weather_multiplier(green_time: int, multiplier: float) -> int:
    """Extend green time during bad weather."""
    return min(int(green_time * multiplier), 120)


def _update_densities():
    """Simulate realistic density fluctuations each tick with momentum."""
    for direction in DIRECTIONS:
        current = _sim_state["densities"][direction]
        # Weighted random walk: tends toward mean reversion around 45
        mean_pull = (45.0 - current) * 0.02
        delta = random.uniform(-3.5, 3.5) + mean_pull
        new_val = max(5.0, min(98.0, current + delta))
        _sim_state["densities"][direction] = round(new_val, 1)
        _sim_state["vehicle_counts"][direction] = max(1, int(new_val / 2))


def _check_auto_clear_emergency():
    """Auto-clear emergency after configured seconds."""
    if _sim_state["emergency_active"] and _sim_state["emergency_triggered_at"]:
        elapsed = time.time() - _sim_state["emergency_triggered_at"]
        if elapsed >= settings.EMERGENCY_CLEAR_SECS:
            _sim_state["emergency_active"] = False
            _sim_state["emergency_direction"] = None
            _sim_state["emergency_triggered_at"] = None
            logger.info("Emergency auto-cleared after %ds", settings.EMERGENCY_CLEAR_SECS)


def _run_optimizer() -> Optional[str]:
    """Run SignalOptimizer to pick the best next green direction."""
    telemetry = []
    weather_key = _sim_state["weather_condition"]
    opt_weather = WEATHER_MAP.get(weather_key, OptWeather.CLEAR)

    for d in DIRECTIONS:
        density_frac = _sim_state["densities"][d] / 100.0
        telemetry.append(LaneTelemetry(
            lane_id=d,
            vehicle_count=_sim_state["vehicle_counts"][d],
            density=density_frac,
            avg_speed=max(5.0, 60.0 - density_frac * 50),
            has_emergency=(_sim_state["emergency_active"] and _sim_state["emergency_direction"] == d),
        ))

    results = _optimizer.optimize(telemetry, weather=opt_weather)
    green_lane = next((r for r in results if r.state.value == "green"), None)
    return green_lane.lane_id if green_lane else None


def _advance_signals():
    """Advance signal timers by 1 tick with proper green→yellow→red cycling."""
    colors = _sim_state["signal_colors"]
    timers = _sim_state["signal_timers"]
    emergency_active = _sim_state["emergency_active"]
    emergency_dir = _sim_state["emergency_direction"]

    # If emergency, force emergency direction green and all others red
    if emergency_active and emergency_dir:
        for d in DIRECTIONS:
            if d == emergency_dir:
                colors[d] = "green"
                elapsed = time.time() - (_sim_state["emergency_triggered_at"] or time.time())
                timers[d] = max(1, settings.EMERGENCY_CLEAR_SECS - int(elapsed))
            else:
                colors[d] = "red"
                timers[d] = max(1, settings.EMERGENCY_CLEAR_SECS - int(
                    time.time() - (_sim_state["emergency_triggered_at"] or time.time())
                ))
        return

    # Normal phase advancement
    for d in DIRECTIONS:
        timers[d] = max(0, timers[d] - 1)

        if timers[d] <= 0:
            current_color = colors[d]
            if current_color == "green":
                colors[d] = "yellow"
                timers[d] = YELLOW_DURATION
            elif current_color == "yellow":
                colors[d] = "red"
                # Red timer = wait for the next green cycle
                density = _sim_state["densities"][d]
                timers[d] = _apply_weather_multiplier(
                    _get_green_time(density), _sim_state["weather_multiplier"]
                )
            elif current_color == "red":
                # Use optimizer to pick who gets green next
                best_dir = _run_optimizer()
                if best_dir == d:
                    colors[d] = "green"
                    density = _sim_state["densities"][d]
                    timers[d] = _apply_weather_multiplier(
                        _get_green_time(density), _sim_state["weather_multiplier"]
                    )
                    _sim_state["active_direction"] = d
                else:
                    # Stay red, reset timer for re-check
                    timers[d] = 5 + random.randint(0, 5)


def _build_ai_insight() -> dict:
    """Generate a periodic AI insight broadcast event."""
    template = random.choice(_AI_INSIGHT_POOL)
    densities = _sim_state["densities"]
    busiest = max(DIRECTIONS, key=lambda d: densities[d])

    return {
        "event": "ai_insight",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "payload": {
            "insight_id": str(uuid.uuid4())[:8].upper(),
            "category": template["category"],
            "priority": "high" if densities[busiest] > 70 else "medium",
            "title": template["title"],
            "description": template["description"],
            "affected_directions": [busiest],
            "confidence": round(random.uniform(0.78, 0.97), 2),
            "busiest_direction": busiest,
            "busiest_density": densities[busiest],
        },
    }


def _build_broadcast_payload() -> dict:
    """Assemble the full payload sent to all WebSocket clients every tick."""
    _update_densities()
    _check_auto_clear_emergency()
    _advance_signals()

    densities = _sim_state["densities"]
    counts = _sim_state["vehicle_counts"]
    colors = _sim_state["signal_colors"]
    timers = _sim_state["signal_timers"]
    emergency_active = _sim_state["emergency_active"]
    emergency_dir = _sim_state["emergency_direction"]
    weather_mult = _sim_state["weather_multiplier"]
    active_dir = _sim_state["active_direction"]

    # Build signals for each direction
    signals = {}
    for d in DIRECTIONS:
        green_time = _apply_weather_multiplier(
            _get_green_time(densities[d]), weather_mult
        )
        signals[d] = {
            "color": colors[d],
            "timer": timers[d],
            "green_time": green_time,
        }

    # Overall stats
    total_vehicles = sum(counts.values())
    avg_density = sum(densities.values()) / len(densities)
    congestion_level = round(avg_density, 1)
    avg_speed = max(10, int(60 - (avg_density * 0.4)))
    throughput = int(total_vehicles * (avg_speed / 60))

    _sim_state["total_vehicles"] = total_vehicles
    _sim_state["avg_speed"] = avg_speed
    _sim_state["throughput"] = throughput

    # Emergency time remaining
    emergency_time_remaining = 0
    if emergency_active and _sim_state["emergency_triggered_at"]:
        elapsed = time.time() - _sim_state["emergency_triggered_at"]
        emergency_time_remaining = max(0, int(settings.EMERGENCY_CLEAR_SECS - elapsed))

    # Consolidate per-lane metrics to reduce redundancy
    lane_metrics = {}
    for d in DIRECTIONS:
        density = densities[d]
        lane_metrics[d] = {
            "density": density,
            "count": counts[d],
            "congestion": min(100, int(density * 1.1 + counts[d] * 1.4)),
            "signal": colors[d],
            "timer": timers[d],
            "trend": "up" if density > 55 else ("down" if density < 30 else "stable")
        }

    return {
        "event": "traffic_update",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "payload": {
            "junction_id": "JUNCTION_ALPHA_01",
            "lanes": lane_metrics,
            "stats": {
                "total_vehicles": total_vehicles,
                "congestion_level": congestion_level,
                "avg_speed": avg_speed,
                "throughput": throughput,
            },
            "emergency": {
                "active": emergency_active,
                "direction": emergency_dir,
                "time_remaining": emergency_time_remaining,
            },
            "weather": {
                "condition": _sim_state["weather_condition"],
                "multiplier": weather_mult,
            },
            "active_direction": active_dir,
        },
    }


# ── Connection Manager ────────────────────────────────────────────────────────

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self._conn_health: Dict[WebSocket, Dict[str, Any]] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        self._conn_health[websocket] = {
            "connected_at": time.time(),
            "last_pong": time.time(),
            "errors": 0,
        }
        logger.info("WS client connected. Total: %d", len(self.active_connections))

        # Send initial state snapshot so client doesn't wait for next tick
        try:
            snapshot = _build_broadcast_payload()
            snapshot["event"] = "initial_state"
            await websocket.send_text(json.dumps(snapshot))
        except Exception as e:
            logger.warning("Failed to send initial state: %s", e)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        self._conn_health.pop(websocket, None)
        logger.info("WS client disconnected. Total: %d", len(self.active_connections))

    async def send_personal(self, data: dict, websocket: WebSocket):
        try:
            await websocket.send_text(json.dumps(data))
        except Exception as e:
            logger.warning("Failed to send personal message: %s", e)
            self._record_error(websocket)

    async def broadcast(self, data: dict):
        if not self.active_connections:
            return
        message = json.dumps(data)
        dead: Set[WebSocket] = set()
        for ws in list(self.active_connections):
            try:
                await ws.send_text(message)
            except Exception:
                self._record_error(ws)
                if self._should_drop(ws):
                    dead.add(ws)
        for ws in dead:
            self.disconnect(ws)
            logger.warning("Dropped unhealthy WS connection (too many errors)")

    def _record_error(self, ws: WebSocket):
        health = self._conn_health.get(ws)
        if health:
            health["errors"] += 1

    def _should_drop(self, ws: WebSocket) -> bool:
        """Drop connection after 5 consecutive errors."""
        health = self._conn_health.get(ws)
        return health is not None and health["errors"] >= 5

    def trigger_emergency(self, direction: str):
        """Called from WebSocket command handler to set emergency state."""
        _sim_state["emergency_active"] = True
        _sim_state["emergency_direction"] = direction
        _sim_state["emergency_triggered_at"] = time.time()
        logger.warning("Emergency triggered via WS: direction=%s", direction)

    def clear_emergency(self):
        """Manually clear emergency state."""
        _sim_state["emergency_active"] = False
        _sim_state["emergency_direction"] = None
        _sim_state["emergency_triggered_at"] = None

    def set_weather(self, condition: str, multiplier: float):
        """Update weather state from external source."""
        _sim_state["weather_condition"] = condition
        _sim_state["weather_multiplier"] = multiplier

    def set_demo_density(self, value: float):
        """Demo mode: set all densities to a specific value."""
        for d in DIRECTIONS:
            _sim_state["densities"][d] = value

    def get_connection_stats(self) -> dict:
        """Diagnostics endpoint data."""
        return {
            "active_connections": len(self.active_connections),
            "total_vehicles": _sim_state["total_vehicles"],
            "weather": _sim_state["weather_condition"],
            "emergency_active": _sim_state["emergency_active"],
        }


manager = ConnectionManager()


async def simulation_broadcast_loop():
    """
    Background task — broadcasts a traffic update to all connected clients
    every SIMULATION_TICK_MS milliseconds.
    Also sends periodic AI insight events.
    """
    tick_seconds = settings.SIMULATION_TICK_MS / 1000.0
    logger.info("Simulation broadcast loop started (tick=%.1fs)", tick_seconds)
    while True:
        try:
            if manager.active_connections:
                payload = _build_broadcast_payload()
                await manager.broadcast(payload)

                # Periodic AI insight broadcast
                _sim_state["tick_counter"] += 1
                if _sim_state["tick_counter"] % AI_INSIGHT_INTERVAL == 0:
                    insight = _build_ai_insight()
                    await manager.broadcast(insight)

        except Exception as e:
            logger.error("Broadcast error: %s", e, exc_info=True)
        await asyncio.sleep(tick_seconds)