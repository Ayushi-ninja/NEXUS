from fastapi import APIRouter, UploadFile, File, HTTPException
from detection.yolo_detector import yolo_detector
from models.detection import DetectionResponse
import cv2
import numpy as np
import tempfile
import os

router = APIRouter(prefix="/detection", tags=["AI Detection"])

@router.post("/image", response_model=DetectionResponse, summary="Detect vehicles in an image")
async def detect_in_image(file: UploadFile = File(...)):
    """
    Upload an image and get vehicle detection results.
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if frame is None:
        raise HTTPException(status_code=400, detail="Invalid image file")
    
    results = yolo_detector.detect_vehicles(frame)
    return results

@router.post("/video-snapshot", response_model=DetectionResponse, summary="Analyze a single frame from a video file")
async def detect_in_video_snapshot(file: UploadFile = File(...)):
    """
    Upload a video and analyze the first frame for testing purposes.
    """
    # Save video to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    cap = cv2.VideoCapture(tmp_path)
    ret, frame = cap.read()
    cap.release()
    os.unlink(tmp_path)

    if not ret:
        raise HTTPException(status_code=400, detail="Could not read video")
    
    results = yolo_detector.detect_vehicles(frame)
    return results

@router.post("/process", summary="Full pipeline: detect + count + classify")
async def process_image(file: UploadFile = File(...)):
    """
    Run the full traffic processing pipeline on an uploaded image:
    YOLO detection → vehicle counting → lane classification → structured JSON.
    """
    from detection.traffic_processor import traffic_processor
    contents = await file.read()
    try:
        result = traffic_processor.process_image_bytes(contents)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return result


@router.get("/counts", summary="Current vehicle counts per lane")
async def get_counts():
    """
    Returns the latest lane-wise vehicle counts from the counting system.
    Updates every frame when video processing is active, otherwise returns
    last known state from simulation.
    """
    from detection.vehicle_counter import vehicle_counter
    from websocket.manager import _sim_state

    # If the counter has data, use it; otherwise build from WS sim state
    summary = vehicle_counter.get_summary()
    if summary["total_frames"] > 0:
        last = vehicle_counter._smoothed_density
        counts = {d: max(1, int(last.get(d, 0) / 3.5)) for d in ["north", "south", "east", "west"]}
    else:
        counts = _sim_state.get("vehicle_counts", {})

    densities = _sim_state.get("densities", {})
    emergency = _sim_state.get("emergency_active", False)

    return {
        "north_lane": counts.get("north", 0),
        "south_lane": counts.get("south", 0),
        "east_lane": counts.get("east", 0),
        "west_lane": counts.get("west", 0),
        "traffic_density": round(sum(densities.values()) / max(1, len(densities)), 1),
        "ambulance_detected": emergency,
        "total_vehicles": sum(counts.values()),
    }


@router.get("/status", summary="Get detection service status")
async def get_status():
    """
    Returns the status of the YOLOv8 detection engine.
    """
    from detection.traffic_processor import traffic_processor
    return {
        "engine": "YOLOv8",
        "model": "yolov8n.pt",
        "yolo_available": yolo_detector.is_available,
        "status": "ready" if yolo_detector.is_available else "mock_mode",
        "processor_running": traffic_processor.is_running,
        "frames_processed": traffic_processor._frame_count,
        "device": "cpu",
        "supported_classes": ["car", "motorcycle", "bus", "truck"],
        "emergency_classes": ["ambulance", "fire truck", "police car"],
    }

@router.get("/demo-video", summary="Process demo traffic video")
async def process_demo_video():
    """
    Process the demo traffic video file (backend/static/demo_traffic.mp4)
    and return detection results for the first frame.
    """
    from detection.traffic_processor import traffic_processor
    
    demo_video_path = "static/demo_traffic.mp4"
    
    if not os.path.exists(demo_video_path):
        raise HTTPException(status_code=404, detail="Demo video not found. Place traffic.mp4 in backend/static/")
    
    cap = cv2.VideoCapture(demo_video_path)
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        raise HTTPException(status_code=400, detail="Could not read demo video")
    
    results = yolo_detector.detect_vehicles(frame)
    return results
