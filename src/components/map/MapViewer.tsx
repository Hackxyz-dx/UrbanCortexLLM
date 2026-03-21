import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useSimulationStore } from '@/lib/store';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix Leaflet Default Icon Issue in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapViewer() {
  const incident = useSimulationStore((state) => state.incident);

  const getColorForRoute = (type: string, status: string, level: string) => {
    if (type === 'primary') return '#ef4444'; // Red for blocked/incident
    if (type === 'diversion') return status === 'approved' ? '#3b82f6' : '#6b7280'; // Blue or Gray
    if (type === 'emergency-corridor') return '#10b981'; // Green
    return '#3b82f6';
  };

  return (
    <MapContainer 
      center={[incident.location.lat, incident.location.lng]} 
      zoom={14} 
      className="w-full h-full z-0"
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      
      <Marker position={[incident.location.lat, incident.location.lng]} icon={customIcon}>
        <Popup className="text-black">
          <strong>{incident.title}</strong><br/>
          {incident.location.desc}<br/>
          Severity: <span className="text-red-600 uppercase text-xs font-bold">{incident.severity}</span>
        </Popup>
      </Marker>

      {incident.routes.map(route => {
        // Find if this route is part of a suggestion
        const isDiversion = route.type === 'diversion';
        const recStatus = isDiversion 
          ? incident.recommendations.find(r => r.id === 'rec-1')?.status 
          : 'approved';

        const color = getColorForRoute(route.type, recStatus || 'pending', route.congestionLevel);
        const weight = recStatus === 'approved' ? 6 : 3;
        const dashArray = recStatus === 'pending' ? '5, 10' : undefined;

        return (
          <Polyline 
            key={route.id}
            positions={route.coordinates}
            color={color}
            weight={weight}
            dashArray={dashArray}
            opacity={0.8}
          >
            <Popup className="text-black text-sm">
              <strong>{route.name}</strong><br/>
              Type: {route.type}<br/>
              Status: {isDiversion ? recStatus : route.congestionLevel}
            </Popup>
          </Polyline>
        );
      })}
    </MapContainer>
  );
}
