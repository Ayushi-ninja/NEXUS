"""
Pydantic models (schemas) shared across the application.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
import random


SignalColor = Literal["red", "yellow", "green"]
Direction = Literal["north", "south", "east", "west"]
WeatherCondition = Literal["clear", "rain", "fog", "storm"]
VehicleType = Literal["car", "bus", "truck", "motorcycle", "ambulance"]


# ─────────────────────────── Traffic ───────────────────────────

class TrafficSignal(BaseModel):
    direction: Direction
    color: SignalColor
    timer: int = Field(..., ge=0, description="Seconds remaining in current phase")
    total_duration: int = Field(..., ge=1)

class LaneDensity(BaseModel):
    direction: Direction
    vehicle_count: int = Field(..., ge=0)
    density_percent: float = Field(..., ge=0, le=100)
    avg_speed_kmh: float = Field(..., ge=0)
    is_congested: bool

class TrafficStatus(BaseModel):
    junction_id: str
    timestamp: datetime
    signals: List[TrafficSignal]
    density: List[LaneDensity]
    total_vehicles: int
    overall_congestion_percent: float
    throughput_per_minute: int

class EmergencyAlert(BaseModel):
    alert_id: str
    active: bool
    vehicle_type: VehicleType = "ambulance"
    direction: Direction
    priority_granted: bool
    estimated_clearance_secs: int
    timestamp: datetime

class TrafficPrediction(BaseModel):
    direction: Direction
    predicted_density_percent: float
    predicted_wait_secs: float
    confidence: float = Field(..., ge=0, le=1)
    recommendation: str


# ─────────────────────────── Weather ───────────────────────────

class WeatherData(BaseModel):
    condition: WeatherCondition
    temperature_c: float
    humidity_percent: float
    visibility_km: float
    wind_speed_kmh: float
    precipitation_mm: float
    timestamp: datetime


# ─────────────────────────── AI ────────────────────────────────

class AIRecommendation(BaseModel):
    recommendation_id: str
    category: Literal["signal_timing", "emergency", "congestion", "weather_adaptation"]
    priority: Literal["low", "medium", "high", "critical"]
    title: str
    description: str
    affected_directions: List[Direction]
    suggested_action: str
    expected_improvement_percent: float
    confidence: float = Field(..., ge=0, le=1)
    timestamp: datetime


# ─────────────────────────── WebSocket ─────────────────────────

class WSMessage(BaseModel):
    event: str
    payload: dict
    timestamp: datetime
