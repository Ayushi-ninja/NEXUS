import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Volume2, VolumeX } from 'lucide-react';

interface EmergencyAlertPopupProps {
  show: boolean;
  onClose: () => void;
  alert: {
    title: string;
    message: string;
    severity: 'critical' | 'high' | 'medium';
    location: string;
  };
}

const EmergencyAlertPopup = ({ show, onClose, alert }: EmergencyAlertPopupProps) => {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (show && !isMuted) {
      // Play alert sound (placeholder - would need actual audio file)
      console.log('Playing alert sound');
    }
  }, [show, isMuted]);

  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'critical':
        return 'bg-red-500 border-red-500';
      case 'high':
        return 'bg-orange-500 border-orange-500';
      case 'medium':
        return 'bg-yellow-500 border-yellow-500';
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Popup */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
          >
            <div className={`glass-card border-2 ${getSeverityColor()} p-6 relative overflow-hidden`}>
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 opacity-10"
                animate={{
                  background: [
                    'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              {/* Pulsing border */}
              <motion.div
                className="absolute inset-0 border-4 rounded-xl"
                animate={{
                  borderColor: [
                    alert.severity === 'critical' ? 'rgba(239, 68, 68, 0.8)' : 
                    alert.severity === 'high' ? 'rgba(249, 115, 22, 0.8)' : 
                    'rgba(234, 179, 8, 0.8)',
                    'transparent',
                  ],
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <AlertTriangle size={32} className="text-white" />
                    </motion.div>
                    <div>
                      <h2 className="text-xl font-bold text-white uppercase">
                        {alert.severity} Alert
                      </h2>
                      <p className="text-sm text-white/80">{alert.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X size={20} className="text-white" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">{alert.title}</h3>
                  <p className="text-white/90">{alert.message}</p>
                </div>

                {/* Timer */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white"
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: 30, ease: 'linear' }}
                    />
                  </div>
                  <span className="text-sm text-white font-mono">30s</span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="flex-1 py-3 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white font-semibold transition-colors"
                  >
                    Acknowledge
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-3 bg-white hover:bg-white/90 rounded-lg text-gray-900 font-semibold transition-colors"
                  >
                    Take Action
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmergencyAlertPopup;
