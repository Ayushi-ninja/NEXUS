"""
Tests for Traffic API endpoints.
"""
import pytest
from httpx import AsyncClient, ASGITransport
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_traffic_status():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/v1/traffic/status")
    assert r.status_code == 200
    data = r.json()
    assert "signals" in data
    assert "density" in data
    assert len(data["signals"]) == 4


@pytest.mark.asyncio
async def test_traffic_signals():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/v1/traffic/signals")
    assert r.status_code == 200
    signals = r.json()
    assert isinstance(signals, list)
    assert len(signals) == 4
    for sig in signals:
        assert sig["color"] in ("red", "yellow", "green")


@pytest.mark.asyncio
async def test_traffic_density():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/v1/traffic/density")
    assert r.status_code == 200
    density = r.json()
    assert len(density) == 4


@pytest.mark.asyncio
async def test_trigger_emergency():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post("/api/v1/traffic/emergency?direction=north")
    assert r.status_code == 200
    data = r.json()
    assert data["active"] is True
    assert data["direction"] == "north"


@pytest.mark.asyncio
async def test_traffic_predictions():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/v1/traffic/predictions")
    assert r.status_code == 200
    preds = r.json()
    assert len(preds) == 4
    for p in preds:
        assert 0 <= p["confidence"] <= 1


@pytest.mark.asyncio
async def test_weather_current():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/v1/weather/current")
    assert r.status_code == 200
    w = r.json()
    assert w["condition"] in ("clear", "rain", "fog", "storm")


@pytest.mark.asyncio
async def test_ai_recommendations():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/v1/ai/recommendations?limit=2")
    assert r.status_code == 200
    recs = r.json()
    assert len(recs) <= 2
    for rec in recs:
        assert 0 <= rec["confidence"] <= 1
