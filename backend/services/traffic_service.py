"""
Mock data generators for the Traffic service.
Replace individual functions with real DB / sensor calls later.
"""
import random
import uuid
from datetime import datetime, timezone
from typing import List
from api.schemas import (
    TrafficStatus, TrafficSignal, LaneDensity,
    EmergencyAlert, TrafficPrediction, Direction,
)
from utils.logger import get_logger
from traffic_logic.signal_optimizer import SignalOptimizer, LaneTelemetry, WeatherCondition

logger = get_logger(__name__)

optimizer = SignalOptimizer()
DIRECTIONS: List[Direction] = ["north", "south", "east", "west"]
_EMERGENCY_STORE: dict = {}  # In-memory store for active emergency alerts

def get_traffic_status(junction_id: str = "JCT-001") -> TrafficStatus:
    logger.debug("Generating traffic status for %s", junction_id)
    
    # 1. Generate realistic telemetry for all lanes
    telemetry = []
    density_list = []
    total_vehicles = 0
    
    # Check for active emergency
    active_emergency = get_active_emergency()
    
    for d in DIRECTIONS:
        count = random.randint(2, 35)
        total_vehicles += count
        pct = round(count / 40, 2) # density as fraction
        
        is_emergency = active_emergency.active and active_emergency.direction == d
        
        telemetry.append(LaneTelemetry(
            lane_id=d,
            vehicle_count=count,
            density=pct,
            avg_speed=round(random.uniform(15, 60), 1),
            has_emergency=is_emergency
        ))
        
        density_list.append(LaneDensity(
            direction=d,
            vehicle_count=count,
            density_percent=round(pct * 100, 1),
            avg_speed_kmh=round(random.uniform(15, 60), 1),
            is_congested=pct > 0.7,
        ))

    # 2. Run Optimizer
    # In a real app, weather would be fetched from weather_service
    opt_results = optimizer.optimize(telemetry, weather=WeatherCondition.CLEAR)
    
    # 3. Map results to TrafficSignal objects
    signals = []
    for res in opt_results:
        signals.append(TrafficSignal(
            direction=res.lane_id,
            color=res.state.value,
            timer=res.timer,
            total_duration=res.timer if res.state == "green" else 30
        ))

    return TrafficStatus(
        junction_id=junction_id,
        timestamp=datetime.now(timezone.utc),
        signals=signals,
        density=density_list,
        total_vehicles=total_vehicles,
        overall_congestion_percent=round(total_vehicles / 140 * 100, 1),
        throughput_per_minute=random.randint(20, 60),
    )


def get_signals() -> List[TrafficSignal]:
    logger.debug("Fetching signal states")
    return [
        TrafficSignal(
            direction=d,
            color=random.choice(["red", "yellow", "green"]),
            timer=random.randint(1, 30),
            total_duration=random.choice([20, 24]),
        )
        for d in DIRECTIONS
    ]


def get_density() -> List[LaneDensity]:
    logger.debug("Fetching density data")
    result = []
    for d in DIRECTIONS:
        count = random.randint(0, 30)
        pct = round(count / 30 * 100, 1)
        result.append(LaneDensity(
            direction=d,
            vehicle_count=count,
            density_percent=pct,
            avg_speed_kmh=round(random.uniform(5, 70), 1),
            is_congested=pct > 70,
        ))
    return result


def trigger_emergency(direction: Direction) -> EmergencyAlert:
    alert_id = str(uuid.uuid4())[:8].upper()
    alert = EmergencyAlert(
        alert_id=alert_id,
        active=True,
        vehicle_type="ambulance",
        direction=direction,
        priority_granted=True,
        estimated_clearance_secs=30,
        timestamp=datetime.now(timezone.utc),
    )
    _EMERGENCY_STORE[alert_id] = alert
    logger.warning("EMERGENCY triggered: %s heading %s", alert_id, direction)
    return alert


def get_active_emergency() -> EmergencyAlert:
    if _EMERGENCY_STORE:
        return list(_EMERGENCY_STORE.values())[-1]
    return EmergencyAlert(
        alert_id="NONE",
        active=False,
        direction="north",
        priority_granted=False,
        estimated_clearance_secs=0,
        timestamp=datetime.now(timezone.utc),
    )


def get_predictions() -> List[TrafficPrediction]:
    logger.debug("Running dynamic traffic predictions")
    
    # Generate mock telemetry to run optimization on
    telemetry = []
    for d in DIRECTIONS:
        count = random.randint(5, 38)
        telemetry.append(LaneTelemetry(
            lane_id=d,
            vehicle_count=count,
            density=round(count / 40, 2),
            avg_speed=round(random.uniform(10, 65), 1)
        ))
    
    # Run optimizer for current state
    results = optimizer.optimize(telemetry)
    
    predictions = []
    for res in results:
        # Match direction
        d = res.lane_id
        t = next(lt for lt in telemetry if lt.lane_id == d)
        
        predictions.append(TrafficPrediction(
            direction=d,
            predicted_density_percent=round(t.density * 100, 1),
            predicted_wait_secs=round(random.uniform(5, 90), 1) if res.state == "red" else 0,
            confidence=round(0.85 + random.uniform(0, 0.12), 2),
            recommendation=res.recommendation,
        ))
        
    return predictions
