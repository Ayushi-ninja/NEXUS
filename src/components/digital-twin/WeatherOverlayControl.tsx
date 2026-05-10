import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudRain, CloudFog, Sun, Thermometer, Eye, Zap } from 'lucide-react';
import { WeatherType } from '../../hooks/useSimulationEngine';

interface Props {
  weather: WeatherType;
  setWeather: (w: WeatherType) => void;
}

const WeatherOverlayControl = ({ weather, setWeather }: Props) => {
  const weatherData = useMemo(() => {
    switch (weather) {
      case 'rain':
        return {
          temp: '18°C',
          visibility: '3 km',
          status: 'Heavy Rain',
          icon: CloudRain,
          color: 'text-blue-400',
          bgGlow: 'shadow-[0_0_20px_rgba(96,165,250,0.2)]',
          recommendation: 'Rain detected: Increasing green signal duration by 10 seconds and reducing baseline speed limits by 30%.'
        };
      case 'fog':
        return {
          temp: '12°C',
          visibility: '0.5 km',
          status: 'Dense Fog',
          icon: CloudFog,
          color: 'text-gray-300',
          bgGlow: 'shadow-[0_0_20px_rgba(156,163,175,0.2)]',
          recommendation: 'Low visibility detected: Reducing signal transition speed and activating junction warning beacons.'
        };
      case 'clear':
      default:
        return {
          temp: '24°C',
          visibility: '10+ km',
          status: 'Clear Skies',
          icon: Sun,
          color: 'text-amber-400',
          bgGlow: 'shadow-[0_0_20px_rgba(251,191,36,0.15)]',
          recommendation: 'Optimal conditions detected. Standard AI signal timing algorithms are active.'
        };
    }
  }, [weather]);

  const Icon = weatherData.icon;

  return (
    <div className={`glass-card p-5 relative overflow-hidden transition-all duration-500 ${weatherData.bgGlow}`}>
      {/* Dynamic Background Effects */}
      <AnimatePresence>
        {weather === 'rain' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-0 pointer-events-none"
            style={{ 
              backgroundImage: 'linear-gradient(180deg, transparent, rgba(96,165,250,0.5))',
              backgroundSize: '100% 200%',
            }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`rain-${i}`}
                className="absolute w-0.5 h-4 bg-blue-300 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-${Math.random() * 20}%`,
                }}
                animate={{
                  y: [0, 200],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 0.8 + Math.random() * 0.5,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: Math.random() * 2
                }}
              />
            ))}
          </motion.div>
        )}
        
        {weather === 'fog' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            <motion.div
              className="w-[200%] h-full bg-gradient-to-r from-transparent via-gray-400 to-transparent blur-2xl"
              animate={{ x: ['-50%', '0%'] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear', repeatType: 'reverse' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cloud size={16} className="text-neon-blue" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Environmental Context</h3>
          </div>
          <div className="flex bg-[#080c1a] border border-dark-border rounded-lg p-1">
            {(['clear', 'rain', 'fog'] as WeatherType[]).map((w) => (
              <button
                key={w}
                onClick={() => setWeather(w)}
                className={`px-3 py-1 rounded text-xs font-medium capitalize transition-all ${
                  weather === w 
                    ? 'bg-neon-blue/20 text-neon-blue' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Current State */}
        <div className="flex items-center gap-4 mb-5">
          <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${weatherData.color}`}>
            <Icon size={32} />
          </div>
          <div>
            <h4 className={`text-xl font-bold ${weatherData.color}`}>{weatherData.status}</h4>
            <div className="flex gap-4 mt-1">
              <div className="flex items-center gap-1 text-gray-300 text-sm">
                <Thermometer size={14} className="text-red-400" />
                <span>{weatherData.temp}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-300 text-sm">
                <Eye size={14} className="text-neon-blue" />
                <span>{weatherData.visibility}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sensor Array */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-[#080c1a]/50 border border-dark-border rounded-lg p-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">Precipitation Sensor</span>
            <span className={`text-xs font-bold ${weather === 'rain' ? 'text-blue-400' : 'text-gray-500'}`}>
              {weather === 'rain' ? 'ACTIVE' : 'IDLE'}
            </span>
          </div>
          <div className="bg-[#080c1a]/50 border border-dark-border rounded-lg p-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">Visibility LIDAR</span>
            <span className={`text-xs font-bold ${weather === 'fog' ? 'text-amber-400' : 'text-gray-500'}`}>
              {weather === 'fog' ? 'WARN' : 'NOMINAL'}
            </span>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="bg-neon-blue/10 border border-neon-blue/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Zap size={14} className="text-neon-blue" />
            <span className="text-xs font-bold text-neon-blue tracking-wide">AI ADAPTATION TRIGGERED</span>
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">
            <AnimatePresence mode="wait">
              <motion.span
                key={weather}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="block"
              >
                {weatherData.recommendation}
              </motion.span>
            </AnimatePresence>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherOverlayControl;
