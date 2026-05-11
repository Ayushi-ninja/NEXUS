"""
Detection service — Wraps YOLOv8 pipeline with lane-aware analysis,
hot-config updates, and detailed status reporting.
"""
from detection.yolo_detector import yolo_detector
import cv2
import numpy as np
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class DetectionService:
    def __init__(self):
        self.detector = yolo_detector

    async def analyze_frame(self, frame_bytes: bytes) -> Dict[str, Any]:
        """
        Analyze a raw frame from a camera or video stream.
        Returns per-lane counts, densities, detections, and metadata.
        """
        nparr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            return {"error": "Invalid frame data", "vehicle_count": 0}

        result = self.detector.detect_vehicles(frame)

        # Enrich with summary per lane for the frontend
        result["summary"] = {
            "total": result["vehicle_count"],
            "by_direction": result.get("lane_counts", {}),
            "emergency": result["emergency_detected"],
        }
        return result

    def update_config(
        self,
        confidence: Optional[float] = None,
        frame_skip: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Hot-update detector parameters."""
        self.detector.update_config(confidence=confidence, frame_skip=frame_skip)
        return self.get_detector_info()

    def get_detector_info(self) -> Dict[str, Any]:
        return {
            "model": "YOLOv8 Nano",
            "task": "Vehicle & Emergency Detection",
            "status": "operational" if self.detector.is_available else "mock_mode",
            "confidence_threshold": self.detector.confidence_threshold,
            "frame_skip": self.detector.frame_skip,
        }


detection_service = DetectionService()
