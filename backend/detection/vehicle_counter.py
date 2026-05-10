"""
Intelligent Vehicle Counting System.
Aggregates YOLO detections into lane-wise counts, traffic density,
congestion estimation, and emergency vehicle detection.
Returns structured JSON ready for WebSocket broadcast.
"""
import time
import logging
from typing import Dict, Any, List, Optional
from collections import deque

logger = logging.getLogger(__name__)

DIRECTIONS = ["north", "south", "east", "west"]

# Exponential moving average alpha for smoothing density
EMA_ALPHA = 0.3


class VehicleCounter:
    """
    Stateful counter that tracks vehicles per lane across frames.
    Maintains a rolling history for trend detection and smoothed density.
    """

    def __init__(self, history_size: int = 30):
        self._history_size = history_size
        self._lane_history: Dict[str, deque] = {
            d: deque(maxlen=history_size) for d in DIRECTIONS
        }
        self._smoothed_density: Dict[str, float] = {d: 0.0 for d in DIRECTIONS}
        self._total_counted: int = 0
        self._emergency_count: int = 0
        self._frame_count: int = 0
        self._last_update: float = time.time()

    def update(self, yolo_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Consume a raw YOLO detection result and return structured counting JSON.

        Args:
            yolo_result: dict from YOLODetector.detect_vehicles()

        Returns:
            Structured JSON with lane counts, densities, congestion, emergency.
        """
        self._frame_count += 1
        now = time.time()
        elapsed = now - self._last_update
        self._last_update = now

        lane_counts = yolo_result.get("lane_counts", {})
        lane_densities_raw = yolo_result.get("lane_densities", {})
        vehicle_count = yolo_result.get("vehicle_count", 0)
        emergency = yolo_result.get("emergency_detected", False)

        self._total_counted += vehicle_count
        if emergency:
            self._emergency_count += 1

        # Per-lane processing
        per_lane: Dict[str, Dict[str, Any]] = {}
        total_density = 0.0

        for d in DIRECTIONS:
            count = lane_counts.get(d, 0)
            raw_density = lane_densities_raw.get(d, 0.0)

            # Push to history for trend
            self._lane_history[d].append(count)

            # EMA smoothing
            prev = self._smoothed_density[d]
            smoothed = EMA_ALPHA * raw_density + (1 - EMA_ALPHA) * prev
            self._smoothed_density[d] = smoothed

            # Trend: compare last 5 frames to previous 5
            history = list(self._lane_history[d])
            if len(history) >= 10:
                recent = sum(history[-5:]) / 5
                older = sum(history[-10:-5]) / 5
                trend = "increasing" if recent > older + 0.5 else (
                    "decreasing" if recent < older - 0.5 else "stable"
                )
            else:
                trend = "stable"

            # Congestion level: 0-100 based on count + density
            congestion = min(100, int(count * 3.5 + smoothed * 0.8))

            per_lane[d] = {
                "vehicle_count": count,
                "density_percent": round(smoothed, 1),
                "congestion_level": congestion,
                "trend": trend,
                "is_congested": congestion > 65,
            }
            total_density += smoothed

        # Overall metrics
        avg_density = total_density / max(1, len(DIRECTIONS))
        overall_congestion = min(100, int(avg_density * 1.2 + vehicle_count * 1.5))

        # Classify overall status
        if overall_congestion > 80:
            status = "critical"
        elif overall_congestion > 60:
            status = "heavy"
        elif overall_congestion > 35:
            status = "moderate"
        else:
            status = "free_flow"

        return {
            "north_lane": per_lane.get("north", {}).get("vehicle_count", 0),
            "south_lane": per_lane.get("south", {}).get("vehicle_count", 0),
            "east_lane": per_lane.get("east", {}).get("vehicle_count", 0),
            "west_lane": per_lane.get("west", {}).get("vehicle_count", 0),
            "traffic_density": round(avg_density, 1),
            "ambulance_detected": emergency,
            "total_vehicles": vehicle_count,
            "overall_congestion": overall_congestion,
            "status": status,
            "lanes": per_lane,
            "metadata": {
                "frame_number": self._frame_count,
                "total_counted": self._total_counted,
                "emergency_detections": self._emergency_count,
                "processing_fps": round(1.0 / max(0.001, elapsed), 1),
                "inference_ms": yolo_result.get("metadata", {}).get("inference_ms", 0),
            },
        }

    def get_summary(self) -> Dict[str, Any]:
        """Return a lightweight summary without needing a new frame."""
        return {
            "smoothed_densities": {
                d: round(v, 1) for d, v in self._smoothed_density.items()
            },
            "total_frames": self._frame_count,
            "total_counted": self._total_counted,
            "emergency_detections": self._emergency_count,
        }

    def reset(self):
        """Reset all counters and history."""
        for d in DIRECTIONS:
            self._lane_history[d].clear()
            self._smoothed_density[d] = 0.0
        self._total_counted = 0
        self._emergency_count = 0
        self._frame_count = 0
        logger.info("VehicleCounter reset")


# Singleton
vehicle_counter = VehicleCounter()
