from typing import Dict, List, Optional, Any
from enum import Enum
import dataclasses

class SignalState(str, Enum):
    GREEN = "green"
    YELLOW = "yellow"
    RED = "red"

class WeatherCondition(str, Enum):
    CLEAR = "clear"
    RAIN = "rain"
    SNOW = "snow"
    FOG = "fog"
    STORM = "storm"

@dataclasses.dataclass
class LaneTelemetry:
    lane_id: str
    vehicle_count: int
    density: float  # 0.0 to 1.0
    avg_speed: float
    has_emergency: bool = False

@dataclasses.dataclass
class OptimizationResult:
    lane_id: str
    state: SignalState
    timer: int
    recommendation: str
    impact_score: float
    is_emergency_priority: bool

class SignalOptimizer:
    def __init__(self):
        # Configuration constants
        self.MIN_GREEN_TIME = 15
        self.MAX_GREEN_TIME = 90
        self.EMERGENCY_GREEN_TIME = 120
        self.YELLOW_TIME = 5
        
        # Weather-based safety multipliers for timers
        self.WEATHER_MULTIPLIERS = {
            WeatherCondition.CLEAR: 1.0,
            WeatherCondition.RAIN: 1.2,
            WeatherCondition.SNOW: 1.5,
            WeatherCondition.FOG: 1.3,
            WeatherCondition.STORM: 1.4
        }

    def optimize(
        self, 
        telemetry: List[LaneTelemetry], 
        weather: WeatherCondition = WeatherCondition.CLEAR
    ) -> List[OptimizationResult]:
        """
        Main optimization engine for adaptive signal timing.
        """
        results = []
        
        # 1. Check for Emergency Vehicles (Absolute Priority)
        emergency_lane = next((l for l in telemetry if l.has_emergency), None)
        
        if emergency_lane:
            return self._handle_emergency_priority(emergency_lane, telemetry)

        # 2. Weather Adaptation Factor
        weather_factor = self.WEATHER_MULTIPLIERS.get(weather, 1.0)
        
        # 3. Dynamic Timing based on Density
        # We find the busiest lane to set the primary green phase
        sorted_lanes = sorted(telemetry, key=lambda x: x.density, reverse=True)
        primary_lane = sorted_lanes[0]
        
        for lane in telemetry:
            is_primary = (lane.lane_id == primary_lane.lane_id)
            
            if is_primary:
                # Dynamic Green Calculation
                # Base green increases with density
                base_green = self.MIN_GREEN_TIME + (lane.density * (self.MAX_GREEN_TIME - self.MIN_GREEN_TIME))
                
                # Apply weather safety multiplier
                adjusted_timer = int(base_green * weather_factor)
                
                # Constraint check
                final_timer = min(self.MAX_GREEN_TIME, max(self.MIN_GREEN_TIME, adjusted_timer))
                
                recommendation = f"Increasing green time by {final_timer - self.MIN_GREEN_TIME}s due to high density ({int(lane.density * 100)}%)"
                if weather != WeatherCondition.CLEAR:
                    recommendation += f" with {weather.value} safety margin applied."
                
                results.append(OptimizationResult(
                    lane_id=lane.lane_id,
                    state=SignalState.GREEN,
                    timer=final_timer,
                    recommendation=recommendation,
                    impact_score=round(lane.density * 0.9, 2),
                    is_emergency_priority=False
                ))
            else:
                # Secondary lanes stay red
                results.append(OptimizationResult(
                    lane_id=lane.lane_id,
                    state=SignalState.RED,
                    timer=0, # Will be set by controller cycle
                    recommendation="Hold phase to clear high-density corridor.",
                    impact_score=0.0,
                    is_emergency_priority=False
                ))
                
        return results

    def _handle_emergency_priority(
        self, 
        emergency_lane: LaneTelemetry, 
        all_lanes: List[LaneTelemetry]
    ) -> List[OptimizationResult]:
        """
        Force immediate green wave for emergency vehicles.
        """
        results = []
        for lane in all_lanes:
            if lane.lane_id == emergency_lane.lane_id:
                results.append(OptimizationResult(
                    lane_id=lane.lane_id,
                    state=SignalState.GREEN,
                    timer=self.EMERGENCY_GREEN_TIME,
                    recommendation="EMERGENCY PRIORITY: Green wave activated for response vehicle.",
                    impact_score=1.0,
                    is_emergency_priority=True
                ))
            else:
                results.append(OptimizationResult(
                    lane_id=lane.lane_id,
                    state=SignalState.RED,
                    timer=self.EMERGENCY_GREEN_TIME,
                    recommendation="HOLD ALL: Emergency vehicle clearing intersection.",
                    impact_score=0.0,
                    is_emergency_priority=True
                ))
        return results

# Example Usage helper for testing/integration
def get_mock_telemetry() -> List[LaneTelemetry]:
    return [
        LaneTelemetry(lane_id="North", vehicle_count=45, density=0.85, avg_speed=22.0),
        LaneTelemetry(lane_id="South", vehicle_count=12, density=0.15, avg_speed=45.0),
        LaneTelemetry(lane_id="East", vehicle_count=28, density=0.45, avg_speed=30.0),
        LaneTelemetry(lane_id="West", vehicle_count=5, density=0.05, avg_speed=50.0)
    ]

if __name__ == "__main__":
    optimizer = SignalOptimizer()
    
    print("--- Scenario 1: High Density North ---")
    results = optimizer.optimize(get_mock_telemetry())
    for res in results:
        if res.state == SignalState.GREEN:
            print(f"Lane: {res.lane_id} | Timer: {res.timer}s | Rec: {res.recommendation}")

    print("\n--- Scenario 2: Emergency at East ---")
    telemetry = get_mock_telemetry()
    telemetry[2].has_emergency = True
    results = optimizer.optimize(telemetry)
    for res in results:
        if res.state == SignalState.GREEN:
            print(f"Lane: {res.lane_id} | Timer: {res.timer}s | Rec: {res.recommendation}")

    print("\n--- Scenario 3: Heavy Rain at North ---")
    results = optimizer.optimize(get_mock_telemetry(), weather=WeatherCondition.RAIN)
    for res in results:
        if res.state == SignalState.GREEN:
            print(f"Lane: {res.lane_id} | Timer: {res.timer}s | Rec: {res.recommendation}")
