import { useState, useEffect } from 'react';
import socketClient from '../websocket/socketClient';
import {
  mockJunctions,
  mockTrafficStats,
  mockAIInsights,
  mockEmergencyAlerts,
  mockCameraFeeds,
  generateLiveUpdate,
  type JunctionData,
  type TrafficStats,
  type AIInsight,
  type EmergencyAlert,
  type CameraFeed
} from '../services/mockDataService';

// Map direction from WS to the mock junction IDs so UI looks consistent
const directionToJunctionMap: Record<string, string> = {
  north: 'j1',
  south: 'j2',
  east: 'j3',
  west: 'j4',
};

/**
 * Hook for Socket Connection
 */
export const useSocketConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setConnectionStatus('connected');
    };
    const handleDisconnect = () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };
    const handleConnecting = () => {
      setConnectionStatus('connecting');
    };

    socketClient.connect();
    socketClient.on('connect', handleConnect);
    socketClient.on('disconnect', handleDisconnect);
    socketClient.on('connecting', handleConnecting);

    // Check initial state
    setIsConnected(socketClient.isConnected());
    setConnectionStatus(socketClient.isConnected() ? 'connected' : 'connecting');

    return () => {
      socketClient.off('connect', handleConnect);
      socketClient.off('disconnect', handleDisconnect);
      socketClient.off('connecting', handleConnecting);
    };
  }, []);

  return { isConnected, connectionStatus };
};

/**
 * Unified Hook for all Junction Telemetry
 */
export const useJunctionData = () => {
  const [junctions, setJunctions] = useState<JunctionData[]>(mockJunctions);
  const { isConnected } = useSocketConnection();

  useEffect(() => {
    const handleTrafficUpdate = (payload: any) => {
      const data = payload?.payload || payload;
      const lanes = data?.lanes;
      if (!lanes) return;

      setJunctions(prev => {
        const next = [...prev];
        Object.entries(lanes).forEach(([dir, lane]: [string, any]) => {
          const jId = directionToJunctionMap[dir.toLowerCase()];
          const jIndex = next.findIndex(j => j.id === jId);
          if (jIndex !== -1) {
            next[jIndex] = {
              ...next[jIndex],
              trafficFlow: lane.congestion ?? next[jIndex].trafficFlow,
              status: lane.density > 80 ? 'critical' : lane.density > 50 ? 'congested' : 'normal',
              signalState: lane.signal || next[jIndex].signalState,
              avgWaitTime: lane.timer || next[jIndex].avgWaitTime,
            };
          }
        });
        return next;
      });
    };

    if (isConnected) {
      socketClient.on('traffic_update', handleTrafficUpdate);
      socketClient.on('initial_state', handleTrafficUpdate);
    }

    // Simulation Fallback (If not connected)
    let interval: any;
    if (!isConnected) {
      interval = setInterval(() => {
        setJunctions(current => current.map(generateLiveUpdate));
      }, 3000);
    }

    return () => {
      socketClient.off('traffic_update', handleTrafficUpdate);
      socketClient.off('initial_state', handleTrafficUpdate);
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);

  return junctions;
};

/**
 * Hook for Aggregate Traffic Stats
 */
export const useTrafficStats = () => {
  const [stats, setStats] = useState<TrafficStats>(mockTrafficStats);
  const { isConnected } = useSocketConnection();

  useEffect(() => {
    const handleTrafficUpdate = (payload: any) => {
      const data = payload?.payload || payload;
      const s = data?.stats;
      const e = data?.emergency;
      if (!s) return;

      setStats({
        totalVehicles: s.total_vehicles,
        avgSpeed: s.avg_speed,
        congestionLevel: s.congestion_level,
        incidents: e?.active ? 1 : 0
      });
    };

    if (isConnected) {
      socketClient.on('traffic_update', handleTrafficUpdate);
      socketClient.on('initial_state', handleTrafficUpdate);
    } else {
      // Local drift for mock feel
      const interval = setInterval(() => {
        setStats(prev => ({
          ...prev,
          totalVehicles: prev.totalVehicles + (Math.random() > 0.5 ? 1 : -1),
          congestionLevel: Math.max(10, Math.min(90, prev.congestionLevel + (Math.random() - 0.5) * 2))
        }));
      }, 4000);
      return () => clearInterval(interval);
    }

    return () => {
      socketClient.off('traffic_update', handleTrafficUpdate);
      socketClient.off('initial_state', handleTrafficUpdate);
    };
  }, [isConnected]);

  return stats;
};

/**
 * Hook for AI Recommendations
 */
export const useAIInsights = () => {
  const [insights, setInsights] = useState<AIInsight[]>(mockAIInsights);
  const { isConnected } = useSocketConnection();

  useEffect(() => {
    const handleAIInsight = (payload: any) => {
      const data = payload?.payload || payload;
      const newInsight: AIInsight = {
        id: data.insight_id || `ai-${Date.now()}`,
        type: (data.category || 'optimization') as AIInsight['type'],
        title: data.title || 'Smart Optimization',
        description: data.description || 'AI suggests signal adjustment.',
        confidence: data.confidence || 0.95,
        timestamp: new Date()
      };
      setInsights(prev => [newInsight, ...prev].slice(0, 5));
    };

    if (isConnected) {
      socketClient.on('ai_insight', handleAIInsight);
    }

    return () => {
      socketClient.off('ai_insight', handleAIInsight);
    };
  }, [isConnected]);

  return insights;
};

/**
 * Hook for Emergency Alerts
 */
export const useEmergencyAlerts = () => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(mockEmergencyAlerts);
  const { isConnected } = useSocketConnection();

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' as const } : a));
  };

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' as const } : a));
  };

  useEffect(() => {
    const handleEmergency = (payload: any) => {
      const data = payload?.payload || payload;
      const e = data?.emergency;
      if (!e?.active) return;

      const newAlert: EmergencyAlert = {
        id: `emergency-${Date.now()}`,
        severity: 'critical',
        type: 'Ambulance Detected',
        location: e.direction ? `Approach: ${e.direction}` : 'Main Junction',
        description: 'Priority signal wave activated for emergency corridor clearance.',
        timestamp: new Date(),
        status: 'active'
      };
      setAlerts(prev => [newAlert, ...prev].slice(0, 5));
    };

    if (isConnected) {
      socketClient.on('traffic_update', handleEmergency);
      socketClient.on('initial_state', handleEmergency);
    }

    return () => {
      socketClient.off('traffic_update', handleEmergency);
      socketClient.off('initial_state', handleEmergency);
    };
  }, [isConnected]);

  return { alerts, acknowledgeAlert, resolveAlert };
};

/**
 * Hook for Live Signal States
 */
export interface SignalState {
  direction: string;
  color: 'red' | 'yellow' | 'green';
  timer: number;
  active: boolean;
}

const DEFAULT_SIGNALS: SignalState[] = [
  { direction: 'North', color: 'green', timer: 24, active: true },
  { direction: 'South', color: 'green', timer: 24, active: true },
  { direction: 'East',  color: 'red',   timer: 18, active: false },
  { direction: 'West',  color: 'red',   timer: 18, active: false },
];

export const useSignalData = (): SignalState[] => {
  const [signals, setSignals] = useState<SignalState[]>(DEFAULT_SIGNALS);
  const { isConnected } = useSocketConnection();

  useEffect(() => {
    const handleUpdate = (payload: any) => {
      const data = payload?.payload || payload;
      const lanes = data?.lanes;
      if (!lanes) return;

      setSignals(prev => {
        const next = [...prev];
        Object.entries(lanes).forEach(([dir, lane]: [string, any]) => {
          const idx = next.findIndex(s => s.direction.toLowerCase() === dir.toLowerCase());
          if (idx !== -1) {
            next[idx] = {
              ...next[idx],
              color: lane.signal ?? next[idx].color,
              timer: lane.timer ?? next[idx].timer,
              active: lane.signal === 'green',
            };
          }
        });
        return next;
      });
    };

    // Global countdown for smooth UI
    const countdown = setInterval(() => {
      setSignals(prev => prev.map(s => ({
        ...s,
        timer: Math.max(0, s.timer - 1),
      })));
    }, 1000);

    if (isConnected) {
      socketClient.on('traffic_update', handleUpdate);
      socketClient.on('initial_state', handleUpdate);
    } else {
      // Basic oscillation for mock feel when offline
      const oscillator = setInterval(() => {
        setSignals(prev => prev.map(s => {
          if (s.timer <= 0) {
            const nextColor = s.color === 'green' ? 'yellow' : (s.color === 'yellow' ? 'red' : 'green');
            return { ...s, color: nextColor, timer: nextColor === 'yellow' ? 4 : 20, active: nextColor === 'green' };
          }
          return s;
        }));
      }, 1000);
      return () => {
        clearInterval(countdown);
        clearInterval(oscillator);
      };
    }

    return () => {
      socketClient.off('traffic_update', handleUpdate);
      socketClient.off('initial_state', handleUpdate);
      clearInterval(countdown);
    };
  }, [isConnected]);

  return signals;
};

/**
 * Hook for Weather Data
 */
export interface WeatherData {
  condition: 'clear' | 'rain' | 'fog' | 'storm';
  temperature_c: number;
  humidity_percent: number;
  visibility_km: number;
  wind_speed_kmh: number;
  precipitation_mm: number;
}

const DEFAULT_WEATHER: WeatherData = {
  condition: 'clear',
  temperature_c: 28.5,
  humidity_percent: 65,
  visibility_km: 9.5,
  wind_speed_kmh: 12,
  precipitation_mm: 0,
};

export const useWeatherData = () => {
  const [weather, setWeather] = useState<WeatherData>(DEFAULT_WEATHER);
  const [loading, setLoading] = useState(false);
  const { isConnected } = useSocketConnection();

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

    const fetchWeather = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/v1/weather/current`);
        if (res.ok) {
          const data = await res.json();
          setWeather(prev => ({
            ...prev,
            ...data,
          }));
        }
      } catch { /* fallback to default */ }
      finally { setLoading(false); }
    };

    const handleWeatherWS = (payload: any) => {
      const data = payload?.payload || payload;
      const w = data?.weather;
      if (w?.condition) {
        setWeather(prev => ({ ...prev, condition: w.condition }));
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 60000);
    
    if (isConnected) {
      socketClient.on('traffic_update', handleWeatherWS);
      socketClient.on('weather_update', handleWeatherWS);
    }

    return () => {
      clearInterval(interval);
      socketClient.off('traffic_update', handleWeatherWS);
      socketClient.off('weather_update', handleWeatherWS);
    };
  }, [isConnected]);

  return { weather, loading };
};

/**
 * Hook for Live Detection Events
 */
export interface DetectionEvent {
  time: string;
  type: string;
  dir: string;
  conf: number;
}

export const useLiveDetection = (maxEntries: number = 12): DetectionEvent[] => {
  const [log, setLog] = useState<DetectionEvent[]>([]);
  const { isConnected } = useSocketConnection();

  useEffect(() => {
    const handleUpdate = (payload: any) => {
      const data = payload?.payload || payload;
      const lanes = data?.lanes;
      const emergency = data?.emergency;
      if (!lanes) return;

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      const entries: DetectionEvent[] = [];

      Object.entries(lanes).forEach(([dir, lane]: [string, any]) => {
        if (lane.count > 0 && Math.random() > 0.7) { // sampled for realism
          entries.push({
            time: timeStr,
            type: lane.density > 75 ? 'Heavy Volume' : 'Vehicle Detected',
            dir: dir.charAt(0).toUpperCase() + dir.slice(1),
            conf: 0.92 + Math.random() * 0.07,
          });
        }
      });

      if (emergency?.active) {
        entries.unshift({
          time: timeStr,
          type: 'PRIORITY VEHICLE',
          dir: emergency.direction?.toUpperCase() || 'UNKNOWN',
          conf: 0.99,
        });
      }

      if (entries.length > 0) {
        setLog(prev => [...entries, ...prev].slice(0, maxEntries));
      }
    };

    if (isConnected) {
      socketClient.on('traffic_update', handleUpdate);
      socketClient.on('initial_state', handleUpdate);
    }

    return () => {
      socketClient.off('traffic_update', handleUpdate);
      socketClient.off('initial_state', handleUpdate);
    };
  }, [isConnected, maxEntries]);

  return log;
};

/**
 * Hook for Camera Feeds
 */
export const useCameraFeeds = () => {
  return useState<CameraFeed[]>(mockCameraFeeds)[0];
};

/**
 * Hook for Analytics Data
 */
export interface AnalyticsData {
  forecast: any;
  density: any[];
  predictions: any[];
  loading: boolean;
}

export const useAnalyticsData = (): AnalyticsData => {
  const [data, setData] = useState<AnalyticsData>({
    forecast: null,
    density: [],
    predictions: [],
    loading: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
        const [forecastRes, densityRes, predictionsRes] = await Promise.all([
          fetch(`${apiUrl}/api/v1/traffic/forecast`).catch(() => null),
          fetch(`${apiUrl}/api/v1/traffic/density`).catch(() => null),
          fetch(`${apiUrl}/api/v1/traffic/predictions`).catch(() => null),
        ]);

        const forecast = forecastRes?.ok ? await forecastRes.json() : null;
        const density = densityRes?.ok ? await densityRes.json() : [];
        const predictions = predictionsRes?.ok ? await predictionsRes.json() : [];

        setData({ forecast, density, predictions, loading: false });
      } catch (err) {
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return data;
};

/**
 * Hook for UI State (Sidebar)
 */
export const useSidebar = () => {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) setIsOpen(false);
      else setIsOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isOpen, isMobile, toggle: () => setIsOpen(!isOpen) };
};
