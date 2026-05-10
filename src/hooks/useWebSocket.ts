import { useState, useEffect, useCallback } from 'react';
import socketService, { WSEvent } from '../services/websocket';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(socketService.isConnected());

  useEffect(() => {
    const handleStatus = ({ connected }: { connected: boolean }) => {
      setIsConnected(connected);
    };

    socketService.on(WSEvent.CONNECTION_STATUS, handleStatus);
    socketService.connect();

    return () => {
      socketService.off(WSEvent.CONNECTION_STATUS, handleStatus);
    };
  }, []);

  const subscribe = useCallback((event: WSEvent, callback: (data: any) => void) => {
    socketService.on(event, callback);
    return () => {
      socketService.off(event, callback);
    };
  }, []);

  return { isConnected, subscribe };
};

/**
 * Hook for specific traffic updates
 */
export const useTrafficWS = () => {
  const [trafficData, setTrafficData] = useState<any>(null);
  const { subscribe } = useWebSocket();

  useEffect(() => {
    return subscribe(WSEvent.TRAFFIC_UPDATE, (data) => {
      setTrafficData(data);
    });
  }, [subscribe]);

  return trafficData;
};

/**
 * Hook for AI insights via WebSocket
 */
export const useAIInsightsWS = () => {
  const [latestInsight, setLatestInsight] = useState<any>(null);
  const { subscribe } = useWebSocket();

  useEffect(() => {
    return subscribe(WSEvent.AI_INSIGHT, (data) => {
      setLatestInsight(data);
    });
  }, [subscribe]);

  return latestInsight;
};

/**
 * Hook for emergency alerts via WebSocket
 */
export const useEmergencyWS = () => {
  const [alert, setAlert] = useState<any>(null);
  const { subscribe } = useWebSocket();

  useEffect(() => {
    return subscribe(WSEvent.EMERGENCY_ALERT, (data) => {
      setAlert(data);
    });
  }, [subscribe]);

  return alert;
};
