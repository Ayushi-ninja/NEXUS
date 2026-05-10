"""
Mock Weather service — replace with real OpenWeather API calls later.
"""
import random
from datetime import datetime, timezone
from api.schemas import WeatherData, WeatherCondition
from config.settings import get_settings
from utils.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()

_CONDITIONS: list[WeatherCondition] = ["clear", "rain", "fog", "storm"]

# Weighted towards clear for realism
_WEIGHTS = [0.55, 0.25, 0.15, 0.05]


def get_current_weather() -> WeatherData:
    condition: WeatherCondition = random.choices(_CONDITIONS, weights=_WEIGHTS, k=1)[0]

    vis_map = {"clear": random.uniform(8, 12), "rain": random.uniform(2, 5),
               "fog": random.uniform(0.2, 1.5), "storm": random.uniform(0.5, 3)}

    precip_map = {"clear": 0.0, "rain": random.uniform(2, 20),
                  "fog": 0.0, "storm": random.uniform(20, 80)}

    logger.debug("Weather condition: %s (city=%s)", condition, settings.WEATHER_CITY)
    return WeatherData(
        condition=condition,
        temperature_c=round(random.uniform(18, 38), 1),
        humidity_percent=round(random.uniform(40, 95), 1),
        visibility_km=round(vis_map[condition], 2),
        wind_speed_kmh=round(random.uniform(0, 45), 1),
        precipitation_mm=round(precip_map[condition], 2),
        timestamp=datetime.now(timezone.utc),
    )
