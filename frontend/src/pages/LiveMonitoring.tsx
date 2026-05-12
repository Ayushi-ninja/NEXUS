import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import CCTVMonitor from '../components/CCTVMonitor';
import LiveActivityFeed from '../components/LiveActivityFeed';
import {
  useTrafficStats, useAIInsights, useLiveDetection, useSignalData,
} from '../hooks/useRealtimeData';
import { trafficApi } from '../services/apiService';
import { Car, Activity, AlertTriangle, TrendingUp, Eye, Cpu, Zap, ShieldCheck } from 'lucide-react';

// Animated vehicle count hook
const useVehicleCounts = () => {
  const stats = useTrafficStats();
  const [counts, setCounts] = useState({ cars: 0, trucks: 0, buses: 0, motorcycles: 0 });
  useEffect(() => {
    const total = stats.totalVehicles;
    setCounts({
      cars:        Math.round(total * 0.55),
      trucks:      Math.round(total * 0.15),
      buses:       Math.round(total * 0.12),
      motorcycles: Math.round(total * 0.18),
    });
  }, [stats.totalVehicles]);
  return counts;
};

const LiveMonitoring = () => {
  const stats = useTrafficStats();
  const insights = useAIInsights();
  const detectionLog = useLiveDetection(12);
  const liveSignals = useSignalData();
  const vehicleCounts = useVehicleCounts();
  const [emergencyTriggering, setEmergencyTriggering] = useState(false);
  const [yoloStatus, setYoloStatus] = useState<'ready' | 'mock' | 'loading'>('loading');

  // Fetch YOLO status on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api/v1/detection/status`);
        if (res.ok) {
          const data = await res.json();
          setYoloStatus(data.yolo_available ? 'ready' : 'mock');
        } else {
          setYoloStatus('mock');
        }
      } catch {
        setYoloStatus('mock');
      }
    })();
  }, []);

  const handleEmergencyOverride = async () => {
    setEmergencyTriggering(true);
    try {
      await trafficApi.triggerEmergency('north');
    } catch { /* offline ok */ }
    setTimeout(() => setEmergencyTriggering(false), 2000);
  };

  // Build lane data from live signals + stats
  const laneData = liveSignals.map(sig => ({
    dir: `${sig.direction} Junction`,
    vph: Math.round(stats.totalVehicles / 4) + Math.floor(Math.random() * 20),
    pct: sig.color === 'green' ? 85 : sig.color === 'yellow' ? 45 : 15,
    color: sig.color === 'green' ? '#06d6a0' : sig.color === 'yellow' ? '#fbbf24' : '#ef4444',
    gradient: sig.color === 'green',
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ boxShadow: '0 0 6px #ef4444' }} />
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest font-mono">Live System Feed</span>
          </div>
          <h1 className="font-headline text-3xl font-bold text-white">
            System <span className="gradient-text">Monitoring</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time neural analysis · Multi-sensor junction telemetry</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold font-mono"
            style={{ background: 'rgba(6,214,160,0.1)', border: '1px solid rgba(6,214,160,0.3)', color: '#06d6a0' }}>
            <ShieldCheck size={13} /> STATUS: SECURE
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold font-mono ${
            yoloStatus === 'ready' ? 'text-[#06d6a0]' : 'text-[#fbbf24]'
          }`} style={{
            background: yoloStatus === 'ready' ? 'rgba(6,214,160,0.08)' : 'rgba(251,191,36,0.08)',
            border: yoloStatus === 'ready' ? '1px solid rgba(6,214,160,0.3)' : '1px solid rgba(251,191,36,0.3)',
            color: yoloStatus === 'ready' ? '#06d6a0' : '#fbbf24'
          }}>
            <Eye size={13} /> YOLOv8: {yoloStatus.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Vehicle Detection Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Cars', value: vehicleCounts.cars, icon: '🚗', color: '#00d4ff', bg: 'rgba(0,212,255,0.08)' },
          { label: 'Trucks', value: vehicleCounts.trucks, icon: '🚛', color: '#a855f7', bg: 'rgba(168,85,247,0.08)' },
          { label: 'Buses', value: vehicleCounts.buses, icon: '🚌', color: '#06d6a0', bg: 'rgba(6,214,160,0.08)' },
          { label: 'Motorcycles', value: vehicleCounts.motorcycles, icon: '🏍️', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
        ].map((v, i) => (
          <motion.div
            key={v.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="detection-badge justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{v.icon}</span>
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">{v.label}</p>
                <p className="text-lg font-black" style={{ color: v.color }}>{v.value}</p>
              </div>
            </div>
            <div className="w-1 h-8 rounded-full ml-2" style={{ background: v.color, opacity: 0.4 }} />
          </motion.div>
        ))}
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Vehicle Count', value: String(stats.totalVehicles), badge: '+12%', icon: Car, color: '#00d4ff', bg: 'rgba(0,212,255,0.08)' },
          { label: 'Traffic Density', value: `${stats.congestionLevel}%`, badge: null, icon: Activity, color: '#a855f7', bg: 'rgba(168,85,247,0.08)' },
          { label: 'Avg Speed', value: `${stats.avgSpeed} km/h`, badge: null, icon: TrendingUp, color: '#06d6a0', bg: 'rgba(6,214,160,0.08)' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card flex items-center gap-4">
              <div className="p-3 rounded-xl" style={{ background: s.bg }}>
                <Icon size={20} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-[10px] font-label text-slate-500 uppercase tracking-widest">{s.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-headline font-bold text-white">{s.value}</span>
                  {s.badge && <span className="text-[10px] font-bold" style={{ color: '#06d6a0' }}>{s.badge}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left — CCTV + Detection log + Lane density */}
        <div className="lg:col-span-8 space-y-6">
          {/* CCTV with HUD overlay */}
          <div className="glass-panel p-0 overflow-hidden rounded-xl hud-frame scanline-overlay"
            style={{ border: '1px solid rgba(0,212,255,0.15)' }}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#00d4ff]/10"
              style={{ background: 'rgba(0,212,255,0.03)' }}>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"
                  style={{ boxShadow: '0 0 6px #ef4444' }} />
                <span className="font-mono text-xs font-bold text-white tracking-widest">CAM-01 | Junction Main</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>REC</span>
              </div>
              <div className="flex items-center gap-4 font-mono text-[10px] text-[#00d4ff]">
                <span>FPS: <strong>30</strong></span>
                <span>VEHICLES: <strong>{vehicleCounts.cars + vehicleCounts.trucks + vehicleCounts.buses}</strong></span>
                <span>INFER: <strong>12ms</strong></span>
                <span className="text-[#06d6a0] font-bold">YOLOv8 ✓</span>
              </div>
            </div>
            <div className="relative">
              <CCTVMonitor />
              {/* HUD corner brackets overlay */}
              <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
                {/* TL */}
                <div className="absolute top-3 left-3 w-6 h-6"
                  style={{ borderTop: '2px solid rgba(0,212,255,0.6)', borderLeft: '2px solid rgba(0,212,255,0.6)', borderRadius: '2px 0 0 0' }} />
                {/* TR */}
                <div className="absolute top-3 right-3 w-6 h-6"
                  style={{ borderTop: '2px solid rgba(0,212,255,0.6)', borderRight: '2px solid rgba(0,212,255,0.6)', borderRadius: '0 2px 0 0' }} />
                {/* BL */}
                <div className="absolute bottom-3 left-3 w-6 h-6"
                  style={{ borderBottom: '2px solid rgba(0,212,255,0.6)', borderLeft: '2px solid rgba(0,212,255,0.6)', borderRadius: '0 0 0 2px' }} />
                {/* BR */}
                <div className="absolute bottom-3 right-3 w-6 h-6"
                  style={{ borderBottom: '2px solid rgba(0,212,255,0.6)', borderRight: '2px solid rgba(0,212,255,0.6)', borderRadius: '0 0 2px 0' }} />
                {/* Center crosshair */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <div className="w-8 h-px bg-[#00d4ff]" />
                  <div className="absolute w-px h-8 bg-[#00d4ff]" />
                </div>
              </div>
            </div>
          </div>

          {/* Detection log + Lane density */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Detection feed */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                <Cpu size={14} className="text-[#00d4ff]" />
                <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-white">Live Detection Feed</h3>
              </div>
              <div className="space-y-2 font-mono text-[10px]">
                {detectionLog.length > 0 ? detectionLog.map((entry, i) => (
                  <div key={i} className="flex gap-3 items-center py-1.5 border-b border-white/5">
                    <span className="text-[#00d4ff]">{entry.time}</span>
                    <span className="flex-1 text-slate-300">{entry.type}</span>
                    <span className="text-[#06d6a0]">{entry.dir}</span>
                    <span className="text-slate-500">
                      {Math.round(entry.conf * 100)}%
                    </span>
                  </div>
                )) : (
                  <div className="text-slate-500 text-center py-4">Waiting for detection events...</div>
                )}
              </div>
            </div>

            {/* Lane density */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                <Activity size={14} className="text-[#00d4ff]" />
                <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-white">Lane Density</h3>
              </div>
              <div className="space-y-4">
                {laneData.map((lane) => (
                  <div key={lane.dir} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-400">{lane.dir}</span>
                      <span className="text-white">{lane.vph} vph</span>
                    </div>
                    <div className="h-3 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${lane.pct}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{
                          background: lane.gradient
                            ? 'linear-gradient(90deg, #06d6a0, #fbbf24, #ef4444)'
                            : lane.color || '#06d6a0',
                          boxShadow: `0 0 8px ${lane.color || '#06d6a0'}60`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Directional Analysis */}
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(0,212,255,0.1)' }}>
                <TrendingUp size={15} className="text-[#00d4ff]" />
              </div>
              <h3 className="font-headline font-bold text-white">Directional Flow Analysis</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {liveSignals.map((d) => {
                const c = d.color === 'green' ? '#06d6a0' : d.color === 'yellow' ? '#fbbf24' : '#ef4444';
                return (
                  <div key={d.direction} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d.direction}</span>
                      <span className="w-2 h-2 rounded-full" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
                    </div>
                    <div className="h-20 rounded-lg flex items-end p-1 gap-0.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-t-sm"
                          style={{ background: `${c}30` }}
                          animate={{ height: `${d.color === 'green' ? 70 + Math.random() * 20 : 20 + Math.random() * 30}%` }}
                          transition={{ duration: 1.5 + i * 0.1, repeat: Infinity, repeatType: 'mirror' }}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] font-mono text-slate-400 text-center">{d.timer}s</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Emergency Monitor */}
          <div className="glass-card p-5" style={{ borderLeft: '3px solid #ef4444' }}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={15} className="text-red-400" />
              <h3 className="font-headline font-bold text-sm text-white">Emergency Monitor</h3>
            </div>
            <div className="p-3 rounded-lg flex items-center gap-3 mb-3"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="p-2 rounded-lg animate-pulse" style={{ background: 'rgba(239,68,68,0.2)' }}>
                <ShieldCheck size={16} className="text-red-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Priority Mode Active</p>
                <p className="text-[10px] text-slate-500">Emergency vehicle detection enabled</p>
              </div>
            </div>
            <button
              onClick={handleEmergencyOverride}
              disabled={emergencyTriggering}
              className="w-full py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all active:scale-95"
              style={{
                background: emergencyTriggering ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#ef4444',
                opacity: emergencyTriggering ? 0.6 : 1,
              }}
            >
              {emergencyTriggering ? 'Triggering...' : 'Force Emergency Override'}
            </button>
          </div>

          {/* Model confidence */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={14} className="text-[#a855f7]" />
              <h3 className="font-headline font-bold text-sm text-white">Model Confidence</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#a855f7"
                    strokeWidth="3" strokeDasharray="100" strokeDashoffset="9" strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-black font-mono text-white">91%</span>
              </div>
              <div className="space-y-2">
                {[['YOLOv8', 94], ['Tracker', 89], ['Classifier', 91]].map(([m, v]) => (
                  <div key={m as string}>
                    <div className="flex justify-between text-[10px] font-mono mb-0.5">
                      <span className="text-slate-400">{m}</span>
                      <span className="text-white">{v}%</span>
                    </div>
                    <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full rounded-full" style={{ width: `${v}%`, background: '#a855f7' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Activity */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Cpu size={14} className="text-[#06d6a0]" />
              <h3 className="font-headline font-bold text-sm text-white">Live Activity</h3>
            </div>
            <LiveActivityFeed />
          </div>

          {/* Neural Insights */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg" style={{ background: 'rgba(168,85,247,0.1)' }}>
                <Zap size={13} className="text-[#a855f7]" />
              </div>
              <h3 className="font-headline font-bold text-sm text-white">Neural Insights</h3>
            </div>
            <div className="space-y-3">
              {insights.slice(0, 2).map((insight) => (
                <div key={insight.id} className="p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" />
                    <span className="text-[9px] font-black text-[#a855f7] uppercase tracking-wider">{insight.type}</span>
                  </div>
                  <p className="text-xs font-bold text-white mb-1">{insight.title}</p>
                  <p className="text-[10px] text-slate-400 line-clamp-2">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveMonitoring;

