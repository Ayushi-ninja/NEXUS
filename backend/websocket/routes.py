"""
WebSocket route handlers — Production-grade.
Clients receive real-time traffic updates and can send commands.
"""
import json
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from websocket.manager import manager
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(tags=["WebSocket"])

VALID_DIRECTIONS = {"north", "south", "east", "west"}
VALID_WEATHER = {"clear", "rain", "fog", "storm", "snow"}


@router.websocket("/ws/traffic")
async def websocket_traffic(websocket: WebSocket):
    """
    Main WebSocket endpoint. Clients receive real-time traffic_update events.

    Supported commands (send as JSON):
      {"command": "ping"}
      {"command": "trigger_emergency", "direction": "north"}
      {"command": "clear_emergency"}
      {"command": "set_demo_density", "value": 95}
      {"command": "set_weather", "condition": "rain", "multiplier": 1.3}
      {"command": "reset"}
      {"command": "get_status"}
    """
    await manager.connect(websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
                command = data.get("command")

                if command == "ping":
                    await manager.send_personal(
                        {"event": "pong", "status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()},
                        websocket,
                    )

                elif command == "trigger_emergency":
                    direction = data.get("direction", "north")
                    if direction not in VALID_DIRECTIONS:
                        await manager.send_personal(
                            {"event": "error", "code": "INVALID_DIRECTION", "message": f"Invalid direction: {direction}"},
                            websocket,
                        )
                        continue
                    manager.trigger_emergency(direction)
                    await manager.broadcast({
                        "event": "emergency_alert",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "payload": {
                            "active": True,
                            "direction": direction,
                            "vehicle_type": "ambulance",
                            "priority_granted": True,
                            "estimated_clearance_secs": 30,
                            "message": f"Emergency vehicle detected on {direction.upper()} approach. Priority signal active.",
                        },
                    })
                    logger.warning("Emergency triggered via WS: direction=%s", direction)

                elif command == "clear_emergency":
                    manager.clear_emergency()
                    await manager.broadcast({
                        "event": "emergency_cleared",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "payload": {"active": False, "message": "Emergency cleared. Normal operation resumed."},
                    })

                elif command == "set_demo_density":
                    value = float(data.get("value", 50))
                    value = max(0.0, min(100.0, value))
                    manager.set_demo_density(value)
                    await manager.send_personal(
                        {"event": "demo_density_set", "value": value},
                        websocket,
                    )

                elif command == "set_weather":
                    condition = data.get("condition", "clear")
                    if condition not in VALID_WEATHER:
                        await manager.send_personal(
                            {"event": "error", "code": "INVALID_WEATHER", "message": f"Invalid weather: {condition}"},
                            websocket,
                        )
                        continue
                    multiplier = float(data.get("multiplier", 1.0))
                    multiplier = max(0.5, min(2.0, multiplier))
                    manager.set_weather(condition, multiplier)
                    await manager.broadcast({
                        "event": "weather_update",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "payload": {
                            "condition": condition,
                            "multiplier": multiplier,
                            "message": f"Weather changed to {condition}. Signal timings adjusted by {multiplier}x.",
                        },
                    })

                elif command == "reset":
                    manager.clear_emergency()
                    manager.set_weather("clear", 1.0)
                    manager.set_demo_density(45.0)
                    await manager.broadcast({
                        "event": "system_reset",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "payload": {"message": "System reset to normal operation."},
                    })

                elif command == "get_status":
                    stats = manager.get_connection_stats()
                    await manager.send_personal(
                        {"event": "status_report", "payload": stats},
                        websocket,
                    )

                else:
                    await manager.send_personal(
                        {"event": "error", "code": "UNKNOWN_COMMAND", "message": f"Unknown command: {command}"},
                        websocket,
                    )

            except json.JSONDecodeError:
                await manager.send_personal(
                    {"event": "error", "code": "INVALID_JSON", "message": "Invalid JSON payload"},
                    websocket,
                )
            except ValueError as e:
                await manager.send_personal(
                    {"event": "error", "code": "INVALID_VALUE", "message": str(e)},
                    websocket,
                )
            except Exception as e:
                logger.error("WS command error: %s", e, exc_info=True)
                await manager.send_personal(
                    {"event": "error", "code": "INTERNAL", "message": "Command processing failed"},
                    websocket,
                )

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error("Unexpected WS error: %s", e, exc_info=True)
        manager.disconnect(websocket)