import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmergencyAlertBanner from '../components/EmergencyAlertBanner';
import JunctionMap from '../components/JunctionMap';
import CircularSignalTimer from '../components/CircularSignalTimer';
import AnimatedCongestionBar from '../components/AnimatedCongestionBar';
import LiveActivityFeed from '../components/LiveActivityFeed';
import EmergencyAlertPopup from '../components/EmergencyAlertPopup';
import {
  useJunctionData,
  useTrafficStats,
  useAIInsights,
  useEmergencyAlerts,
  useSocketConnection,
  useSignalData,
  useWeatherData,
} from '../hooks/useRealtimeData';
import {
  Car, Activity, AlertTriangle, Zap, Brain,
  TrendingUp, Map as MapIcon, Layers, ArrowUpRight, ArrowDownRight,
  ShieldCheck, Cpu
} from 'lucide-react';

const Dashboard = () => {
  const junctions = useJunctionData();
  const stats = useTrafficStats();
  const insights = useAIInsights();
  const { alerts, acknowledgeAlert, resolveAlert } = useEmergencyAlerts();
  const isConnected = useSocketConnection();
  const liveSignals = useSignalData();
  const { weather } = useWeatherData();
  const [showEmergencyPopup, setShowEmergencyPopup] = useState(false);
  const [activePopupAlert, setActivePopupAlert] = useState<any>(null);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const latestAlert = alerts[0];
    if (latestAlert && latestAlert.status === 'active' && latestAlert.severity === 'critical') {
      const isNew = Date.now() - new Date(latestAlert.timestamp).getTime() < 5000;
      if (isNew) {
        setActivePopupAlert({
          title: latestAlert.type,
          message: latestAlert.description,
          severity: latestAlert.severity,
          location: latestAlert.location,
        });
        setShowEmergencyPopup(true);
      }
    }
  }, [alerts]);

  const statCards = [
    {
      title: 'Total Vehicles',
      value: stats.totalVehicles.toLocaleString(),
      icon: Car,
      trend: { value: 12, positive: true },
      color: '#00d4ff',
      bg: 'rgba(0,212,255,0.08)',
    },
    {
      title: 'Avg Speed',
      value: `${stats.avgSpeed} km/h`,
      icon: TrendingUp,
      trend: { value: 5, positive: false },
      color: '#06d6a0',
      bg: 'rgba(6,214,160,0.08)',
    },
    {
      title: 'Congestion',
      value: `${stats.congestionLevel}%`,
      icon: AlertTriangle,
      trend: { value: 8, positive: false },
      color: '#fbbf24',
      bg: 'rgba(251,191,36,0.08)',
    },
    {
      title: 'AI Efficiency',
      value: '94.2%',
      icon: Brain,
      trend: { value: 3, positive: true },
      color: '#a855f7',
      bg: 'rgba(168,85,247,0.08)',
    },
    {
      title: 'Active Alerts',
      value: String(stats.incidents),
      icon: Zap,
      trend: null,
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.08)',
    },
  ];

  const signalColor = (s: string) =>
    s === 'green' ? '#06d6a0' : s === 'yellow' ? '#fbbf24' : '#ef4444';

  const WEATHER_ICON: Record<string, string> = {
    clear: '☀️', rain: '🌧️', fog: '🌫️', storm: '⛈️',
  };

  if (isBooting) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0a0f1e] flex flex-col items-center justify-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#a855f7] flex items-center justify-center shadow-[0_0_50px_rgba(0,212,255,0.3)]">
            <Cpu size={48} className="text-white animate-pulse" />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 border-2 border-dashed border-[#00d4ff]/30 rounded-full"
          />
        </motion.div>
        
        <div className="mt-12 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-headline text-2xl font-bold text-white tracking-tight"
          >
            SMART CITY <span className="gradient-text">OS</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-slate-500 font-mono text-[10px] mt-2 uppercase tracking-[0.3em]"
          >
            Initializing Neural Traffic Core...
          </motion.p>
        </div>

        <div className="mt-8 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-[#00d4ff] to-[#a855f7]"
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      <AnimatePresence>
        {showEmergencyPopup && (
          <EmergencyAlertPopup
            show={showEmergencyPopup}
            onClose={() => setShowEmergencyPopup(false)}
            alert={activePopupAlert || {
              title: 'Critical Congestion Alert',
              message: 'System reporting severe conditions.',
              severity: 'critical',
              location: 'System-wide',
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white">
            City <span className="gradient-text">Intelligence</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
            <ShieldCheck size={13} className="text-[#00d4ff]" />
            Monitoring 4 critical junctions · 94.2% AI confidence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest`}
            style={{
              background: isConnected ? 'rgba(6,214,160,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${isConnected ? 'rgba(6,214,160,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: isConnected ? '#06d6a0' : '#ef4444',
            }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: isConnected ? '#06d6a0' : '#ef4444' }} />
            {isConnected ? 'Neural Sync Active' : 'Offline Mode'}
          </div>
          <button
            onClick={() => setShowEmergencyPopup(true)}
            className="relative p-2.5 rounded-lg transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            <Zap size={18} className="text-red-400" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3, scale: 1.02 }}
              className="stat-card relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-1">
                <div className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-white/50 animate-pulse" />
              </div>
              
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-lg" style={{ background: card.bg }}>
                  <Icon size={16} style={{ color: card.color }} />
                </div>
                {card.trend && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold"
                    style={{ color: card.trend.positive ? '#06d6a0' : '#ef4444' }}>
                    {card.trend.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {card.trend.value}%
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-[10px] font-label uppercase tracking-widest mb-1">{card.title}</p>
              <p className="text-2xl font-headline font-bold text-white" style={{ textShadow: `0 0 20px ${card.color}40` }}>
                {card.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left — Map + Signal Timers + Congestion */}
        <div className="lg:col-span-8 space-y-6">
          {/* Junction Map */}
          <div className="glass-panel p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00d4ff]/30 to-transparent animate-shimmer" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(0,212,255,0.1)' }}>
                  <MapIcon size={16} className="text-[#00d4ff]" />
                </div>
                <h2 className="font-headline font-bold text-white">Digital Twin Map</h2>
              </div>
              <div className="live-badge group">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06d6a0] animate-pulse" />
                <span className="group-hover:text-white transition-colors">Live Telemetry</span>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <JunctionMap junctions={junctions} />
            </div>
          </div>

          {/* Signal Timers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {junctions.slice(0, 3).map((junction) => (
              <motion.div
                key={junction.id}
                whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)" }}
                className="glass-card p-5 flex flex-col items-center"
              >
                <p className="text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest mb-4">
                  {junction.name}
                </p>
                <CircularSignalTimer
                  timeLeft={junction.avgWaitTime}
                  totalTime={120}
                  signalState={junction.signalState}
                />
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">Wait:</span>
                  <span className="text-sm font-bold text-white font-mono">{junction.avgWaitTime}s</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Congestion Bars */}
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(168,85,247,0.1)' }}>
                <Layers size={16} className="text-[#a855f7]" />
              </div>
              <h2 className="font-headline font-bold text-white">Traffic Density</h2>
            </div>
            <div className="space-y-3">
              {junctions.slice(0, 4).map((junction) => (
                <AnimatedCongestionBar
                  key={junction.id}
                  label={junction.name.split(' ')[0]}
                  value={junction.trafficFlow}
                  max={200}
                  trend={junction.status === 'congested' || junction.status === 'critical' ? 'up' : 'stable'}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right — Signals, AI Feed, Alerts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Signal Status */}
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(0,212,255,0.1)' }}>
                <Activity size={16} className="text-[#00d4ff]" />
              </div>
              <h2 className="font-headline font-bold text-white">Signal Status</h2>
            </div>
            <div className="space-y-3">
              {liveSignals.map((sig) => (
                <motion.div 
                  key={sig.direction}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-3 rounded-xl transition-all"
                  style={{
                    background: sig.active ? `${signalColor(sig.color)}08` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${sig.active ? signalColor(sig.color) + '40' : 'rgba(255,255,255,0.05)'}`,
                    boxShadow: sig.active ? `0 0 12px ${signalColor(sig.color)}20` : 'none',
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: signalColor(sig.color), boxShadow: `0 0 12px ${signalColor(sig.color)}` }}>
                      <span className="text-[10px] font-black text-black">{sig.direction[0]}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{sig.direction}bound</p>
                      <p className="text-[10px] uppercase tracking-wider font-mono" style={{ color: signalColor(sig.color) }}>
                        {sig.color.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xl font-headline font-black font-mono" style={{ color: signalColor(sig.color) }}>
                    {sig.timer}s
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI Intelligence Feed */}
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(168,85,247,0.1)' }}>
                  <Brain size={16} className="text-[#a855f7]" />
                </div>
                <h2 className="font-headline font-bold text-white text-sm">AI Intelligence Feed</h2>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse" />
            </div>
            <div className="space-y-3">
              {insights.slice(0, 3).map((insight) => (
                <motion.div 
                  key={insight.id} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-lg relative overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderLeft: `3px solid ${insight.type === 'alert' ? '#ef4444' : insight.type === 'prediction' ? '#fbbf24' : '#00d4ff'}`,
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      insight.type === 'alert' ? 'critical-badge' :
                      insight.type === 'prediction' ? 'high-badge' : 'medium-badge'
                    }`}>{insight.type}</span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {insight.confidence > 1 ? insight.confidence.toFixed(0) : Math.round(insight.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{insight.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(6,214,160,0.1)' }}>
                <Cpu size={16} className="text-[#06d6a0]" />
              </div>
              <h2 className="font-headline font-bold text-white text-sm">Live Activity</h2>
            </div>
            <LiveActivityFeed />
          </div>

          {/* Emergency Alerts */}
          {alerts.length > 0 && (
            <div className="glass-panel p-5" style={{ borderLeft: '3px solid #ef4444' }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={15} className="text-red-400" />
                <h2 className="font-headline font-bold text-white text-sm">Priority Alerts</h2>
              </div>
              <EmergencyAlertBanner
                alerts={alerts}
                onAcknowledge={acknowledgeAlert}
                onResolve={resolveAlert}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom status strip */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl text-[10px] font-mono"
        style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2" style={{ color: isConnected ? '#06d6a0' : '#ef4444' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: isConnected ? '#06d6a0' : '#ef4444', boxShadow: `0 0 5px ${isConnected ? '#06d6a0' : '#ef4444'}` }} />
            WS: {isConnected ? 'Connected' : 'Reconnecting…'}
          </span>
          <span className="flex items-center gap-2 text-slate-400">
            <span className="text-base">{WEATHER_ICON[weather.condition] ?? '🌤️'}</span>
            {weather.condition.toUpperCase()} · {weather.temperature_c}°C
          </span>
          <span className="flex items-center gap-2 text-slate-400">
            💨 {weather.wind_speed_kmh} km/h · 👁 {weather.visibility_km}km
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <span>v2.0.0-stable</span>
          <span className="text-[#00d4ff] font-bold">AI: {isConnected ? 'LIVE' : 'MOCK'}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
