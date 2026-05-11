"""
Traffic Processor — Orchestration Pipeline.
Ties together: YOLOv8 detection → Vehicle counting → Signal optimization → WS broadcast.
Supports: video file, webcam, uploaded image, or simulated input.
Designed for hackathon demo: stable, CPU-friendly, visually impressive.
"""
import cv2
import asyncio
import time
import logging
import numpy as np
from typing import Optional, Dict, Any, AsyncGenerator
from pathlib import Path

from detection.yolo_detector import yolo_detector
from detection.vehicle_counter import vehicle_counter

logger = logging.getLogger(__name__)

# Default demo video path (place a traffic video here for demo)
DEFAULT_VIDEO = Path(__file__).parent.parent / "static" / "demo_traffic.mp4"


class TrafficProcessor:
    """
    Async-capable traffic processing pipeline.
    Reads frames → runs YOLO → counts vehicles → yields structured results.
    """

    def __init__(
        self,
        target_fps: int = 10,
        resize_width: int = 640,
    ):
        self.target_fps = target_fps
        self.resize_width = resize_width
        self._running = False
        self._cap: Optional[cv2.VideoCapture] = None
        self._last_result: Optional[Dict[str, Any]] = None
        self._frame_count = 0

    @property
    def is_running(self) -> bool:
        return self._running

    @property
    def last_result(self) -> Optional[Dict[str, Any]]:
        return self._last_result

    def process_frame(self, frame: np.ndarray) -> Dict[str, Any]:
        """
        Process a single frame through the full pipeline:
        1. Resize for performance
        2. Run YOLO detection
        3. Run vehicle counter
        4. Return structured result
        """
        self._frame_count += 1

        # Resize for performance
        h, w = frame.shape[:2]
        if w > self.resize_width:
            scale = self.resize_width / w
            frame = cv2.resize(frame, (self.resize_width, int(h * scale)))

        # YOLO detection
        detection = yolo_detector.detect_vehicles(frame)

        # Vehicle counting
        count_result = vehicle_counter.update(detection)

        # Merge detection details into count result
        result = {
            **count_result,
            "detections": detection.get("detections", [])[:20],  # Cap for WS bandwidth
            "detection_metadata": detection.get("metadata", {}),
        }

        self._last_result = result
        return result

    def process_image(self, image_path: str) -> Dict[str, Any]:
        """Process a single image file."""
        frame = cv2.imread(image_path)
        if frame is None:
            raise ValueError(f"Could not read image: {image_path}")
        return self.process_frame(frame)

    def process_image_bytes(self, image_bytes: bytes) -> Dict[str, Any]:
        """Process image from raw bytes (upload endpoint)."""
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Could not decode image bytes")
        return self.process_frame(frame)

    async def process_video_async(
        self,
        source: Any = 0,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Async generator that processes a video source frame-by-frame.
        Yields structured count results at target_fps.

        Args:
            source: Video file path, webcam index (0), or URL.
        """
        self._cap = cv2.VideoCapture(source)
        if not self._cap.isOpened():
            logger.error("Failed to open video source: %s", source)
            return

        self._running = True
        frame_interval = 1.0 / self.target_fps
        logger.info("TrafficProcessor started on source: %s (target %d FPS)", source, self.target_fps)

        try:
            while self._running and self._cap.isOpened():
                start = time.perf_counter()

                ret, frame = self._cap.read()
                if not ret:
                    # Loop video for demo
                    self._cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    ret, frame = self._cap.read()
                    if not ret:
                        break

                result = self.process_frame(frame)
                yield result

                # Throttle to target FPS
                elapsed = time.perf_counter() - start
                sleep_time = max(0, frame_interval - elapsed)
                if sleep_time > 0:
                    await asyncio.sleep(sleep_time)
                else:
                    # Yield to event loop even if behind
                    await asyncio.sleep(0)

        finally:
            self.stop()

    def stop(self):
        """Stop processing and release resources."""
        self._running = False
        if self._cap is not None:
            self._cap.release()
            self._cap = None
        logger.info("TrafficProcessor stopped (processed %d frames)", self._frame_count)

    def get_annotated_frame(self, frame: np.ndarray) -> np.ndarray:
        """
        Draw bounding boxes on frame for visual output.
        Returns annotated frame (for streaming endpoint or debug).
        """
        if self._last_result is None:
            return frame

        annotated = frame.copy()
        detections = self._last_result.get("detections", [])

        for det in detections:
            bbox = det.get("bbox", [])
            if len(bbox) != 4:
                continue
            x1, y1, x2, y2 = bbox
            label = det.get("class", "vehicle")
            conf = det.get("confidence", 0)
            is_emg = det.get("is_emergency", False)

            # Custom colors per class (BGR format for OpenCV)
            if is_emg:
                color = (0, 0, 255)  # Red
                border_thick = 4
            elif label == "car":
                color = (255, 212, 0)  # Cyan-ish blue (BGR)
                border_thick = 2
            elif label in ["truck", "bus"]:
                color = (0, 165, 255)  # Orange
                border_thick = 2
            else:
                color = (0, 255, 0)  # Green
                border_thick = 2

            # Draw glowing/thick box for emergency
            if is_emg:
                cv2.rectangle(annotated, (x1-2, y1-2), (x2+2, y2+2), (0, 0, 200), 6) # Outer glow
                
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, border_thick)
            
            text = f"{label.upper()} {conf:.0%}"
            (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            
            # Label background
            cv2.rectangle(annotated, (x1, y1 - 20), (x1 + tw + 6, y1), color, -1)
            cv2.putText(
                annotated, text, (x1 + 3, y1 - 6),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA
            )

        # Overlay stats with enterprise styling
        stats_text = (
            f"SYSTEM: ACTIVE | "
            f"VEHICLES: {self._last_result.get('total_vehicles', 0):03d} | "
            f"DENSITY: {self._last_result.get('traffic_density', 0):.1f}% | "
            f"STATUS: {self._last_result.get('status', 'NORMAL').upper()}"
        )
        
        # Dark top bar
        cv2.rectangle(annotated, (0, 0), (annotated.shape[1], 45), (20, 20, 20), -1)
        
        cv2.putText(
            annotated, stats_text, (15, 30),
            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2, cv2.LINE_AA
        )

        return annotated


# Singleton
traffic_processor = TrafficProcessor()
