# AI Junction Optimization System — Backend

A production-ready **FastAPI** scaffold for the AI Junction Optimization System hackathon project.

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.11+
- pip

### 2. Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
```

### 3. Run the Server

```bash
uvicorn main:app --reload
```

The API will be available at:
- **REST API**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **WebSocket**: ws://localhost:8000/ws/traffic

---

## 📁 Folder Structure

```
backend/
├── api/
│   ├── routes/
│   │   ├── traffic.py      # /api/v1/traffic/...
│   │   ├── weather.py      # /api/v1/weather/...
│   │   ├── ai.py           # /api/v1/ai/...
│   │   ├── detection.py    # /api/v1/detection/...
│   │   └── health.py       # /health
│   └── schemas.py          # Pydantic response models
├── models/
│   └── detection.py        # AI detection schemas
├── detection/
│   └── yolo_detector.py    # YOLOv8 implementation
├── websocket/
│   ├── manager.py          # Connection pool + broadcast loop
│   └── routes.py           # WS endpoint handler
├── services/
│   ├── traffic_service.py  # Mock traffic data logic
│   ├── weather_service.py  # Mock weather data logic
│   ├── ai_service.py       # Mock AI recommendations logic
│   └── detection_service.py # AI detection wrapper
├── ai_models/              # Future: ML model loaders
├── traffic_logic/          # Future: Signal optimization algorithms
├── weather/                # Future: Real weather API integration
├── utils/
│   └── logger.py           # Structured logger
├── config/
│   └── settings.py         # Pydantic BaseSettings (env vars)
├── static/                 # Served static files
├── tests/
│   └── test_traffic_api.py # Async pytest suite
├── main.py                 # Application entry point
├── requirements.txt
└── .env.example
```

---

## 🔌 API Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/traffic/status` | Full junction snapshot |
| GET | `/api/v1/traffic/signals` | Signal states |
| GET | `/api/v1/traffic/density` | Lane density metrics |
| GET | `/api/v1/traffic/emergency` | Active emergency status |
| POST | `/api/v1/traffic/emergency?direction=north` | Trigger emergency |
| GET | `/api/v1/traffic/predictions` | AI predictions |
| GET | `/api/v1/weather/current` | Current weather |
| GET | `/api/v1/ai/recommendations?limit=3` | AI recommendations |
| POST | `/api/v1/detection/image` | Detect vehicles in uploaded image |
| POST | `/api/v1/detection/video-snapshot` | Detect in video first frame |
| GET | `/api/v1/detection/status` | Get detection engine status |

### WebSocket — `ws://localhost:8000/ws/traffic`

#### Server → Client Events

| Event | Description |
|-------|-------------|
| `traffic_update` | Vehicle counts, congestion, throughput (every 1s) |
| `signal_update` | Signal colors and timers (every 1s) |
| `congestion_update` | Per-direction congestion levels (every 3s) |
| `emergency_alert` | Priority lane activation events (random 1%) |

#### Client → Server Commands

```json
{ "command": "ping" }
{ "command": "trigger_emergency", "direction": "north" }
```

---

## 🧪 Running Tests

```bash
pip install pytest pytest-asyncio
pytest tests/ -v
```

---

## ⚙️ Environment Variables

See `.env.example` for all available settings. Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DEBUG` | `False` | Enable hot reload and debug logging |
| `PORT` | `8000` | Server port |
| `ALLOWED_ORIGINS` | `["http://localhost:5173"]` | CORS allowed origins |
| `SIMULATION_TICK_MS` | `1000` | WebSocket broadcast interval (ms) |
| `LOG_LEVEL` | `INFO` | Logging verbosity |

---

## 🔮 Roadmap

- [ ] PostgreSQL integration via SQLAlchemy
- [ ] Redis pub/sub for multi-instance WS broadcast
- [ ] Real OpenWeather API integration
- [ ] YOLO v8 vehicle detection model loader
- [ ] JWT authentication middleware
- [ ] Rate limiting per API key
