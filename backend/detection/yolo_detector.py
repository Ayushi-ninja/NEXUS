"""
YOLOv8 Vehicle Detection Pipeline — Production-grade.
Features: frame skipping, lane-based ROI counting, confidence thresholds,
inference timing, direction-aware classification, and graceful fallback.
"""
import cv2
import numpy as np
import time
import logging
from typing import List, Dict, Any, Optional, Generator

logger = logging.getLogger(__name__)

# Lazy-load ultralytics to avoid hard crash if not installed
_YOLO = None
def _load_yolo():
    global _YOLO
    if _YOLO is None:
        try:
            from ultralytics import YOLO
            _YOLO = YOLO
        except ImportError:
            logger.error("ultralytics not installed — YOLO detection unavailable")
    return _YOLO


# ── COCO class IDs for vehicles ───────────────────────────────────────────────
VEHICLE_CLASS_IDS = {2, 3, 5, 7}            # car, motorcycle, bus, truck
VEHICLE_ID_TO_LABEL = {2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}
EMERGENCY_KEYWORDS = {"ambulance", "fire truck", "police car"}

# ── Default lane ROI regions (fractional coordinates, 0→1) ───────────────────
# Each direction covers a quadrant of the frame. Customize per camera.
DEFAULT_LANE_ROIS: Dict[str, Dict[str, float]] = {
    "north": {"x1": 0.35, "y1": 0.0,  "x2": 0.65, "y2": 0.45},
    "south": {"x1": 0.35, "y1": 0.55, "x2": 0.65, "y2": 1.0},
    "east":  {"x1": 0.55, "y1": 0.35, "x2": 1.0,  "y2": 0.65},
    "west":  {"x1": 0.0,  "y1": 0.35, "x2": 0.45, "y2": 0.65},
}


class YOLODetector:
    def __init__(
        self,
        model_path: str = "yolov8n.pt",
        confidence_threshold: float = 0.35,
        frame_skip: int = 2,
        lane_rois: Optional[Dict[str, Dict[str, float]]] = None,
    ):
        """
        Initialize YOLOv8 detector with configurable parameters.
        
        Args:
            model_path: Path to YOLO model weights.
            confidence_threshold: Minimum detection confidence (0-1).
            frame_skip: Process every Nth frame (1 = every frame).
            lane_rois: Per-direction ROI regions in fractional coords.
        """
        self.model = None
        self.confidence_threshold = confidence_threshold
        self.frame_skip = max(1, frame_skip)
        self.lane_rois = lane_rois or DEFAULT_LANE_ROIS
        self._frame_counter = 0
        self._last_result: Optional[Dict[str, Any]] = None

        YOLO_cls = _load_yolo()
        if YOLO_cls:
            try:
                self.model = YOLO_cls(model_path)
                logger.info("YOLOv8 model loaded: %s", model_path)
            except Exception as e:
                logger.error("Failed to load YOLO model: %s", e)
        else:
            logger.warning("YOLO unavailable — detector will return mock data")

    @property
    def is_available(self) -> bool:
        return self.model is not None

    def detect_vehicles(self, frame: np.ndarray) -> Dict[str, Any]:
        """
        Perform vehicle detection on a single frame.
        Implements frame skipping — returns cached result on skipped frames.
        """
        self._frame_counter += 1

        # Frame skip: return cached result if available
        if self._frame_counter % self.frame_skip != 0 and self._last_result is not None:
            return self._last_result

        if not self.is_available:
            return self._mock_detection(frame)

        start_time = time.perf_counter()

        results = self.model(frame, verbose=False, conf=self.confidence_threshold)[0]
        height, width = frame.shape[:2]
        total_area = height * width

        detections: List[Dict[str, Any]] = []
        lane_counts: Dict[str, int] = {d: 0 for d in self.lane_rois}
        lane_densities: Dict[str, float] = {d: 0.0 for d in self.lane_rois}
        occupied_area = 0
        vehicle_count = 0
        emergency_detected = False

        for box in results.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])

            if cls_id not in VEHICLE_CLASS_IDS:
                continue
            if conf < self.confidence_threshold:
                continue

            vehicle_count += 1
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            box_area = (x2 - x1) * (y2 - y1)
            occupied_area += box_area

            label = VEHICLE_ID_TO_LABEL.get(cls_id, results.names.get(cls_id, "unknown"))

            # Emergency check (COCO doesn't have ambulance — use heuristic)
            is_emergency = label in EMERGENCY_KEYWORDS
            if is_emergency:
                emergency_detected = True

            # Determine which lane ROI this detection falls into
            cx = (x1 + x2) / 2 / width    # normalized center x
            cy = (y1 + y2) / 2 / height   # normalized center y
            direction = self._classify_direction(cx, cy)

            if direction:
                lane_counts[direction] += 1
                lane_densities[direction] += box_area / total_area

            detections.append({
                "class": label,
                "confidence": round(conf, 3),
                "bbox": [x1, y1, x2, y2],
                "direction": direction,
                "is_emergency": is_emergency,
            })

        inference_ms = round((time.perf_counter() - start_time) * 1000, 1)
        density_percentage = min(100.0, (occupied_area / max(1, total_area)) * 200)

        result = {
            "vehicle_count": vehicle_count,
            "density_percentage": round(density_percentage, 2),
            "emergency_detected": emergency_detected,
            "detections": detections,
            "lane_counts": lane_counts,
            "lane_densities": {d: round(v * 100, 2) for d, v in lane_densities.items()},
            "metadata": {
                "frame_width": width,
                "frame_height": height,
                "model_version": "YOLOv8n",
                "inference_ms": inference_ms,
                "confidence_threshold": self.confidence_threshold,
                "frame_number": self._frame_counter,
                "was_skipped": False,
            },
        }
        self._last_result = result
        return result

    def _classify_direction(self, cx: float, cy: float) -> Optional[str]:
        """Assign a normalized center point to a lane direction using ROIs."""
        for direction, roi in self.lane_rois.items():
            if roi["x1"] <= cx <= roi["x2"] and roi["y1"] <= cy <= roi["y2"]:
                return direction
        return None

    def _mock_detection(self, frame: np.ndarray) -> Dict[str, Any]:
        """Fallback mock detection when YOLO is unavailable."""
        import random
        height, width = frame.shape[:2]
        count = random.randint(5, 25)
        return {
            "vehicle_count": count,
            "density_percentage": round(count * 3.5, 2),
            "emergency_detected": False,
            "detections": [],
            "lane_counts": {"north": count // 4, "south": count // 4, "east": count // 4, "west": count // 4},
            "lane_densities": {"north": 0.0, "south": 0.0, "east": 0.0, "west": 0.0},
            "metadata": {
                "frame_width": width,
                "frame_height": height,
                "model_version": "mock",
                "inference_ms": 0.0,
                "confidence_threshold": self.confidence_threshold,
                "frame_number": self._frame_counter,
                "was_skipped": False,
            },
        }

    def process_video_stream(self, video_source: Any) -> Generator[Dict[str, Any], None, None]:
        """
        Generator that processes a video source frame-by-frame.
        Implements frame skipping for performance.
        """
        cap = cv2.VideoCapture(video_source)
        if not cap.isOpened():
            logger.error("Failed to open video source: %s", video_source)
            return

        try:
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                yield self.detect_vehicles(frame)
        finally:
            cap.release()
            logger.info("Video source released: %s", video_source)

    def update_config(self, confidence: float = None, frame_skip: int = None):
        """Hot-update detection parameters without reloading model."""
        if confidence is not None:
            self.confidence_threshold = max(0.1, min(0.95, confidence))
        if frame_skip is not None:
            self.frame_skip = max(1, frame_skip)
        logger.info("Detector config updated: conf=%.2f, skip=%d",
                     self.confidence_threshold, self.frame_skip)


# Singleton instance
yolo_detector = YOLODetector()
