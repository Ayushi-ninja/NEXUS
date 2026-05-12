import { motion } from 'framer-motion';
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer } from 'lucide-react';

interface WeatherStatusCardProps {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy';
  location?: string;
}

const WeatherStatusCard = ({ temperature, humidity, windSpeed, condition, location = 'Downtown' }: WeatherStatusCardProps) => {
  const getConditionIcon = () => {
    switch (condition) {
      case 'sunny':
        return <Sun size={48} className="text-yellow-400" />;
      case 'cloudy':
        return <Cloud size={48} className="text-gray-400" />;
      case 'rainy':
        return <CloudRain size={48} className="text-blue-400" />;
    }
  };

  const getConditionText = () => {
    switch (condition) {
      case 'sunny':
        return 'Sunny';
      case 'cloudy':
        return 'Cloudy';
      case 'rainy':
        return 'Rainy';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="glass-card p-6 relative overflow-hidden"
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
            'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
            'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
          ],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm text-gray-400">{location}</h3>
            <p className="text-xs text-gray-500">Weather Conditions</p>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            {getConditionIcon()}
          </motion.div>
        </div>

        {/* Temperature */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Thermometer size={16} className="text-neon-blue" />
            <span className="text-4xl font-bold gradient-text">{temperature}°C</span>
          </div>
          <p className="text-sm text-gray-400 mt-1">{getConditionText()}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Droplets size={14} className="text-blue-400" />
              <span className="text-xs text-gray-400">Humidity</span>
            </div>
            <p className="text-lg font-semibold text-white">{humidity}%</p>
          </div>

          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Wind size={14} className="text-cyan-400" />
              <span className="text-xs text-gray-400">Wind</span>
            </div>
            <p className="text-lg font-semibold text-white">{windSpeed} km/h</p>
          </div>
        </div>

        {/* Traffic Impact */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-400 mb-2">Traffic Impact</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              condition === 'rainy' ? 'bg-red-400 animate-pulse' : 
              condition === 'cloudy' ? 'bg-yellow-400' : 'bg-green-400'
            }`} />
            <span className="text-sm text-gray-300">
              {condition === 'rainy' ? 'High Impact - Slower speeds' : 
               condition === 'cloudy' ? 'Moderate Impact' : 'Low Impact - Normal flow'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherStatusCard;
