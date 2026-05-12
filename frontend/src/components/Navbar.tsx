import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, User, Menu, Wifi, Clock, ShieldCheck, Cpu } from 'lucide-react';
import { useSocketConnection } from '../hooks/useRealtimeData';

interface NavbarProps {
  onMenuClick: () => void;
  isMobile: boolean;
}

const Navbar = ({ onMenuClick, isMobile }: NavbarProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [time, setTime] = useState(new Date());
  const { isConnected } = useSocketConnection();
  const [latency, setLatency] = useState(12);
  const [notifCount, setNotifCount] = useState(3);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Simulate realistic latency drift
  useEffect(() => {
    const l = setInterval(() => {
      setLatency(Math.floor(8 + Math.random() * 18));
    }, 3000);
    return () => clearInterval(l);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 right-0 left-0 h-16 z-30"
      style={{
        background: 'rgba(3, 7, 18, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 4px 30px rgba(0,212,255,0.04)',
      }}
    >
      {/* Top edge shimmer */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.3) 50%, transparent)' }} />

      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          {isMobile && (
            <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <Menu size={20} className="text-slate-400" />
            </button>
          )}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full w-60"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Search size={13} className="text-slate-600" />
            <input
              type="text"
              placeholder="Search junctions, alerts..."
              className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-600 flex-1"
            />
            <kbd className="hidden xl:block text-[9px] text-slate-600 px-1 py-0.5 rounded border border-white/10 font-mono">⌘K</kbd>
          </div>
        </div>

        {/* Center — live status indicators */}
        <div className="hidden lg:flex items-center gap-5">
          {/* WebSocket status */}
          <motion.div
            className="flex items-center gap-2"
            animate={{ opacity: isConnected ? 1 : 0.6 }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse"
              style={{ 
                background: isConnected ? '#06d6a0' : '#ef4444',
                boxShadow: `0 0 6px ${isConnected ? '#06d6a0' : '#ef4444'}` 
              }} />
            <span className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: isConnected ? '#06d6a0' : '#ef4444' }}>
              {isConnected ? 'Neural Sync Active' : 'Reconnecting…'}
            </span>
          </motion.div>

          <div className="w-px h-4 bg-white/10" />

          {/* Latency */}
          <div className="flex items-center gap-1.5">
            <Wifi size={11} className="text-[#00d4ff]" />
            <span className="text-[10px] font-bold text-[#00d4ff] font-mono">
              {latency}ms
            </span>
          </div>

          <div className="w-px h-4 bg-white/10" />

          {/* AI model */}
          <div className="flex items-center gap-1.5">
            <Cpu size={11} className="text-[#a855f7]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              YOLOv8: <span className="text-[#a855f7]">Active</span>
            </span>
          </div>

          <div className="w-px h-4 bg-white/10" />

          {/* Shield / AI confidence */}
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={11} className="text-[#06d6a0]" />
            <span className="text-[10px] font-bold text-slate-400">
              AI: <span className="text-[#06d6a0]">94.2%</span>
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <Clock size={11} className="text-[#00d4ff]" />
            <span className="font-mono">{time.toLocaleTimeString()}</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setShowNotifications(!showNotifications); setNotifCount(0); }}
              className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Bell size={17} className="text-slate-400" />
              {notifCount > 0 && (
                <>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-xl overflow-hidden z-50"
                  style={{ background: 'rgba(10,15,30,0.98)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-headline font-bold text-sm text-white">System Alerts</h3>
                    <span className="text-[9px] font-mono text-slate-500 px-2 py-0.5 rounded-full bg-white/5">3 new</span>
                  </div>
                  <div className="p-2 space-y-1">
                    {[
                      { msg: 'Emergency vehicle detected — North approach', time: '2m ago', color: '#ef4444', icon: '🚨' },
                      { msg: 'AI optimization: +15s green phase recommended', time: '5m ago', color: '#00d4ff', icon: '⚡' },
                      { msg: 'Congestion peak at East junction (87%)', time: '8m ago', color: '#fbbf24', icon: '⚠️' },
                    ].map((n, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-3 rounded-lg hover:bg-white/5 cursor-pointer flex items-start gap-3 transition-colors"
                      >
                        <span className="text-sm flex-shrink-0 mt-0.5">{n.icon}</span>
                        <div>
                          <p className="text-xs text-slate-200 leading-tight">{n.msg}</p>
                          <p className="text-[10px] text-slate-500 mt-1 font-mono">{n.time}</p>
                        </div>
                        <div className="w-1 h-full rounded-full ml-auto flex-shrink-0 mt-1" style={{ background: n.color, minHeight: '30px' }} />
                      </motion.div>
                    ))}
                  </div>
                  <div className="px-3 pb-3">
                    <button className="w-full py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg btn-secondary">
                      View All Alerts
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #a855f7)', padding: '1.5px' }}>
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
              <User size={13} className="text-slate-300" />
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
