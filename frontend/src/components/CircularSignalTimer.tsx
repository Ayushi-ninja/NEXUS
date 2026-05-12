import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface CircularSignalTimerProps {
  timeLeft: number;
  totalTime: number;
  signalState: 'red' | 'yellow' | 'green';
  size?: number;
}

const CircularSignalTimer = ({ timeLeft, totalTime, signalState, size = 120 }: CircularSignalTimerProps) => {
  const percentage = (timeLeft / totalTime) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colors = {
    red: { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)' },
    yellow: { stroke: '#eab308', glow: 'rgba(234, 179, 8, 0.5)' },
    green: { stroke: '#22c55e', glow: 'rgba(34, 197, 94, 0.5)' },
  };

  const color = colors[signalState];

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer glow ring */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Background circle */}
      <svg className="absolute" width={size} height={size} viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="#1f2937"
          strokeWidth="8"
        />
      </svg>

      {/* Progress circle */}
      <svg className="absolute" width={size} height={size} viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
        <motion.circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke={color.stroke}
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5 }}
          style={{
            strokeDasharray: circumference,
            filter: `drop-shadow(0 0 8px ${color.glow})`,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <Clock size={20} className="text-gray-400 mb-1" />
        <motion.span
          key={timeLeft}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-3xl font-bold text-white"
        >
          {timeLeft}
        </motion.span>
        <span className="text-xs text-gray-400">seconds</span>
      </div>

      {/* Signal indicator dots */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
        {['red', 'yellow', 'green'].map((state) => (
          <motion.div
            key={state}
            className={`w-2 h-2 rounded-full ${
              state === signalState
                ? 'bg-current animate-pulse'
                : 'bg-gray-600'
            }`}
            style={{
              color: colors[state as keyof typeof colors].stroke,
            }}
            animate={state === signalState ? {
              boxShadow: [`0 0 0 ${colors[state as keyof typeof colors].glow}`],
            } : {}}
          />
        ))}
      </div>
    </div>
  );
};

export default CircularSignalTimer;
