import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Clock, Car, Zap } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'alert' | 'success' | 'info' | 'warning';
  title: string;
  description: string;
  timestamp: Date;
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'alert',
    title: 'Critical Congestion',
    description: 'Park Avenue junction experiencing heavy traffic',
    timestamp: new Date(Date.now() - 30000),
  },
  {
    id: '2',
    type: 'success',
    title: 'Signal Optimized',
    description: 'AI adjusted timing at Broadway & 42nd',
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: '3',
    type: 'warning',
    title: 'Weather Alert',
    description: 'Rain expected in 15 minutes',
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: '4',
    type: 'info',
    title: 'Emergency Vehicle',
    description: 'Ambulance routed through Main Street',
    timestamp: new Date(Date.now() - 600000),
  },
];

const LiveActivityFeed = () => {
  const [activities] = useState<ActivityItem[]>(mockActivities);

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle size={16} className="text-red-400" />;
      case 'success':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'warning':
        return <Zap size={16} className="text-yellow-400" />;
      case 'info':
        return <Car size={16} className="text-blue-400" />;
    }
  };

  const getBorderColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'alert':
        return 'border-red-500/50';
      case 'success':
        return 'border-green-500/50';
      case 'warning':
        return 'border-yellow-500/50';
      case 'info':
        return 'border-blue-500/50';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Activity size={20} className="text-neon-blue" />
        </motion.div>
        <h3 className="font-semibold text-white">Live Activity</h3>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card p-4 border-l-2 ${getBorderColor(activity.type)} relative overflow-hidden`}
            >
              {/* Animated glow effect */}
              <motion.div
                className="absolute top-0 left-0 w-1 h-full"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  backgroundColor: activity.type === 'alert' ? '#ef4444' :
                                   activity.type === 'success' ? '#22c55e' :
                                   activity.type === 'warning' ? '#eab308' : '#3b82f6',
                }}
              />

              <div className="relative z-10">
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getIcon(activity.type)}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white text-sm">{activity.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">{activity.description}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Clock size={12} className="text-gray-500" />
                      <span className="text-xs text-gray-500">{formatTime(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* View All Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors"
      >
        View All Activity
      </motion.button>
    </div>
  );
};

export default LiveActivityFeed;
