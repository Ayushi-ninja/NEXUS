# AI Junction Optimization System

> **Enterprise-grade Smart City Traffic Intelligence Platform** — Real-time AI-powered junction optimization with digital twin simulation, YOLOv8 vehicle detection, and Google Gemini-driven insights.

---

## Overview

This system provides **end-to-end intelligent traffic management** for a 4-way junction, combining computer vision, adaptive signal optimization, and generative AI to reduce congestion, prioritize emergency vehicles, and adapt to weather conditions — all visualized through a premium cyberpunk-themed dashboard.

### Key Highlights

- **Real-time Digital Twin** — Canvas-based 4-way junction simulation with vehicle physics, signal cycling (green/yellow/red), emergency priority corridors, and weather particle effects
- **YOLOv8 Detection Pipeline** — Frame-skipping, lane-based ROI counting, confidence thresholds, and inference timing for production-grade vehicle detection
- **Adaptive Signal Optimizer** — Density-driven green phase allocation with weather multipliers and emergency preemption logic
- **Google Gemini AI Insights** — Enterprise-grade structured prompting generates data-backed traffic recommendations with automatic mock fallback
- **WebSocket Architecture** — Sub-second broadcast loop with connection health tracking, periodic AI insight events, and per-connection error isolation
- **Premium UI** — Glassmorphism panels, neon glow accents, Framer Motion micro-interactions, and a dark cyberpunk theme

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** + **TypeScript** | UI framework with full type safety |
| **Vite** | Lightning-fast HMR and builds |
| **Tailwind CSS** | Utility-first styling with custom neon/glass theme |
| **Framer Motion** | Smooth page transitions and micro-interactions |
| **Recharts** | Real-time traffic data visualization |
| **Leaflet.js** | Interactive junction map overlays |
| **Lucide React** | 200+ premium icons |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | High-performance async REST + WebSocket API |
| **YOLOv8** (ultralytics) | Real-time vehicle detection and counting |
| **Google Gemini 1.5 Flash** | AI-powered traffic recommendations |
| **Pydantic v2** | Request/response validation and settings |
| **OpenCV** | Frame processing for detection pipeline |

---

## Features

| Page | Description |
|---|---|
| **Dashboard** | Live traffic stats, signal states, congestion charts, AI insights, and junction map — all updating in real-time via WebSocket |
| **Live Monitoring** | CCTV-style camera feed with AI bounding box overlays, vehicle telemetry HUD, and detection confidence meters |
| **Digital Twin** | Interactive 4-way junction simulation with vehicle animations, traffic signal cycling, emergency corridors, weather effects (rain/fog), and congestion heatmaps |
| **AI Insights** | Gemini-powered recommendations with confidence scores, priority categories, and affected direction mapping |
| **Emergency Control** | One-click emergency triggering with priority lane visualization and auto-clearance timers |
| **Analytics** | Historical traffic patterns, throughput trends, and congestion analysis charts |
| **Settings** | System configuration, API key management, and simulation parameters |

---

## Quick Start

### Prerequisites

- **Node.js 18+** and **npm**
- **Python 3.11+** and **pip**
- (Optional) **Google Gemini API Key** for live AI recommendations

### 1. Frontend Setup

```bash
# From project root
npm install
cp .env.example .env      # configure VITE_WS_URL
npm run dev
```

Frontend runs at **http://localhost:5173**

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (macOS/Linux)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env → add your GEMINI_API_KEY (optional)

# Start server
uvicorn main:app --reload
```

Backend runs at:
- **REST API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **WebSocket**: ws://localhost:8000/ws/traffic

### 3. Build for Production

```bash
npm run build    # Frontend → dist/
```

---

## Project Structure

```
Junction-ai/
├── src/                          # Frontend (React + TypeScript)
│   ├── components/
│   │   ├── digital-twin/         # Canvas simulation components
│   │   │   ├── TrafficJunctionCanvas.tsx   # Main 2D junction renderer
│   │   │   ├── VehicleOverlay.tsx          # SVG vehicle sprites
│   │   │   ├── TrafficSignalPanel.tsx      # Signal control sidebar
│   │   │   ├── WeatherOverlayControl.tsx   # Weather effect controls
│   │   │   ├── CongestionHeatPanel.tsx     # Heatmap overlay panel
│   │   │   ├── EmergencyPanel.tsx          # Emergency trigger panel
│   │   │   ├── MiniMapOverlay.tsx          # Corner mini-map
│   │   │   └── SimulationTimeline.tsx      # Phase timeline strip
│   │   ├── StatCard.tsx          # Animated stat display
│   │   ├── SignalStatusCard.tsx   # Traffic light indicator
│   │   ├── AIInsightCard.tsx      # AI recommendation card
│   │   ├── CCTVMonitor.tsx        # CCTV feed with AI overlays
│   │   ├── Sidebar.tsx / Navbar.tsx
│   │   └── ...                    # 20+ reusable components
│   ├── pages/                     # 7 route pages
│   ├── hooks/
│   │   ├── useSimulationEngine.ts # Full physics simulation engine
│   │   ├── useRealtimeData.ts     # WebSocket + simulation fallback
│   │   ├── useAmbientAudio.ts     # Weather/emergency sound effects
│   │   └── ...
│   ├── websocket/socketClient.ts  # WS client with reconnection
│   └── services/websocket.ts      # Mock WS for offline demo
│
├── backend/                       # Backend (FastAPI + Python)
│   ├── api/
│   │   ├── routes/                # REST endpoints (traffic, weather, AI, detection, health)
│   │   └── schemas.py             # Pydantic models
│   ├── detection/
│   │   └── yolo_detector.py       # YOLOv8 pipeline with lane ROIs
│   ├── traffic_logic/
│   │   ├── signal_optimizer.py    # Adaptive signal timing engine
│   │   └── signal_controller.py   # Phase controller
│   ├── services/                  # Business logic (traffic, AI, weather, detection)
│   ├── websocket/
│   │   ├── manager.py             # Connection pool + broadcast loop
│   │   └── routes.py              # WS command handler
│   ├── config/settings.py         # Pydantic BaseSettings
│   └── main.py                    # FastAPI entry point
│
├── tailwind.config.js             # Custom neon/glass theme
├── package.json
└── README.md
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │Dashboard │  │Digital   │  │  Live    │  │   AI   │ │
│  │          │  │  Twin    │  │Monitoring│  │Insights│ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘ │
│       │              │              │             │      │
│  ┌────▼──────────────▼──────────────▼─────────────▼───┐ │
│  │           useRealtimeData (Hook)                   │ │
│  │    WebSocket ←→ Simulation Fallback                │ │
│  └────────────────────────┬───────────────────────────┘ │
└───────────────────────────┼─────────────────────────────┘
                            │ ws://localhost:8000/ws/traffic
┌───────────────────────────▼─────────────────────────────┐
│                   FastAPI Backend                         │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │  WebSocket  │  │   Signal     │  │   YOLOv8      │ │
│  │  Manager    │  │  Optimizer   │  │  Detector     │ │
│  │ (broadcast) │  │  (adaptive)  │  │ (lane-aware)  │ │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘ │
│         │                │                    │         │
│  ┌──────▼────────────────▼────────────────────▼──────┐ │
│  │            Google Gemini AI Service               │ │
│  │     (enterprise prompting + mock fallback)        │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Demo Flow (Recommended for Judges)

### Step 1 — Dashboard (30s)
Show the live dashboard with updating stats, signal indicators, and congestion charts. Point out the real-time WebSocket data flow.

### Step 2 — Digital Twin (60s)
Navigate to `/digital-twin`. Demonstrate:
- Vehicle spawning and physics simulation
- **Signal cycling** (green → yellow → red)
- Click **Emergency** to trigger ambulance priority corridor
- Toggle **Weather** (rain/fog) to show particle effects and speed adaptation
- Use **Speed** controls (0.5x–3x)
- Hover vehicles for tooltip inspection

### Step 3 — Live Monitoring (30s)
Show the CCTV-style interface with AI bounding box overlays and real-time inference stats.

### Step 4 — AI Insights (30s)
Demonstrate Gemini-powered recommendations with confidence scores and affected directions.

### Step 5 — Backend (30s)
Open **http://localhost:8000/docs** to show the Swagger UI and live API endpoints.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `GEMINI_API_KEY` | *(empty)* | Google Gemini API key for AI recommendations |
| `OPENWEATHER_API_KEY` | *(empty)* | OpenWeather key for live weather data |
| `SIMULATION_TICK_MS` | `1000` | WebSocket broadcast interval (ms) |
| `EMERGENCY_CLEAR_SECS` | `30` | Auto-clear emergency after N seconds |
| `DEBUG` | `False` | Enable debug mode and hot reload |
| `ALLOWED_ORIGINS` | `localhost:5173,5174,3000` | CORS allowed origins |

---

## WebSocket Commands

Connect to `ws://localhost:8000/ws/traffic` and send JSON:

```json
{"command": "ping"}
{"command": "trigger_emergency", "direction": "north"}
{"command": "clear_emergency"}
{"command": "set_weather", "condition": "rain", "multiplier": 1.3}
{"command": "set_demo_density", "value": 85}
{"command": "reset"}
{"command": "get_status"}
```

---

## What's Simulated vs. Real

| Component | Status |
|---|---|
| Vehicle detection (YOLOv8) | **Real** — runs on uploaded images/video |
| Signal optimization | **Real** — adaptive timing based on density + weather |
| Gemini AI insights | **Real** — live API calls with structured prompting |
| Digital Twin vehicles | **Simulated** — physics engine in `useSimulationEngine.ts` |
| WebSocket traffic data | **Simulated** — realistic fluctuations via `manager.py` |
| CCTV camera feeds | **Simulated** — placeholder video with AI overlay HUD |
| Weather data | **Simulated** — mock data (real OpenWeather integration ready) |

---

## Deployment

### Frontend → Vercel
```bash
# vercel.json is already configured
vercel deploy --prod
# Set env var in Vercel dashboard:
#   VITE_WS_URL = wss://your-backend.onrender.com/ws/traffic
```

### Backend → Render
1. Connect your GitHub repo to [render.com](https://render.com)
2. Select `backend/render.yaml` as the service config
3. Set secret env vars: `GEMINI_API_KEY`, `OPENWEATHER_API_KEY`
4. Update `ALLOWED_ORIGINS` to include your Vercel frontend URL

---

## License

MIT License