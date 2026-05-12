import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Vehicle, EmergencyVehicleState, Direction } from '../../hooks/useSimulationEngine';

interface Props {
  vehicles: Vehicle[];
  emergencyVehicle: EmergencyVehicleState;
}

const getRotation = (direction: Direction): number => {
  switch (direction) {
    case 'north': return 270;
    case 'south': return 90;
    case 'east': return 0;
    case 'west': return 180;
    default: return 0;
  }
};

const PASTEL_COLORS = ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#e0baff'];

// --- Subcomponents for Vehicles ---

const CarSVG = ({ color, waiting }: { color: string; waiting: boolean }) => {
  const plateColor = useMemo(() => PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)], []);
  return (
    <g transform="translate(-14, -7)">
      {/* Headlight glow */}
      {!waiting && (
        <g>
          <circle cx="28" cy="3" r="8" fill="url(#headlight-glow)" />
          <circle cx="28" cy="11" r="8" fill="url(#headlight-glow)" />
        </g>
      )}
      
      {/* Body */}
      <rect x="0" y="0" width="28" height="14" rx="3" fill={color} />
      
      {/* Wheels */}
      <rect x="4" y="-1" width="4" height="16" rx="1" fill="#1f2937" />
      <rect x="20" y="-1" width="4" height="16" rx="1" fill="#1f2937" />
      
      {/* Windshield */}
      <polygon points="18,2 22,3 22,11 18,12" fill="#0f172a" opacity="0.8" />
      <polygon points="6,2 4,3 4,11 6,12" fill="#0f172a" opacity="0.8" />
      
      {/* Headlights */}
      <rect x="26" y="2" width="2" height="3" fill="#ffffff" />
      <rect x="26" y="9" width="2" height="3" fill="#ffffff" />
      
      {/* Taillights */}
      <rect x="0" y="2" width="2" height="3" fill={waiting ? '#ef4444' : '#7f1d1d'} />
      <rect x="0" y="9" width="2" height="3" fill={waiting ? '#ef4444' : '#7f1d1d'} />

      {/* License plate */}
      <rect x="0" y="5" width="1" height="4" fill={plateColor} />
    </g>
  );
};

const BusSVG = ({ waiting }: { waiting: boolean }) => {
  return (
    <g transform="translate(-24, -8)">
      {/* Headlight glow */}
      {!waiting && (
        <g>
          <circle cx="48" cy="4" r="10" fill="url(#headlight-glow)" />
          <circle cx="48" cy="12" r="10" fill="url(#headlight-glow)" />
        </g>
      )}
      
      {/* Wheels */}
      <rect x="6" y="-1" width="6" height="18" rx="1" fill="#1f2937" />
      <rect x="36" y="-1" width="6" height="18" rx="1" fill="#1f2937" />
      
      {/* Body */}
      <rect x="0" y="0" width="48" height="16" rx="2" fill="#eab308" />
      
      {/* Front Windshield */}
      <rect x="44" y="2" width="4" height="12" rx="1" fill="#0f172a" opacity="0.8" />
      
      {/* Windows */}
      {[...Array(6)].map((_, i) => (
        <g key={i}>
          <rect x={6 + i * 6} y="1" width="4" height="2" fill="#0f172a" opacity="0.6" />
          <rect x={6 + i * 6} y="13" width="4" height="2" fill="#0f172a" opacity="0.6" />
        </g>
      ))}
      
      {/* Headlights */}
      <rect x="46" y="2" width="2" height="3" fill="#ffffff" />
      <rect x="46" y="11" width="2" height="3" fill="#ffffff" />
      
      {/* Taillights */}
      <rect x="0" y="2" width="2" height="3" fill={waiting ? '#ef4444' : '#7f1d1d'} />
      <rect x="0" y="11" width="2" height="3" fill={waiting ? '#ef4444' : '#7f1d1d'} />

      {/* License plate */}
      <rect x="0" y="6" width="1" height="4" fill="#facc15" />
    </g>
  );
};

const TruckSVG = ({ waiting }: { waiting: boolean }) => {
  return (
    <g transform="translate(-26, -8)">
      {/* Headlight glow */}
      {!waiting && (
        <g>
          <circle cx="52" cy="3" r="10" fill="url(#headlight-glow)" />
          <circle cx="52" cy="13" r="10" fill="url(#headlight-glow)" />
        </g>
      )}

      {/* Trailer */}
      <rect x="0" y="1" width="34" height="14" rx="1" fill="#475569" />
      {/* Trailer Wheels */}
      <rect x="4" y="0" width="6" height="16" rx="1" fill="#1f2937" />
      <rect x="12" y="0" width="6" height="16" rx="1" fill="#1f2937" />
      
      {/* Cab */}
      <rect x="36" y="0" width="18" height="16" rx="3" fill="#1e293b" />
      {/* Cab Wheels */}
      <rect x="42" y="-1" width="8" height="18" rx="1" fill="#1f2937" />
      
      {/* Exhaust Pipe */}
      <circle cx="40" cy="2" r="1.5" fill="#94a3b8" />
      <circle cx="40" cy="14" r="1.5" fill="#94a3b8" />

      {/* Windshield */}
      <rect x="48" y="2" width="4" height="12" fill="#0f172a" opacity="0.8" />
      
      {/* Headlights */}
      <rect x="52" y="2" width="2" height="3" fill="#ffffff" />
      <rect x="52" y="11" width="2" height="3" fill="#ffffff" />
      
      {/* Taillights */}
      <rect x="0" y="2" width="2" height="3" fill={waiting ? '#ef4444' : '#7f1d1d'} />
      <rect x="0" y="11" width="2" height="3" fill={waiting ? '#ef4444' : '#7f1d1d'} />

      {/* License plate */}
      <rect x="0" y="6" width="1" height="4" fill="#94a3b8" />
    </g>
  );
};

const MotorcycleSVG = ({ waiting }: { waiting: boolean }) => {
  return (
    <g transform="translate(-7, -4)">
      {/* Headlight glow */}
      {!waiting && (
        <circle cx="14" cy="4" r="6" fill="url(#headlight-glow)" />
      )}

      {/* Body */}
      <rect x="0" y="2" width="14" height="4" rx="2" fill="#1d4ed8" />
      
      {/* Wheels */}
      <rect x="1" y="1.5" width="3" height="5" rx="1" fill="#1f2937" />
      <rect x="10" y="1.5" width="3" height="5" rx="1" fill="#1f2937" />
      
      {/* Rider Silhouette */}
      <circle cx="7" cy="4" r="2.5" fill="#111827" />
      <rect x="5" y="2.5" width="4" height="3" fill="#111827" />

      {/* Headlight */}
      <rect x="13" y="3" width="1" height="2" fill="#ffffff" />
      
      {/* Taillight */}
      <rect x="0" y="3" width="1" height="2" fill={waiting ? '#ef4444' : '#7f1d1d'} />
    </g>
  );
};

const AmbulanceSVG = ({ waiting }: { waiting: boolean }) => {
  return (
    <g transform="translate(-14, -7)">
      {/* Headlight glow */}
      {!waiting && (
        <g>
          <circle cx="28" cy="3" r="8" fill="url(#headlight-glow)" />
          <circle cx="28" cy="11" r="8" fill="url(#headlight-glow)" />
        </g>
      )}

      {/* Wheels */}
      <rect x="4" y="-1" width="4" height="16" rx="1" fill="#1f2937" />
      <rect x="20" y="-1" width="4" height="16" rx="1" fill="#1f2937" />

      {/* Body */}
      <rect x="0" y="0" width="28" height="14" rx="3" fill="#ffffff" />
      
      {/* Red Cross */}
      <rect x="10" y="6" width="6" height="2" fill="#ef4444" />
      <rect x="12" y="4" width="2" height="6" fill="#ef4444" />
      
      {/* Windshield */}
      <polygon points="20,2 24,3 24,11 20,12" fill="#0f172a" opacity="0.8" />
      <polygon points="6,2 4,3 4,11 6,12" fill="#0f172a" opacity="0.8" />
      
      {/* Roof Flashing Lights — Enhanced Siren Glow */}
      <motion.circle 
        cx="14" cy="2" r="2" fill="#ef4444" 
        animate={{ opacity: [1, 0.2, 1], r: [2, 4, 2] }} 
        transition={{ duration: 0.3, repeat: Infinity, ease: 'linear' }}
      />
      <motion.circle 
        cx="14" cy="2" r="6" fill="#ef4444" 
        animate={{ opacity: [0.3, 0, 0.3], r: [6, 12, 6] }} 
        transition={{ duration: 0.3, repeat: Infinity, ease: 'linear' }}
      />

      <motion.circle 
        cx="14" cy="12" r="2" fill="#3b82f6" 
        animate={{ opacity: [0.2, 1, 0.2], r: [2, 4, 2] }} 
        transition={{ duration: 0.3, repeat: Infinity, ease: 'linear' }}
      />
      <motion.circle 
        cx="14" cy="12" r="6" fill="#3b82f6" 
        animate={{ opacity: [0, 0.3, 0], r: [6, 12, 6] }} 
        transition={{ duration: 0.3, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Headlights */}
      <rect x="26" y="2" width="2" height="3" fill="#ffffff" />
      <rect x="26" y="9" width="2" height="3" fill="#ffffff" />
      
      {/* Taillights */}
      <rect x="0" y="2" width="2" height="3" fill={waiting ? '#ef4444' : '#7f1d1d'} />
      <rect x="0" y="9" width="2" height="3" fill={waiting ? '#ef4444' : '#7f1d1d'} />

      {/* License plate */}
      <rect x="0" y="5" width="1" height="4" fill="#ffffff" />
    </g>
  );
};

const VehicleOverlay = ({ vehicles, emergencyVehicle }: Props) => {
  return (
    <svg 
      viewBox="0 0 800 800" 
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
    >
      <defs>
        <radialGradient id="headlight-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* Regular Vehicles */}
      {vehicles.map((v) => (
        <g
          key={v.id}
          style={{ transform: `translate(${v.x}px, ${v.y}px) rotate(${getRotation(v.direction)}deg)`, transition: 'transform 0.05s linear' }}
        >
          {v.type === 'car' && <CarSVG color={v.color} waiting={v.waiting} />}
          {v.type === 'bus' && <BusSVG waiting={v.waiting} />}
          {v.type === 'truck' && <TruckSVG waiting={v.waiting} />}
          {v.type === 'motorcycle' && <MotorcycleSVG waiting={v.waiting} />}
        </g>
      ))}

      {/* Emergency Vehicle */}
      {emergencyVehicle.active && (
        <g
          style={{ transform: `translate(${emergencyVehicle.x}px, ${emergencyVehicle.y}px) rotate(${getRotation(emergencyVehicle.direction)}deg)`, transition: 'transform 0.05s linear' }}
        >
          <AmbulanceSVG waiting={false} />
        </g>
      )}
    </svg>
  );
};

export default VehicleOverlay;
