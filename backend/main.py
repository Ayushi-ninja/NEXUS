"""
AI Junction Optimization System — FastAPI Entry Point
Run with: uvicorn main:app --reload
"""
import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from config.settings import get_settings
from utils.logger import get_logger
from api.routes.traffic import router as traffic_router
from api.routes.weather import router as weather_router
from api.routes.ai import router as ai_router
from api.routes.detection import router as detection_router
from api.routes.health import router as health_router
from api.routes.demo import router as demo_router
from websocket.routes import router as ws_router
from websocket.manager import simulation_broadcast_loop

settings = get_settings()
logger = get_logger("main")

# ─────────────────────── Lifespan ────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("=" * 60)
    logger.info("  %s  v%s", settings.APP_NAME, settings.APP_VERSION)
    logger.info("  Environment : %s", settings.ENV)
    logger.info("  Docs        : http://%s:%d/docs", settings.HOST, settings.PORT)
    logger.info("=" * 60)

    # Start the WebSocket broadcast background task
    broadcast_task = asyncio.create_task(simulation_broadcast_loop())
    logger.info("WebSocket broadcast loop started")

    yield  # ← Application runs here

    broadcast_task.cancel()
    try:
        await broadcast_task
    except asyncio.CancelledError:
        pass
    logger.info("Shutdown complete.")


# ─────────────────────── App Factory ─────────────────────────────

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "Production-ready backend for the AI Junction Optimization System. "
            "Provides real-time traffic signal management, congestion analysis, "
            "weather adaptation and AI-driven recommendations via REST + WebSocket."
        ),
        contact={
            "name": "DekNek Hackathon Team",
            "url": "https://github.com/deknekteam/junction-ai",
        },
        license_info={"name": "MIT"},
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ── CORS ────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Static files ─────────────────────────────────────────────
    app.mount("/static", StaticFiles(directory="static"), name="static")

    # ── Versioned API prefix ──────────────────────────────────────
    API_V1 = "/api/v1"
    app.include_router(health_router)                         # /health
    app.include_router(traffic_router, prefix=API_V1)        # /api/v1/traffic/...
    app.include_router(weather_router, prefix=API_V1)        # /api/v1/weather/...
    app.include_router(ai_router,      prefix=API_V1)        # /api/v1/ai/...
    app.include_router(detection_router, prefix=API_V1)     # /api/v1/detection/...
    app.include_router(demo_router,    prefix=API_V1)        # /api/v1/demo/...
    app.include_router(ws_router)                            # /ws/traffic

    # ── Global exception handler ──────────────────────────────────
    @app.exception_handler(Exception)
    async def global_exception_handler(request, exc):
        logger.error("Unhandled exception: %s", exc, exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error. Please check server logs."},
        )

    return app


app = create_app()


# ─────────────────────── Dev entrypoint ──────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
