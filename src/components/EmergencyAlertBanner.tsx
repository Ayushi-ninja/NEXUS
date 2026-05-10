import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { EmergencyAlert } from '../services/mockDataService';

interface EmergencyAlertBannerProps {
  alerts: EmergencyAlert[];
  onAcknowledge?: (id: string) => void;
  onResolve?: (id: string) => void;
}

const EmergencyAlertBanner = ({ alerts, onAcknowledge, onResolve }: EmergencyAlertBannerProps) => {
  const activeAlerts = alerts.filter(alert => alert.status !== 'resolved');

  const getSeverityColor = (severity: EmergencyAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 border-red-500/50 text-red-400';
      case 'high':
        return 'bg-orange-500/20 border-orange-500/50 text-orange-400';
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      case 'low':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    }
  };

  const getStatusIcon = (status: EmergencyAlert['status']) => {
    switch (status) {
      case 'acknowledged':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'active':
        return <AlertCircle size={16} className="text-red-400 animate-pulse" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {activeAlerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`glass-card border ${getSeverityColor(alert.severity)} p-4 relative overflow-hidden`}
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-current" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} />
                  <span className="font-semibold text-white">{alert.type}</span>
                  {getStatusIcon(alert.status)}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAcknowledge?.(alert.id)}
                    disabled={alert.status === 'acknowledged'}
                    className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-colors"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => onResolve?.(alert.id)}
                    className="text-xs px-2 py-1 rounded bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
                  >
                    Resolve
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-300 mb-2">{alert.description}</p>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">{alert.location}</span>
                <span className="text-gray-500">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {activeAlerts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card border border-green-500/30 p-6 text-center"
        >
          <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
          <p className="text-gray-400">No active emergency alerts</p>
        </motion.div>
      )}
    </div>
  );
};

export default EmergencyAlertBanner;
