import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { Card } from "@/components/ui/card";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom car icon
const carIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1E3A5F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
      <circle cx="7" cy="17" r="2"/>
      <path d="M9 17h6"/>
      <circle cx="17" cy="17" r="2"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Component to update map center
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function LiveMap({ isActive, onRouteUpdate, onSpeedUpdate, onDistanceUpdate }) {
  const [position, setPosition] = useState(null);
  const [route, setRoute] = useState([]);
  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  const watchIdRef = useRef(null);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (isActive && 'geolocation' in navigator) {
      // Request initial position
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const initialPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            timestamp: new Date().toISOString()
          };
          setPosition([initialPos.lat, initialPos.lng]);
          setRoute([initialPos]);
        },
        (error) => console.error('Initial GPS Error:', error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );

      // Start watching position
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const newPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            timestamp: new Date().toISOString()
          };
          
          setPosition([newPos.lat, newPos.lng]);
          const currentSpeed = pos.coords.speed ? (pos.coords.speed * 3.6).toFixed(0) : 0;
          setSpeed(currentSpeed);
          onSpeedUpdate?.(currentSpeed);
          
          setRoute(prev => {
            // Calculate distance from last point
            if (prev.length > 0) {
              const lastPos = prev[prev.length - 1];
              const dist = calculateDistance(lastPos.lat, lastPos.lng, newPos.lat, newPos.lng);
              setDistance(prevDist => {
                const newDist = prevDist + dist;
                onDistanceUpdate?.(newDist);
                return newDist;
              });
            }
            
            const updated = [...prev, newPos];
            onRouteUpdate?.(updated);
            return updated;
          });
        },
        (error) => {
          console.error('GPS Error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isActive, onRouteUpdate]);

  if (!position) {
    return (
      <Card className="p-6 rounded-3xl text-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-500">Aguardando GPS...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Map */}
      <Card className="overflow-hidden rounded-3xl" style={{ height: '350px' }}>
        <MapContainer
          center={position}
          zoom={18}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Route polyline */}
          {route.length > 1 && (
            <Polyline
              positions={route.map(r => [r.lat, r.lng])}
              color="#3B82F6"
              weight={5}
              opacity={0.8}
            />
          )}
          
          {/* Current position marker */}
          <Marker position={position} icon={carIcon} />
          
          <MapUpdater center={position} />
        </MapContainer>
      </Card>
    </div>
  );
}