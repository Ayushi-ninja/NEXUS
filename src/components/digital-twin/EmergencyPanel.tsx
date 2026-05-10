import { motion, AnimatePresence } from 'framer-motion';
import { Ambulance, Siren, Route, Zap } from 'lucide-react';
import { EmergencyVehicleState } from '../../hooks/useSimulationEngine';

interface Props {
  emergencyVehicle: EmergencyVehicleState;
  onTrigger: () => void;
}

const EmergencyPanel = ({ emergencyVehicle, onTrigger }: Props) => {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Siren size={14} className="text-red-400" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Emergency</h3>
        </div>
        <AnimatePresence>
          {emergencyVehicle.active && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 animate-pulse"
            >
              ACTIVE
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {emergencyVehicle.active ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {/* Status indicator */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="relative">
                <Ambulance size={24} className="text-red-400" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Emergency Vehicle Active</p>
                <p className="text-xs text-gray-400">
                  Direction: <span className="text-red-400 font-medium capitalize">{emergencyVehicle.direction}</span>
                </p>
              </div>
            </div>

            {/* Priority lane info */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02]">
              <Route size={14} className="text-amber-400" />
              <span className="text-xs text-gray-300">Priority lane active — signals overridden</span>
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500">Transit Progress</span>
                <span className="text-xs text-red-400 font-mono">
                  {Math.round(Math.min(100, emergencyVehicle.progress * 100))}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 to-amber-500"
                  initial={false}
                  animate={{ width: `${Math.min(100, emergencyVehicle.progress * 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="inactive"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <Ambulance size={20} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-400">No active emergency</p>
                <p className="text-[10px] text-gray-500">Click below to simulate</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onTrigger}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition-all"
            >
              <Zap size={14} />
              Trigger Emergency
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmergencyPanel;
