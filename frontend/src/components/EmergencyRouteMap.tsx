import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// framer-motion available if needed

// Custom marker icons
const ambulanceIcon = new L.DivIcon({
  html: `<div class="bg-red-500 p-2 rounded-full border-2 border-white animate-pulse shadow-lg shadow-red-500/50">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
         </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const hospitalIcon = new L.DivIcon({
  html: `<div class="bg-blue-600 p-2 rounded-lg border-2 border-white shadow-lg">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
         </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface EmergencyRouteMapProps {
  center: [number, number];
  route: [number, number][];
  currentPos: [number, number];
  destination: [number, number];
}

const EmergencyRouteMap = ({ center, route, currentPos, destination }: EmergencyRouteMapProps) => {
  return (
    <div className="h-full min-h-[400px] w-full rounded-xl overflow-hidden relative border border-white/10 shadow-2xl">
      {/* Map Overlay Info */}
      <div className="absolute top-4 left-4 z-[1000] space-y-2">
        <div className="bg-dark-bg/80 backdrop-blur-md p-3 rounded-lg border border-red-500/30 shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Live Tracking</span>
          </div>
          <p className="text-white font-bold text-sm">Ambulance EV-001</p>
          <p className="text-xs text-red-400">Status: Priority Override Active</p>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={15}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Main Route Line */}
        <Polyline
          positions={route}
          pathOptions={{ 
            color: '#ef4444', 
            weight: 6, 
            opacity: 0.8,
            dashArray: '10, 10',
            lineCap: 'round'
          }}
        />

        {/* Dynamic Route Glow */}
        <Polyline
          positions={route}
          pathOptions={{ 
            color: '#ef4444', 
            weight: 12, 
            opacity: 0.2,
            lineCap: 'round'
          }}
        />

        {/* Emergency Lanes visualization */}
        <Polyline
          positions={route.map(([lat, lng]) => [lat + 0.0001, lng + 0.0001])}
          pathOptions={{ 
            color: '#3b82f6', 
            weight: 2, 
            opacity: 0.4,
            dashArray: '5, 15'
          }}
        />

        {/* Current Position */}
        <Marker position={currentPos} icon={ambulanceIcon}>
          <Popup className="emergency-popup">
            <div className="text-center">
              <p className="font-bold text-red-600">Ambulance AMB-2024</p>
              <p className="text-xs">Moving: 72 km/h</p>
            </div>
          </Popup>
        </Marker>

        {/* Destination */}
        <Marker position={destination} icon={hospitalIcon}>
          <Popup>
            <p className="font-bold">City Hospital</p>
            <p className="text-xs">Arrival ETA: 3m 45s</p>
          </Popup>
        </Marker>

        {/* Override Zones */}
        <Circle
          center={currentPos}
          radius={300}
          pathOptions={{
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.1,
            weight: 1,
            dashArray: '5, 5'
          }}
        />
      </MapContainer>

      {/* Map Control Shortcuts */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        <button className="p-2 bg-dark-bg/80 backdrop-blur-md border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button className="p-2 bg-dark-bg/80 backdrop-blur-md border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
};

export default EmergencyRouteMap;
