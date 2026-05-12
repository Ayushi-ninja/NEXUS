import { motion } from 'framer-motion';
import { Brain, Sparkles, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { AIInsight } from '../services/mockDataService';

interface AIInsightCardProps {
  insight: AIInsight;
}

const AIInsightCard = ({ insight }: AIInsightCardProps) => {
  const getStyles = () => {
    switch (insight.type) {
      case 'optimization':
        return { 
          icon: <TrendingUp size={16} />, 
          color: 'text-neon-green', 
          border: 'border-neon-green/30',
          bg: 'bg-neon-green/5'
        };
      case 'alert':
        return { 
          icon: <AlertTriangle size={16} />, 
          color: 'text-neon-orange', 
          border: 'border-neon-orange/30',
          bg: 'bg-neon-orange/5'
        };
      case 'prediction':
        return { 
          icon: <Sparkles size={16} />, 
          color: 'text-neon-purple', 
          border: 'border-neon-purple/30',
          bg: 'bg-neon-purple/5'
        };
      default:
        return { 
          icon: <Brain size={16} />, 
          color: 'text-neon-blue', 
          border: 'border-neon-blue/30',
          bg: 'bg-neon-blue/5'
        };
    }
  };

  const styles = getStyles();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`glass-panel p-4 relative overflow-hidden group ${styles.border} ${styles.bg}`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center gap-2 px-2 py-0.5 rounded-full border ${styles.border} ${styles.color}`}>
            {styles.icon}
            <span className="text-[8px] font-bold uppercase tracking-widest">
              {insight.type}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/40 rounded-lg border border-white/5">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className={`w-1 h-2 rounded-full ${i <= insight.confidence * 5 ? styles.bg.replace('/5', '') : 'bg-white/10'}`} 
                />
              ))}
            </div>
            <span className="text-[10px] font-mono font-bold text-white">
              {Math.round(insight.confidence * 100)}%
            </span>
          </div>
        </div>

        <h4 className="text-sm font-bold text-white mb-2 tracking-tight group-hover:text-neon-blue transition-colors">
          {insight.title}
        </h4>
        <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">
          {insight.description}
        </p>

        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Clock size={10} />
            <span className="text-[8px] font-bold uppercase">
              {new Date(insight.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <button className={`text-[8px] font-bold uppercase tracking-widest transition-colors ${styles.color} hover:brightness-125`}>
            Execute ⚡
          </button>
        </div>
      </div>

      {/* Subtle background brain icon */}
      <div className="absolute -bottom-2 -right-2 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
        <Brain size={80} />
      </div>
    </motion.div>
  );
};

export default AIInsightCard;
