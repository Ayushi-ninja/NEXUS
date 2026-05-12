import { motion } from 'framer-motion';
import { Car, TrendingUp, TrendingDown } from 'lucide-react';

interface TrafficDensityCardProps {
  junctionName: string;
  currentDensity: number;
  capacity: number;
  trend: 'up' | 'down' | 'stable';
}

const TrafficDensityCard = ({ junctionName, currentDensity, capacity, trend }: TrafficDensityCardProps) => {
  const percentage = Math.min(100, (currentDensity / capacity) * 100);
  
  const getStatusColor = () => {
    if (percentage < 50) return 'from-green-500 to-emerald-500';
    if (percentage < 75) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-red-400" />;
      case 'down':
        return <TrendingDown size={16} className="text-green-400" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="glass-card p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Car size={20} className="text-neon-blue" />
            <h3 className="text-lg font-semibold">{junctionName}</h3>
          </div>
          {getTrendIcon()}
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Density</span>
            <span className="font-semibold">{currentDensity}/{capacity}</span>
          </div>
          
          <div className="h-3 bg-dark-card rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${getStatusColor()} rounded-full`}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${percentage < 50 ? 'text-green-400' : percentage < 75 ? 'text-yellow-400' : 'text-red-400'}`}>
            {percentage < 50 ? 'Low Traffic' : percentage < 75 ? 'Moderate' : 'High Traffic'}
          </span>
          <span className="text-2xl font-bold gradient-text">{Math.round(percentage)}%</span>
        </div>
      </div>
    </motion.div>
  );
};

export default TrafficDensityCard;
