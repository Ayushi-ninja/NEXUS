import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CloudRain,
  AlertTriangle, CheckCircle, Brain, TrendingDown, Clock, Activity
} from 'lucide-react';
import { useWeatherData, useAIInsights } from '../hooks/useRealtimeData';

const WEATHER_ICONS: Record<string, { icon: string; color: string; label: string }> = {
  clear:  { icon: '☀️', color: '#fbbf24', label: 'Clear' },
  rain:   { icon: '🌧️', color: '#60a5fa', label: 'Rain' },
  fog:    { icon: '🌫️', color: '#94a3b8', label: 'Fog' },
  storm:  { icon: '⛈️', color: '#a855f7', label: 'Storm' },
};

const HOURLY_FORECAST = [
  { time: 'Now',   icon: '🌧️', temp: 24, rain: 80, wind: 18, condition: 'rain' },
  { time: '14:00', icon: '🌧️', temp: 23, rain: 75, wind: 20, condition: 'rain' },
  { time: '15:00', icon: '🌦️', temp: 24, rain: 45, wind: 15, condition: 'rain' },
  { time: '16:00', icon: '⛅', temp: 25, rain: 20, wind: 12, condition: 'clear' },
  { time: '17:00', icon: '☀️', temp: 27, rain: 5,  wind: 10, condition: 'clear' },
  { time: '18:00', icon: '☀️', temp: 28, rain: 5,  wind: 9,  condition: 'clear' },
];

const FIVE_DAY = [
  { day: 'Today', icon: '🌧️', high: 28, low: 22, condition: 'rain' },
  { day: 'Mon',   icon: '⛅', high: 30, low: 24, condition: 'clear' },
  { day: 'Tue',   icon: '☀️', high: 33, low: 26, condition: 'clear' },
  { day: 'Wed',   icon: '🌫️', high: 29, low: 23, condition: 'fog' },
  { day: 'Thu',   icon: '🌧️', high: 26, low: 21, condition: 'rain' },
];

const ADAPTED_SIGNALS = [
  { junction: 'J-01 North Main', original: 45, adapted: 58, reason: 'Rain — extended cycle', severity: 'moderate' },
  { junction: 'J-02 East Cross', original: 40, adapted: 52, reason: 'Reduced visibility', severity: 'moderate' },
  { junction: 'J-03 Broadway',   original: 50, adapted: 50, reason: 'No adaptation needed', severity: 'none' },
  { junction: 'J-04 West Blvd',  original: 42, adapted: 60, reason: 'Heavy rain zone',     severity: 'high' },
  { junction: 'J-05 South Gate', original: 38, adapted: 55, reason: 'Fog detection active', severity: 'moderate' },
  { junction: 'J-06 Central',    original: 48, adapted: 48, reason: 'Clear conditions',     severity: 'none' },
];

const Weather = () => {
  const { weather } = useWeatherData();
  const aiInsights = useAIInsights();
  const [activeHour, setActiveHour] = useState(0);

  const weatherMeta = WEATHER_ICONS[weather.condition] ?? WEATHER_ICONS.clear;
  const trafficImpact = weather.condition === 'storm' ? 'Critical' :
                        weather.condition === 'fog'   ? 'High' :
                        weather.condition === 'rain'  ? 'Moderate' : 'Minimal';
  const impactColor  = weather.condition === 'storm' ? '#ef4444' :
                       weather.condition === 'fog'   ? '#fbbf24' :
                       weather.condition === 'rain'  ? '#60a5fa' : '#06d6a0';

  const weatherInsights = aiInsights.filter((_, i) => i < 4);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg" style={{ background: 'rgba(96,165,250,0.12)' }}>
              <CloudRain size={13} className="text-blue-400" />
            </div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono">Weather Intelligence</span>
          </div>
          <h1 className="font-headline text-3xl font-bold text-white">
            Weather <span className="gradient-text">Adaptation System</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">AI-driven traffic adaptation based on real-time meteorological data</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl stat-card">
            <span className="text-2xl">{weatherMeta.icon}</span>
            <div>
              <p className="text-sm font-bold text-white">{weatherMeta.label}</p>
              <p className="text-[10px] text-slate-500 font-mono">{weather.temperature_c}°C</p>
            </div>
          </div>
          {(weather.condition === 'fog' || weather.condition === 'rain' || weather.condition === 'storm') && (
            <motion.div
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444' }}
            >
              <AlertTriangle size={13} />
              Weather Alert Active
            </motion.div>
          )}
        </div>
      </div>

      {/* Alert Banner (conditional) */}
      {weather.condition === 'fog' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-4 p-4 rounded-xl"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.35)' }}
        >
          <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-yellow-300">⚠️ Low Visibility Alert — Fog Conditions Detected</p>
            <p className="text-xs text-slate-400 mt-1">Visibility below 2km across 4 junctions. Signal cycles extended by up to 40% and yellow phase increased to 6s. Speed recommendations broadcast via VSL.</p>
          </div>
          <span className="text-[9px] font-black px-2 py-1 rounded font-mono text-yellow-400"
            style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>ACTIVE</span>
        </motion.div>
      )}

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Current Condition',
            value: weatherMeta.label,
            sub: `${weather.temperature_c}°C · ${weather.humidity_percent}% humidity`,
            icon: weatherMeta.icon,
            color: weatherMeta.color,
            bg: `${weatherMeta.color}12`,
          },
          {
            label: 'Visibility',
            value: `${weather.visibility_km} km`,
            sub: weather.visibility_km < 3 ? 'Critical — reduced speed' : weather.visibility_km < 6 ? 'Moderate — caution' : 'Good conditions',
            icon: '👁️',
            color: weather.visibility_km < 3 ? '#ef4444' : weather.visibility_km < 6 ? '#fbbf24' : '#06d6a0',
            bg: weather.visibility_km < 3 ? 'rgba(239,68,68,0.08)' : 'rgba(6,214,160,0.08)',
          },
          {
            label: 'Precipitation',
            value: `${weather.precipitation_mm} mm/h`,
            sub: `Wind: ${weather.wind_speed_kmh} km/h`,
            icon: '💧',
            color: '#60a5fa',
            bg: 'rgba(96,165,250,0.08)',
          },
          {
            label: 'Traffic Impact',
            value: trafficImpact,
            sub: 'AI-assessed severity',
            icon: weather.condition === 'clear' ? '✅' : '⚡',
            color: impactColor,
            bg: `${impactColor}12`,
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -3 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-slate-500 font-label uppercase tracking-widest">{kpi.label}</p>
              <span className="text-xl">{kpi.icon}</span>
            </div>
            <p className="text-2xl font-headline font-black text-white mb-1"
              style={{ color: kpi.color, textShadow: `0 0 20px ${kpi.color}30` }}>
              {kpi.value}
            </p>
            <p className="text-[10px] text-slate-500 font-mono">{kpi.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left — Hourly Forecast + 5-Day */}
        <div className="lg:col-span-4 space-y-5">

          {/* Hourly forecast */}
          <div className="glass-panel p-5 relative overflow-hidden">
            <div className="shimmer-line" />
            <div className="section-header">
              <div className="section-header-icon" style={{ background: 'rgba(96,165,250,0.1)' }}>
                <Clock size={14} className="text-blue-400" />
              </div>
              <h2 className="font-headline font-bold text-white text-sm">Hourly Forecast</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {HOURLY_FORECAST.map((h, i) => (
                <button
                  key={i}
                  onClick={() => setActiveHour(i)}
                  className={`forecast-card ${activeHour === i ? 'active' : ''}`}
                >
                  <span className="text-[10px] font-mono text-slate-400">{h.time}</span>
                  <span className="text-xl">{h.icon}</span>
                  <span className="text-sm font-bold text-white">{h.temp}°</span>
                  <span className="text-[9px] text-blue-400 font-mono">{h.rain}%</span>
                </button>
              ))}
            </div>

            {/* Selected hour detail */}
            <div className="mt-4 p-3 rounded-xl space-y-2"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Rain probability</span>
                <span className="text-blue-400 font-bold">{HOURLY_FORECAST[activeHour].rain}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5">
                <motion.div className="h-full rounded-full bg-blue-400"
                  animate={{ width: `${HOURLY_FORECAST[activeHour].rain}%` }}
                  transition={{ duration: 0.5 }} />
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Wind speed</span>
                <span className="text-slate-300 font-bold">{HOURLY_FORECAST[activeHour].wind} km/h</span>
              </div>
            </div>
          </div>

          {/* 5-Day Forecast */}
          <div className="glass-panel p-5">
            <div className="section-header">
              <div className="section-header-icon" style={{ background: 'rgba(0,212,255,0.1)' }}>
                <Activity size={14} className="text-[#00d4ff]" />
              </div>
              <h2 className="font-headline font-bold text-white text-sm">5-Day Outlook</h2>
            </div>
            <div className="space-y-2">
              {FIVE_DAY.map((d, i) => (
                <div key={i} className="data-row">
                  <span className="text-xs font-bold text-slate-300 w-12">{d.day}</span>
                  <span className="text-lg">{d.icon}</span>
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-xs font-mono text-white font-bold">{d.high}°</span>
                    <span className="text-[10px] text-slate-500 font-mono">/ {d.low}°</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded ml-2"
                    style={{
                      background: WEATHER_ICONS[d.condition]?.color + '15',
                      color: WEATHER_ICONS[d.condition]?.color,
                      border: `1px solid ${WEATHER_ICONS[d.condition]?.color}30`,
                    }}>
                    {WEATHER_ICONS[d.condition]?.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Adapted Signal Table + AI Recs */}
        <div className="lg:col-span-8 space-y-5">

          {/* Weather-Adapted Signals Table */}
          <div className="glass-panel p-5 relative overflow-hidden">
            <div className="shimmer-line" />
            <div className="flex items-center justify-between mb-5">
              <div className="section-header mb-0">
                <div className="section-header-icon" style={{ background: 'rgba(168,85,247,0.1)' }}>
                  <TrendingDown size={14} className="text-[#a855f7]" />
                </div>
                <h2 className="font-headline font-bold text-white">Weather-Adapted Signals</h2>
              </div>
              <span className="live-badge">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06d6a0] animate-pulse" />
                Auto-adapting
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Junction', 'Original Cycle', 'Adapted Cycle', 'Delta', 'Reason', 'Status'].map(h => (
                      <th key={h} className="pb-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="space-y-1">
                  {ADAPTED_SIGNALS.map((row, i) => {
                    const delta = row.adapted - row.original;
                    return (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-white/3 hover:bg-white/2 transition-colors"
                      >
                        <td className="py-3 pr-4 font-bold text-slate-200">{row.junction}</td>
                        <td className="py-3 pr-4 font-mono text-slate-400">{row.original}s</td>
                        <td className="py-3 pr-4">
                          <span className="font-mono font-bold text-white">{row.adapted}s</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="font-mono font-bold text-sm"
                            style={{ color: delta > 0 ? '#fbbf24' : '#06d6a0' }}>
                            {delta > 0 ? `+${delta}s` : `${delta}s`}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-slate-400 text-[10px]">{row.reason}</td>
                        <td className="py-3">
                          {row.severity === 'none' ? (
                            <span className="flex items-center gap-1 text-[#06d6a0]">
                              <CheckCircle size={11} /> Normal
                            </span>
                          ) : (
                            <span className="font-bold text-[10px] px-2 py-0.5 rounded uppercase"
                              style={{
                                color: row.severity === 'high' ? '#ef4444' : '#fbbf24',
                                background: row.severity === 'high' ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)',
                                border: `1px solid ${row.severity === 'high' ? 'rgba(239,68,68,0.3)' : 'rgba(251,191,36,0.3)'}`,
                              }}>
                              {row.severity}
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Weather Recommendations */}
          <div className="glass-panel p-5" style={{ borderTop: '3px solid #a855f7' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(168,85,247,0.1)' }}>
                <Brain size={16} className="text-[#a855f7]" />
              </div>
              <h2 className="font-headline font-bold text-white">AI Weather Recommendations</h2>
              <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse ml-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {weatherInsights.map((ins, i) => (
                <motion.div
                  key={ins.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -2 }}
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(168,85,247,0.05)',
                    border: '1px solid rgba(168,85,247,0.15)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-black uppercase ${
                      ins.type === 'alert' ? 'critical-badge' :
                      ins.type === 'prediction' ? 'high-badge' : 'medium-badge'
                    }`}>{ins.type}</span>
                    <span className="text-[9px] font-mono text-slate-500">
                      {ins.confidence > 1 ? ins.confidence.toFixed(0) : Math.round(ins.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white mb-1 line-clamp-1">{ins.title}</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">{ins.description}</p>
                  <div className="flex gap-2 mt-3">
                    <button className="btn-primary text-[9px] py-1 px-3">Apply</button>
                    <button className="btn-secondary text-[9px] py-1 px-3">Dismiss</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Weather stats strip */}
          <div className="command-strip">
            <div className="flex items-center gap-6">
              {[
                { label: 'Temperature', value: `${weather.temperature_c}°C`, icon: '🌡️' },
                { label: 'Humidity', value: `${weather.humidity_percent}%`, icon: '💧' },
                { label: 'Wind', value: `${weather.wind_speed_kmh} km/h`, icon: '💨' },
                { label: 'Visibility', value: `${weather.visibility_km} km`, icon: '👁️' },
                { label: 'Precip.', value: `${weather.precipitation_mm} mm`, icon: '🌧️' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className="text-sm">{s.icon}</span>
                  <div>
                    <p className="text-[9px] text-slate-600 uppercase tracking-wider">{s.label}</p>
                    <p className="text-[11px] text-slate-300 font-bold font-mono">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Updated {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Weather;
