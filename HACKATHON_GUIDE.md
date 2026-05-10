# AI Junction Optimization System — Hackathon Guide

## Human-Required Tasks

### 1. Configure OpenWeather API Key (5 min)

**WHY:** Live weather data for realistic signal adaptation and weather overlays.

**STEPS:**
1. Get free API key from https://openweathermap.org/api
2. Edit `backend/.env`
3. Replace: `OPENWEATHER_API_KEY=your_openweather_key_here`
4. Set: `WEATHER_CITY=Mumbai` (or your city)

**CREDENTIALS:** OpenWeather account (free tier)

**EXPECTED RESULT:** Weather endpoint returns live data instead of mock.

---

### 2. Verify Gemini API Key (2 min)

**WHY:** AI insights need real Gemini API for professional recommendations.

**STEPS:**
1. Check `backend/.env` has: `GEMINI_API_KEY=AIzaSyCAjBOdiu4VOVbpkAXiBCu3Re2vokW0bR8`
2. Test AIInsights page in frontend
3. If invalid, get new key from https://ai.google.dev/

**CREDENTIALS:** Google Cloud project with Gemini API enabled

**EXPECTED RESULT:** AI insights generate real recommendations instead of mock.

---

### 3. Add Demo Traffic Video (10 min)

**WHY:** YOLO detection needs real traffic video for live demo.

**STEPS:**
1. Download traffic video from YouTube/Pexels (30-60s)
2. Save as `backend/static/demo_traffic.mp4`
3. Test detection endpoint with video file

**CREDENTIALS:** None

**EXPECTED RESULT:** YOLO processes real video and returns vehicle detections.

---

### 4. Deploy Frontend to Vercel (5 min)

**WHY:** Live demo needs public URL for judges.

**STEPS:**
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel login`
3. Run: `vercel deploy --prod`
4. Set env var in Vercel dashboard: `VITE_API_URL=https://your-backend.onrender.com`

**CREDENTIALS:** Vercel account (free tier)

**EXPECTED RESULT:** Frontend accessible at `https://your-project.vercel.app`

---

### 5. Deploy Backend to Render (10 min)

**WHY:** Backend needs public URL for WebSocket/REST API.

**STEPS:**
1. Create account at https://render.com
2. Connect GitHub repo
3. Create Web Service
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Set env vars: `GEMINI_API_KEY`, `OPENWEATHER_API_KEY`, `ALLOWED_ORIGINS`

**CREDENTIALS:** Render account (free tier)

**EXPECTED RESULT:** Backend accessible at `https://your-backend.onrender.com`

---

### 6. Live Demo Rehearsals (30 min)

**WHY:** Smooth demo flow maximizes hackathon impact.

**RECOMMENDED FLOW (3 min):**
1. **Dashboard (30s)** — Show live stats, signal states, congestion charts
2. **Digital Twin (60s)** — Show vehicle simulation, emergency trigger, weather effects
3. **Live Monitoring (30s)** — Show AI detection feed
4. **AI Insights (30s)** — Show Gemini recommendations
5. **Emergency Control (30s)** — Click "Start Demo" to show automated sequence

**EXPECTED RESULT:** Confident, smooth demo that highlights AI realism.

---

## Quick Start for Hackathon Demo

### Local Setup (5 min)

```bash
# Terminal 1: Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 2: Frontend
npm install
npm run dev
```

### Demo URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- WebSocket: ws://localhost:8000/ws/traffic

### Demo Mode

Navigate to **Emergency Control** page → Click **"Start Demo"** button.

This runs a 90-second automated sequence:
1. Congestion spike (density → 85%)
2. AI insight recommendation
3. Emergency vehicle trigger (ambulance)
4. Rain event (weather → rain)
5. AI insight recommendation
6. Reset to normal

---

## Key Talking Points for Judges

1. **Real AI Integration** — YOLOv8 for vehicle detection, Google Gemini for insights
2. **Adaptive Signal Optimization** — Density-driven green phase allocation
3. **Emergency Vehicle Prioritization** — Automatic green wave for ambulances
4. **Weather Adaptation** — Signal timing adjusts for rain/fog
5. **Real-time Digital Twin** — Canvas-based junction simulation
6. **Enterprise Architecture** — FastAPI + React + WebSocket + Pydantic

---

## Fallback Strategy

If anything fails during demo:
- **Backend down:** Frontend automatically falls back to simulation mode
- **AI API fails:** Mock data provides realistic fallback
- **YOLO fails:** Mock detection maintains demo flow
- **WebSocket fails:** Local simulation continues

The system is designed to NEVER completely fail.

---

## Remaining Risks

1. **OpenWeather API quota** — Free tier has limits (1000 calls/day)
2. **Gemini API quota** — Free tier has limits (15 requests/min)
3. **YOLO performance** — CPU inference may be slow on low-end devices
4. **WebSocket stability** — Public networks may block WS connections

**Mitigation:** All APIs have mock fallbacks. Demo can run entirely offline.
