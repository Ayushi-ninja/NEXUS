import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { JunctionData } from '../services/mockDataService';

// Fix for default marker icons in Leaflet with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface JunctionMapProps {
  junctions: JunctionData[];
  onJunctionClick?: (junction: JunctionData) => void;
}

const JunctionMap = ({ junctions, onJunctionClick }: JunctionMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map centered on New York
    const map = L.map(mapContainerRef.current).setView([40.7128, -74.0060], 12);

    // Add dark theme tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add junction markers
    junctions.forEach((junction) => {
      const markerColor = junction.status === 'critical' ? '#ef4444' 
                        : junction.status === 'congested' ? '#f59e0b' 
                        : '#22c55e';

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${markerColor};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 10px ${markerColor};
            cursor: pointer;
          "></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([junction.location.lat, junction.location.lng], {
        icon: customIcon,
      }).addTo(map);

      marker.bindPopup(`
        <div style="color: #000; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold;">${junction.name}</h3>
          <p style="margin: 4px 0;"><strong>Status:</strong> ${junction.status}</p>
          <p style="margin: 4px 0;"><strong>Traffic Flow:</strong> ${junction.trafficFlow} vehicles/min</p>
          <p style="margin: 4px 0;"><strong>Avg Wait Time:</strong> ${junction.avgWaitTime}s</p>
          <p style="margin: 4px 0;"><strong>Signal:</strong> ${junction.signalState.toUpperCase()}</p>
        </div>
      `);

      marker.on('click', () => {
        onJunctionClick?.(junction);
      });
    });
  }, [junctions, onJunctionClick]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-white/10"
        style={{ zIndex: 1 }}
      />
      
      {/* Map legend */}
      <div className="absolute bottom-4 left-4 z-10 glass-card p-3 rounded-lg">
        <h4 className="text-sm font-semibold mb-2 text-white">Junction Status</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-gray-300">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
            <span className="text-gray-300">Congested</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            <span className="text-gray-300">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JunctionMap;
