// Define the event types for our system
export enum WSEvent {
  TRAFFIC_UPDATE = 'traffic:update',
  SIGNAL_UPDATE = 'signal:update',
  EMERGENCY_ALERT = 'emergency:alert',
  VEHICLE_COUNT = 'vehicle:count',
  AI_INSIGHT = 'ai:insight',
  WEATHER_UPDATE = 'weather:update',
  CONNECTION_STATUS = 'connection:status'
}

type Listener = (...args: any[]) => void;

/**
 * A mock Socket.IO client that simulates real-time events.
 * This can be swapped with a real io() connection easily.
 */
class MockSocket {
  private connected: boolean = false;
  private simulationIntervals: any[] = [];
  private listeners: Map<string, Listener[]> = new Map();

  constructor() {
    console.log('[WebSocket] Service Initialized');
  }

  connect() {
    if (this.connected) return;
    
    console.log('[WebSocket] Connecting to mock server...');
    
    // Simulate connection delay
    setTimeout(() => {
      this.connected = true;
      this.emit('connect');
      this.emit(WSEvent.CONNECTION_STATUS, { connected: true });
      this.startSimulation();
      console.log('[WebSocket] Connected (Simulated)');
    }, 1000);
  }

  disconnect() {
    this.connected = false;
    this.simulationIntervals.forEach(clearInterval);
    this.simulationIntervals = [];
    this.emit('disconnect');
    this.emit(WSEvent.CONNECTION_STATUS, { connected: false });
    console.log('[WebSocket] Disconnected');
  }

  on(event: string, listener: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(listener);
    return this;
  }

  off(event: string, listener: Listener) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      this.listeners.set(event, eventListeners.filter(l => l !== listener));
    }
    return this;
  }

  emit(event: string, ...args: any[]) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(...args));
    }
    return true;
  }

  private startSimulation() {
    let congestion = 42;
    let weatherPhase = 0; // rotates: clear → rain → fog → clear
    const WEATHER_CYCLE = ['clear', 'rain', 'fog', 'clear', 'storm', 'clear'];
    const WEATHER_MULT = { clear: 1.0, rain: 1.3, fog: 1.25, storm: 1.5, snow: 1.4 } as Record<string, number>;

    // 1. Traffic Updates (Every 2 seconds) — momentum-based congestion walk
    const trafficInterval = setInterval(() => {
      const delta = (Math.random() - 0.48) * 4;
      congestion = Math.max(18, Math.min(95, congestion + delta));
      this.emit(WSEvent.TRAFFIC_UPDATE, {
        total_vehicles: Math.floor(congestion * 14 + Math.random() * 80),
        avg_speed: Math.max(8, Math.round(65 - congestion * 0.45)),
        congestion_level: Math.round(congestion * 10) / 10,
        emergency_active: false,
        densities: {
          north: Math.round(Math.max(10, congestion + (Math.random() - 0.5) * 18)),
          south: Math.round(Math.max(10, congestion + (Math.random() - 0.5) * 18)),
          east:  Math.round(Math.max(10, congestion + (Math.random() - 0.5) * 18)),
          west:  Math.round(Math.max(10, congestion + (Math.random() - 0.5) * 18)),
        },
        signals: {
          north: { color: 'green',  timer: Math.round(20 + congestion * 0.3) },
          south: { color: 'red',    timer: Math.round(15 + congestion * 0.2) },
          east:  { color: 'red',    timer: Math.round(18 + congestion * 0.25) },
          west:  { color: 'yellow', timer: 4 },
        },
        timestamp: new Date().toISOString(),
      });
    }, 2000);

    // 2. AI Insights (Every 10 seconds) — professional, data-driven messages
    const AI_POOL = [
      { type: 'optimization', title: 'Green Wave — Arterial Sync', description: 'Platoon arrival detected on N/S corridor. Synchronizing green onset by +4s increases progression bandwidth from 38% to 67%.', confidence: 0.93 },
      { type: 'prediction', title: 'Congestion Forecast +12 Min', description: 'Density trending +2.3%/min on east approach. Peak congestion of 82% projected in 12 minutes. Pre-emptive phase shift recommended.', confidence: 0.89 },
      { type: 'optimization', title: 'Off-Peak Cycle Compression', description: 'Overall density below 28%. Compressing cycle from 90s to 60s. Actuated-coordinated mode active — reducing average delay by 22%.', confidence: 0.91 },
      { type: 'alert', title: 'Queue Spillback — East Lane', description: 'Vehicle queue on east approach exceeds upstream detector threshold. Activating congestion-flush: 15s bonus green phase to clear backlog.', confidence: 0.87 },
      { type: 'optimization', title: 'Adaptive Phase Extension', description: 'Sustained high-density event (>75%) on north approach. Extending green phase by 12s reduces queue spillback probability by 34%.', confidence: 0.95 },
    ];
    let aiIdx = 0;
    const aiInterval = setInterval(() => {
      const insight = AI_POOL[aiIdx % AI_POOL.length];
      aiIdx++;
      this.emit(WSEvent.AI_INSIGHT, {
        insight_id: `AI-${Date.now().toString(36).toUpperCase().slice(-6)}`,
        ...insight,
        timestamp: new Date().toISOString(),
      });
    }, 10000);

    // 3. Weather cycle (Every 45 seconds) — rotates through conditions
    const weatherInterval = setInterval(() => {
      const condition = WEATHER_CYCLE[weatherPhase % WEATHER_CYCLE.length];
      const multiplier = WEATHER_MULT[condition] ?? 1.0;
      weatherPhase++;
      this.emit(WSEvent.WEATHER_UPDATE, {
        condition,
        multiplier,
        message: `Weather changed to ${condition}. Signal timings adjusted ×${multiplier}.`,
        timestamp: new Date().toISOString(),
      });
      // Also spike congestion slightly during bad weather
      if (condition !== 'clear') congestion = Math.min(92, congestion + 8);
    }, 45000);

    // 4. Emergency vehicle demo (after 30s, then every 90s)
    const fireEmergency = () => {
      const directions = ['north', 'south', 'east', 'west'];
      const dir = directions[Math.floor(Math.random() * directions.length)];
      this.emit(WSEvent.EMERGENCY_ALERT, {
        active: true,
        direction: dir,
        vehicle_type: 'ambulance',
        priority_granted: true,
        estimated_clearance_secs: 30,
        message: `Ambulance detected on ${dir.toUpperCase()} approach. Priority corridor active — cross-traffic held.`,
        timestamp: new Date().toISOString(),
      });
    };
    const emergencyTimeout = setTimeout(fireEmergency, 30000);
    const emergencyInterval = setInterval(fireEmergency, 90000);

    this.simulationIntervals.push(
      trafficInterval, aiInterval, weatherInterval,
      emergencyTimeout as any, emergencyInterval,
    );
  }

  isConnected() {
    return this.connected;
  }
}

// Singleton instance
const socketService = new MockSocket();
export default socketService;
