from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DetectionMetadata(BaseModel):
    frame_width: int
    frame_height: int
    model_version: str

class VehicleDetection(BaseModel):
    class_name: str
    confidence: float
    bbox: List[int]
    is_emergency: bool

class DetectionResponse(BaseModel):
    vehicle_count: int
    density_percentage: float
    emergency_detected: bool
    detections: List[Dict[str, Any]]
    metadata: DetectionMetadata

class StreamStatus(BaseModel):
    status: str
    source: str
    active: bool
