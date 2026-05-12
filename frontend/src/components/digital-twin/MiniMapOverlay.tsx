import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Vehicle, TrafficSignal } from '../../hooks/useSimulationEngine';

interface Props {
  vehicles: Vehicle[];
  signals: TrafficSignal[];
}

// Custom DivIcon for the main junction (glowing neon effect)
const mainJunctionIcon = new L.DivIcon({
  html: `
    <div class="relative flex items-center justify-center w-8 h-8">
      <div class="absolute w-full h-full bg-neon-blue rounded-full opacity-20 animate-ping"></div>
      <div class="absolute w-4 h-4 bg-neon-blue rounded-full shadow-[0_0_15px_rgba(0,212,255,0.8)] border-2 border-white"></div>
    </div>
  `,
  className: 'custom-leaflet-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Helper to get Tailwind classes based on color name
const getColorClasses = (color: string) => {
  switch(color) {
    case 'neon-purple': return 'bg-neon-purple shadow-[0_0_10px_#a855f7]';
    case 'neon-pink': return 'bg-neon-pink shadow-[0_0_10px_#ec4899]';
    case 'neon-green': return 'bg-neon-green shadow-[0_0_10px_#22c55e]';
    default: return 'bg-neon-blue shadow-[0_0_10px_#0ea5e9]';
  }
};

// Custom DivIcon for secondary junctions (less prominent)
const secondaryJunctionIcon = (color: string) => new L.DivIcon({
  html: `
    <div class="relative flex items-center justify-center w-6 h-6">
      <div class="absolute w-3 h-3 ${getColorClasses(color)} rounded-full opacity-80"></div>
    </div>
  `,
  className: 'custom-leaflet-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const MiniMapOverlay = ({ vehicles, signals: _signals }: Props) => {
  // Mock coordinates for the smart city center (e.g. downtown)
  const centerPos: [number, number] = [40.7128, -74.0060]; // NYC as an example
  
  // Calculate average traffic density to show in the popup
  const activeVehicles = vehicles.length;
  const status = activeVehicles > 30 ? 'High Congestion' : 'Normal Flow';
  const statusColor = activeVehicles > 30 ? 'text-red-500' : 'text-neon-green';

  return (
    <div className="w-[300px] h-[200px] rounded-lg shadow-xl overflow-hidden border border-dark-border relative">
      {/* Title Bar */}
      <div className="absolute top-0 left-0 w-full bg-[#080c1a]/80 backdrop-blur-md px-3 py-1.5 z-[400] flex justify-between items-center border-b border-dark-border">
        <span className="text-xs font-bold text-gray-300 tracking-wider">CITY OVERVIEW</span>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-blue opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-blue"></span>
          </span>
          <span className="text-[10px] text-neon-blue">LIVE GPS</span>
        </div>
      </div>

      <MapContainer 
        center={centerPos} 
        zoom={13} 
        zoomControl={false}
        className="w-full h-full z-0 bg-[#080c1a]"
      >
        {/* Dark Matter Tile Layer from CartoDB */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Main Junction Marker */}
        <Marker position={centerPos} icon={mainJunctionIcon}>
          <Popup className="custom-popup">
            <div className="bg-[#0f172a] text-white p-2 rounded-lg border border-dark-border shadow-2xl min-w-[150px]">
              <h3 className="font-bold text-sm mb-1 text-neon-blue">Junction Alpha</h3>
              <div className="text-xs space-y-1 text-gray-300">
                <p>Status: <span className={`font-semibold ${statusColor}`}>{status}</span></p>
                <p>Active Vehicles: <span className="text-white font-semibold">{activeVehicles}</span></p>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Secondary Junctions for Context */}
        <Marker position={[40.7200, -73.9950]} icon={secondaryJunctionIcon('neon-purple')} />
        <Marker position={[40.7050, -74.0150]} icon={secondaryJunctionIcon('neon-pink')} />
        <Marker position={[40.7180, -74.0200]} icon={secondaryJunctionIcon('neon-green')} />
      </MapContainer>

      {/* Override some default Leaflet styles to match our theme */}
      <style>{`
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
        }
        .leaflet-popup-tip {
          background: #0f172a !important;
          border: 1px solid #1e293b !important;
          border-top: none !important;
          border-left: none !important;
        }
        .custom-leaflet-icon {
          background: transparent;
          border: none;
        }
        /* Make attribution less distracting */
        .leaflet-control-attribution {
          background: rgba(8, 12, 26, 0.7) !important;
          color: #64748b !important;
          font-size: 8px !important;
        }
        .leaflet-control-attribution a {
          color: #94a3b8 !important;
        }
      `}</style>
    </div>
  );
};

export default MiniMapOverlay;
