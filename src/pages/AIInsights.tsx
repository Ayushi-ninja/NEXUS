import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  Brain, TrendingUp, Cpu,
  Zap, Activity, Bot, Send, Target, GitBranch, BarChart2, RefreshCw
} from 'lucide-react';
import { useAIInsights } from '../hooks/useRealtimeData';
import { aiApi, type ApiAIRecommendation } from '../services/apiService';

const AI_METRICS = [
  { label: 'Delay Reduced', value: '24.8%', color: '#00d4ff', bars: [4, 7, 5, 8, 6, 9, 10] },
  { label: 'CO₂ Savings', value: '12.4t', color: '#a855f7', bars: [3, 5, 4, 6, 8, 7, 9] },
  { label: 'Throughput +', value: '18.2%', color: '#06d6a0', bars: [6, 4, 7, 5, 8, 9, 7] },
  { label: 'Fuel Saved', value: '8.6kL', color: '#fbbf24', bars: [5, 6, 4, 7, 5, 8, 9] },
];

const ACTIVITY_STREAM = [
  { time: '12:45:02', event: 'Signal Timing Adjusted', junction: 'North Main', details: 'Added 15s to East-West phase', color: '#00d4ff' },
  { time: '12:44:15', event: 'Congestion Predicted', junction: 'Broadway & 5th', details: '85% queue formation probability in 10 min', color: '#a855f7' },
  { time: '12:43:50', event: 'Emergency Route Primed', junction: 'Route 66', details: 'Signal wave ready for Ambulance EV-202', color: '#06d6a0' },
  { time: '12:42:10', event: 'Weather Adaptation', junction: 'Global', details: 'Rain detection multiplier applied (1.3×)', color: '#fbbf24' },
  { time: '12:41:05', event: 'AI Model Retrained', junction: 'System', details: 'Accuracy improved to 94.7% (+0.5%)', color: '#00d4ff' },
];

const AIInsights = () => {
  const wsInsights = useAIInsights();
  const [apiInsights, setApiInsights] = useState<ApiAIRecommendation[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am the Gemini Traffic AI, powered by Google Gemini 1.5 Flash. Monitoring 4 junctions at 94.2% accuracy. How can I optimize the network today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Poll Gemini REST API every 30 seconds
  useEffect(() => {
    const fetchInsights = async () => {
      setApiLoading(true);
      try {
        const data = await aiApi.getRecommendations(6);
        setApiInsights(data);
        setLastRefresh(new Date());
      } catch {
        // silently fall back to WS insights
      } finally {
        setApiLoading(false);
      }
    };
    fetchInsights();
    const interval = setInterval(fetchInsights, 30000);
    return () => clearInterval(interval);
  }, []);

  // Scroll chat to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Merge API insights + WS insights, deduplicate by title
  const allInsights = [
    ...apiInsights.map(r => ({
      id: r.recommendation_id,
      type: (r.category === 'emergency' ? 'alert' : r.category === 'congestion' ? 'prediction' : 'optimization') as 'alert' | 'prediction' | 'optimization',
      title: r.title,
      description: r.description,
      confidence: r.confidence,
      timestamp: new Date(r.timestamp),
    })),
    ...wsInsights,
  ].slice(0, 8);

  const CHAT_RESPONSES: Record<string, string> = {
    traffic: 'Current network telemetry: North junction at 78% density, East at 62%. Adaptive phase extension active — green time increased by 18s. Projected throughput: +140 vehicles/hour.',
    emergency: 'Emergency protocol status: Standby. Pre-emptive green wave configured for all approach corridors. Signal preemption latency: <200ms. All units ready.',
    congestion: 'Congestion model predicts 84% density on North approach within 12 minutes based on upstream inflow patterns. Recommend activating platoon-splitting signal sequence now.',
    weather: 'Precipitation monitoring active. Current multiplier: ×1.0 (clear). Rain trigger armed at 5mm/hr — will extend yellow phase to 6s and reduce cycle speed by 15%.',
    signal: 'Signal optimization running cycle #1,247. Current efficiency: 94.2%. Green wave synchronization on N/S arterial achieving 67% bandwidth. East-West coordination at 58%.',
    optimize: 'Running full-network optimization sweep... Done. Recommended: compress West cycle by 8s, extend North green by 12s, activate coordinated platoon mode on S corridor. Expected improvement: -22% avg delay.',
  };

  const getMockResponse = (q: string): string => {
    const ql = q.toLowerCase();
    const key = Object.keys(CHAT_RESPONSES).find(k => ql.includes(k));
    return key ? CHAT_RESPONSES[key] : `Analyzing query: "${q}"... Gemini AI recommends: Increase North-bound green time by 20s to clear the emerging queue. Expected improvement: +140 vehicles/hour throughput and -18% average delay.`;
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const userMsg = inputValue;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputValue('');
    setIsTyping(true);
    // Try to get a fresh recommendation from API when user asks
    try {
      const recs = await aiApi.getRecommendations(1);
      if (recs.length > 0) {
        const r = recs[0];
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'assistant', text: `[${r.priority.toUpperCase()} PRIORITY] ${r.title}: ${r.description} — ${r.suggested_action} (Confidence: ${Math.round(r.confidence * 100)}%)` }]);
          setIsTyping(false);
        }, 900);
        return;
      }
    } catch { /* fall through to mock */ }
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: getMockResponse(userMsg) }]);
      setIsTyping(false);
    }, 1200);
  };

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
            <div className="p-1 rounded" style={{ background: 'rgba(168,85,247,0.15)' }}>
              <Brain size={14} className="text-[#a855f7]" />
            </div>
            <span className="text-[10px] font-bold text-[#a855f7] uppercase tracking-widest font-mono">Neural Processor Active</span>
          </div>
          <h1 className="font-headline text-3xl font-bold text-white">
            Smart City <span className="gradient-text">AI Insights</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gemini-powered traffic intelligence · Real-time ML optimization</p>
        </div>
        <div className="flex items-center gap-3">
          {[['94.2%', 'AI Accuracy', '#00d4ff'], ['98%', 'Safety Rating', '#06d6a0'], ['24/7', 'Uptime', '#a855f7']].map(([v, l, c]) => (
            <div key={l} className="text-center px-4 py-2.5 rounded-xl stat-card">
              <p className="text-lg font-headline font-black" style={{ color: c as string }}>{v}</p>
              <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {AI_METRICS.map((m) => (
          <div key={m.label} className="stat-card">
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-label">{m.label}</p>
                <p className="text-2xl font-headline font-black" style={{ color: m.color }}>{m.value}</p>
              </div>
              <div className="h-10 w-16 flex items-end gap-0.5">
                {m.bars.map((h, i) => (
                  <motion.div key={i} className="flex-1 rounded-t-sm"
                    style={{ background: `${m.color}30` }}
                    animate={{ height: `${h * 10}%` }}
                    transition={{ duration: 1, delay: i * 0.05 }} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left — Gemini Chat */}
        <div className="lg:col-span-4 space-y-5">
          <div className="glass-panel flex flex-col overflow-hidden" style={{ height: '520px' }}>
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #00d4ff, #a855f7)' }}>
                  <Bot size={18} className="text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#06d6a0] border-2 border-[#030712]" />
              </div>
              <div>
                <p className="font-headline font-bold text-sm text-white">Gemini Traffic AI</p>
                <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: apiLoading ? '#fbbf24' : '#06d6a0' }}>
              {apiLoading ? 'Querying Gemini…' : `Online · ${lastRefresh ? 'Live API' : 'Ready'}`}
            </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed"
                    style={msg.role === 'user' ? {
                      background: 'linear-gradient(135deg, #00d4ff, #a855f7)',
                      color: 'white',
                    } : {
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#cbd5e1',
                    }}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-2xl flex gap-1 items-center"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="text-[9px] text-slate-500 font-mono mr-1">Gemini thinking</span>
                    {[0, 0.2, 0.4].map((d, i) => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#a855f7]"
                        animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 0.9, delay: d }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask Gemini to optimize traffic..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4ff]/50 transition-colors"
                />
                <button onClick={handleSend}
                  className="p-2.5 rounded-xl transition-all active:scale-95"
                  style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
                  <Send size={15} className="text-[#00d4ff]" />
                </button>
              </div>
            </div>
          </div>

          {/* AI Performance */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Cpu size={14} className="text-[#00d4ff]" />
              <h3 className="font-headline font-bold text-sm text-white">Model Performance</h3>
            </div>
            <div className="space-y-3">
              {[['Detection Accuracy', 94], ['Prediction Rate', 89], ['Signal Optimization', 96], ['Emergency Response', 99]].map(([label, val]) => (
                <div key={label as string}>
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-white font-bold">{val}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #00d4ff, #a855f7)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${val}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Insights + Activity */}
        <div className="lg:col-span-8 space-y-6">
          {/* Featured insight */}
          <div className="glass-panel p-5 relative overflow-hidden" style={{ borderLeft: '3px solid #00d4ff' }}>
            <div className="absolute top-4 right-4">
              <motion.div className="w-3 h-3 rounded-full bg-[#00d4ff]"
                animate={{ boxShadow: ['0 0 5px #00d4ff', '0 0 20px #00d4ff', '0 0 5px #00d4ff'] }}
                transition={{ duration: 2, repeat: Infinity }} />
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl flex-shrink-0" style={{ background: 'rgba(0,212,255,0.1)' }}>
                <Zap size={22} className="text-[#00d4ff]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="medium-badge">Active Optimization</span>
                  <span className="text-[10px] text-slate-500 font-mono">Confidence: 98%</span>
                </div>
                <h3 className="font-headline font-bold text-white text-lg mb-2">Smart Signal Override: North Corridor</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Heavy congestion detected in North approach. AI has automatically increased green duration by 20s.
                  Estimated throughput increase: <span className="text-[#06d6a0] font-bold">+140 vehicles/hour</span>.
                </p>
                <div className="flex gap-3">
                  <button className="btn-primary text-[10px] py-2 px-4">View Analytics</button>
                  <button className="btn-secondary text-[10px] py-2 px-4">Manual Override</button>
                </div>
              </div>
            </div>
          </div>

          {/* Insight cards grid */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-headline font-bold text-white text-sm">Live Gemini Recommendations</h3>
            {apiLoading && <RefreshCw size={12} className="text-[#a855f7] animate-spin" />}
            {lastRefresh && <span className="text-[9px] text-slate-500 font-mono ml-auto">Updated {lastRefresh.toLocaleTimeString()}</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allInsights.map((insight) => (
              <motion.div key={insight.id} whileHover={{ y: -3 }} className="glass-card p-4"
                style={{ borderLeft: `3px solid ${insight.type === 'alert' ? '#ef4444' : insight.type === 'prediction' ? '#fbbf24' : '#00d4ff'}` }}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg flex-shrink-0"
                    style={{ background: insight.type === 'alert' ? 'rgba(239,68,68,0.1)' : insight.type === 'prediction' ? 'rgba(251,191,36,0.1)' : 'rgba(0,212,255,0.1)' }}>
                    {insight.type === 'alert' ? <Zap size={14} className="text-red-400" /> :
                     insight.type === 'prediction' ? <TrendingUp size={14} className="text-yellow-400" /> :
                     <Target size={14} className="text-[#00d4ff]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-black uppercase tracking-wider ${
                        insight.type === 'alert' ? 'critical-badge' : insight.type === 'prediction' ? 'high-badge' : 'medium-badge'
                      }`}>{insight.type}</span>
                      <span className="text-[9px] text-slate-500 font-mono ml-auto">
                        {insight.confidence > 1 ? insight.confidence.toFixed(0) : Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white mb-1 line-clamp-1">{insight.title}</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">{insight.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Activity stream */}
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(0,212,255,0.1)' }}>
                <Activity size={14} className="text-[#00d4ff]" />
              </div>
              <h3 className="font-headline font-bold text-white">AI Activity Stream</h3>
              <span className="ml-auto live-badge"><span className="w-1.5 h-1.5 rounded-full bg-[#06d6a0] animate-pulse" />Live</span>
            </div>
            <div className="space-y-0 relative">
              <div className="absolute left-2.5 top-0 bottom-0 w-px bg-white/5" />
              {ACTIVITY_STREAM.map((item, i) => (
                <div key={i} className="relative pl-8 py-3 group">
                  <div className="absolute left-0 top-3.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: `${item.color}15`, border: `1px solid ${item.color}40` }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[9px] text-slate-500 font-mono">{item.time}</span>
                        <span className="text-xs font-bold" style={{ color: item.color }}>{item.event}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{item.junction} · {item.details}</p>
                    </div>
                    <GitBranch size={12} className="text-slate-600 mt-1 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all btn-secondary">
              View Extended Logs
            </button>
          </div>

          {/* Prediction chart */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={14} className="text-[#a855f7]" />
              <h3 className="font-headline font-bold text-sm text-white">24h Prediction Confidence</h3>
            </div>
            <div className="h-20 flex items-end gap-1">
              {[65, 72, 58, 81, 90, 85, 78, 92, 88, 95, 87, 79].map((v, i) => (
                <motion.div key={i} className="flex-1 rounded-t-sm"
                  style={{ background: v > 85 ? 'rgba(6,214,160,0.6)' : v > 70 ? 'rgba(0,212,255,0.4)' : 'rgba(168,85,247,0.4)' }}
                  initial={{ height: 0 }}
                  animate={{ height: `${v}%` }}
                  transition={{ duration: 0.6, delay: i * 0.04 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIInsights;
