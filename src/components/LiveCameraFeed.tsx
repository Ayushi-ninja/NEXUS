import { motion } from 'framer-motion';
import { Camera, Video, VideoOff, Clock } from 'lucide-react';
import { CameraFeed } from '../services/mockDataService';

interface LiveCameraFeedProps {
  feed: CameraFeed;
}

const LiveCameraFeed = ({ feed }: LiveCameraFeedProps) => {
  const isOnline = feed.status === 'online';
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
  const demoVideoUrl = `${apiUrl}/static/demo_traffic.mp4`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="glass-card p-4 relative overflow-hidden"
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isOnline ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {isOnline ? (
                <Video size={16} className="text-green-400" />
              ) : (
                <VideoOff size={16} className="text-red-400" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">{feed.name}</h4>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                <span className="text-xs text-gray-400 capitalize">{feed.status}</span>
              </div>
            </div>
          </div>
          <Camera size={16} className="text-gray-400" />
        </div>

        {/* Camera feed with demo video */}
        <div className="relative aspect-video bg-dark-card rounded-lg overflow-hidden border border-white/10">
          {isOnline ? (
            <>
              <video
                src={demoVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 pointer-events-none" />
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500/80 px-2 py-1 rounded">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-xs text-white font-medium">LIVE</span>
              </div>
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 px-2 py-1 rounded">
                <Clock size={12} className="text-gray-300" />
                <span className="text-xs text-gray-300">
                  {new Date(feed.lastUpdated).toLocaleTimeString()}
                </span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-dark-card/50">
              <div className="text-center">
                <VideoOff size={32} className="text-red-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Camera Offline</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LiveCameraFeed;
