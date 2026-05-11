"""
Weather API routes — /api/v1/weather/...
Fetches real weather from OpenWeather API and returns signal timing adjustments.
"""
import httpx
from fastapi import APIRouter
from api.schemas import WeatherData
from config.settings import get_settings

router = APIRouter(prefix="/weather", tags=["Weather"])
settings = get_settings()


def _condition_to_schema_condition(owm_main: str) -> str:
    """Map OpenWeather 'main' condition string to our schema condition strings."""
    mapping = {
        "Clear": "clear",
        "Clouds": "cloudy",
        "Rain": "rain",
        "Drizzle": "rain",
        "Thunderstorm": "storm",
        "Snow": "snow",
        "Mist": "fog",
        "Fog": "fog",
        "Haze": "fog",
        "Smoke": "fog",
        "Dust": "fog",
        "Sand": "fog",
        "Ash": "fog",
        "Squall": "storm",
        "Tornado": "storm",
    }
    return mapping.get(owm_main, "cloudy")


def _get_signal_multiplier(condition: str) -> float:
    """Return signal timing multiplier based on weather condition."""
    multipliers = {
        "clear": 1.0,
        "cloudy": 1.05,
        "rain": 1.3,
        "storm": 1.5,
        "snow": 1.8,
        "fog": 1.4,
    }
    return multipliers.get(condition, 1.0)


def _get_weather_recommendation(condition: str, multiplier: float) -> str:
    messages = {
        "clear": "Optimal driving conditions. Standard signal timings active.",
        "cloudy": "Slightly reduced visibility. Minor timing adjustments applied.",
        "rain": f"Rain detected. Signal timings extended by {int((multiplier - 1) * 100)}% for safety.",
        "storm": f"Storm conditions. Signal timings extended by {int((multiplier - 1) * 100)}%. Caution advised.",
        "snow": f"Snow detected. Signal timings extended by {int((multiplier - 1) * 100)}%. Reduce speed.",
        "fog": f"Low visibility fog. Signal timings extended by {int((multiplier - 1) * 100)}%. Use fog lights.",
    }
    return messages.get(condition, "Weather data unavailable. Standard timings active.")


async def _fetch_live_weather() -> WeatherData:
    """Fetch real weather from OpenWeather API."""
    from datetime import datetime, timezone
    api_key = settings.OPENWEATHER_API_KEY
    city = settings.WEATHER_CITY

    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?q={city}&appid={api_key}&units=metric"
    )

    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.get(url)
        response.raise_for_status()
        data = response.json()

    owm_main = data["weather"][0]["main"]
    condition = _condition_to_schema_condition(owm_main)

    return WeatherData(
        condition=condition,
        temperature_c=round(data["main"]["temp"], 1),
        humidity_percent=float(data["main"]["humidity"]),
        visibility_km=round(data.get("visibility", 10000) / 1000, 1),
        wind_speed_kmh=round(data["wind"]["speed"] * 3.6, 1),
        precipitation_mm=float(data.get("rain", {}).get("1h", 0.0)),
        timestamp=datetime.now(timezone.utc),
    )


def _get_mock_weather() -> WeatherData:
    """Fallback mock weather when API key is missing or call fails."""
    from datetime import datetime, timezone
    return WeatherData(
        condition="clear",
        temperature_c=28.5,
        humidity_percent=65.0,
        visibility_km=9.5,
        wind_speed_kmh=12.0,
        precipitation_mm=0.0,
        timestamp=datetime.now(timezone.utc),
    )


@router.get("/current", response_model=WeatherData, summary="Current weather at the junction")
async def current_weather():
    """
    Returns current weather conditions and their impact on signal timing.
    Uses OpenWeather API if key is configured, otherwise returns realistic mock data.
    """
    if not settings.OPENWEATHER_API_KEY or settings.OPENWEATHER_API_KEY == "your_openweather_key_here":
        return _get_mock_weather()

    try:
        return await _fetch_live_weather()
    except Exception:
        # If API call fails, return mock data so frontend never breaks
        return _get_mock_weather()