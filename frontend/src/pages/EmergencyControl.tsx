import { motion } from 'framer-motion';
import { useState } from 'react';
import EmergencyVehiclePanel from '../components/EmergencyVehiclePanel';
import EmergencyRouteMap from '../components/EmergencyRouteMap';
import PriorityOverrideControl from '../components/PriorityOverrideControl';
import EmergencyAlertCenter from '../components/EmergencyAlertCenter';
import { ShieldAlert, Brain, Siren, Zap, Activity, X, Play } from 'lucide-react';
import { trafficApi, demoApi } from '../services/apiService';

const DIRECTIONS = ['north', 'south', 'east', 'west'] as const;
type Dir = typeof DIRECTIONS[number];

const EmergencyControl = () => {
  const [emergencyDir, setEmergencyDir] = useState<Dir | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [demoRunning, setDemoRunning] = useState(false);

  const mockRoute: [number, number][] = [
    [40.7128, -74.0060],
    [40.7148, -74.0080],
    [40.7168, -74.0100],
    [40.7188, -74.0120],
  ];

  const handleTrigger = async (dir: Dir) => {
    setIsTriggering(true);
    try {
      await trafficApi.triggerEmergency(dir);
      setEmergencyDir(dir);
      setStatusMsg(`⚡ Emergency priority granted — ${dir.toUpperCase()} approach cleared.`);
      setTimeout(() => {
        setEmergencyDir(null);
        setStatusMsg('Emergency corridor auto-cleared.');
      }, 30000);
    } catch {
      setStatusMsg('Backend offline — running in simulation mode.');
      setEmergencyDir(dir);
    } finally { setIsTriggering(false); }
  };

  const handleClear = async () => {
    try {
      await trafficApi.clearEmergency();
    } catch { /* offline ok */ }
    setEmergencyDir(null);
    setStatusMsg('Emergency cleared manually.');
  };

  const handleDemoStart = async () => {
    setDemoRunning(true);
    setStatusMsg('🎟 Demo sequence initiated — 90s automated flow active.');
    try { await demoApi.start(); } catch { /* offline */ }
    setTimeout(() => setDemoRunning(false), 90000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-6"
    >
      {/* Red alert bar */}
      <div className="fixed top-0 left-0 w-full h-0.5 z-50 animate-pulse"
        style={{ background: 'linear-gradient(90deg, transparent, #ef4444, transparent)', boxShadow: '0 0 20px #ef4444' }} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Siren size={22} className="text-red-400" />
            </motion.div>
            <h1 className="font-headline text-3xl font-bold text-white uppercase tracking-tight">
              Emergency <span style={{ color: '#ef4444' }}>Operations Center</span>
            </h1>
          </div>
          <p className="text-slate-400 text-sm ml-9">Critical response and signal priority management</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)' }}>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-black text-red-400 uppercase tracking-widest font-mono">Active Emergency Mode</span>
          </div>
            {/* Demo Mode Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={demoRunning}
            onClick={handleDemoStart}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            style={{ background: demoRunning ? 'rgba(168,85,247,0.08)' : 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.4)', color: '#a855f7', opacity: demoRunning ? 0.6 : 1 }}>
            <Play size={12} />
            {demoRunning ? 'Demo Running…' : 'Start Demo'}
          </motion.button>
          {[['4:32', 'Resp. Time'], ['99.4%', 'Override Rate'], [emergencyDir ? emergencyDir.toUpperCase() : '—', 'Active Dir']].map(([v, l]) => (
            <div key={l} className="stat-card px-4 py-2 text-center">
              <p className="text-base font-headline font-black" style={{ color: emergencyDir && l === 'Active Dir' ? '#ef4444' : 'white' }}>{v}</p>
              <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" style={{ minHeight: '700px' }}>

        {/* Left — Vehicle panel + Override */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <div className="glass-panel p-0 overflow-hidden flex-1 flex flex-col"
            style={{ border: '1px solid rgba(239,68,68,0.15)' }}>
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
              <ShieldAlert size={14} className="text-red-400" />
              <span className="font-headline font-bold text-xs text-white uppercase tracking-wider">Emergency Vehicles</span>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <EmergencyVehiclePanel />
            </div>
          </div>

          <div className="glass-panel p-0 overflow-hidden h-80"
            style={{ border: '1px solid rgba(239,68,68,0.1)' }}>
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
              <Zap size={14} className="text-[#fbbf24]" />
              <span className="font-headline font-bold text-xs text-white uppercase tracking-wider">Priority Override</span>
            </div>
            <div className="p-4 h-full overflow-y-auto">
              <PriorityOverrideControl />
            </div>
          </div>
        </div>

        {/* Center — Map */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          <div className="glass-panel p-0 overflow-hidden flex-1 relative"
            style={{ border: '1px solid rgba(239,68,68,0.15)' }}>
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ boxShadow: '0 0 6px #ef4444' }} />
                <span className="font-mono text-xs font-bold text-white">LIVE ROUTE — EV-001 · Ambulance</span>
              </div>
              <div className="flex items-center gap-4 font-mono text-[10px] text-[#00d4ff]">
                <span>ETA: 2:14</span>
                <span>DIST: 1.8km</span>
              </div>
            </div>
            <EmergencyRouteMap
              center={[40.7128, -74.0060]}
              route={mockRoute}
              currentPos={[40.7148, -74.0080]}
              destination={[40.7188, -74.0120]}
            />
            <div className="absolute bottom-4 left-4 z-10 flex gap-2 flex-wrap">
              {DIRECTIONS.map(dir => (
                <motion.button
                  key={dir}
                  whileTap={{ scale: 0.95 }}
                  disabled={isTriggering || emergencyDir === dir}
                  onClick={() => handleTrigger(dir)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all"
                  style={{
                    background: emergencyDir === dir ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.12)',
                    border: `1px solid ${emergencyDir === dir ? 'rgba(239,68,68,0.8)' : 'rgba(239,68,68,0.3)'}`,
                    color: '#ef4444',
                    boxShadow: emergencyDir === dir ? '0 0 12px #ef444460' : 'none',
                  }}>
                  <Siren size={10} /> {dir}
                </motion.button>
              ))}
              {emergencyDir && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase"
                  style={{ background: 'rgba(6,214,160,0.12)', border: '1px solid rgba(6,214,160,0.4)', color: '#06d6a0' }}>
                  <X size={10} /> Clear
                </motion.button>
              )}
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="glass-panel p-5 relative overflow-hidden"
            style={{ borderTop: '3px solid #a855f7', borderLeft: '1px solid rgba(168,85,247,0.2)' }}>
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: 'rgba(168,85,247,0.1)' }}>
                <Brain size={18} className="text-[#a855f7]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-black text-[#a855f7] uppercase tracking-widest">Gemini AI Recommendation</span>
                  <span className="text-[9px] font-mono text-slate-500">{statusMsg || 'System standby — select direction to trigger.'}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <span className="text-[#a855f7] font-bold">INSIGHT: </span>
                  Congestion predicted at 5th & Broadway in 2 minutes. Recommend activating{' '}
                  <span className="text-[#06d6a0] font-bold">"Emergency Lane C"</span> and extending green wave duration for EV-001.
                </p>
              </div>
              <motion.button whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex-shrink-0 transition-all"
                style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.4)', color: '#a855f7' }}>
                Apply Strategy
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right — Alert center + Response stats */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <div className="glass-panel p-0 overflow-hidden flex-1"
            style={{ border: '1px solid rgba(239,68,68,0.12)' }}>
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
              <Activity size={14} className="text-red-400" />
              <span className="font-headline font-bold text-xs text-white uppercase tracking-wider">Alert Center</span>
            </div>
            <div className="p-4 h-full overflow-y-auto">
              <EmergencyAlertCenter />
            </div>
          </div>

          <div className="glass-card p-5" style={{ border: '1px solid rgba(239,68,68,0.12)' }}>
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert size={14} className="text-red-400" />
              <h3 className="font-headline font-bold text-sm text-white">Response Efficiency</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span className="text-slate-400 uppercase tracking-wider">Avg Response Time</span>
                  <span className="text-[#06d6a0] font-bold">-12%</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-headline font-black text-white">4:32</span>
                  <span className="text-xs text-slate-500 font-mono">min</span>
                </div>
              </div>
              {[['Override Success Rate', 99.4, '#00d4ff'], ['Route Clearance', 87, '#06d6a0'], ['AI Prediction Acc.', 96, '#a855f7']].map(([label, val, color]) => (
                <div key={label as string}>
                  <div className="flex justify-between text-[10px] font-mono mb-1.5">
                    <span className="text-slate-400">{label as string}</span>
                    <span style={{ color: color as string }} className="font-bold">{val}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div className="h-full rounded-full"
                      style={{ background: color as string, boxShadow: `0 0 6px ${color}80` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${val}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmergencyControl;
