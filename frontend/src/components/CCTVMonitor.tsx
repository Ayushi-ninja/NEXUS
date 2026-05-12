import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Maximize2, Settings, Shield, 
  Activity, Cpu
} from 'lucide-react';

interface Detection {
  id: string;
  type: 'car' | 'truck' | 'bus' | 'motorcycle' | 'ambulance';
  bbox: { x: number; y: number; w: number; h: number };
  confidence: number;
}

const CCTVMonitor = () => {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [timestamp, setTimestamp] = useState(new Date());
  const monitorRef = useRef<HTMLDivElement>(null);

  // Simulate moving bounding boxes
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(new Date());
      
      const newDetections: Detection[] = [
        {
          id: 'det-1',
          type: 'car',
          bbox: { 
            x: 20 + Math.sin(Date.now() / 1000) * 5, 
            y: 30 + Math.cos(Date.now() / 1500) * 3, 
            w: 15, 
            h: 12 
          },
          confidence: 0.98
        },
        {
          id: 'det-2',
          type: 'truck',
          bbox: { 
            x: 60 + Math.cos(Date.now() / 2000) * 8, 
            y: 45 + Math.sin(Date.now() / 1200) * 4, 
            w: 22, 
            h: 18 
          },
          confidence: 0.94
        },
        {
          id: 'det-3',
          type: 'ambulance',
          bbox: { 
            x: 40 + Math.sin(Date.now() / 800) * 12, 
            y: 20 + Math.cos(Date.now() / 1000) * 6, 
            w: 18, 
            h: 15 
          },
          confidence: 0.99
        }
      ];
      setDetections(newDetections);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10 group shadow-2xl shadow-blue-500/10" ref={monitorRef}>
      {/* Real Video Placeholder - We use a high-quality city street image or dark gradient */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1545147986-a9d6f210df77?q=80&w=2000&auto=format&fit=crop")',
          filter: 'brightness(0.4) contrast(1.2) saturate(0.8)'
        }}
      />
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Detection Overlays */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        <AnimatePresence>
          {detections.map((det) => (
            <motion.g key={det.id}>
              {/* Bounding Box */}
              <rect
                x={`${det.bbox.x}%`}
                y={`${det.bbox.y}%`}
                width={`${det.bbox.w}%`}
                height={`${det.bbox.h}%`}
                fill="transparent"
                stroke={det.type === 'ambulance' ? '#ef4444' : '#00d4ff'}
                strokeWidth="2"
                className="transition-all duration-75 ease-linear"
              />
              
              {/* Corner Accents */}
              <path
                d={`M ${det.bbox.x}% ${det.bbox.y + 2}% L ${det.bbox.x}% ${det.bbox.y}% L ${det.bbox.x + 2}% ${det.bbox.y}%`}
                stroke={det.type === 'ambulance' ? '#ef4444' : '#00d4ff'}
                strokeWidth="4"
                fill="none"
              />
              <path
                d={`M ${det.bbox.x + det.bbox.w - 2}% ${det.bbox.y}% L ${det.bbox.x + det.bbox.w}% ${det.bbox.y}% L ${det.bbox.x + det.bbox.w}% ${det.bbox.y + 2}%`}
                stroke={det.type === 'ambulance' ? '#ef4444' : '#00d4ff'}
                strokeWidth="4"
                fill="none"
              />

              {/* Label */}
              <foreignObject
                x={`${det.bbox.x}%`}
                y={`${det.bbox.y - 5}%`}
                width="150"
                height="30"
              >
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-t text-[10px] font-bold uppercase tracking-widest ${
                  det.type === 'ambulance' ? 'bg-red-500 text-white' : 'bg-neon-blue text-black'
                }`}>
                  {det.type === 'ambulance' && <Shield size={10} />}
                  <span>{det.type} [{(det.confidence * 100).toFixed(0)}%]</span>
                </div>
              </foreignObject>
            </motion.g>
          ))}
        </AnimatePresence>
      </svg>

      {/* Interface Overlays */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
        {/* Top Bar */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 px-2 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-1 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                LIVE
              </div>
              <div className="text-white/80 font-mono text-xs tracking-widest uppercase">
                CAM_04 // MAIN_ST_JUNCTION
              </div>
            </div>
            <div className="text-white/40 font-mono text-[10px]">
              COORD: 40.7128° N, 74.0060° W
            </div>
          </div>

          <div className="flex gap-4">
            <div className="glass-card px-3 py-1.5 flex items-center gap-2 border-white/5 bg-black/40">
              <Cpu size={14} className="text-neon-blue" />
              <div className="flex flex-col">
                <span className="text-[8px] text-white/40 leading-none">PROCESSOR</span>
                <span className="text-[10px] text-white font-mono leading-none mt-1">YOLO_V8_NANO</span>
              </div>
            </div>
            <div className="glass-card px-3 py-1.5 flex items-center gap-2 border-white/5 bg-black/40">
              <Activity size={14} className="text-neon-purple" />
              <div className="flex flex-col">
                <span className="text-[8px] text-white/40 leading-none">INFERENCE</span>
                <span className="text-[10px] text-white font-mono leading-none mt-1">12.4ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* HUD Elements */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4">
          <div className="w-1 h-32 bg-white/5 rounded-full relative overflow-hidden">
            <motion.div 
              className="absolute bottom-0 w-full bg-neon-blue"
              animate={{ height: ['40%', '65%', '55%', '80%', '45%'] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>
          <span className="text-[8px] text-white/40 rotate-90 origin-left mt-4">BANDWIDTH</span>
        </div>

        {/* Bottom Bar */}
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-2">
            <div className="font-mono text-xl text-white/90">
              {timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              <span className="text-sm ml-1 text-white/40">.{(timestamp.getMilliseconds() / 10).toFixed(0).padStart(2, '0')}</span>
            </div>
            <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">
              SYS_DATE: {timestamp.toLocaleDateString('en-GB').replace(/\//g, '.')}
            </div>
          </div>

          <div className="flex items-center gap-6 pointer-events-auto">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[8px] text-white/40 uppercase tracking-widest">Detection Stream</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div 
                    key={i}
                    className="w-4 h-1 rounded-full bg-neon-blue/20"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            </div>
            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors">
              <Maximize2 size={18} className="text-white" />
            </button>
            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors">
              <Settings size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Viewport Corners */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-white/20 rounded-tl-xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-white/20 rounded-tr-xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-white/20 rounded-bl-xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-white/20 rounded-br-xl pointer-events-none" />

      {/* Static / Interference Effect (Very subtle) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>
    </div>
  );
};

export default CCTVMonitor;
