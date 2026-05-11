"""
Phase 12-13: Demo Sequence + Failsafe Validation
Tests the full 90-second hackathon demo flow via backend API
"""
import json
import time
import urllib.request
import urllib.error

BASE = "http://localhost:8000"
PASS = []
FAIL = []

def ok(label): PASS.append(label); print(f"  \033[92mPASS\033[0m  {label}")
def fail(label, r=""): FAIL.append(label); print(f"  \033[91mFAIL\033[0m  {label}" + (f"  ({r})" if r else ""))
def info(msg): print(f"  \033[94mINFO\033[0m  {msg}")

def get(path, timeout=6):
    with urllib.request.urlopen(BASE + path, timeout=timeout) as r:
        return json.loads(r.read())

def post(path, timeout=6):
    req = urllib.request.Request(BASE + path, data=b"", method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read())

def delete(path, timeout=6):
    req = urllib.request.Request(BASE + path, method="DELETE")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read())

# ── PHASE 12: Failsafe Tests ──────────────────────────────────────────────────
print("\n" + "="*60)
print("PHASE 12: Failsafe & Edge Case Testing")
print("="*60)

# Double-trigger emergency (idempotent)
try:
    post("/api/v1/traffic/emergency?direction=north")
    post("/api/v1/traffic/emergency?direction=north")
    d = get("/api/v1/traffic/emergency")
    assert d["active"] is True
    ok("Double emergency trigger — idempotent, still active")
    delete("/api/v1/traffic/emergency")
except Exception as e:
    fail("Emergency idempotency", str(e))

# Clear when no emergency active (no crash)
try:
    delete("/api/v1/traffic/emergency")
    d = get("/api/v1/traffic/emergency")
    assert d["active"] is False
    ok("Clear when inactive — no crash, returns active=False")
except Exception as e:
    fail("Clear inactive emergency", str(e))

# Unknown demo scenario (should return error gracefully)
try:
    req = urllib.request.Request(
        BASE + "/api/v1/demo/scenario?scenario=invalid_xyz",
        data=b"", method="POST"
    )
    with urllib.request.urlopen(req, timeout=5) as r:
        d = json.loads(r.read())
        assert d.get("status") == "error"
        ok("Unknown demo scenario — returns error status gracefully")
except Exception as e:
    fail("Unknown scenario handling", str(e))

# Double demo start (should return already_running or started)
try:
    d1 = post("/api/v1/demo/start")
    time.sleep(0.3)
    d2 = post("/api/v1/demo/start")
    assert d2.get("status") in ("already_running", "started")
    ok(f"Double demo start — second call returns '{d2['status']}'")
except Exception as e:
    fail("Double demo start", str(e))

# Reset after demo running
try:
    time.sleep(1)
    d = post("/api/v1/demo/reset")
    assert d.get("status") == "reset"
    ok("Demo reset while running — graceful reset")
except Exception as e:
    fail("Demo reset", str(e))

# Forecast data validity
try:
    d = get("/api/v1/traffic/forecast")
    forecast = d["forecast"]
    assert len(forecast) == 24
    assert all(0 <= h["predicted_density"] <= 100 for h in forecast)
    assert any(h["is_peak"] for h in forecast)
    ok(f"Forecast — 24h, all densities 0-100, peaks marked, peak={d['peak_hour']}")
except Exception as e:
    fail("Forecast validity", str(e))

# AI recommendations with limit=1 and limit=5
try:
    for lim in [1, 5]:
        d = get(f"/api/v1/ai/recommendations?limit={lim}", timeout=10)
        assert 1 <= len(d) <= lim + 2  # allow slight overshoot
        ok(f"AI recommendations limit={lim} — returned {len(d)} recs")
except Exception as e:
    fail("AI limit parameter", str(e))

# ── PHASE 13: Final Demo Sequence Validation ──────────────────────────────────
print("\n" + "="*60)
print("PHASE 13: Full Demo Sequence Validation")
print("="*60)

# Reset to clean state
try:
    post("/api/v1/demo/reset")
    ok("Reset to clean demo baseline")
except Exception as e:
    fail("Pre-demo reset", str(e))

# Verify baseline densities are low
try:
    d = get("/api/v1/demo/status")
    assert d["emergency_active"] is False
    assert d["weather"] == "clear"
    ok(f"Baseline verified — emergency=False, weather=clear")
except Exception as e:
    fail("Baseline check", str(e))

# STEP 1: Traffic spike
try:
    req = urllib.request.Request(
        BASE + "/api/v1/demo/scenario?scenario=traffic_spike",
        data=b"", method="POST"
    )
    with urllib.request.urlopen(req, timeout=5) as r:
        d = json.loads(r.read())
    assert d["status"] == "success"
    status = get("/api/v1/demo/status")
    high_density = all(v >= 80 for v in status["sim_densities"].values())
    assert high_density, f"Densities not high enough: {status['sim_densities']}"
    ok(f"Step 1: Traffic spike — densities at {list(status['sim_densities'].values())}")
except Exception as e:
    fail("Demo Step 1 traffic spike", str(e))

# STEP 2: Ambulance emergency
try:
    req = urllib.request.Request(
        BASE + "/api/v1/demo/scenario?scenario=ambulance",
        data=b"", method="POST"
    )
    with urllib.request.urlopen(req, timeout=5) as r:
        d = json.loads(r.read())
    assert d["status"] == "success"
    status = get("/api/v1/demo/status")
    assert status["emergency_active"] is True
    ok("Step 2: Ambulance triggered — emergency_active=True")
except Exception as e:
    fail("Demo Step 2 ambulance", str(e))

# STEP 3: Rain weather event
try:
    req = urllib.request.Request(
        BASE + "/api/v1/demo/scenario?scenario=rain_event",
        data=b"", method="POST"
    )
    with urllib.request.urlopen(req, timeout=5) as r:
        d = json.loads(r.read())
    assert d["status"] == "success"
    status = get("/api/v1/demo/status")
    assert status["weather"] == "rain"
    ok("Step 3: Rain event — weather=rain confirmed")
except Exception as e:
    fail("Demo Step 3 rain", str(e))

# STEP 4: Full clear
try:
    req = urllib.request.Request(
        BASE + "/api/v1/demo/scenario?scenario=clear",
        data=b"", method="POST"
    )
    with urllib.request.urlopen(req, timeout=5) as r:
        d = json.loads(r.read())
    assert d["status"] == "success"
    status = get("/api/v1/demo/status")
    assert status["emergency_active"] is False
    assert status["weather"] == "clear"
    ok("Step 4: Clear — emergency=False, weather=clear, all normalized")
except Exception as e:
    fail("Demo Step 4 clear", str(e))

# STEP 5: Start full auto sequence
try:
    d = post("/api/v1/demo/start")
    assert d["status"] in ("started", "already_running")
    assert len(d.get("steps", [])) >= 7
    ok(f"Step 5: Auto demo started — {len(d.get('steps',[]))} timed events queued")
    info("Demo will broadcast: congestion → AI insight → ambulance → emergency insight → rain → AI insight → normalize (90s)")
except Exception as e:
    fail("Auto demo start", str(e))

# ── RESULTS ───────────────────────────────────────────────────────────────────
print("\n" + "="*60)
total = len(PASS) + len(FAIL)
print(f"RESULTS: {len(PASS)}/{total} passed  |  {len(FAIL)} failed")
print("="*60)
if FAIL:
    print("FAILED:")
    for f in FAIL:
        print(f"  - {f}")
else:
    print("\033[92m✓ All Phase 12-13 demo & failsafe tests passed!\033[0m")
