import { Component, type ErrorInfo, type ReactNode } from 'react';
import { type PrintLocation } from '../lib/store';
import { Clock, Navigation, MapPin } from 'lucide-react';
import { Card } from './ui/card';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PrintStationsMapProps {
  locations: PrintLocation[];
  selectedLocation: PrintLocation | null;
  onLocationSelect: (location: PrintLocation) => void;
  userLocation?: { lat: number, lng: number } | null;
}

// Helper: strictly validate a coordinate value
const isValidCoord = (v: unknown): v is number =>
  typeof v === 'number' && isFinite(v) && !isNaN(v);

// Helper: check that a location has safe lat/lng
const hasValidCoords = (loc: PrintLocation) =>
  isValidCoord(loc.lat) && isValidCoord(loc.lng);

// ─── Error Boundary ──────────────────────────────────────────────────────────
interface EBState { hasError: boolean }
class MapErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, EBState> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: Error, info: ErrorInfo) { console.warn('PrintStationsMap error:', err, info); }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

// ─── Map controller ──────────────────────────────────────────────────────────
function MapController({
  selectedLocation,
  userLocation,
}: {
  selectedLocation: PrintLocation | null;
  userLocation?: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    try {
      if (selectedLocation && hasValidCoords(selectedLocation)) {
        map.flyTo([selectedLocation.lat, selectedLocation.lng], 17, { duration: 1.5 });
      } else if (
        userLocation &&
        isValidCoord(userLocation.lat) &&
        isValidCoord(userLocation.lng)
      ) {
        map.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 1.5 });
      }
    } catch (_) {
      // Swallow any internal Leaflet navigation errors
    }
  }, [selectedLocation, userLocation, map]);

  return null;
}

// ─── Main component ──────────────────────────────────────────────────────────
function PrintStationsMapInner({
  locations,
  selectedLocation,
  onLocationSelect,
  userLocation,
}: PrintStationsMapProps) {
  // Only render markers for locations with valid coordinates
  const safeLocations = (locations ?? []).filter(hasValidCoords);

  // Compute a safe center
  const lats = safeLocations.map((l) => l.lat);
  const lngs = safeLocations.map((l) => l.lng);
  const centerLat =
    lats.length > 0
      ? lats.reduce((a, b) => a + b, 0) / lats.length
      : 7.3013;
  const centerLng =
    lngs.length > 0
      ? lngs.reduce((a, b) => a + b, 0) / lngs.length
      : 125.6806;

  // Final safety guard — if somehow still NaN, bail out
  if (!isValidCoord(centerLat) || !isValidCoord(centerLng)) {
    return (
      <Card className="flex items-center justify-center w-full h-[400px] border-2">
        <div className="text-center text-gray-500 space-y-2">
          <MapPin className="w-10 h-10 mx-auto opacity-40" />
          <p className="text-sm font-medium">Map unavailable</p>
        </div>
      </Card>
    );
  }

  const safeUserLocation =
    userLocation &&
    isValidCoord(userLocation.lat) &&
    isValidCoord(userLocation.lng)
      ? userLocation
      : null;

  const createCustomIcon = (location: PrintLocation, isSelected: boolean) => {
    let colorClass = 'bg-green-500';
    if (location.waitTime > 5) colorClass = 'bg-yellow-500';
    if (location.waitTime > 10) colorClass = 'bg-orange-500';
    const ringClass = isSelected ? 'ring-4 ring-blue-500/50 scale-125' : '';

    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-white shadow-lg ${colorClass} ${ringClass} transition-transform duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect width="12" height="8" x="6" y="14"></rect>
          </svg>
          <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white whitespace-nowrap shadow-md ${colorClass}">
            ${location.waitTime}m
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });
  };

  const userIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg bg-blue-600 ring-4 ring-blue-300">
        <div class="w-3 h-3 bg-white rounded-full"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <Card className="relative w-full h-[400px] overflow-hidden shadow-lg border-2 z-0">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={16}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController selectedLocation={selectedLocation} userLocation={safeUserLocation} />

        {/* Render Locations */}
        {safeLocations.map((location) => {
          const isSelected = selectedLocation?.id === location.id;
          return (
            <Marker
              key={location.id}
              position={[location.lat, location.lng]}
              icon={createCustomIcon(location, isSelected)}
              eventHandlers={{ click: () => onLocationSelect(location) }}
            >
              <Popup className="custom-popup">
                <div className="font-sans min-w-[180px]">
                  <h4 className="font-bold text-sm text-gray-900">{location.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-gray-600 mt-1 mb-2">
                    <Clock className="w-3 h-3" />
                    <span>{location.waitTime} min wait</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        location.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                    <span className="text-gray-700">
                      {location.status === 'online' ? 'Online & Ready' : 'Offline'}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* User Location & Geofence */}
        {safeUserLocation && (
          <>
            <Marker position={[safeUserLocation.lat, safeUserLocation.lng]} icon={userIcon}>
              <Popup>You are here</Popup>
            </Marker>
            <Circle
              center={[safeUserLocation.lat, safeUserLocation.lng]}
              radius={500}
              pathOptions={{
                fillColor: '#00736D',
                fillOpacity: 0.1,
                color: '#00736D',
                weight: 1,
              }}
            />
          </>
        )}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border-2 border-gray-200 z-[1000] pointer-events-none">
        <p className="text-xs font-semibold text-gray-700 mb-2">Partner Shops</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600">≤ 5 min</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-600">6-10 min</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-gray-600">&gt; 10 min</span>
          </div>
        </div>
      </div>

      {safeUserLocation && (
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border-2 border-blue-200 z-[1000] pointer-events-none">
          <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
            <Navigation className="w-3 h-3" />
            <span>Geofence Active (500m)</span>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Public export wrapped in error boundary ─────────────────────────────────
export function PrintStationsMap(props: PrintStationsMapProps) {
  const fallback = (
    <Card className="flex items-center justify-center w-full h-[400px] border-2 bg-[#E6F1F0]/30">
      <div className="text-center text-[#80B9B6] space-y-2 px-6">
        <MapPin className="w-10 h-10 mx-auto opacity-60" />
        <p className="text-sm font-semibold text-[#002E2C]">Map could not load</p>
        <p className="text-xs text-gray-500">Use the list below to select a partner shop.</p>
      </div>
    </Card>
  );

  return (
    <MapErrorBoundary fallback={fallback}>
      <PrintStationsMapInner {...props} />
    </MapErrorBoundary>
  );
}
