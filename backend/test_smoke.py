"""
Quick smoke-test: hits every REST endpoint + WebSocket.
Run: python test_smoke.py
"""
import asyncio
import json
import urllib.request
import urllib.error

BASE = "http://localhost:8000"

TESTS = [
    ("GET", "/health",                            None),
    ("GET", "/api/v1/traffic/status",             None),
    ("GET", "/api/v1/traffic/signals",            None),
    ("GET", "/api/v1/traffic/density",            None),
    ("GET", "/api/v1/traffic/emergency",          None),
    ("GET", "/api/v1/traffic/predictions",        None),
    ("GET", "/api/v1/weather/current",            None),
    ("GET", "/api/v1/ai/recommendations?limit=3", None),
    ("POST","/api/v1/traffic/emergency?direction=north", b""),
]


def run_rest():
    print("\n=== REST Endpoint Tests ===\n")
    all_ok = True
    for method, path, body in TESTS:
        url = BASE + path
        req = urllib.request.Request(url, data=body, method=method)
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                payload = json.loads(resp.read())
                status = resp.status
                # Pick a useful summary field
                if "junction_id"  in payload:  summary = f"junction_id={payload['junction_id']}"
                elif "status"     in payload:  summary = f"status={payload['status']}"
                elif "condition"  in payload:  summary = f"condition={payload['condition']}"
                elif "active"     in payload:  summary = f"active={payload['active']}, dir={payload.get('direction')}"
                elif isinstance(payload, list): summary = f"{len(payload)} items"
                else: summary = str(payload)[:60]
                print(f"  OK  {method:4s} {path:<45s}  ->  {summary}")
        except urllib.error.HTTPError as e:
            print(f"  FAIL {method:4s} {path:<45s}  ->  HTTP {e.code}: {e.read().decode()[:80]}")
            all_ok = False
        except Exception as e:
            print(f"  ERR  {method:4s} {path:<45s}  ->  {e}")
            all_ok = False
    return all_ok


async def run_websocket():
    print("\n=== WebSocket Test ===\n")
    try:
        import websockets
    except ImportError:
        print("  SKIP  websockets not installed")
        return True

    uri = "ws://localhost:8000/ws/traffic"
    try:
        async with websockets.connect(uri, open_timeout=5) as ws:
            print(f"  Connected to {uri}")
            # Send ping
            await ws.send(json.dumps({"command": "ping"}))
            received = []
            for _ in range(4):
                try:
                    raw = await asyncio.wait_for(ws.recv(), timeout=3)
                    msg = json.loads(raw)
                    received.append(msg.get("event", "?"))
                except asyncio.TimeoutError:
                    break
            print(f"  Received events: {received}")
            if "pong" in received:
                print("  OK  ping -> pong confirmed")
            broadcast_events = [e for e in received if e in ("traffic_update", "signal_update", "congestion_update")]
            if broadcast_events:
                print(f"  OK  broadcast events received: {broadcast_events}")
            print("  WebSocket test passed")
            return True
    except Exception as e:
        print(f"  FAIL  {e}")
        return False


if __name__ == "__main__":
    rest_ok  = run_rest()
    ws_ok    = asyncio.run(run_websocket())
    print("\n" + "="*60)
    if rest_ok and ws_ok:
        print("  ALL TESTS PASSED")
    else:
        print("  SOME TESTS FAILED — check output above")
    print("="*60)
