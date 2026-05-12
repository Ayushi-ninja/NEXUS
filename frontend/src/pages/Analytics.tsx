import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car } from 'lucide-react';
import {
  Clock, Activity, AlertTriangle,
  ChevronDown, MapPin, BarChart2
} from 'lucide-react';
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useAnalyticsData } from '../hooks/useRealtimeData';
import { useAnalyticsMockData, TimeRange, JunctionFilter } from '../hooks/useAnalyticsMockData';

// --- Custom Recharts Tooltip ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'rgba(3,7,18,0.95)', border: '1px solid rgba(0,212,255,0.2)', backdropFilter: 'blur(12px)' }}
        className="p-3 rounded-xl shadow-2xl">
        <p className="text-[#00d4ff] font-mono text-xs font-bold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs font-mono">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="text-white font-bold">
              {typeof entry.value === 'number' && !Number.isInteger(entry.value)
                ? entry.value.toFixed(1)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- Main Component ---
const Analytics = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');
  const [junction, setJunction] = useState<JunctionFilter>('all');
  const [showJunctionDropdown, setShowJunctionDropdown] = useState(false);

  // Fetch real backend data
  const { forecast, predictions } = useAnalyticsData();

  // Use mock data for charts that don't have backend endpoints yet
  const {
    liveKpis,
    waitTimeData,
    emergencyData,
    vehicleTypeData,
    weatherImpactData,
    optimizationData,
    heatmapData
  } = useAnalyticsMockData(timeRange, junction);

  // Transform backend forecast to chart format
  const trafficDensityData = forecast?.forecast?.map((f: any) => ({
    hour: f.label,
    density: f.predicted_density,
    isPeak: f.is_peak,
  })) || [];

  // Transform backend predictions to chart format
  const predictionData = predictions?.map((p: any) => ({
    direction: p.direction,
    predicted: p.predicted_density_percent,
    confidence: p.confidence * 100,
  })) || [];

  const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#22c55e', '#ef4444'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 pb-12"
    >
      {/* --- SVG Definitions for Gradients and Glows --- */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorPredActual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
          </linearGradient>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* --- Header & Controls --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg" style={{ background: 'rgba(0,212,255,0.1)' }}>
              <BarChart2 size={13} className="text-[#00d4ff]" />
            </div>
            <span className="text-[10px] font-bold text-[#00d4ff] uppercase tracking-widest font-mono">Intelligence Dashboard</span>
          </div>
          <h1 className="font-headline text-3xl font-bold text-white">Analytics <span className="gradient-text">&amp; Intelligence</span></h1>
          <p className="text-slate-400 text-sm mt-1">Deep insights into AI Junction performance</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {(['1H', '24H', '7D', '30D'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold font-mono transition-all"
                style={timeRange === range ? {
                  background: 'rgba(0,212,255,0.12)',
                  color: '#00d4ff',
                  boxShadow: '0 0 10px rgba(0,212,255,0.2)'
                } : { color: '#64748b' }}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Junction Filter */}
          <div className="relative">
            <button
              onClick={() => setShowJunctionDropdown(!showJunctionDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)', color: '#a855f7' }}
            >
              <MapPin size={13} />
              {junction === 'all' ? 'All Junctions' : junction.toUpperCase()}
              <ChevronDown size={12} />
            </button>
            
            <AnimatePresence>
              {showJunctionDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 glass-card rounded-xl p-1 z-50"
                  style={{ border: '1px solid rgba(168,85,247,0.3)' }}
                >
                  {['all', 'j1', 'j2', 'j3', 'j4'].map((j) => (
                    <button
                      key={j}
                      onClick={() => { setJunction(j as JunctionFilter); setShowJunctionDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-mono text-slate-400 hover:text-white rounded-lg transition-colors"
                      style={{ background: 'transparent' }}
                    >
                      {j === 'all' ? 'All Junctions' : `Junction ${j.toUpperCase()}`}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* --- Top KPIs --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Vehicles', value: liveKpis.activeVehicles.toLocaleString(), badge: '+2.4%', icon: Car, color: '#00d4ff', bg: 'rgba(0,212,255,0.08)' },
          { label: 'Avg Wait Time', value: `${liveKpis.avgWaitTime}s`, badge: '-12%', icon: Clock, color: '#ec4899', bg: 'rgba(236,72,153,0.08)' },
          { label: 'Optimization Eff.', value: `${liveKpis.efficiency}%`, badge: '+5%', icon: Activity, color: '#06d6a0', bg: 'rgba(6,214,160,0.08)' },
          { label: 'Emergency Resp.', value: String(liveKpis.emergencyIncidents), badge: 'today', icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} layout className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-slate-500 font-label uppercase tracking-widest">{kpi.label}</p>
                <div className="p-1.5 rounded-lg" style={{ background: kpi.bg }}>
                  <Icon size={14} style={{ color: kpi.color }} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-headline font-black text-white">{kpi.value}</span>
                <span className="text-[10px] font-bold" style={{ color: '#06d6a0' }}>{kpi.badge}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* --- Main Charts Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Traffic Density Trends */}
        <div className="glass-panel p-5 flex flex-col min-h-[380px]">
          <h2 className="font-headline font-bold text-white mb-1">Traffic Density Trends</h2>
          <p className="text-[11px] text-slate-500 mb-5">Actual vehicle density vs maximum road capacity</p>
          <div className="flex-1 w-full h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficDensityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="time" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                <Area 
                  type="monotone" dataKey="density" name="Density"
                  stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorDensity)" 
                  filter="url(#neonGlow)" isAnimationActive={true}
                />
                <Area 
                  type="step" dataKey="capacity" name="Capacity Limit"
                  stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" fill="none"
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Congestion Prediction */}
        <div className="glass-panel p-5 flex flex-col min-h-[380px]">
          <h2 className="font-headline font-bold text-white mb-1">AI Congestion Prediction</h2>
          <p className="text-[11px] text-slate-500 mb-5">Historical data and AI-forecasted congestion levels</p>
          <div className="flex-1 w-full h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={predictionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="time" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                <Area 
                  type="monotone" dataKey="actual" name="Actual Congestion"
                  stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorPredActual)"
                  filter="url(#neonGlow)" isAnimationActive={true}
                />
                <Line 
                  type="monotone" dataKey="predicted" name="AI Prediction"
                  stroke="#f472b6" strokeWidth={2} strokeDasharray="5 5" dot={false}
                  filter="url(#neonGlow)" isAnimationActive={true}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Average Wait Time */}
        <div className="glass-panel p-5 flex flex-col min-h-[350px]">
          <h2 className="font-headline font-bold text-white mb-5">Average Wait Times</h2>
          <div className="flex-1 w-full h-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waitTimeData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="junction" type="category" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1f2937', opacity: 0.4 }} />
                <Bar dataKey="wait" name="Wait Time (s)" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={true}>
                  {waitTimeData.map((_entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Type Distribution */}
        <div className="glass-panel p-5 flex flex-col min-h-[350px]">
          <h2 className="font-headline font-bold text-white mb-2">Vehicle Distribution</h2>
          <div className="flex-1 w-full h-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleTypeData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  paddingAngle={5} dataKey="value"
                  isAnimationActive={true}
                >
                  {vehicleTypeData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weather Impact */}
        <div className="glass-panel p-5 flex flex-col min-h-[350px]">
          <h2 className="font-headline font-bold text-white mb-2">Weather Impact (Index)</h2>
          <div className="flex-1 w-full h-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={weatherImpactData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 200]} tick={false} axisLine={false} />
                <Radar name="Clear" dataKey="clear" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                <Radar name="Rain" dataKey="rain" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />
                <Radar name="Fog" dataKey="fog" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Signal Optimization Efficiency */}
        <div className="glass-panel p-5 flex flex-col min-h-[380px]">
          <h2 className="font-headline font-bold text-white mb-1">Signal Optimization Efficiency</h2>
          <p className="text-[11px] text-slate-500 mb-5">AI-driven efficiency gains vs fixed-time baseline</p>
          <div className="flex-1 w-full h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={optimizationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="time" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#6b7280" domain={[40, 100]} tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                <Area 
                  type="monotone" dataKey="efficiency" name="AI Efficiency (%)"
                  stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorEfficiency)"
                  filter="url(#neonGlow)" isAnimationActive={true}
                />
                <Line 
                  type="monotone" dataKey="baseline" name="Fixed Baseline (%)"
                  stroke="#6b7280" strokeWidth={2} strokeDasharray="4 4" dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emergency Response */}
        <div className="glass-panel p-5 flex flex-col min-h-[380px]">
          <h2 className="font-headline font-bold text-white mb-1">Emergency Response Times</h2>
          <p className="text-[11px] text-slate-500 mb-5">Ambulance routing delay (minutes) vs target</p>
          <div className="flex-1 w-full h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={emergencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="day" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                <Line 
                  type="monotone" dataKey="responseTime" name="Actual Response (m)"
                  stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#0f172a' }}
                  filter="url(#neonGlow)" isAnimationActive={true}
                />
                <Line 
                  type="step" dataKey="targetTime" name="Target (5m)"
                  stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Heatmap Card */}
      <div className="glass-panel p-5 overflow-hidden">
        <h2 className="font-headline font-bold text-white mb-1">Congestion Heatmap</h2>
        <p className="text-[11px] text-slate-500 mb-5">Traffic intensity across junctions over time</p>
        
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header Row */}
            <div className="flex mb-2">
              <div className="w-24 shrink-0"></div>
              {heatmapData.hours.map(h => (
                <div key={h} className="flex-1 text-center text-xs text-gray-400 font-medium">{h}</div>
              ))}
            </div>
            
            {/* Grid Rows */}
            <div className="space-y-2">
              {heatmapData.junctions.map(j => (
                <div key={j} className="flex items-center">
                  <div className="w-24 shrink-0 text-sm font-medium text-gray-300 truncate pr-2">{j}</div>
                  {heatmapData.hours.map(h => {
                    const dataPoint = heatmapData.data.find(d => d.junction === j && d.hour === h);
                    const intensity = dataPoint ? dataPoint.intensity : 0;
                    
                    // Map intensity 0-100 to color
                    let bgColor = 'bg-green-500/20';
                    let borderColor = 'border-green-500/30';
                    if (intensity > 70) {
                      bgColor = 'bg-red-500/40';
                      borderColor = 'border-red-500/50';
                    } else if (intensity > 40) {
                      bgColor = 'bg-yellow-500/40';
                      borderColor = 'border-yellow-500/50';
                    } else if (intensity > 20) {
                      bgColor = 'bg-green-500/40';
                      borderColor = 'border-green-500/50';
                    }

                    return (
                      <div key={`${j}-${h}`} className="flex-1 px-1">
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className={`h-12 rounded-md border ${bgColor} ${borderColor} flex items-center justify-center cursor-pointer transition-colors`}
                        >
                          <span className="text-xs font-bold text-white/90">{intensity}%</span>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
};


export default Analytics;
