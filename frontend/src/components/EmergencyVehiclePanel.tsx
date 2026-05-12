import { motion } from 'framer-motion';
import { Siren, MapPin, Clock, Activity, ShieldAlert } from 'lucide-react';

interface EmergencyVehicle {
  id: string;
  type: 'Ambulance' | 'Fire Truck' | 'Police';
  plateNumber: string;
  location: string;
  destination: string;
  eta: string;
  status: 'responding' | 'arriving' | 'completed';
  speed: number;
}

const mockVehicles: EmergencyVehicle[] = [
  {
    id: 'EV-001',
    type: 'Ambulance',
    plateNumber: 'AMB-2024-01',
    location: '4th Avenue',
    destination: 'City Hospital',
    eta: '3m 45s',
    status: 'responding',
    speed: 72,
  },
  {
    id: 'EV-002',
    type: 'Fire Truck',
    plateNumber: 'FIRE-911',
    location: 'Broadway',
    destination: 'Industrial Park',
    eta: '5m 12s',
    status: 'responding',
    speed: 58,
  },
];

const EmergencyVehiclePanel = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Siren className="text-red-500 animate-pulse" size={20} />
          <h3 className="font-semibold text-white">Detected Emergency Vehicles</h3>
        </div>
        <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full border border-red-500/30">
          {mockVehicles.length} Active
        </span>
      </div>

      <div className="space-y-3">
        {mockVehicles.map((vehicle) => (
          <motion.div
            key={vehicle.id}
            whileHover={{ scale: 1.02 }}
            className="glass-card p-4 border-l-4 border-red-500 relative overflow-hidden group"
          >
            {/* Background Scanner Effect */}
            <motion.div
              className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />

            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-red-400">{vehicle.id}</span>
                  <h4 className="font-bold text-white">{vehicle.type}</h4>
                </div>
                <p className="text-xs text-gray-400">{vehicle.plateNumber}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end text-green-400">
                  <Activity size={12} />
                  <span className="text-xs font-mono">{vehicle.speed} km/h</span>
                </div>
                <div className="flex items-center gap-1 justify-end text-gray-400">
                  <Clock size={12} />
                  <span className="text-xs">{vehicle.eta}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-white/5 p-2 rounded border border-white/10">
                <span className="text-[10px] text-gray-500 block uppercase">Current</span>
                <div className="flex items-center gap-1">
                  <MapPin size={10} className="text-blue-400" />
                  <span className="text-xs text-white truncate">{vehicle.location}</span>
                </div>
              </div>
              <div className="bg-white/5 p-2 rounded border border-white/10">
                <span className="text-[10px] text-gray-500 block uppercase">Dest</span>
                <div className="flex items-center gap-1">
                  <ShieldAlert size={10} className="text-red-400" />
                  <span className="text-xs text-white truncate">{vehicle.destination}</span>
                </div>
              </div>
            </div>

            {/* Tracking Progress */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>Progress</span>
                <span>65%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm transition-colors mt-2">
        View All Vehicles
      </button>
    </div>
  );
};

export default EmergencyVehiclePanel;
