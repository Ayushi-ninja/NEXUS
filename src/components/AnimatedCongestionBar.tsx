import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AnimatedCongestionBarProps {
  value: number;
  max: number;
  label: string;
  trend?: 'up' | 'down' | 'stable';
  showPercentage?: boolean;
}

const AnimatedCongestionBar = ({ value, max, label, trend = 'stable', showPercentage = true }: AnimatedCongestionBarProps) => {
  const percentage = Math.min(100, (value / max) * 100);
  
  const getColor = () => {
    if (percentage < 40) return { bg: 'from-green-500 to-emerald-500', text: 'text-green-400', bar: 'bg-gradient-to-r from-green-500 to-emerald-500' };
    if (percentage < 70) return { bg: 'from-yellow-500 to-orange-500', text: 'text-yellow-400', bar: 'bg-gradient-to-r from-yellow-500 to-orange-500' };
    return { bg: 'from-red-500 to-rose-500', text: 'text-red-400', bar: 'bg-gradient-to-r from-red-500 to-rose-500' };
  };

  const colors = getColor();
  
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={14} className="text-red-400" />;
      case 'down':
        return <TrendingDown size={14} className="text-green-400" />;
      default:
        return <Minus size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">{label}</span>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          {showPercentage && (
            <span className={`text-sm font-semibold ${colors.text}`}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>
      
      <div className="relative h-4 bg-dark-card rounded-full overflow-hidden border border-white/10">
        {/* Animated background pattern */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
          }}
          animate={{
            backgroundPosition: ['200% 0', '-200% 0'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Progress bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full ${colors.bar} rounded-full relative`}
        >
          {/* Glowing effect */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-sm"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      </div>
      
      {/* Value display */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>0</span>
        <span>{value}/{max}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export default AnimatedCongestionBar;
