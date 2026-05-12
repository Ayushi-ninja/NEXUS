import { motion } from 'framer-motion';
import { MapPin, Flame } from 'lucide-react';

interface HeatmapSectionProps {
  data: { x: number; y: number; intensity: number; label: string }[];
}

const HeatmapSection = ({ data }: HeatmapSectionProps) => {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame size={20} className="text-orange-400" />
          <h3 className="font-semibold text-white">Congestion Heatmap</h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-400">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-400">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-400">High</span>
          </div>
        </div>
      </div>

      <div className="relative h-64 bg-dark-card rounded-lg overflow-hidden border border-white/10">
        {/* Grid background */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }} />

        {/* Heatmap points */}
        {data.map((point, index) => {
          const getColor = (intensity: number) => {
            if (intensity < 0.33) return 'rgba(34, 197, 94, 0.6)';
            if (intensity < 0.66) return 'rgba(234, 179, 8, 0.6)';
            return 'rgba(239, 68, 68, 0.6)';
          };

          const getSize = (intensity: number) => {
            return 40 + intensity * 60;
          };

          return (
            <motion.div
              key={index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="absolute rounded-full blur-xl"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                width: `${getSize(point.intensity)}px`,
                height: `${getSize(point.intensity)}px`,
                backgroundColor: getColor(point.intensity),
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Pulsing effect */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{ backgroundColor: getColor(point.intensity) }}
              />
            </motion.div>
          );
        })}

        {/* Location markers */}
        {data.map((point, index) => (
          <motion.div
            key={`marker-${index}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className="absolute z-10 flex flex-col items-center"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/20">
              <span className="text-xs text-white whitespace-nowrap">{point.label}</span>
            </div>
            <MapPin size={16} className="text-white mt-1" />
          </motion.div>
        ))}

        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
          <p className="text-xs text-gray-400">Real-time congestion data</p>
        </div>
      </div>
    </div>
  );
};

export default HeatmapSection;
