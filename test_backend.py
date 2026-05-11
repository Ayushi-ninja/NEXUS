import urllib.request
import json

base = 'http://localhost:8000'
tests = [
    '/health',
    '/api/v1/traffic/status',
    '/api/v1/traffic/signals',
    '/api/v1/traffic/density',
    '/api/v1/traffic/emergency',
    '/api/v1/traffic/predictions',
    '/api/v1/weather/current',
    '/api/v1/detection/status',
    '/api/v1/detection/counts',
    '/api/v1/demo/status',
    '/api/v1/traffic/forecast',
]

print('=== REST API TESTS ===')
for path in tests:
    try:
        with urllib.request.urlopen(base + path, timeout=5) as r:
            data = json.loads(r.read())
            print(f'  OK  {path}')
    except Exception as e:
        print(f'  FAIL {path} -> {e}')

print()
print('=== AI RECOMMENDATIONS ===')
try:
    with urllib.request.urlopen(base + '/api/v1/ai/recommendations?limit=2', timeout=10) as r:
        data = json.loads(r.read())
        for rec in data:
            print(f'  [{rec["priority"]}] {rec["title"][:60]}')
except Exception as e:
    print(f'  FAIL -> {e}')

print()
print('=== WEBSOCKET TEST ===')
try:
    import threading
    import websocket as ws_lib
    received = []
    def on_message(wsapp, msg):
        received.append(json.loads(msg))
        if len(received) >= 2:
            wsapp.close()
    wsapp = ws_lib.WebSocketApp('ws://localhost:8000/ws/traffic', on_message=on_message)
    t = threading.Thread(target=wsapp.run_forever)
    t.start()
    t.join(timeout=8)
    if received:
        print(f'  OK  WebSocket received {len(received)} events')
        for ev in received:
            print(f'    event={ev.get("event")} payload_keys={list((ev.get("payload") or {}).keys())}')
    else:
        print('  FAIL WebSocket — no events received')
except ImportError:
    print('  SKIP websocket-client not installed')
except Exception as e:
    print(f'  FAIL -> {e}')
