import { motion } from 'framer-motion';
import { TrafficCone, MapPin } from 'lucide-react';

interface SignalStatusCardProps {
  junctionName: string;
  signalState: 'red' | 'yellow' | 'green';
  avgWaitTime: number;
  location: string;
}

const SignalStatusCard = ({ junctionName, signalState, avgWaitTime, location }: SignalStatusCardProps) => {
  const signalConfigs = {
    red: { color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/30', glow: 'shadow-red-500/20', label: 'STOP' },
    yellow: { color: 'text-yellow-500', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', glow: 'shadow-yellow-500/20', label: 'PREPARE' },
    green: { color: 'text-neon-green', bg: 'bg-neon-green/20', border: 'border-neon-green/30', glow: 'shadow-neon-green/20', label: 'CLEAR' },
  };

  const config = signalConfigs[signalState];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`glass-panel p-5 relative overflow-hidden group border-b-2 ${config.border.replace('border-', 'border-b-')}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <h3 className="font-bold text-white tracking-tight">{junctionName}</h3>
          <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-medium uppercase tracking-wider">
            <MapPin size={10} className="text-neon-blue" />
            <span>{location}</span>
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${config.border} ${config.color}`}>
          {config.label}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1.5">
            {[ 'red', 'yellow', 'green' ].map((s) => (
              <div 
                key={s}
                className={`w-3 h-3 rounded-full border transition-all duration-500 ${
                  signalState === s 
                    ? `${signalConfigs[s as keyof typeof signalConfigs].bg} ${signalConfigs[s as keyof typeof signalConfigs].border} scale-125 ${signalConfigs[s as keyof typeof signalConfigs].glow}` 
                    : 'bg-white/5 border-white/10 opacity-30'
                }`}
              >
                {signalState === s && (
                  <motion.div 
                    layoutId="active-signal"
                    className={`w-full h-full rounded-full ${signalConfigs[s as keyof typeof signalConfigs].bg.replace('/20', '')}`}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="h-12 w-[1px] bg-white/10" />
          
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1.5">Avg Wait</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-bold text-white leading-none">{avgWaitTime}</span>
              <span className="text-xs text-gray-500 font-medium">sec</span>
            </div>
          </div>
        </div>

        <div className={`w-12 h-12 rounded-xl border ${config.border} ${config.bg} flex items-center justify-center ${config.color} transition-all duration-500 group-hover:scale-110`}>
          <TrafficCone size={24} />
        </div>
      </div>

      {/* Decorative pulse line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] overflow-hidden">
        <motion.div 
          className={`h-full w-24 bg-gradient-to-r from-transparent via-current to-transparent ${config.color}`}
          animate={{ x: ['-100%', '400%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
};

export default SignalStatusCard;
