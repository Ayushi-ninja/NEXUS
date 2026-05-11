import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ambulance, Eye, EyeOff,
  Activity, Gauge, Car, Timer, AlertTriangle, BarChart3,
  Play, Pause, RotateCcw, Maximize2, ChevronDown, Cloud, Volume2, VolumeX
} from 'lucide-react';
import TrafficJunctionCanvas from '../components/digital-twin/TrafficJunctionCanvas';
import TrafficSignalPanel from '../components/digital-twin/TrafficSignalPanel';
import VehicleStatsPanel from '../components/digital-twin/VehicleStatsPanel';
import WeatherOverlayControl from '../components/digital-twin/WeatherOverlayControl';
import CongestionHeatPanel from '../components/digital-twin/CongestionHeatPanel';
import EmergencyPanel from '../components/digital-twin/EmergencyPanel';
import SimulationTimeline from '../components/digital-twin/SimulationTimeline';
import MiniMapOverlay from '../components/digital-twin/MiniMapOverlay';
import { useSimulationEngine } from '../hooks/useSimulationEngine';
import { useAmbientAudio } from '../hooks/useAmbientAudio';

const DigitalTwin = () => {
  const {
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
  } = useSimulationEngine();

  const { isMuted, toggleMute } = useAmbientAudio(weather, emergencyVehicle.active);

  const [showMiniMap, setShowMiniMap] = useState(() => {
    const saved = localStorage.getItem('dt_minimap');
    return saved ? JSON.parse(saved) : true;
  });
  
  const [showOverlays, setShowOverlays] = useState(() => {
    const saved = localStorage.getItem('dt_overlays');
    return saved ? JSON.parse(saved) : {
      congestion: true,
      weather: true,
      emergency: true,
      density: true,
    };
  });

  useEffect(() => {
    localStorage.setItem('dt_minimap', JSON.stringify(showMiniMap));
  }, [showMiniMap]);

  useEffect(() => {
    localStorage.setItem('dt_overlays', JSON.stringify(showOverlays));
  }, [showOverlays]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && canvasContainerRef.current) {
      canvasContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#06d6a0] animate-pulse" style={{ boxShadow: '0 0 6px #06d6a0' }} />
            <span className="text-[10px] font-bold text-[#06d6a0] uppercase tracking-widest font-mono">Live Simulation Engine</span>
          </div>
          <h1 className="font-headline text-3xl font-bold text-white">Digital Twin — <span className="gradient-text">Smart Junction</span></h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time 4-way traffic simulation · {vehicles.length} active vehicles
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Simulation controls */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSimulation}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs font-mono transition-all"
            style={isRunning ? {
              background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.35)', color: '#fbbf24'
            } : {
              background: 'rgba(6,214,160,0.1)', border: '1px solid rgba(6,214,160,0.35)', color: '#06d6a0'
            }}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            {isRunning ? 'Pause' : 'Start'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetSimulation}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
          >
            <RotateCcw size={16} />
          </motion.button>

          {/* Speed selector */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
              <Gauge size={14} />
              {simulationSpeed}x
              <ChevronDown size={12} />
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50">
              <div className="glass-card rounded-xl p-1 min-w-[80px]" style={{ border: '1px solid rgba(0,212,255,0.2)' }}>
                {[0.5, 1, 2, 3].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setSimulationSpeed(speed)}
                    className="block w-full text-left px-3 py-1.5 text-xs font-mono rounded-lg transition-colors"
                    style={simulationSpeed === speed ? { background: 'rgba(0,212,255,0.1)', color: '#00d4ff' } : { color: '#94a3b8' }}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency trigger */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={triggerEmergency}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs font-mono transition-all"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444' }}
          >
            <Ambulance size={16} />
            Emergency
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMute}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all"
            style={isMuted ? {
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444'
            } : {
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8'
            }}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
          >
            <Maximize2 size={16} />
          </motion.button>
        </div>
      </div>

      {/* Live Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <LiveStatChip
          icon={<Car size={16} />}
          label="Active Vehicles"
          value={stats.activeVehicles}
          color="blue"
        />
        <LiveStatChip
          icon={<Gauge size={16} />}
          label="Avg Speed"
          value={`${stats.avgSpeed} km/h`}
          color="green"
        />
        <LiveStatChip
          icon={<Timer size={16} />}
          label="Avg Wait"
          value={`${stats.avgWaitTime}s`}
          color="amber"
        />
        <LiveStatChip
          icon={<AlertTriangle size={16} />}
          label="Congestion"
          value={`${stats.congestionLevel}%`}
          color={stats.congestionLevel > 70 ? 'red' : stats.congestionLevel > 40 ? 'amber' : 'green'}
        />
      </div>

      {/* Main Simulation Area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Canvas — 3 cols */}
        <div className="xl:col-span-3 space-y-4">
          <div
            ref={canvasContainerRef}
            className={`glass-panel overflow-hidden relative ${isFullscreen ? 'p-0' : 'p-1'}`}
          >
            {/* Canvas Header */}
            {!isFullscreen && (
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#06d6a0] animate-pulse" style={{ boxShadow: '0 0 6px #06d6a0' }} />
                  <span className="font-mono text-xs font-bold text-white">Live Simulation</span>
                  <span className="text-xs text-gray-500 ml-2">
                    T+{Math.floor(simulationTime / 60)}:{(simulationTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {[['congestion','Congestion','#ef4444'], ['weather','Weather','#00d4ff'], ['density','Density','#a855f7']].map(([key, label, color]) => (
                    <button key={key}
                      onClick={() => setShowOverlays((o: typeof showOverlays) => ({ ...o, [key]: !o[key as keyof typeof o] }))}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold font-mono transition-all"
                      style={showOverlays[key as keyof typeof showOverlays] ? { background: `${color}18`, color } : { color: '#475569' }}
                    >
                      {key === 'congestion' ? <Activity size={11} /> : key === 'weather' ? <Cloud size={11} /> : <BarChart3 size={11} />}
                      {label}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowMiniMap((v: boolean) => !v)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold font-mono transition-all"
                    style={showMiniMap ? { background: 'rgba(0,212,255,0.12)', color: '#00d4ff' } : { color: '#475569' }}
                  >
                    {showMiniMap ? <Eye size={11} /> : <EyeOff size={11} />} Map
                  </button>
                </div>
              </div>
            )}

            {/* The Junction Canvas */}
            <div className={`relative ${isFullscreen ? 'h-screen' : 'aspect-square w-full max-h-[700px] mx-auto'}`}>
              <TrafficJunctionCanvas
                vehicles={vehicles}
                signals={signals}
                congestionZones={congestionZones}
                emergencyVehicle={emergencyVehicle}
                weather={weather}
                showCongestion={showOverlays.congestion}
                showWeather={showOverlays.weather}
                showDensity={showOverlays.density}
              />

              {/* Mini Map Overlay */}
              <AnimatePresence>
                {showMiniMap && !isFullscreen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute bottom-4 right-4 z-10"
                  >
                    <MiniMapOverlay vehicles={vehicles} signals={signals} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Timeline */}
          <SimulationTimeline simulationTime={simulationTime} signals={signals} />
        </div>

        {/* Right Sidebar Panels — 1 col */}
        <div className="space-y-4">
          <TrafficSignalPanel signals={signals} />
          <WeatherOverlayControl weather={weather} setWeather={setWeather} />
          <CongestionHeatPanel congestionZones={congestionZones} />
          <EmergencyPanel
            emergencyVehicle={emergencyVehicle}
            onTrigger={triggerEmergency}
          />
          <VehicleStatsPanel stats={stats} vehicles={vehicles} />
        </div>
      </div>
    </motion.div>
  );
};

/* ---------- Small helper component ---------- */
interface LiveStatChipProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple';
}

const colorHexMap: Record<string, string> = {
  blue: '#00d4ff',
  green: '#06d6a0',
  amber: '#fbbf24',
  red: '#ef4444',
  purple: '#a855f7',
};

const LiveStatChip = ({ icon, label, value, color }: LiveStatChipProps) => {
  const hex = colorHexMap[color] || '#00d4ff';
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="stat-card flex items-center gap-3"
    >
      <div className="p-2 rounded-lg flex-shrink-0" style={{ background: `${hex}12` }}>
        <div style={{ color: hex }}>{icon}</div>
      </div>
      <div>
        <p className="text-[10px] text-slate-500 font-label uppercase tracking-widest">{label}</p>
        <p className="text-lg font-headline font-black" style={{ color: hex }}>{value}</p>
      </div>
    </motion.div>
  );
};

export default DigitalTwin;
