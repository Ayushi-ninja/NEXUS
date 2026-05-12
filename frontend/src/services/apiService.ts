/**
 * Centralized REST API service layer.
 * All backend HTTP calls go through here — never call fetch() directly in components.
 */

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const V1 = `${BASE}/api/v1`;

// ── Generic fetch helper ───────────────────────────────────────────────────

async function get<T>(path: string): Promise<T> {
  try {
    const res = await fetch(`${V1}${path}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
    return res.json();
  } catch (err) {
    console.warn(`[API] GET ${path} failed, returning null:`, err);
    return null as T;
  }
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  try {
    const res = await fetch(`${V1}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
    return res.json();
  } catch (err) {
    console.warn(`[API] POST ${path} failed, returning null:`, err);
    return null as T;
  }
}

async function del<T>(path: string): Promise<T> {
  try {
    const res = await fetch(`${V1}${path}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`DELETE ${path} → ${res.status}`);
    return res.json();
  } catch (err) {
    console.warn(`[API] DELETE ${path} failed, returning null:`, err);
    return null as T;
  }
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface ApiSignal {
  direction: 'north' | 'south' | 'east' | 'west';
  color: 'red' | 'yellow' | 'green';
  timer: number;
  total_duration: number;
}

export interface ApiLaneDensity {
  direction: 'north' | 'south' | 'east' | 'west';
  vehicle_count: number;
  density_percent: number;
  avg_speed_kmh: number;
  is_congested: boolean;
}

export interface ApiTrafficStatus {
  junction_id: string;
  timestamp: string;
  signals: ApiSignal[];
  density: ApiLaneDensity[];
  total_vehicles: number;
  overall_congestion_percent: number;
  throughput_per_minute: number;
}

export interface ApiWeatherData {
  condition: 'clear' | 'rain' | 'fog' | 'storm';
  temperature_c: number;
  humidity_percent: number;
  visibility_km: number;
  wind_speed_kmh: number;
  precipitation_mm: number;
  timestamp: string;
}

export interface ApiAIRecommendation {
  recommendation_id: string;
  category: 'signal_timing' | 'emergency' | 'congestion' | 'weather_adaptation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affected_directions: string[];
  suggested_action: string;
  expected_improvement_percent: number;
  confidence: number;
  timestamp: string;
}

export interface ApiEmergencyAlert {
  alert_id: string;
  active: boolean;
  vehicle_type: string;
  direction: 'north' | 'south' | 'east' | 'west';
  priority_granted: boolean;
  estimated_clearance_secs: number;
  timestamp: string;
}

export interface ApiTrafficPrediction {
  direction: 'north' | 'south' | 'east' | 'west';
  predicted_density_percent: number;
  predicted_wait_secs: number;
  confidence: number;
  recommendation: string;
}

export interface ApiForecast {
  forecast: Array<{
    hour: number;
    label: string;
    predicted_density: number;
    is_current: boolean;
    is_peak: boolean;
  }>;
  peak_hour: string;
  peak_density: number;
  recommendation: string;
  generated_at: string;
}

export interface ApiDetectionResult {
  vehicle_count: number;
  density_percentage: number;
  emergency_detected: boolean;
  detections: Array<{
    class: string;
    confidence: number;
    bbox: number[];
    direction: string | null;
    is_emergency: boolean;
  }>;
  lane_counts: Record<string, number>;
  lane_densities: Record<string, number>;
  metadata: {
    frame_width: number;
    frame_height: number;
    model_version: string;
    inference_ms: number;
    confidence_threshold: number;
    frame_number: number;
    was_skipped: boolean;
  };
}

// ── Traffic API ────────────────────────────────────────────────────────────

export const trafficApi = {
  getStatus: (junctionId = 'JCT-001') =>
    get<ApiTrafficStatus>(`/traffic/status?junction_id=${junctionId}`),

  getSignals: () => get<ApiSignal[]>('/traffic/signals'),

  getDensity: () => get<ApiLaneDensity[]>('/traffic/density'),

  getPredictions: () => get<ApiTrafficPrediction[]>('/traffic/predictions'),

  getForecast: () => get<ApiForecast>('/traffic/forecast'),

  triggerEmergency: (direction: string) =>
    post<ApiEmergencyAlert>(`/traffic/emergency?direction=${direction}`),

  clearEmergency: () => del<{ status: string; message: string }>('/traffic/emergency'),

  getEmergency: () => get<ApiEmergencyAlert>('/traffic/emergency'),
};

// ── Weather API ────────────────────────────────────────────────────────────

export const weatherApi = {
  getCurrent: () => get<ApiWeatherData>('/weather/current'),
};

// ── AI API ─────────────────────────────────────────────────────────────────

export const aiApi = {
  getRecommendations: (limit = 3) =>
    get<ApiAIRecommendation[]>(`/ai/recommendations?limit=${limit}`),
};

// ── Detection API ──────────────────────────────────────────────────────────

export const detectionApi = {
  analyzeImage: async (file: File): Promise<ApiDetectionResult> => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${V1}/detection/image`, { method: 'POST', body: form });
    if (!res.ok) throw new Error(`Detection failed: ${res.status}`);
    return res.json();
  },

  getStatus: () => get<{ engine: string; status: string; device: string }>('/detection/status'),
};

// ── Demo API ───────────────────────────────────────────────────────────────

export const demoApi = {
  start: () => post<{ status: string; message: string; steps: unknown[] }>('/demo/start'),
  reset: () => post<{ status: string; message: string }>('/demo/reset'),
  getStatus: () => get<{ running: boolean; sim_densities: Record<string, number>; weather: string; emergency_active: boolean }>('/demo/status'),
};

// ── Health ─────────────────────────────────────────────────────────────────

export const healthApi = {
  check: () => fetch(`${BASE}/health`).then(r => r.json()),
};
