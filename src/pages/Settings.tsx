import { motion } from 'framer-motion';
import { useState } from 'react';
import { Bell, Shield, Palette, Database, Globe, Settings as SettingsIcon, CheckCircle } from 'lucide-react';

const Toggle = ({ on }: { on: boolean }) => (
  <div className="w-11 h-6 rounded-full relative cursor-pointer transition-all duration-300 flex-shrink-0"
    style={{ background: on ? 'linear-gradient(90deg, #00d4ff, #a855f7)' : 'rgba(255,255,255,0.08)', boxShadow: on ? '0 0 10px rgba(0,212,255,0.3)' : 'none' }}>
    <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300"
      style={{ left: on ? '26px' : '4px' }} />
  </div>
);

type Section = 'notifications' | 'security' | 'appearance' | 'data' | 'system';

const SECTIONS: { id: Section; label: string; icon: typeof Bell; color: string }[] = [
  { id: 'notifications', label: 'Notifications', icon: Bell, color: '#00d4ff' },
  { id: 'security', label: 'Security', icon: Shield, color: '#a855f7' },
  { id: 'appearance', label: 'Appearance', icon: Palette, color: '#06d6a0' },
  { id: 'data', label: 'Data & Storage', icon: Database, color: '#ec4899' },
  { id: 'system', label: 'System', icon: Globe, color: '#fbbf24' },
];

const Settings = () => {
  const [active, setActive] = useState<Section>('notifications');
  const [toggles, setToggles] = useState({ emergencyAlerts: true, aiInsights: true, systemUpdates: false, twoFactor: false, aiAutoApply: true, weatherAdaptation: true });
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof typeof toggles) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg" style={{ background: 'rgba(0,212,255,0.1)' }}>
              <SettingsIcon size={14} className="text-[#00d4ff]" />
            </div>
            <span className="text-[10px] font-bold text-[#00d4ff] uppercase tracking-widest font-mono">System Configuration</span>
          </div>
          <h1 className="font-headline text-3xl font-bold text-white">
            Platform <span className="gradient-text">Settings</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Configure AI Junction system preferences and integrations</p>
        </div>
        <motion.button onClick={handleSave} whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
          style={{ background: saved ? 'rgba(6,214,160,0.15)' : 'rgba(0,212,255,0.1)', border: `1px solid ${saved ? 'rgba(6,214,160,0.4)' : 'rgba(0,212,255,0.3)'}`, color: saved ? '#06d6a0' : '#00d4ff' }}>
          {saved ? <><CheckCircle size={15} /> Saved!</> : 'Save Changes'}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar nav */}
        <div className="lg:col-span-3">
          <div className="glass-panel p-3 space-y-1">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = active === s.id;
              return (
                <button key={s.id} onClick={() => setActive(s.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left"
                  style={isActive ? {
                    background: `${s.color}10`,
                    borderLeft: `3px solid ${s.color}`,
                    paddingLeft: '10px',
                  } : { borderLeft: '3px solid transparent' }}>
                  <div className="p-1.5 rounded-md flex-shrink-0"
                    style={{ background: isActive ? `${s.color}18` : 'rgba(255,255,255,0.04)' }}>
                    <Icon size={14} style={{ color: isActive ? s.color : '#64748b' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: isActive ? 'white' : '#64748b' }}>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* System status */}
          <div className="glass-card p-4 mt-4 space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">System Status</p>
            {[['Backend API', '#06d6a0', 'Operational'], ['WebSocket', '#06d6a0', 'Connected'], ['AI Engine', '#00d4ff', 'Active'], ['CCTV Feed', '#fbbf24', 'Partial']].map(([label, color, status]) => (
              <div key={label as string} className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: color as string }} />
                  <span className="text-[10px] font-mono" style={{ color: color as string }}>{status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-9 space-y-5">
          {active === 'notifications' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="glass-panel p-5">
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-white/5">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(0,212,255,0.1)' }}>
                    <Bell size={15} className="text-[#00d4ff]" />
                  </div>
                  <h2 className="font-headline font-bold text-white">Notification Preferences</h2>
                </div>
                <div className="space-y-5">
                  {[
                    { key: 'emergencyAlerts' as const, label: 'Emergency Alerts', desc: 'Critical incident notifications — fires, accidents, blocked routes' },
                    { key: 'aiInsights' as const, label: 'AI Insights', desc: 'New optimization recommendations from the Gemini traffic engine' },
                    { key: 'systemUpdates' as const, label: 'System Updates', desc: 'Platform maintenance and version release notifications' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                      onClick={() => toggle(item.key)}>
                      <div>
                        <p className="text-sm font-bold text-white">{item.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                      <Toggle on={toggles[item.key]} />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {active === 'security' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="glass-panel p-5">
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-white/5">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(168,85,247,0.1)' }}>
                    <Shield size={15} className="text-[#a855f7]" />
                  </div>
                  <h2 className="font-headline font-bold text-white">Security Settings</h2>
                </div>
                <div className="space-y-5">
                  <div className="flex items-center justify-between py-3 border-b border-white/5" onClick={() => toggle('twoFactor')}>
                    <div>
                      <p className="text-sm font-bold text-white">Two-Factor Authentication</p>
                      <p className="text-[11px] text-slate-500">Extra security layer via authenticator app or SMS</p>
                    </div>
                    <Toggle on={toggles.twoFactor} />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <div>
                      <p className="text-sm font-bold text-white">Session Timeout</p>
                      <p className="text-[11px] text-slate-500">Automatically log out after inactivity</p>
                    </div>
                    <select className="rounded-lg px-3 py-2 text-xs text-white font-mono"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <option>15 minutes</option>
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>Never</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-bold text-white">Audit Log</p>
                      <p className="text-[11px] text-slate-500">Track all system configuration changes</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
                      style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', color: '#a855f7' }}>
                      View Logs
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {active === 'appearance' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="glass-panel p-5">
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-white/5">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(6,214,160,0.1)' }}>
                    <Palette size={15} className="text-[#06d6a0]" />
                  </div>
                  <h2 className="font-headline font-bold text-white">Appearance & Theme</h2>
                </div>
                <div className="space-y-5">
                  <div className="py-3 border-b border-white/5">
                    <p className="text-sm font-bold text-white mb-1">Accent Color</p>
                    <p className="text-[11px] text-slate-500 mb-3">Customize the primary interface accent color</p>
                    <div className="flex gap-3">
                      {[['#00d4ff', 'Cyan'], ['#a855f7', 'Purple'], ['#06d6a0', 'Green'], ['#ec4899', 'Pink'], ['#fbbf24', 'Gold']].map(([c, l]) => (
                        <button key={c} title={l} className="w-9 h-9 rounded-full border-2 transition-all hover:scale-110"
                          style={{ background: c as string, borderColor: c === '#00d4ff' ? 'white' : 'transparent' }} />
                      ))}
                    </div>
                  </div>
                  <div className="py-3">
                    <p className="text-sm font-bold text-white mb-1">Interface Density</p>
                    <p className="text-[11px] text-slate-500 mb-3">Adjust information density of panels</p>
                    <div className="flex gap-2">
                      {['Compact', 'Default', 'Comfortable'].map((opt, i) => (
                        <button key={opt} className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
                          style={i === 1 ? {
                            background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff',
                          } : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {active === 'data' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="glass-panel p-5">
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-white/5">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(236,72,153,0.1)' }}>
                    <Database size={15} className="text-pink-400" />
                  </div>
                  <h2 className="font-headline font-bold text-white">Data & Storage</h2>
                </div>
                <div className="space-y-5">
                  <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <div>
                      <p className="text-sm font-bold text-white">Data Retention Period</p>
                      <p className="text-[11px] text-slate-500">Historical traffic data storage duration</p>
                    </div>
                    <select className="rounded-lg px-3 py-2 text-xs text-white font-mono"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <option>30 days</option><option>90 days</option><option>1 year</option><option>Forever</option>
                    </select>
                  </div>
                  <div className="py-3 border-b border-white/5">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-400">Storage Used</span>
                      <span className="text-white font-mono">2.4 GB / 10 GB</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="h-full rounded-full w-1/4" style={{ background: 'linear-gradient(90deg, #00d4ff, #a855f7)' }} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="btn-secondary text-xs py-2 px-4">Export Data</button>
                    <button className="btn-danger text-xs py-2 px-4">Clear All Data</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {active === 'system' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="glass-panel p-5">
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-white/5">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.1)' }}>
                    <Globe size={15} className="text-yellow-400" />
                  </div>
                  <h2 className="font-headline font-bold text-white">System Configuration</h2>
                </div>
                <div className="space-y-5">
                  {[
                    { label: 'API Endpoint', desc: 'Backend REST API connection', defaultVal: 'http://localhost:8000/api' },
                    { label: 'WebSocket URL', desc: 'Real-time data stream endpoint', defaultVal: 'ws://localhost:8000/ws' },
                    { label: 'Gemini API Key', desc: 'Google Gemini AI engine credentials', defaultVal: '●●●●●●●●●●●●●●●●' },
                  ].map((field) => (
                    <div key={field.label} className="py-3 border-b border-white/5 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold text-white">{field.label}</p>
                          <p className="text-[11px] text-slate-500">{field.desc}</p>
                        </div>
                      </div>
                      <input type={field.label.includes('Key') ? 'password' : 'text'}
                        defaultValue={field.defaultVal}
                        className="w-full rounded-lg px-4 py-2.5 text-xs font-mono text-white focus:outline-none transition-all"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-3 border-b border-white/5" onClick={() => toggle('aiAutoApply')}>
                    <div>
                      <p className="text-sm font-bold text-white">AI Auto-Apply Optimizations</p>
                      <p className="text-[11px] text-slate-500">Automatically apply AI signal timing suggestions</p>
                    </div>
                    <Toggle on={toggles.aiAutoApply} />
                  </div>
                  <div className="flex items-center justify-between py-3" onClick={() => toggle('weatherAdaptation')}>
                    <div>
                      <p className="text-sm font-bold text-white">Weather Adaptation</p>
                      <p className="text-[11px] text-slate-500">Adjust signal timing based on weather conditions</p>
                    </div>
                    <Toggle on={toggles.weatherAdaptation} />
                  </div>
                </div>
              </div>

              {/* Version info */}
              <div className="glass-card p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">AI Junction v2.0.0</p>
                  <p className="text-[10px] text-slate-500 font-mono">Build: hackathon-2024 · Stable</p>
                </div>
                <button className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}>
                  Check Updates
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
