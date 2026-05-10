import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { TrafficSignal } from '../../hooks/useSimulationEngine';

interface Props {
  simulationTime: number;
  signals: TrafficSignal[];
}

const SimulationTimeline = ({ simulationTime, signals }: Props) => {
  const minutes = Math.floor(simulationTime / 60);
  const seconds = simulationTime % 60;
  const totalCycles = Math.floor(simulationTime / 48); // green(20)+yellow(4)+red(24) = 48s cycle

  return (
    <div className="glass-card px-5 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Clock */}
        <div className="flex items-center gap-3">
          <Clock size={16} className="text-neon-blue" />
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Elapsed</span>
            <p className="text-lg font-mono font-bold text-white">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </p>
          </div>
        </div>

        {/* Center: Signal cycle visualization */}
        <div className="hidden md:flex items-center gap-1">
          {signals.map((signal) => {
            const colors: Record<string, string> = {
              red: 'bg-red-500',
              yellow: 'bg-amber-400',
              green: 'bg-emerald-400',
            };
            return (
              <div key={signal.direction} className="flex flex-col items-center gap-1">
                <span className="text-[8px] text-gray-600 uppercase">{signal.direction[0]}</span>
                <motion.div
                  className={`w-6 h-1.5 rounded-full ${colors[signal.color]}`}
                  animate={{
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Right: Cycle counter */}
        <div className="text-right">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Cycles</span>
          <p className="text-lg font-mono font-bold gradient-text">{totalCycles}</p>
        </div>
      </div>
    </div>
  );
};

export default SimulationTimeline;
