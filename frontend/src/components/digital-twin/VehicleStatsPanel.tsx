import { Car, Truck, Bus, TrendingUp, TrendingDown } from 'lucide-react';
import { Vehicle, SimulationStats } from '../../hooks/useSimulationEngine';

interface Props {
  stats: SimulationStats;
  vehicles: Vehicle[];
}

const VehicleStatsPanel = ({ stats, vehicles }: Props) => {
  const carCount = vehicles.filter((v) => v.type === 'car').length;
  const busCount = vehicles.filter((v) => v.type === 'bus').length;
  const truckCount = vehicles.filter((v) => v.type === 'truck').length;
  const waitingCount = vehicles.filter((v) => v.waiting).length;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Car size={14} className="text-cyan-400" />
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Vehicles</h3>
      </div>

      {/* Vehicle type breakdown */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <VehicleTypeChip icon={<Car size={14} />} label="Cars" count={carCount} color="blue" />
        <VehicleTypeChip icon={<Bus size={14} />} label="Buses" count={busCount} color="purple" />
        <VehicleTypeChip icon={<Truck size={14} />} label="Trucks" count={truckCount} color="amber" />
      </div>

      {/* Quick stats */}
      <div className="space-y-2.5">
        <QuickStat label="Moving" value={vehicles.length - waitingCount} suffix="vehicles" trend="up" />
        <QuickStat label="Waiting" value={waitingCount} suffix="at signals" trend="down" />
        <QuickStat label="Throughput" value={stats.throughput} suffix="/ min" trend="up" />
      </div>
    </div>
  );
};

/* Helpers */
interface VehicleTypeChipProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: 'blue' | 'purple' | 'amber';
}

const chipColors = {
  blue:   'bg-blue-500/10 text-blue-400 border-blue-500/10',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/10',
  amber:  'bg-amber-500/10 text-amber-400 border-amber-500/10',
};

const VehicleTypeChip = ({ icon, label, count, color }: VehicleTypeChipProps) => (
  <div className={`flex flex-col items-center gap-1 p-2 rounded-lg border ${chipColors[color]}`}>
    {icon}
    <span className="text-lg font-bold">{count}</span>
    <span className="text-[9px] text-gray-500">{label}</span>
  </div>
);

interface QuickStatProps {
  label: string;
  value: number;
  suffix: string;
  trend: 'up' | 'down';
}

const QuickStat = ({ label, value, suffix, trend }: QuickStatProps) => (
  <div className="flex items-center justify-between px-2 py-1.5 rounded bg-white/[0.02]">
    <span className="text-xs text-gray-400">{label}</span>
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-bold text-white">{value}</span>
      <span className="text-[10px] text-gray-500">{suffix}</span>
      {trend === 'up' ? (
        <TrendingUp size={10} className="text-emerald-400" />
      ) : (
        <TrendingDown size={10} className="text-amber-400" />
      )}
    </div>
  </div>
);

export default VehicleStatsPanel;
