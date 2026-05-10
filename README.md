<div align="center">

```
███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗     █████╗ ██╗
████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝    ██╔══██╗██║
██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗    ███████║██║
██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║    ██╔══██║██║
██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║    ██║  ██║██║
╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝    ╚═╝  ╚═╝╚═╝
```

### *Neural-Adaptive Traffic Intelligence System*

**Every second counts. NEXUS makes them count less.**

---

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Detection-FF6B35?style=for-the-badge&logo=opencv&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

## 🧠 What is NEXUS AI?

**NEXUS AI** is a real-time, AI-powered traffic junction optimization system that replaces outdated fixed-timer signals with an intelligent, adaptive platform. It detects vehicles using computer vision, predicts congestion before it happens, gives emergency vehicles instant priority, and visualizes the entire junction as a live 3D digital twin — all in one unified smart-city dashboard.

> Built for the AI Hackathon 2026 · Problem Statement: *AI-Based Junction Optimization System*

---

## ⚡ Key Features

| Feature | Description | AI Tech Used |
|---|---|---|
| 🎯 **Real-time Detection** | Counts and classifies vehicles per lane from live camera feed | YOLOv8 + OpenCV |
| 🚦 **Adaptive Signals** | Dynamically adjusts green/red timing based on lane density | Reinforcement Learning (Q-learning) |
| 🚨 **Emergency Override** | Detects ambulances and clears their path in under 2 seconds | YOLOv8 fine-tuned on emergency vehicles |
| 📈 **Congestion Prediction** | Forecasts traffic density 60 minutes ahead | Prophet time-series model |
| 🌦️ **Weather Adaptation** | Adjusts signal timing for rain, fog, and haze conditions | OpenWeatherMap API + rule engine |
| 🏙️ **Digital Twin** | Live 3D simulation of the junction with animated vehicles | Three.js + React Three Fiber |
| 🤖 **AI Analyst** | Natural language insights and recommendations | Claude API (claude-sonnet-4) |
| 📊 **Live Dashboard** | Real-time monitoring of all 4 junction lanes | React 18 + WebSocket + Recharts |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        NEXUS AI PLATFORM                        │
├─────────────────┬───────────────────────┬───────────────────────┤
│   PERCEPTION    │     INTELLIGENCE       │    VISUALIZATION      │
│                 │                        │                       │
│  📷 Camera Feed │  🧠 RL Signal Engine   │  📊 React Dashboard   │
│       ↓         │         ↑              │         ↑             │
│  YOLOv8 Model   │  Density Scores        │  WebSocket Stream     │
│       ↓         │         ↑              │         ↑             │
│  Vehicle Count  │  Prophet Forecaster    │  FastAPI Backend      │
│       ↓         │         ↑              │         ↑             │
│  Density Score  │  Weather Modifier      │  Redis Pub/Sub        │
│       ↓         │         ↑              │         ↑             │
│  MQTT Publish ──┴─→ Signal Controller ──┴→ 3D Digital Twin      │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                    Claude API (AI Analyst)
                    "North lane congestion 
                     expected in 12 minutes"
```

---

## 🛠️ Tech Stack

### Backend
| Tool | Purpose |
|---|---|
| **FastAPI** | REST API + WebSocket server |
| **Redis** | Real-time pub/sub message bus |
| **MQTT (Mosquitto)** | Emergency vehicle event bus |
| **Python 3.11** | Core runtime |

### AI / ML
| Tool | Purpose |
|---|---|
| **YOLOv8** (Ultralytics) | Vehicle detection & classification |
| **OpenCV** | Frame processing & video stream |
| **Stable-Baselines3** | Reinforcement learning signal optimizer |
| **Prophet** | Traffic congestion forecasting |
| **Claude API** | Natural language traffic insights |
| **Roboflow** | Emergency vehicle dataset |

### Frontend
| Tool | Purpose |
|---|---|
| **React 18 + Vite** | Dashboard UI |
| **Tailwind CSS + shadcn/ui** | Component styling |
| **Recharts** | Real-time forecast charts |
| **Three.js / R3F** | 3D digital twin simulation |
| **Framer Motion** | Smooth UI animations |
| **Leaflet.js** | Map overlay |

### Infrastructure
| Tool | Purpose |
|---|---|
| **Docker + Compose** | One-command deployment |
| **OpenWeatherMap API** | Live weather data |
| **Vercel** | Frontend deployment |

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Node.js 20+
- Python 3.11+

### 1. Clone the repo
```bash
git clone https://github.com/Ayushi-ninja/Junction-ai.git
cd Junction-ai
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Edit .env and add your API keys:
# ANTHROPIC_API_KEY=your_key_here
# OPENWEATHER_API_KEY=your_key_here
```

### 3. Run with Docker (recommended)
```bash
docker-compose up --build
```

### 4. Or run manually

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 5. Open the dashboard
```
Dashboard:      http://localhost:5173
Digital Twin:   http://localhost:5173/simulation
API Docs:       http://localhost:8000/docs
```

> **Demo Mode**: Set `DEMO_MODE=true` in `.env` to run the full system without a camera using pre-recorded traffic replay data.

---

## 📁 Project Structure

```
junction-ai/
├── frontend/                  # React 18 dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── JunctionView.jsx      # SVG junction diagram
│   │   │   ├── LaneCard.jsx          # Per-lane stats card
│   │   │   ├── ForecastChart.jsx     # Recharts density forecast
│   │   │   ├── WeatherWidget.jsx     # Weather + signal modifier
│   │   │   ├── EmergencyBanner.jsx   # Alert overlay
│   │   │   ├── AIInsightPanel.jsx    # Claude AI analyst panel
│   │   │   └── DigitalTwin.jsx       # Three.js 3D simulation
│   │   ├── hooks/
│   │   │   ├── useSignalSocket.js    # WebSocket signal feed
│   │   │   ├── useDetectionSocket.js # WebSocket detection feed
│   │   │   └── useTrafficData.js     # Unified data hook
│   │   └── pages/
│   │       ├── Dashboard.jsx
│   │       ├── Simulation.jsx
│   │       └── Analytics.jsx
│
├── backend/                   # FastAPI server
│   ├── main.py                # App entry + WebSocket endpoints
│   ├── routers/
│   │   ├── signals.py         # Signal state API
│   │   ├── detection.py       # Vehicle detection API
│   │   ├── forecast.py        # Prophet forecast API
│   │   ├── weather.py         # OpenWeatherMap API
│   │   └── insights.py        # Claude AI analyst API
│   ├── services/
│   │   ├── redis_client.py
│   │   └── mqtt_client.py
│   └── models/schemas.py
│
├── ml/                        # AI/ML models
│   ├── detector.py            # YOLOv8 vehicle detector
│   ├── signal_controller.py   # RL signal optimizer
│   └── forecaster.py          # Prophet forecaster
│
├── simulation/                # Digital twin (standalone)
├── demo/                      # Mock data + replay scripts
│   ├── traffic_sequence.json
│   ├── forecast_sequence.json
│   ├── signal_sequence.json
│   ├── weather_mock.json
│   └── replay.py
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ✅ Feature Checklist

### Core Features
- [x] Real-time vehicle detection (YOLOv8)
- [x] Vehicle classification (car / bus / truck / motorcycle)
- [x] Adaptive signal timing based on lane density
- [x] Emergency vehicle detection and signal override
- [x] Traffic congestion prediction (60-minute horizon)
- [x] Live monitoring dashboard (4-lane view)
- [x] AI natural language traffic insights (Claude API)

### Bonus Features
- [x] 3D Digital Twin simulation (Three.js)
- [x] Weather-based signal adaptation (rain / fog / haze)
- [x] MQTT-based emergency event bus
- [x] Demo replay mode (no camera required)
- [x] Reinforcement learning signal optimizer

---

## 🎬 How It Works

### 1. Vehicle Detection
YOLOv8 processes each camera frame and detects vehicles per lane. Each vehicle type is weighted (car=1, motorcycle=0.5, bus=2, truck=2) to compute a **density score** from 0.0 to 1.0.

### 2. Adaptive Signal Control
The RL agent receives a state vector `[north_density, south_density, east_density, west_density]` every 5 seconds. It selects which lane gets an extended green phase to minimize total junction wait time. The weather modifier then scales all timings (e.g. ×1.2 in rain).

### 3. Emergency Override
When an ambulance is detected, NEXUS immediately:
- Publishes to MQTT topic `junction/emergency`
- Sets all conflicting lanes to RED
- Gives the ambulance lane a 30-second GREEN
- Restores normal AI timing on exit

### 4. Congestion Prediction
Prophet forecasts density per lane for the next 60 minutes using historical patterns (rush hour peaks, day-of-week trends). Alerts trigger when predicted density exceeds 85%.

### 5. AI Analyst
Every 90 seconds, current junction state is sent to Claude API, which returns a 2-sentence insight and one actionable recommendation displayed on the dashboard.

---

## 🌦️ Weather Adaptation

| Condition | Signal Modifier | Reason |
|---|---|---|
| Clear | ×1.0 | Normal timing |
| Rain | ×1.2 | Longer stopping distance |
| Fog | ×1.5 | Reduced visibility |
| Haze | ×1.1 | Slight caution |

---

## 👥 Team

Built with ❤️ at **AI Hackathon 2026**

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**NEXUS AI** · *Smarter junctions. Safer cities. Zero wasted seconds.*

⭐ Star this repo if NEXUS impressed you!

</div>
