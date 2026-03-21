import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useSimulationStore } from '@/lib/store';
import L from 'leaflet';

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

  // Diversion route r2 is linked to strategy strat-1
  const isStratApproved = incident.strategies.find(s => s.id === 'strat-1')?.status === 'approved';

  const getRouteStyle = (type: string, id: string) => {
    if (type === 'primary') {
      return { color: '#ef4444', weight: 5, dashArray: undefined as string | undefined, opacity: 0.9 };
    }
    if (type === 'emergency-corridor') {
      return { color: '#10b981', weight: 4, dashArray: '6, 6' as string | undefined, opacity: 0.85 };
    }
    if (type === 'diversion') {
      if (id === 'r2') {
        return isStratApproved
          ? { color: '#2563eb', weight: 5, dashArray: undefined as string | undefined, opacity: 0.9 }
          : { color: '#94a3b8', weight: 3, dashArray: '8, 8' as string | undefined, opacity: 0.6 };
      }
      return { color: '#94a3b8', weight: 3, dashArray: '8, 8' as string | undefined, opacity: 0.6 };
    }
    return { color: '#3b82f6', weight: 3, dashArray: undefined as string | undefined, opacity: 0.8 };
  };

  return (
    <MapContainer
      center={[incident.location.lat, incident.location.lng]}
      zoom={14}
      className="w-full h-full z-0"
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />

      <Marker position={[incident.location.lat, incident.location.lng]} icon={customIcon}>
        <Popup className="text-black">
          <strong>{incident.title}</strong><br/>
          {incident.location.desc}<br/>
          Severity: <span className="text-red-600 uppercase text-xs font-bold">{incident.severity}</span><br/>
          Status: <span className="uppercase text-xs font-bold">{incident.status}</span>
        </Popup>
      </Marker>

      {incident.routes.map(route => {
        const style = getRouteStyle(route.type, route.id);
        return (
          <Polyline
            key={route.id}
            positions={route.coordinates}
            color={style.color}
            weight={style.weight}
            dashArray={style.dashArray}
            opacity={style.opacity}
          >
            <Popup className="text-black text-sm">
              <strong>{route.name}</strong><br/>
              Type: {route.type}<br/>
              Congestion: {route.congestionLevel}<br/>
              {route.type === 'diversion' && route.id === 'r2' && (
                <span className={isStratApproved ? 'text-blue-600 font-bold' : 'text-gray-500'}>
                  {isStratApproved ? '✓ ACTIVE — Diversion Live' : 'Pending Approval'}
                </span>
              )}
            </Popup>
          </Polyline>
        );
      })}
    </MapContainer>
  );
}
