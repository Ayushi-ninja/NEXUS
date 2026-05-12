import { useState, useEffect } from 'react';
import { 
  JunctionData, 
  TrafficStats, 
  AIInsight, 
  EmergencyAlert, 
  mockJunctions,
  mockTrafficStats,
  mockAIInsights,
  mockEmergencyAlerts,
  mockCameraFeeds,
  generateLiveUpdate
} from '../services/mockDataService';
import { useTrafficWS, useAIInsightsWS, useEmergencyWS } from './useWebSocket';

/**
 * Custom hook to manage junction data with real-time updates
 */
export const useJunctionData = () => {
  const [junctions, setJunctions] = useState<JunctionData[]>(mockJunctions);

  useEffect(() => {
    const interval = setInterval(() => {
      setJunctions(current => current.map(generateLiveUpdate));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return junctions;
};

/**
 * Custom hook to manage traffic stats with WebSocket updates
 */
export const useTrafficStats = () => {
  const [stats, setStats] = useState<TrafficStats>(mockTrafficStats);
  const wsData = useTrafficWS();

  useEffect(() => {
    if (wsData) {
      setStats(prev => ({
        ...prev,
        totalVehicles: wsData.totalVehicles,
        avgSpeed: wsData.avgSpeed,
        congestionLevel: wsData.congestionLevel,
      }));
    }
  }, [wsData]);

  return stats;
};

/**
 * Custom hook to manage AI insights with WebSocket updates
 */
export const useAIInsights = () => {
  const [insights, setInsights] = useState<AIInsight[]>(mockAIInsights);
  const latestInsight = useAIInsightsWS();

  useEffect(() => {
    if (latestInsight) {
      setInsights(prev => [latestInsight, ...prev.slice(0, 4)]);
    }
  }, [latestInsight]);

  return insights;
};

/**
 * Custom hook to manage emergency alerts with WebSocket updates
 */
export const useEmergencyAlerts = () => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(mockEmergencyAlerts);
  const wsAlert = useEmergencyWS();

  useEffect(() => {
    if (wsAlert) {
      setAlerts(prev => [wsAlert, ...prev]);
    }
  }, [wsAlert]);

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, status: 'acknowledged' as const } : alert
    ));
  };

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, status: 'resolved' as const } : alert
    ));
  };

  return { alerts, acknowledgeAlert, resolveAlert };
};

/**
 * Custom hook to manage camera feeds
 */
export const useCameraFeeds = () => {
  return mockCameraFeeds;
};

// Hook for responsive sidebar
export const useSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggle = () => setIsOpen(!isOpen);

  return { isOpen, isMobile, toggle };
};
