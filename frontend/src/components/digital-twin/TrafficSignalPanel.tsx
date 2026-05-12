import { motion } from 'framer-motion';
import { TrafficSignal } from '../../hooks/useSimulationEngine';

interface Props {
  signals: TrafficSignal[];
}

const directionLabels: Record<string, string> = {
  north: '↑ North',
  south: '↓ South',
  east: '→ East',
  west: '← West',
};

const colorConfig: Record<string, { bg: string; ring: string; glow: string; text: string }> = {
  red:    { bg: 'bg-red-500',    ring: 'ring-red-500/40',    glow: 'shadow-red-500/50',    text: 'text-red-400' },
  yellow: { bg: 'bg-amber-400',  ring: 'ring-amber-400/40',  glow: 'shadow-amber-400/50',  text: 'text-amber-400' },
  green:  { bg: 'bg-emerald-400', ring: 'ring-emerald-400/40', glow: 'shadow-emerald-400/50', text: 'text-emerald-400' },
};

const TrafficSignalPanel = ({ signals }: Props) => {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Traffic Signals</h3>
      </div>

      <div className="space-y-3">
        {signals.map((signal) => {
          const cc = colorConfig[signal.color];
          const progress = (signal.timer / signal.totalDuration) * 100;

          return (
            <motion.div
              key={signal.direction}
              layout
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
            >
              {/* Direction */}
              <span className="text-xs text-gray-400 w-16 font-medium">
                {directionLabels[signal.direction]}
              </span>

              {/* Signal indicator */}
              <div className="flex items-center gap-1.5">
                {(['red', 'yellow', 'green'] as const).map((c) => (
                  <div
                    key={c}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                      signal.color === c
                        ? `${colorConfig[c].bg} ring-2 ${colorConfig[c].ring} shadow-lg ${colorConfig[c].glow}`
                        : 'bg-gray-700/50'
                    }`}
                  />
                ))}
              </div>

              {/* Timer bar */}
              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${cc.bg}`}
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>

              {/* Timer text */}
              <span className={`text-xs font-mono font-bold w-8 text-right ${cc.text}`}>
                {signal.timer}s
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Signal cycle info */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500">
        <span>Cycle: Green 20s → Yellow 4s → Red 24s</span>
        <span className="text-neon-blue">AI Optimized</span>
      </div>
    </div>
  );
};

export default TrafficSignalPanel;
