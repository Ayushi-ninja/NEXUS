import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { CongestionZone } from '../../hooks/useSimulationEngine';

interface Props {
  congestionZones: CongestionZone[];
}

const directionLabels: Record<string, string> = {
  north: 'North',
  south: 'South',
  east: 'East',
  west: 'West',
};

const getColor = (level: number) => {
  if (level > 70) return { bar: 'bg-red-500', text: 'text-red-400', glow: 'shadow-red-500/30' };
  if (level > 40) return { bar: 'bg-amber-500', text: 'text-amber-400', glow: 'shadow-amber-500/30' };
  return { bar: 'bg-emerald-500', text: 'text-emerald-400', glow: 'shadow-emerald-500/30' };
};

const CongestionHeatPanel = ({ congestionZones }: Props) => {
  const avgCongestion = Math.round(
    congestionZones.reduce((s, z) => s + z.level, 0) / congestionZones.length
  );

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame size={14} className="text-red-400" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Congestion</h3>
        </div>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            avgCongestion > 60
              ? 'bg-red-500/20 text-red-400'
              : avgCongestion > 35
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-emerald-500/20 text-emerald-400'
          }`}
        >
          {avgCongestion}%
        </span>
      </div>

      <div className="space-y-3">
        {congestionZones.map((zone) => {
          const c = getColor(zone.level);
          return (
            <div key={zone.direction}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">{directionLabels[zone.direction]}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500">{zone.vehicleCount} vehicles</span>
                  <span className={`text-xs font-mono font-bold ${c.text}`}>{zone.level}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${c.bar} shadow-lg ${c.glow}`}
                  initial={false}
                  animate={{ width: `${Math.min(100, zone.level)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Heat indicator */}
      <div className="mt-4 pt-3 border-t border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Heat Level</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-4 h-2 rounded-sm transition-colors duration-300 ${
                  avgCongestion / 20 >= i
                    ? i <= 2
                      ? 'bg-emerald-500'
                      : i <= 4
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CongestionHeatPanel;
