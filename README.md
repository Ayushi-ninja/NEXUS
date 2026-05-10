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
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![YOLOv8](https://img.shields.io/badge/YOLOv8-Detection-FF6B35?style=for-the-badge&logo=opencv&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_AI-Intelligence-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)

</div>

---

## 🧠 What is NEXUS AI?

**NEXUS AI** is a real-time, AI-powered smart traffic junction optimization system that replaces outdated fixed-timer signals with an intelligent, adaptive platform. It detects vehicles using computer vision, predicts congestion before it happens, gives emergency vehicles instant corridor priority, adapts to weather conditions, and visualizes everything through a live Digital Twin simulation — all in one unified smart-city command center.

> 🏆 Built for **AI Hackathon 2026** · Problem Statement: *AI-Based Junction Optimization System*

---

## ⚡ Key Features

| Feature | Description | Tech Used |
|---|---|---|
| 🎯 **Real-time Vehicle Detection** | Detects cars, buses, trucks, bikes, and ambulances from CCTV / webcam / video | YOLOv8 + OpenCV |
| 🚦 **Adaptive Signal Optimization** | Dynamically adjusts green/red timing based on real-time lane density | Signal Optimizer Service |
| 🚨 **Emergency Vehicle Priority** | Detects ambulances and instantly creates a cleared traffic corridor | Emergency Logic Module |
| 📊 **Live Smart Dashboard** | Real-time vehicle counts, density, signal states, alerts, and AI insights | React + WebSocket |
| 🏙️ **Digital Twin Simulation** | Animated smart-city junction with live signal sync and weather effects | Framer Motion + Leaflet.js |
| 🌦️ **Weather-Based Adaptation** | Adjusts signal timings for rain, fog, and reduced visibility | OpenWeather API |
| 🤖 **Gemini AI Intelligence** | Natural language congestion insights and predictive recommendations | Gemini AI (Google) |
| 📈 **Congestion Prediction** | Analyzes traffic trends and forecasts upcoming congestion | AI Analytics Engine |

---

## 🏗️ System Architecture

```
Traffic Video Feed / CCTV Camera / Webcam
              ↓
    YOLOv8 + OpenCV Processing
              ↓
  Vehicle Detection + Vehicle Counting
              ↓
    Traffic Density Calculation
              ↓
    Traffic Optimization Engine
              ↓
    Emergency Vehicle Detection
              ↓
     Weather Adaptation Layer
              ↓
   Gemini AI Recommendation Engine
              ↓
  FastAPI Backend APIs + WebSockets
              ↓
    Real-time Frontend Dashboard
              ↓
  Digital Twin Smart-City Visualization
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18 + TypeScript** | Dashboard UI and all page components |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Styling and responsive layout |
| **Framer Motion** | Smooth animations and Digital Twin vehicle motion |
| **Recharts** | Traffic analytics charts and density graphs |
| **Leaflet.js** | Junction map and Digital Twin visualization |
| **Socket.IO Client** | Real-time WebSocket data feed |
| **Axios** | REST API client |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | REST API server and WebSocket broadcaster |
| **Python 3.11** | Core runtime |
| **WebSockets** | Real-time bidirectional data streaming |
| **Async APIs** | Non-blocking inference and parallel processing |

### AI & Computer Vision
| Technology | Purpose |
|---|---|
| **YOLOv8** (Ultralytics) | Vehicle detection and classification |
| **OpenCV** | Frame processing and video stream handling |
| **Gemini AI** (Google) | Traffic intelligence, congestion insights, recommendations |
| **yolov8n.pt** | Pre-trained detection model (6.5 MB, included in repo) |

### Integrations & Deployment
| Technology | Purpose |
|---|---|
| **OpenWeather API** | Live weather — rain, fog, visibility detection |
| **Socket.IO** | Real-time frontend-backend synchronization |
| **Stitch MCP** | Smart-city dashboard preview integration |
| **Vercel** | Frontend deployment |
| **Render / Railway** | Backend deployment |
| **Google Cloud** | Cloud services |

---

## 📁 Project Structure

```
Junction-ai/
│
├── 📁 backend/                          # FastAPI Backend Server
│   ├── main.py                          # App entry — CORS, routes, WebSocket setup
│   ├── requirements.txt                 # Python dependencies
│   ├── .env                             # API keys (gitignored)
│   ├── .env.example                     # Environment variables template
│   ├── render.yaml                      # Render deployment config
│   ├── yolov8n.pt                       # YOLOv8 AI model (6.5 MB)
│   │
│   ├── 📁 api/routes/
│   │   ├── detection.py                 # Vehicle detection endpoints
│   │   ├── traffic.py                   # Traffic data and signal endpoints
│   │   ├── weather.py                   # OpenWeather API integration
│   │   ├── ai_insights.py               # Gemini AI insights endpoints
│   │   └── health.py                    # System health check
│   │
│   ├── 📁 ai_models/
│   │   └── vehicle_detection.py         # YOLOv8 wrapper class
│   │
│   ├── 📁 detection/
│   │   ├── yolo_detector.py             # YOLOv8 detector logic
│   │   └── traffic_processor.py         # Full detection pipeline
│   │
│   ├── 📁 services/
│   │   ├── ai_service.py                # Gemini AI integration service
│   │   ├── signal_optimizer.py          # Adaptive signal timing logic
│   │   ├── traffic_service.py           # Traffic data processing service
│   │   ├── weather_service.py           # Weather API + signal modifier
│   │   └── demo_service.py              # Demo mode automation
│   │
│   ├── 📁 traffic_logic/
│   │   ├── congestion.py                # Congestion calculation algorithms
│   │   ├── emergency.py                 # Emergency vehicle priority logic
│   │   └── signal_controller.py         # Signal state machine
│   │
│   ├── 📁 websocket/
│   │   └── traffic_ws.py                # WebSocket real-time broadcaster
│   │
│   └── 📁 static/
│       └── demo_traffic.mp4             # Demo traffic video (24.4 MB)
│
├── 📁 src/                              # React + TypeScript Frontend
│   ├── main.tsx                         # React entry point
│   ├── App.tsx                          # Root component + navigation state
│   │
│   ├── 📁 pages/
│   │   ├── Dashboard.tsx                # Main traffic overview dashboard
│   │   ├── LiveMonitoring.tsx           # CCTV feed with detection overlays
│   │   ├── DigitalTwin.tsx              # Smart-city junction simulation
│   │   ├── Analytics.tsx                # Traffic trends and forecasting
│   │   ├── AIInsights.tsx               # Gemini AI recommendations
│   │   ├── EmergencyControl.tsx         # Emergency operations panel
│   │   └── Settings.tsx                 # System configuration
│   │
│   ├── 📁 components/                   # 29 reusable UI components
│   │   ├── LiveCameraFeed.tsx           # Camera feed with bounding boxes
│   │   ├── SignalIndicator.tsx          # Traffic light state display
│   │   ├── CongestionMeter.tsx          # Lane density visualization
│   │   ├── EmergencyAlert.tsx           # Emergency alert banner
│   │   ├── WeatherWidget.tsx            # Weather + signal modifier display
│   │   ├── StatCard.tsx                 # Metric summary cards
│   │   └── ... 23 more components
│   │
│   ├── 📁 hooks/
│   │   ├── useRealtimeData.ts           # Unified real-time data hook
│   │   ├── useSocketConnection.ts       # WebSocket connection manager
│   │   ├── useTrafficStats.ts           # Traffic statistics hook
│   │   └── useAIInsights.ts             # Gemini AI insights polling hook
│   │
│   ├── 📁 services/
│   │   ├── apiService.ts                # REST API client (Axios)
│   │   ├── mockDataService.ts           # Demo fallback data service
│   │   └── websocket.ts                 # Socket.IO client
│   │
│   └── 📁 utils/
│       └── formatUtils.ts               # Data formatting helpers
│
├── 📁 stitch-preview/
│   └── dashboard.html                   # Stitch MCP preview
│
├── 📄 package.json                      # NPM dependencies
├── 📄 vite.config.ts                    # Vite configuration
├── 📄 tailwind.config.js                # Tailwind CSS config
├── 📄 tsconfig.json                     # TypeScript config
├── 📄 vercel.json                       # Vercel deployment config
├── 📄 README.md                         # This file
├── 📄 HACKATHON_GUIDE.md                # Hackathon deployment guide
└── 📄 IMPLEMENTATION_REPORT.md          # Full implementation summary
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Webcam, CCTV feed, or traffic video (or just use Demo Mode)

### 1. Clone the repository
```bash
git clone https://github.com/Ayushi-ninja/Junction-ai.git
cd Junction-ai
```

### 2. Configure environment variables
```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and add your keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
OPENWEATHER_API_KEY=your_openweather_key_here
DEMO_MODE=true
```

### 3. Start the backend
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac / Linux

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 4. Start the frontend
```bash
# From project root
npm install
npm run dev
```

### 5. Open the platform
```
Dashboard         →  http://localhost:5173
Live Monitoring   →  http://localhost:5173  (Live Monitoring tab)
Digital Twin      →  http://localhost:5173  (Digital Twin tab)
API Docs          →  http://localhost:8000/docs
Health Check      →  http://localhost:8000/api/health
```

> **💡 Demo Mode** — Set `DEMO_MODE=true` in `backend/.env` to run the full platform using the included `demo_traffic.mp4`. No camera required. Perfect for presentations and judge demos.

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check |
| `POST` | `/api/detection/analyze` | Run YOLOv8 on an uploaded frame |
| `GET` | `/api/traffic/status` | Current traffic density per lane |
| `GET` | `/api/traffic/signals` | Current signal states for all lanes |
| `GET` | `/api/weather` | Live weather data + signal modifier |
| `GET` | `/api/ai_insights` | Gemini AI traffic recommendations |
| `WS` | `/ws/traffic` | Real-time traffic data WebSocket stream |

Full interactive API docs available at `http://localhost:8000/docs` (Swagger UI).

---

## 🎯 Platform Pages

### 📊 Dashboard
Main traffic command center — vehicle counts, congestion meters, signal states, AI insights panel, weather widget, and emergency alerts, all updated live via WebSocket.

### 📹 Live Monitoring
Real-time CCTV / webcam feed with YOLOv8 bounding box overlays. Shows detected vehicle classifications and confidence scores on every frame.

### 🏙️ Digital Twin
Animated smart-city junction simulation. Vehicles move dynamically, traffic signals change in sync with the AI engine, congestion zones glow red, and weather effects (rain, fog) render in real time.

### 📈 Analytics
Historical traffic trend charts, congestion forecasting, signal efficiency metrics, and lane-by-lane performance breakdown powered by Recharts.

### 🤖 AI Insights
Gemini AI-generated operational intelligence — congestion predictions, proactive signal optimization suggestions, and smart-city traffic advisories in natural language.

### 🚨 Emergency Control
Dedicated panel for ambulance monitoring, manual emergency override activation, and real-time priority corridor visualization.

### ⚙️ Settings
System configuration — API connection settings, demo mode toggle, YOLOv8 detection thresholds, and signal timing parameters.

---

## 🚨 Emergency Vehicle Flow

```
Ambulance enters camera frame
          ↓
YOLOv8 detects "ambulance" class
          ↓
Emergency logic module activates
          ↓
All conflicting signals → RED
          ↓
Ambulance approach lane → GREEN (30s override)
          ↓
Emergency alert broadcasts via WebSocket
          ↓
Dashboard shows full-width alert banner
          ↓
Digital Twin animates the priority corridor
          ↓
Ambulance clears junction
          ↓
Normal adaptive signal timing resumes
```

---

## 🌦️ Weather Adaptation

| Condition | Signal Modifier | Reason |
|---|---|---|
| ☀️ Clear | ×1.0 | Normal timing |
| 🌧️ Rain | ×1.2 | Extended stopping distance |
| 🌫️ Fog | ×1.5 | Severely reduced visibility |
| 🌁 Haze | ×1.1 | Slight caution increase |

---

## ✅ Feature Checklist

### Core Features
- [x] Real-time vehicle detection (YOLOv8 + OpenCV)
- [x] Vehicle classification — car, bus, truck, bike, ambulance
- [x] Adaptive signal timing based on live lane density
- [x] Emergency vehicle detection and instant signal override
- [x] Live smart dashboard with real-time WebSocket updates
- [x] AI-generated traffic insights (Gemini AI)
- [x] Weather-based signal timing adaptation (OpenWeather API)
- [x] Congestion analysis and prediction engine

### Bonus Features
- [x] Digital Twin smart-city junction simulation
- [x] Demo mode with included traffic video (no camera required)
- [x] Stitch MCP dashboard preview integration
- [x] Full TypeScript frontend (29 components, 7 pages)
- [x] Vercel + Render cloud deployment ready
- [x] Interactive API documentation (Swagger UI)

---

## 🔮 Future Scope

- Multi-junction city-wide signal coordination
- Reinforcement learning signal optimizer (Stable-Baselines3)
- Drone-based aerial traffic monitoring
- Smart parking integration
- Pollution-aware adaptive traffic routing
- Public transport signal priority lanes
- Edge AI inference deployed at traffic poles
- City-wide smart mobility analytics platform

---

## 📄 Documentation

| File | Description |
|---|---|
| `README.md` | Project overview (this file) |
| `HACKATHON_GUIDE.md` | Step-by-step hackathon deployment guide |
| `IMPLEMENTATION_REPORT.md` | Full technical implementation summary |
| `backend/.env.example` | Environment variables template |
| `backend/render.yaml` | Render backend deployment config |
| `vercel.json` | Vercel frontend deployment config |

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
