import { motion } from 'framer-motion';
import { Zap, Power, Radio } from 'lucide-react';
import { useState } from 'react';

interface OverrideJunction {
  id: string;
  name: string;
  status: 'normal' | 'overridden';
  priorityLevel: number;
}

const PriorityOverrideControl = () => {
  const [junctions, setJunctions] = useState<OverrideJunction[]>([
    { id: 'J-001', name: 'Main & 4th St', status: 'normal', priorityLevel: 1 },
    { id: 'J-002', name: 'Broadway Ave', status: 'overridden', priorityLevel: 3 },
    { id: 'J-003', name: 'Park Road', status: 'normal', priorityLevel: 1 },
  ]);

  const toggleOverride = (id: string) => {
    setJunctions(prev => prev.map(j => 
      j.id === id ? { ...j, status: j.status === 'normal' ? 'overridden' : 'normal' } : j
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="text-yellow-400" size={20} />
          <h3 className="font-semibold text-white">Signal Priority Override</h3>
        </div>
        <button className="p-1 text-red-400 hover:bg-red-500/10 rounded border border-red-500/30 flex items-center gap-1">
          <Power size={14} />
          <span className="text-[10px] uppercase font-bold">Emergency Stop All</span>
        </button>
      </div>

      <div className="space-y-2">
        {junctions.map((j) => (
          <div key={j.id} className="glass-card p-4 border border-white/5 bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${j.status === 'overridden' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                <div>
                  <h4 className="text-sm font-medium text-white">{j.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 font-mono">{j.id}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${j.status === 'overridden' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {j.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block uppercase">Priority</span>
                  <span className={`text-xs font-bold ${j.status === 'overridden' ? 'text-red-400' : 'text-blue-400'}`}>
                    LVL {j.status === 'overridden' ? 'MAX' : j.priorityLevel}
                  </span>
                </div>
                <button 
                  onClick={() => toggleOverride(j.id)}
                  className={`p-2 rounded-lg border transition-all ${
                    j.status === 'overridden' 
                      ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <Radio size={18} className={j.status === 'overridden' ? 'animate-pulse' : ''} />
                </button>
              </div>
            </div>

            {j.status === 'overridden' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-3 pt-3 border-t border-white/10"
              >
                <div className="flex gap-2">
                  <button className="flex-1 py-1 text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 rounded uppercase font-bold">Green Wave</button>
                  <button className="flex-1 py-1 text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded uppercase font-bold">Hold All</button>
                  <button className="flex-1 py-1 text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 rounded uppercase font-bold">Release</button>
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriorityOverrideControl;
