import { useState, useEffect, useRef, useCallback } from 'react';
import socketClient from '../websocket/socketClient';

/* ===================== TYPES ===================== */
export type WeatherType = 'clear' | 'rain' | 'fog';
export type SignalColor = 'red' | 'yellow' | 'green';
export type Direction = 'north' | 'south' | 'east' | 'west';
export type VehicleType = 'car' | 'truck' | 'bus' | 'motorcycle';

export interface Vehicle {
  id: string;
  x: number;
  y: number;
  direction: Direction;
  lane: number;
  speed: number;
  maxSpeed: number;
  type: VehicleType;
  color: string;
  waiting: boolean;
  progress: number;
}

export interface TrafficSignal {
  direction: Direction;
  color: SignalColor;
  timer: number;
  totalDuration: number;
}

export interface CongestionZone {
  direction: Direction;
  level: number;
  vehicleCount: number;
}

export interface EmergencyVehicleState {
  active: boolean;
  x: number;
  y: number;
  direction: Direction;
  progress: number;
  pathPoints: { x: number; y: number }[];
}

export interface SimulationStats {
  activeVehicles: number;
  avgSpeed: number;
  avgWaitTime: number;
  congestionLevel: number;
  throughput: number;
}

/* ===================== CONSTANTS ===================== */
const CANVAS_CENTER = 400;
// Road is 120px wide centered at 400, so half is 60px.
// Each direction uses one half (60px). We place the lane center at ±30 from the road center.
const ROAD_HALF = 60;
const LANE_HALF = ROAD_HALF / 2; // 30px from center line = middle of each half

const VEHICLE_COLORS = [
  '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316',
  '#a855f7', '#0ea5e9', '#22c55e', '#e11d48',
];

const SIGNAL_DURATIONS: Record<SignalColor, number> = {
  green: 20,
  yellow: 4,
  red: 24,
};

const DIRECTIONS: Direction[] = ['north', 'south', 'east', 'west'];

/* ===================== HELPERS ===================== */
let vehicleIdCounter = 0;
const generateVehicleId = () => `v-${++vehicleIdCounter}`;

const randomFrom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomColor = () => randomFrom(VEHICLE_COLORS);

const randomVehicleType = (): VehicleType => {
  const r = Math.random();
  if (r < 0.55) return 'car';
  if (r < 0.70) return 'motorcycle';
  if (r < 0.85) return 'bus';
  return 'truck';
};

const getSpawnPosition = (direction: Direction, lane: number): { x: number; y: number } => {
  // Vertical road (north/south): right half for north (x > center), left half for south (x < center)
  // Horizontal road (east/west): bottom half for east (y > center), top half for west (y < center)
  // Each half is 60px wide, so lane center is at ±30 from the road center line.
  // lane 0 = primary lane, lane 1 = secondary lane (offset slightly within the half)
  const laneOffset = lane === 0 ? LANE_HALF : LANE_HALF / 2; // 30 or 15 from center
  switch (direction) {
    // North travels upward — stays in the RIGHT half of vertical road (x > center)
    case 'north': return { x: CANVAS_CENTER + laneOffset, y: 820 };
    // South travels downward — stays in the LEFT half of vertical road (x < center)
    case 'south': return { x: CANVAS_CENTER - laneOffset, y: -20 };
    // East travels rightward — stays in the BOTTOM half of horizontal road (y > center)
    case 'east':  return { x: -20,  y: CANVAS_CENTER + laneOffset };
    // West travels leftward — stays in the TOP half of horizontal road (y < center)
    case 'west':  return { x: 820, y: CANVAS_CENTER - laneOffset };
  }
};

const getVelocity = (direction: Direction, speed: number) => {
  switch (direction) {
    case 'north': return { vx: 0, vy: -speed };
    case 'south': return { vx: 0, vy: speed };
    case 'east':  return { vx: speed, vy: 0 };
    case 'west':  return { vx: -speed, vy: 0 };
  }
};

const isNearJunction = (v: Vehicle): boolean => {
  const margin = 160;
  return (
    v.x > CANVAS_CENTER - margin &&
    v.x < CANVAS_CENTER + margin &&
    v.y > CANVAS_CENTER - margin &&
    v.y < CANVAS_CENTER + margin
  );
};

const isBeforeJunction = (v: Vehicle): boolean => {
  const stopLine = 60;
  switch (v.direction) {
    case 'north': return v.y > CANVAS_CENTER + stopLine;
    case 'south': return v.y < CANVAS_CENTER - stopLine;
    case 'east':  return v.x < CANVAS_CENTER - stopLine;
    case 'west':  return v.x > CANVAS_CENTER + stopLine;
  }
};

const isOffScreen = (v: Vehicle): boolean => {
  return v.x < -50 || v.x > 850 || v.y < -50 || v.y > 850;
};

const spawnVehicle = (direction: Direction): Vehicle => {
  const lane = Math.random() < 0.5 ? 0 : 1;
  const pos = getSpawnPosition(direction, lane);
  const vType = randomVehicleType();
  const maxSpeed = 
    vType === 'motorcycle' ? 3.0 + Math.random() * 2.0 :
    vType === 'car' ? 2.5 + Math.random() * 1.5 : 
    vType === 'bus' ? 1.8 + Math.random() : 
    1.5 + Math.random() * 0.8;
  return {
    id: generateVehicleId(),
    ...pos,
    direction,
    lane,
    speed: maxSpeed,
    maxSpeed,
    type: vType,
    color: randomColor(),
    waiting: false,
    progress: 0,
  };
};

/* ===================== HOOK ===================== */
export const useSimulationEngine = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [signals, setSignals] = useState<TrafficSignal[]>([
    { direction: 'north', color: 'green', timer: 20, totalDuration: 20 },
    { direction: 'south', color: 'green', timer: 20, totalDuration: 20 },
    { direction: 'east',  color: 'red',   timer: 24, totalDuration: 24 },
    { direction: 'west',  color: 'red',   timer: 24, totalDuration: 24 },
  ]);
  const [congestionZones, setCongestionZones] = useState<CongestionZone[]>([
    { direction: 'north', level: 20, vehicleCount: 0 },
    { direction: 'south', level: 15, vehicleCount: 0 },
    { direction: 'east',  level: 30, vehicleCount: 0 },
    { direction: 'west',  level: 25, vehicleCount: 0 },
  ]);
  const [emergencyVehicle, setEmergencyVehicle] = useState<EmergencyVehicleState>({
    active: false,
    x: 0,
    y: 800,
    direction: 'north',
    progress: 0,
    pathPoints: [],
  });
  const [stats, setStats] = useState<SimulationStats>({
    activeVehicles: 0,
    avgSpeed: 0,
    avgWaitTime: 0,
    congestionLevel: 0,
    throughput: 0,
  });
  // Initialize from localStorage if available
  const [weather, setWeather] = useState<WeatherType>(() => {
    const saved = localStorage.getItem('dt_weather');
    return (saved as WeatherType) || 'clear';
  });
  const [isRunning, setIsRunning] = useState(true);
  const [simulationTime, setSimulationTime] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState(() => {
    const saved = localStorage.getItem('dt_speed');
    return saved ? parseFloat(saved) : 1;
  });

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('dt_weather', weather);
  }, [weather]);

  useEffect(() => {
    localStorage.setItem('dt_speed', simulationSpeed.toString());
  }, [simulationSpeed]);

  // Use refs for values needed in the animation loop to avoid stale closures
  const signalsRef = useRef(signals);
  signalsRef.current = signals;
  const weatherRef = useRef(weather);
  weatherRef.current = weather;
  const simulationSpeedRef = useRef(simulationSpeed);
  simulationSpeedRef.current = simulationSpeed;

  const lastTimeRef = useRef<number>(0);
  const frameRef = useRef<number>();
  const signalAccumRef = useRef(0);
  const spawnAccumRef = useRef(0);
  const timeAccumRef = useRef(0);

  /* ----- Signal advancement ----- */
  const advanceSignals = useCallback(() => {
    setSignals(prev =>
      prev.map(signal => {
        let newTimer = signal.timer - 1;
        let newColor = signal.color;
        let newDuration = signal.totalDuration;

        if (newTimer <= 0) {
          if (signal.color === 'green') {
            newColor = 'yellow';
            newDuration = SIGNAL_DURATIONS.yellow;
            newTimer = SIGNAL_DURATIONS.yellow;
          } else if (signal.color === 'yellow') {
            newColor = 'red';
            newDuration = SIGNAL_DURATIONS.red;
            newTimer = SIGNAL_DURATIONS.red;
          } else {
            newColor = 'green';
            newDuration = SIGNAL_DURATIONS.green;
            newTimer = SIGNAL_DURATIONS.green;
          }
        }

        return { ...signal, color: newColor, timer: newTimer, totalDuration: newDuration };
      })
    );
  }, []);

  /* ----- Vehicle spawning ----- */
  const spawnWave = useCallback(() => {
    const newVehicles: Vehicle[] = [];
    DIRECTIONS.forEach(dir => {
      const count = Math.random() < 0.6 ? 1 : Math.random() < 0.3 ? 2 : 0;
      for (let i = 0; i < count; i++) {
        newVehicles.push(spawnVehicle(dir));
      }
    });
    setVehicles(prev => [...prev, ...newVehicles]);
  }, []);

  /* ----- Emergency vehicle ----- */
  const triggerEmergency = useCallback(() => {
    const dir: Direction = randomFrom(DIRECTIONS);
    const pos = getSpawnPosition(dir, 0);

    const pathPoints: { x: number; y: number }[] = [];
    const vel = getVelocity(dir, 3);
    for (let i = 0; i < 30; i++) {
      pathPoints.push({ x: pos.x + vel.vx * i * 5, y: pos.y + vel.vy * i * 5 });
    }

    setEmergencyVehicle({
      active: true,
      x: pos.x,
      y: pos.y,
      direction: dir,
      progress: 0,
      pathPoints,
    });
  }, []);

  /* ----- Main simulation loop ----- */
  useEffect(() => {
    if (!isRunning) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      return;
    }

    const loop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const rawDelta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;
      const delta = Math.min(rawDelta, 0.1) * simulationSpeedRef.current;

      signalAccumRef.current += delta;
      spawnAccumRef.current += delta;
      timeAccumRef.current += delta;

      // Advance signals every second
      while (signalAccumRef.current >= 1) {
        signalAccumRef.current -= 1;
        advanceSignals();
      }

      // Spawn vehicles every 2 seconds
      while (spawnAccumRef.current >= 2) {
        spawnAccumRef.current -= 2;
        spawnWave();
      }

      // Track simulation clock
      while (timeAccumRef.current >= 1) {
        timeAccumRef.current -= 1;
        setSimulationTime(t => t + 1);
      }

      // Update vehicles — read signals from ref to avoid stale closure
      const currentSignals = signalsRef.current;
      const currentWeather = weatherRef.current;
      const weatherSlowdown = currentWeather === 'rain' ? 0.7 : currentWeather === 'fog' ? 0.8 : 1;

      setVehicles(prev => {
        const updated = prev.map(v => {
          const copy = { ...v };

          // Check signal for this direction
          const mySignal = currentSignals.find(s => s.direction === v.direction);
          if (
            mySignal &&
            (mySignal.color === 'red' || mySignal.color === 'yellow') &&
            isBeforeJunction(v) &&
            isNearJunction(v)
          ) {
            copy.waiting = true;
            copy.speed = Math.max(0, copy.speed - 0.12); // Smoother braking
          } else {
            copy.waiting = false;
            copy.speed = Math.min(copy.maxSpeed * weatherSlowdown, copy.speed + 0.06); // Smoother acceleration
          }

          const vel = getVelocity(copy.direction, copy.speed * delta * 30);
          copy.x += vel.vx;
          copy.y += vel.vy;
          copy.progress = Math.min(1, copy.progress + 0.005 * delta * 30);

          return copy;
        });

        // Compute congestion from updated vehicles
        const dirCounts: Record<Direction, number> = { north: 0, south: 0, east: 0, west: 0 };
        const dirWaiting: Record<Direction, number> = { north: 0, south: 0, east: 0, west: 0 };
        updated.forEach(v => {
          dirCounts[v.direction]++;
          if (v.waiting) dirWaiting[v.direction]++;
        });

        const newCongestion = DIRECTIONS.map(dir => ({
          direction: dir,
          level: Math.min(100, Math.round((dirWaiting[dir] / Math.max(1, dirCounts[dir])) * 100 + dirCounts[dir] * 5)),
          vehicleCount: dirCounts[dir],
        }));
        setCongestionZones(newCongestion);

        // Stats
        const totalSpeed = updated.reduce((s, v) => s + v.speed, 0);
        const waitingCount = updated.filter(v => v.waiting).length;
        const avgCong = newCongestion.reduce((s, z) => s + z.level, 0) / 4;
        setStats({
          activeVehicles: updated.length,
          avgSpeed: updated.length ? Math.round((totalSpeed / updated.length) * 10) : 0,
          avgWaitTime: Math.round(waitingCount * 4.5),
          congestionLevel: Math.round(avgCong),
          throughput: Math.round(updated.length * 0.3),
        });

        return updated.filter(v => !isOffScreen(v));
      });

      // Update emergency vehicle
      setEmergencyVehicle(prev => {
        if (!prev.active) return prev;
        const speed = 5 * delta * 30;
        const vel = getVelocity(prev.direction, speed);
        const nx = prev.x + vel.vx;
        const ny = prev.y + vel.vy;
        const newProgress = prev.progress + 0.008 * delta * 30;

        if (nx < -100 || nx > 900 || ny < -100 || ny > 900) {
          return { ...prev, active: false, progress: 0, pathPoints: [] };
        }

        return {
          ...prev,
          x: nx,
          y: ny,
          progress: newProgress,
          pathPoints: [...prev.pathPoints, { x: nx, y: ny }].slice(-60),
        };
      });

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      lastTimeRef.current = 0;
    };
  }, [isRunning, advanceSignals, spawnWave]);

  const toggleSimulation = useCallback(() => setIsRunning(r => !r), []);

  const resetSimulation = useCallback(() => {
    setVehicles([]);
    setSimulationTime(0);
    vehicleIdCounter = 0;
    setSignals([
      { direction: 'north', color: 'green', timer: 20, totalDuration: 20 },
      { direction: 'south', color: 'green', timer: 20, totalDuration: 20 },
      { direction: 'east',  color: 'red',   timer: 24, totalDuration: 24 },
      { direction: 'west',  color: 'red',   timer: 24, totalDuration: 24 },
    ]);
    setEmergencyVehicle({ active: false, x: 0, y: 800, direction: 'north', progress: 0, pathPoints: [] });
    setCongestionZones([
      { direction: 'north', level: 20, vehicleCount: 0 },
      { direction: 'south', level: 15, vehicleCount: 0 },
      { direction: 'east',  level: 30, vehicleCount: 0 },
      { direction: 'west',  level: 25, vehicleCount: 0 },
    ]);
    setStats({ activeVehicles: 0, avgSpeed: 0, avgWaitTime: 0, congestionLevel: 0, throughput: 0 });
  }, []);

  /* ----- Backend WebSocket Live Sync ----- */
  useEffect(() => {
    const handleBackendUpdate = (payload: any) => {
      if (!payload) return;

      // Sync signal colors + timers from backend
      const sigs = payload.signals;
      if (sigs && typeof sigs === 'object' && !Array.isArray(sigs)) {
        setSignals(prev =>
          prev.map(s => {
            const backend = sigs[s.direction];
            if (!backend) return s;
            return {
              ...s,
              color: backend.color as SignalColor,
              timer: backend.timer ?? s.timer,
            };
          })
        );
      }

      // Sync congestion zones from backend lane data
      const lanes = payload.lanes;
      if (lanes && typeof lanes === 'object') {
        setCongestionZones(prev =>
          prev.map(z => {
            const lane = lanes[z.direction];
            if (!lane) return z;
            return {
              ...z,
              level: lane.congestion_level ?? z.level,
              vehicleCount: lane.vehicle_count ?? z.vehicleCount,
            };
          })
        );
      }

      // Sync emergency state
      if (payload.emergency_active && payload.emergency_direction) {
        setEmergencyVehicle(prev => {
          if (prev.active) return prev; // don't override mid-animation
          const dir = payload.emergency_direction as Direction;
          const pos = getSpawnPosition(dir, 0);
          const vel = getVelocity(dir, 3);
          const pathPoints = Array.from({ length: 30 }, (_, i) => ({
            x: pos.x + vel.vx * i * 5,
            y: pos.y + vel.vy * i * 5,
          }));
          return { active: true, x: pos.x, y: pos.y, direction: dir, progress: 0, pathPoints };
        });
      }

      // Sync weather
      const wc = payload.weather_condition;
      if (wc && (wc === 'clear' || wc === 'rain' || wc === 'fog')) {
        setWeather(wc as WeatherType);
      }
    };

    socketClient.on('traffic_update', handleBackendUpdate);
    socketClient.on('initial_state', handleBackendUpdate);
    return () => {
      socketClient.off('traffic_update', handleBackendUpdate);
      socketClient.off('initial_state', handleBackendUpdate);
    };
  }, []);

  return {
    vehicles,
    signals,
    congestionZones,
    emergencyVehicle,
    stats,
    weather,
    setWeather,
    isRunning,
    toggleSimulation,
    resetSimulation,
    triggerEmergency,
    simulationTime,
    simulationSpeed,
    setSimulationSpeed,
  };
};
