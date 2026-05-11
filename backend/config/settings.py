"""
Application settings loaded from environment variables via Pydantic BaseSettings.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "AI Junction Optimization System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENV: str = "development"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ]

    # Security
    SECRET_KEY: str = "change-me-in-production-please"
    API_KEY_HEADER: str = "X-API-Key"

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"

    # Simulation / AI
    JUNCTION_COUNT: int = 4
    SIMULATION_TICK_MS: int = 1000
    EMERGENCY_CLEAR_SECS: int = 30

    # OpenWeather API
    OPENWEATHER_API_KEY: str = ""
    WEATHER_CITY: str = "Mumbai"

    # Google Gemini API
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()