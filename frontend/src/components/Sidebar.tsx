import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Activity,
  Box,
  Brain,
  AlertTriangle,
  BarChart3,
  Settings,
  Menu,
  X,
  Zap,
  CloudRain,
  Radio,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  badge?: string;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Live Monitoring', path: '/live-monitoring', icon: Activity },
  { label: 'Digital Twin', path: '/digital-twin', icon: Box },
  { label: 'AI Insights', path: '/ai-insights', icon: Brain },
  { label: 'Emergency Control', path: '/emergency', icon: AlertTriangle, badge: 'LIVE', badgeColor: '#ef4444' },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Weather', path: '/weather', icon: CloudRain },
  { label: 'Settings', path: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, isMobile, onToggle }: SidebarProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: isOpen ? (isMobile ? '280px' : '256px') : isMobile ? '0' : '72px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-full z-50 overflow-hidden"
        style={{
          background: 'rgba(3, 7, 18, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '4px 0 30px rgba(0,0,0,0.5)',
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/5 relative overflow-hidden">
          <div className="shimmer-line" />
          <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center relative"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #a855f7)' }}>
            <Activity size={18} className="text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#06d6a0] border-2 border-[#030712]" />
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="ml-3 overflow-hidden"
              >
                <h1 className="font-headline font-bold text-base gradient-text whitespace-nowrap">AI Junction</h1>
                <p className="text-[9px] text-slate-500 whitespace-nowrap font-mono tracking-wider">Traffic Intelligence v2.0</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* System status chip */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mx-3 mt-4 mb-2"
            >
              {/* Online status */}
              <div className="p-2.5 rounded-lg flex items-center gap-2 mb-2"
                style={{ background: 'rgba(6,214,160,0.06)', border: '1px solid rgba(6,214,160,0.2)' }}>
                <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(6,214,160,0.1)' }}>
                  <Radio size={12} className="text-[#06d6a0]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-[#06d6a0] uppercase tracking-wider whitespace-nowrap">System Online</p>
                  <p className="text-[9px] text-slate-500 font-mono whitespace-nowrap">24 junctions · AI active</p>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-[#06d6a0] animate-pulse ml-auto flex-shrink-0" />
              </div>

              {/* Intelligence status */}
              <div className="p-2.5 rounded-lg flex items-center gap-2"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,212,255,0.1)' }}>
                  <Zap size={12} className="text-[#00d4ff]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-[#00d4ff] uppercase tracking-wider whitespace-nowrap">Neural Sync</p>
                  <p className="text-[9px] text-slate-500 font-mono whitespace-nowrap">Active Nodes: 1,240</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className="px-2 py-2 space-y-0.5 overflow-y-auto" style={{ height: 'calc(100vh - 260px)' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} onClick={isMobile ? onToggle : undefined}>
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group"
                  style={active ? {
                    background: 'linear-gradient(90deg, rgba(0,212,255,0.1) 0%, transparent 100%)',
                    borderLeft: '3px solid #00d4ff',
                    boxShadow: '0 0 15px rgba(0,212,255,0.08)',
                    paddingLeft: '10px',
                  } : {
                    borderLeft: '3px solid transparent',
                  }}
                >
                  <Icon
                    size={18}
                    className={`flex-shrink-0 transition-colors ${active ? 'text-[#00d4ff]' : 'text-slate-500 group-hover:text-slate-300'}`}
                  />
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        className="flex items-center justify-between flex-1 min-w-0"
                      >
                        <span className={`text-sm font-medium whitespace-nowrap font-body truncate ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded font-mono ml-2 flex-shrink-0"
                            style={{ 
                              background: `${item.badgeColor}20`,
                              color: item.badgeColor, 
                              border: `1px solid ${item.badgeColor}40` 
                            }}>
                            {item.badge}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/5">
          <AnimatePresence>
            {isOpen && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full mb-2 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all active:scale-95"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
                onClick={() => {}}
              >
                Emergency Override
              </motion.button>
            )}
          </AnimatePresence>
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg transition-colors"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            {isOpen ? <X size={16} className="text-slate-400" /> : <Menu size={16} className="text-slate-400" />}
            <AnimatePresence>
              {isOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-xs text-slate-500">Collapse</motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
