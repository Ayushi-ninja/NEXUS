"""
Simple health-check and root route.
"""
from fastapi import APIRouter
from datetime import datetime, timezone
from config.settings import get_settings

router = APIRouter(tags=["Health"])
settings = get_settings()


@router.get("/", summary="Root — API info")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "env": settings.ENV,
        "docs": "/docs",
        "redoc": "/redoc",
    }


@router.get("/health", summary="Health check")
async def health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc)}
