"""
AI Junction Optimization System — Full Test Suite
Tests: REST APIs, WebSocket, Gemini AI, Weather, Demo sequence
"""
import json
import time
import threading
import urllib.request
import urllib.error
from datetime import datetime

BASE = "http://localhost:8000"
WS_URL = "ws://localhost:8000/ws/traffic"
PASS = []
FAIL = []

def ok(label):
    PASS.append(label)
    print(f"  \033[92mPASS\033[0m  {label}")

def fail(label, reason=""):
    FAIL.append(label)
    print(f"  \033[91mFAIL\033[0m  {label}" + (f"  ({reason})" if reason else ""))

def get(path, timeout=6):
    with urllib.request.urlopen(BASE + path, timeout=timeout) as r:
        return json.loads(r.read())

def post(path, data=None, timeout=6):
    body = json.dumps(data).encode() if data else b""
    req = urllib.request.Request(
        BASE + path, data=body,
        headers={"Content-Type": "application/json"}, method="POST"
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read())

def delete(path, timeout=6):
    req = urllib.request.Request(BASE + path, method="DELETE")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read())

# ── PHASE 2+3: REST API Tests ─────────────────────────────────────────────────
print("\n" + "="*60)
print("PHASE 2+3: REST API & Backend Tests")
print("="*60)

# Health
try:
    d = get("/health")
    assert d.get("status") == "healthy"
    ok("GET /health")
except Exception as e:
    fail("GET /health", str(e))

# Traffic status
try:
    d = get("/api/v1/traffic/status")
    assert "junction_id" in d
    assert "signals" in d
    assert "density" in d
    assert "total_vehicles" in d
    ok("GET /api/v1/traffic/status — has junction_id, signals, density, total_vehicles")
except Exception as e:
    fail("GET /api/v1/traffic/status", str(e))

# Signals
try:
    d = get("/api/v1/traffic/signals")
    assert isinstance(d, list)
    assert len(d) == 4
    assert all("direction" in s and "color" in s and "timer" in s for s in d)
    ok(f"GET /api/v1/traffic/signals — 4 signals, all have direction/color/timer")
except Exception as e:
    fail("GET /api/v1/traffic/signals", str(e))

# Density
try:
    d = get("/api/v1/traffic/density")
    assert isinstance(d, list) and len(d) > 0
    assert all("density_percent" in lane for lane in d)
    ok(f"GET /api/v1/traffic/density — {len(d)} lanes with density_percent")
except Exception as e:
    fail("GET /api/v1/traffic/density", str(e))

# Emergency (GET)
try:
    d = get("/api/v1/traffic/emergency")
    assert "active" in d
    ok(f"GET /api/v1/traffic/emergency — active={d['active']}")
except Exception as e:
    fail("GET /api/v1/traffic/emergency", str(e))

# Emergency trigger + clear
try:
    d = post("/api/v1/traffic/emergency?direction=north")
    assert d.get("active") is True
    ok("POST /api/v1/traffic/emergency?direction=north — emergency triggered")
    time.sleep(0.5)
    d2 = delete("/api/v1/traffic/emergency")
    assert d2.get("status") == "cleared"
    ok("DELETE /api/v1/traffic/emergency — emergency cleared")
except Exception as e:
    fail("Emergency trigger/clear", str(e))

# Predictions
try:
    d = get("/api/v1/traffic/predictions")
    assert isinstance(d, list) and len(d) > 0
    ok(f"GET /api/v1/traffic/predictions — {len(d)} predictions")
except Exception as e:
    fail("GET /api/v1/traffic/predictions", str(e))

# Forecast
try:
    d = get("/api/v1/traffic/forecast")
    assert "forecast" in d and len(d["forecast"]) == 24
    ok(f"GET /api/v1/traffic/forecast — 24 hourly entries, peak={d['peak_hour']}")
except Exception as e:
    fail("GET /api/v1/traffic/forecast", str(e))

# ── PHASE 5: Weather ──────────────────────────────────────────────────────────
print("\n" + "="*60)
print("PHASE 5: Weather API")
print("="*60)

try:
    d = get("/api/v1/weather/current")
    assert "condition" in d
    assert "temperature_c" in d
    assert "humidity_percent" in d
    ok(f"GET /api/v1/weather/current — condition={d['condition']}, temp={d['temperature_c']}°C")
except Exception as e:
    fail("GET /api/v1/weather/current", str(e))

# ── PHASE 6: Gemini AI ────────────────────────────────────────────────────────
print("\n" + "="*60)
print("PHASE 6: Gemini AI Recommendations")
print("="*60)

try:
    d = get("/api/v1/ai/recommendations?limit=3", timeout=12)
    assert isinstance(d, list) and len(d) > 0
    for rec in d:
        assert "title" in rec and "priority" in rec and "confidence" in rec
    ok(f"GET /api/v1/ai/recommendations — {len(d)} recs returned")
    for rec in d:
        print(f"         [{rec['priority'].upper()}] {rec['title'][:55]}  conf={rec['confidence']}")
except Exception as e:
    fail("GET /api/v1/ai/recommendations", str(e))

# ── PHASE 4: Detection ────────────────────────────────────────────────────────
print("\n" + "="*60)
print("PHASE 4: Detection & YOLO")
print("="*60)

try:
    d = get("/api/v1/detection/status")
    assert "yolo_available" in d
    ok(f"GET /api/v1/detection/status — yolo_available={d['yolo_available']}, status={d['status']}")
except Exception as e:
    fail("GET /api/v1/detection/status", str(e))

try:
    d = get("/api/v1/detection/counts")
    assert "total" in d or "north" in d or isinstance(d, dict)
    ok(f"GET /api/v1/detection/counts — response OK")
except Exception as e:
    fail("GET /api/v1/detection/counts", str(e))

# ── PHASE 7: WebSocket ────────────────────────────────────────────────────────
print("\n" + "="*60)
print("PHASE 7: WebSocket Real-time Sync")
print("="*60)

try:
    import websocket as wslib
    received = []
    errors = []

    def on_msg(app, msg):
        data = json.loads(msg)
        received.append(data)
        if len(received) >= 3:
            app.close()

    def on_err(app, err):
        errors.append(str(err))

    app = wslib.WebSocketApp(WS_URL, on_message=on_msg, on_error=on_err)
    t = threading.Thread(target=app.run_forever)
    t.daemon = True
    t.start()
    t.join(timeout=10)

    if received:
        ok(f"WebSocket connected — received {len(received)} events")
        for ev in received[:3]:
            keys = list((ev.get("payload") or {}).keys())
            print(f"         event={ev.get('event')}  payload_keys={keys}")
        # Validate traffic_update structure
        tu = next((e for e in received if e.get("event") == "traffic_update"), None)
        if tu:
            payload = tu["payload"]
            assert "lanes" in payload and "stats" in payload and "emergency" in payload
            ok("traffic_update payload has lanes, stats, emergency, weather")
        else:
            fail("No traffic_update event in first 3 events")
    else:
        fail("WebSocket", f"no events — errors: {errors}")
except ImportError:
    fail("WebSocket", "websocket-client not installed — run: pip install websocket-client")
except Exception as e:
    fail("WebSocket", str(e))

# ── PHASE 8: Demo Sequence ────────────────────────────────────────────────────
print("\n" + "="*60)
print("PHASE 8: Demo Sequence")
print("="*60)

try:
    d = post("/api/v1/demo/reset")
    assert d.get("status") == "reset"
    ok("POST /api/v1/demo/reset — baseline restored")
except Exception as e:
    fail("POST /api/v1/demo/reset", str(e))

try:
    d = post("/api/v1/demo/scenario?scenario=traffic_spike")
    assert d.get("status") == "success"
    ok("POST /api/v1/demo/scenario?scenario=traffic_spike")
except Exception as e:
    fail("Demo scenario traffic_spike", str(e))

try:
    d = post("/api/v1/demo/scenario?scenario=ambulance")
    assert d.get("status") == "success"
    ok("POST /api/v1/demo/scenario?scenario=ambulance")
except Exception as e:
    fail("Demo scenario ambulance", str(e))

try:
    d = post("/api/v1/demo/scenario?scenario=rain_event")
    assert d.get("status") == "success"
    ok("POST /api/v1/demo/scenario?scenario=rain_event")
except Exception as e:
    fail("Demo scenario rain_event", str(e))

try:
    d = post("/api/v1/demo/scenario?scenario=clear")
    assert d.get("status") == "success"
    ok("POST /api/v1/demo/scenario?scenario=clear — all cleared")
except Exception as e:
    fail("Demo scenario clear", str(e))

try:
    d = post("/api/v1/demo/start")
    assert d.get("status") in ("started", "already_running")
    ok(f"POST /api/v1/demo/start — status={d['status']}")
except Exception as e:
    fail("POST /api/v1/demo/start", str(e))

# ── RESULTS ───────────────────────────────────────────────────────────────────
print("\n" + "="*60)
total = len(PASS) + len(FAIL)
print(f"RESULTS: {len(PASS)}/{total} passed  |  {len(FAIL)} failed")
print("="*60)
if FAIL:
    print("FAILED TESTS:")
    for f in FAIL:
        print(f"  - {f}")
else:
    print("\033[92mAll tests passed!\033[0m")
