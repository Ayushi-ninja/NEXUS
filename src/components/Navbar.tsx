import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, User, Menu, Wifi, Clock } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
  isMobile: boolean;
}

const Navbar = ({ onMenuClick, isMobile }: NavbarProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 right-0 left-0 h-16 z-30"
      style={{
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 4px 30px rgba(0,212,255,0.05)',
      }}
    >
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          {isMobile && (
            <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <Menu size={20} className="text-slate-400" />
            </button>
          )}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full w-64"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Search size={14} className="text-slate-500" />
            <input
              type="text"
              placeholder="Search junctions, alerts..."
              className="bg-transparent border-none outline-none text-sm text-white placeholder-slate-600 flex-1"
            />
          </div>
        </div>

        {/* Center — status indicators */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#06d6a0] animate-pulse" style={{ boxShadow: '0 0 6px #06d6a0' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">WebSocket: Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi size={12} className="text-[#00d4ff]" />
            <span className="text-[10px] font-bold text-[#00d4ff] font-mono">LATENCY: 12ms</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#06d6a0]" style={{ boxShadow: '0 0 6px #06d6a0' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">YOLOv8: Active</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <Clock size={12} className="text-[#00d4ff]" />
            <span>{time.toLocaleTimeString()}</span>
          </div>

          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Bell size={18} className="text-slate-400" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-xl overflow-hidden z-50"
                  style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="p-4 border-b border-white/5">
                    <h3 className="font-headline font-bold text-sm text-white">System Alerts</h3>
                  </div>
                  <div className="p-2 space-y-1">
                    {[
                      { msg: 'Emergency vehicle detected — North approach', time: '2m ago', color: '#ef4444' },
                      { msg: 'AI optimization: +15s green phase recommended', time: '5m ago', color: '#00d4ff' },
                      { msg: 'Congestion peak at East junction (87%)', time: '8m ago', color: '#fbbf24' },
                    ].map((n, i) => (
                      <div key={i} className="p-3 rounded-lg hover:bg-white/5 cursor-pointer flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.color }} />
                        <div>
                          <p className="text-xs text-slate-200">{n.msg}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #a855f7)', padding: '1px' }}>
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
              <User size={14} className="text-slate-300" />
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
