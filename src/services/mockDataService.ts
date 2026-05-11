// Mock data service for AI Junction Optimization System
// Provides realistic mock data for all components

export interface JunctionData {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  status: 'normal' | 'congested' | 'critical';
  trafficFlow: number;
  avgWaitTime: number;
  signalState: 'red' | 'yellow' | 'green';
}

export interface TrafficStats {
  totalVehicles: number;
  avgSpeed: number;
  congestionLevel: number;
  incidents: number;
}

export interface AIInsight {
  id: string;
  type: 'optimization' | 'alert' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  timestamp: Date;
}

export interface EmergencyAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  location: string;
  description: string;
  timestamp: Date;
  status: 'active' | 'resolved' | 'acknowledged';
}

export interface CameraFeed {
  id: string;
  junctionId: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  lastUpdated: Date;
}

// Mock junction data
export const mockJunctions: JunctionData[] = [
  {
    id: 'j1',
    name: 'Main Street & 5th Avenue',
    location: { lat: 40.7128, lng: -74.0060 },
    status: 'normal',
    trafficFlow: 85,
    avgWaitTime: 45,
    signalState: 'green',
  },
  {
    id: 'j2',
    name: 'Broadway & 42nd Street',
    location: { lat: 40.7580, lng: -73.9855 },
    status: 'congested',
    trafficFlow: 120,
    avgWaitTime: 120,
    signalState: 'red',
  },
  {
    id: 'j3',
    name: 'Park Avenue & 59th Street',
    location: { lat: 40.7644, lng: -73.9735 },
    status: 'critical',
    trafficFlow: 150,
    avgWaitTime: 180,
    signalState: 'red',
  },
  {
    id: 'j4',
    name: 'Lexington Avenue & 34th Street',
    location: { lat: 40.7484, lng: -73.9817 },
    status: 'normal',
    trafficFlow: 70,
    avgWaitTime: 35,
    signalState: 'green',
  },
  {
    id: 'j5',
    name: 'Wall Street & Broadway',
    location: { lat: 40.7074, lng: -74.0113 },
    status: 'congested',
    trafficFlow: 95,
    avgWaitTime: 90,
    signalState: 'yellow',
  },
];

// Mock traffic statistics
export const mockTrafficStats: TrafficStats = {
  totalVehicles: 15420,
  avgSpeed: 28.5,
  congestionLevel: 42,
  incidents: 3,
};

// Mock AI insights
export const mockAIInsights: AIInsight[] = [
  {
    id: 'insight1',
    type: 'optimization',
    title: 'Signal Timing Optimization',
    description: 'Adjusting signal timing at Broadway & 42nd Street could reduce wait times by 23%',
    confidence: 0.92,
    timestamp: new Date(),
  },
  {
    id: 'insight2',
    type: 'alert',
    title: 'Unusual Traffic Pattern Detected',
    description: 'Higher than expected traffic volume on Main Street corridor',
    confidence: 0.87,
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: 'insight3',
    type: 'prediction',
    title: 'Congestion Prediction',
    description: 'Expected congestion increase at Park Avenue junction in 15 minutes',
    confidence: 0.78,
    timestamp: new Date(Date.now() - 600000),
  },
];

// Mock emergency alerts
export const mockEmergencyAlerts: EmergencyAlert[] = [
  {
    id: 'alert1',
    severity: 'critical',
    type: 'Accident',
    location: 'Park Avenue & 59th Street',
    description: 'Multi-vehicle collision blocking all lanes',
    timestamp: new Date(Date.now() - 180000),
    status: 'active',
  },
  {
    id: 'alert2',
    severity: 'high',
    type: 'Signal Failure',
    location: 'Broadway & 42nd Street',
    description: 'Traffic signal malfunction reported',
    timestamp: new Date(Date.now() - 900000),
    status: 'acknowledged',
  },
  {
    id: 'alert3',
    severity: 'medium',
    type: 'Road Work',
    location: 'Main Street & 5th Avenue',
    description: 'Scheduled maintenance causing delays',
    timestamp: new Date(Date.now() - 3600000),
    status: 'active',
  },
];

// Mock camera feeds
export const mockCameraFeeds: CameraFeed[] = [
  {
    id: 'cam1',
    junctionId: 'j1',
    name: 'Camera 1 - Main Street',
    status: 'online',
    lastUpdated: new Date(),
  },
  {
    id: 'cam2',
    junctionId: 'j2',
    name: 'Camera 2 - Broadway',
    status: 'online',
    lastUpdated: new Date(),
  },
  {
    id: 'cam3',
    junctionId: 'j3',
    name: 'Camera 3 - Park Avenue',
    status: 'offline',
    lastUpdated: new Date(Date.now() - 3600000),
  },
  {
    id: 'cam4',
    junctionId: 'j4',
    name: 'Camera 4 - Lexington',
    status: 'online',
    lastUpdated: new Date(),
  },
];

// Helper function to get random data variations
export const getRandomTrafficFlow = (base: number): number => {
  const variation = Math.random() * 20 - 10;
  return Math.max(0, Math.round(base + variation));
};

export const getRandomSignalState = (): 'red' | 'yellow' | 'green' => {
  const states = ['red', 'yellow', 'green'];
  return states[Math.floor(Math.random() * states.length)] as any;
};

export const generateLiveUpdate = (junction: JunctionData): JunctionData => {
  return {
    ...junction,
    trafficFlow: getRandomTrafficFlow(junction.trafficFlow),
    signalState: Math.random() > 0.8 ? getRandomSignalState() : junction.signalState,
    avgWaitTime: Math.max(0, junction.avgWaitTime + Math.floor(Math.random() * 5) - 2),
    status: junction.trafficFlow > 140 ? 'critical' : junction.trafficFlow > 100 ? 'congested' : 'normal',
  };
};
