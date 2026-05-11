import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'purple' | 'green' | 'red' | 'orange';
}

const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }: StatCardProps) => {
  const colorClasses = {
    blue: 'border-neon-blue/20 bg-neon-blue/5 text-neon-blue',
    purple: 'border-neon-purple/20 bg-neon-purple/5 text-neon-purple',
    green: 'border-neon-green/20 bg-neon-green/5 text-neon-green',
    red: 'border-red-500/20 bg-red-500/5 text-red-500',
    orange: 'border-neon-orange/20 bg-neon-orange/5 text-neon-orange',
  };

  const glowClasses = {
    blue: 'shadow-neon-blue/20',
    purple: 'shadow-neon-purple/20',
    green: 'shadow-neon-green/20',
    red: 'shadow-red-500/20',
    orange: 'shadow-neon-orange/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`glass-panel p-5 relative overflow-hidden group ${glowClasses[color]}`}
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${colorClasses[color].split(' ')[1]}`} />
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-xl border ${colorClasses[color]}`}>
            <Icon size={20} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              trend.isPositive ? 'bg-neon-green/10 text-neon-green border-neon-green/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
            }`}>
              {trend.isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</h3>
          <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        </div>
      </div>

      {/* Decorative scanline */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.02] to-transparent h-[1px] top-0 animate-scanline" />
    </motion.div>
  );
};

export default StatCard;
