import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info, AlertCircle, ShieldAlert, X } from 'lucide-react';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

const EmergencyAlertCenter = () => {
  const alerts: Alert[] = [
    {
      id: 'AL-101',
      type: 'critical',
      title: 'Ambulance Route Clearance',
      message: 'EV-001 entering Junction 04. Requesting immediate green wave.',
      timestamp: '10:42:15 AM',
    },
    {
      id: 'AL-102',
      type: 'warning',
      title: 'Heavy Traffic: Route B',
      message: 'Congestion detected on secondary emergency route. Recommending alternative Alpha-2.',
      timestamp: '10:40:02 AM',
    },
    {
      id: 'AL-103',
      type: 'info',
      title: 'Protocol Activated',
      message: 'Emergency vehicle prioritization mode active city-wide.',
      timestamp: '10:35:10 AM',
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="text-blue-400" size={20} />
          <h3 className="font-semibold text-white">Alert Notification Center</h3>
        </div>
        <button className="text-[10px] text-gray-500 hover:text-white uppercase tracking-wider font-bold">Clear All</button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`p-3 rounded-lg border bg-white/[0.02] relative group ${
                alert.type === 'critical' ? 'border-red-500/30' :
                alert.type === 'warning' ? 'border-yellow-500/30' : 'border-blue-500/30'
              }`}
            >
              <div className="flex gap-3">
                <div className={`mt-1 p-1.5 rounded-full ${
                  alert.type === 'critical' ? 'bg-red-500/20 text-red-500' :
                  alert.type === 'warning' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-500'
                }`}>
                  {alert.type === 'critical' ? <ShieldAlert size={14} /> :
                   alert.type === 'warning' ? <AlertCircle size={14} /> : <Info size={14} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-xs font-bold uppercase ${
                      alert.type === 'critical' ? 'text-red-400' :
                      alert.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                    }`}>
                      {alert.title}
                    </h4>
                    <span className="text-[10px] text-gray-500 font-mono">{alert.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1 line-clamp-2">{alert.message}</p>
                </div>

                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-500 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-[10px] text-gray-500 mb-2">
          <span>System Status</span>
          <span className="text-green-500 uppercase font-bold">Online</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-1 bg-green-500/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-green-500"
              animate={{ width: ['20%', '100%', '20%'] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
          </div>
          <div className="h-1 bg-blue-500/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-500"
              animate={{ width: ['100%', '30%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAlertCenter;
