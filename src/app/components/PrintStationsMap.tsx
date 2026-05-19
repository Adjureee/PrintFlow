import { Component, type ErrorInfo, type ReactNode } from "react";
import { Clock, Navigation, MapPin, Star } from "lucide-react";
import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DNSC_CENTER, type PrintShop } from "../lib/print-shops";

interface PrintStationsMapProps {
  locations: PrintShop[];
  selectedLocation: PrintShop | null;
  onLocationSelect: (location: PrintShop) => void;
  userLocation?: { lat: number; lng: number } | null;
}

const isValidCoord = (v: unknown): v is number =>
  typeof v === "number" && isFinite(v) && !isNaN(v);

const hasValidCoords = (loc: PrintShop) =>
  isValidCoord(loc.lat) && isValidCoord(loc.lng);

interface EBState {
  hasError: boolean;
}

class MapErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  EBState
> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error, info: ErrorInfo) {
    console.warn("PrintStationsMap error:", err, info);
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function MapController({
  selectedLocation,
  userLocation,
}: {
  selectedLocation: PrintShop | null;
  userLocation?: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    try {
      if (selectedLocation && hasValidCoords(selectedLocation)) {
        map.flyTo([selectedLocation.lat, selectedLocation.lng], 17, {
          duration: 1.5,
        });
      } else if (
        userLocation &&
        isValidCoord(userLocation.lat) &&
        isValidCoord(userLocation.lng)
      ) {
        map.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 1.5 });
      }
    } catch {
      /* swallow Leaflet navigation errors */
    }
  }, [selectedLocation, userLocation, map]);

  return null;
}

function PrintStationsMapInner({
  locations,
  selectedLocation,
  onLocationSelect,
  userLocation,
}: PrintStationsMapProps) {
  const safeLocations = (locations ?? []).filter(hasValidCoords);

  const centerLat = DNSC_CENTER.lat;
  const centerLng = DNSC_CENTER.lng;

  if (!isValidCoord(centerLat) || !isValidCoord(centerLng)) {
    return (
      <div className="flex h-[420px] w-full items-center justify-center rounded-3xl border border-[#80B9B6]/30 bg-white/80 backdrop-blur-md">
        <div className="space-y-2 text-center text-[#80B9B6]">
          <MapPin className="mx-auto h-10 w-10 opacity-40" />
          <p className="text-sm font-medium text-[#002E2C]">Map unavailable</p>
        </div>
      </div>
    );
  }

  const safeUserLocation =
    userLocation &&
    isValidCoord(userLocation.lat) &&
    isValidCoord(userLocation.lng)
      ? userLocation
      : null;

  const createCustomIcon = (location: PrintShop, isSelected: boolean) => {
    const isFlagship = location.tier === "premium";
    let colorClass = "bg-[#00736D]";
    if (location.waitTime > 5) colorClass = "bg-amber-500";
    if (location.waitTime > 10) colorClass = "bg-orange-500";
    const ringClass = isSelected
      ? "ring-4 ring-[#00736D]/40 scale-125"
      : "hover:scale-110";
    const flagshipBadge = isFlagship
      ? `<span class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#002E2C] text-[8px] text-white shadow-md">★</span>`
      : "";

    return L.divIcon({
      className: "custom-div-icon",
      html: `
        <div class="group relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform duration-300 ${colorClass} ${ringClass}">
          ${flagshipBadge}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect width="12" height="8" x="6" y="14"></rect>
          </svg>
          <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-md ${colorClass}">
            ${location.waitTime}m
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -24],
    });
  };

  const userIcon = L.divIcon({
    className: "custom-div-icon",
    html: `
      <div class="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#002E2C] shadow-lg ring-4 ring-[#80B9B6]/50 transition-transform duration-300 hover:scale-110">
        <div class="h-3 w-3 rounded-full bg-white"></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-3xl border border-[#80B9B6]/25 shadow-xl shadow-[#002E2C]/10">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={16}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          selectedLocation={selectedLocation}
          userLocation={safeUserLocation}
        />

        {safeLocations.map((location) => {
          const isSelected = selectedLocation?.id === location.id;
          const isPremium = location.tier === "premium";
          return (
            <Marker
              key={location.id}
              position={[location.lat, location.lng]}
              icon={createCustomIcon(location, isSelected)}
              eventHandlers={{ click: () => onLocationSelect(location) }}
            >
              <Popup className="printflow-popup">
                <div className="min-w-[200px] font-sans">
                  <div className="mb-2 flex items-center gap-2">
                    <h4 className="text-sm font-black text-[#002E2C]">
                      {location.name}
                    </h4>
                    {isPremium && (
                      <span className="rounded-full bg-[#E6F1F0] px-1.5 py-0.5 text-[9px] font-bold text-[#00736D]">
                        Premium
                      </span>
                    )}
                  </div>
                  <div className="mb-2 flex items-center gap-1 text-xs text-[#00736D]">
                    <Clock className="h-3 w-3" />
                    <span className="font-semibold">
                      {location.waitTime} min wait
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        location.status === "online"
                          ? "bg-green-500"
                          : "bg-rose-400"
                      }`}
                    />
                    <span className="font-medium text-[#002E2C]/80">
                      {location.status === "online"
                        ? "Online & Ready"
                        : "Offline"}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {safeUserLocation && (
          <>
            <Marker
              position={[safeUserLocation.lat, safeUserLocation.lng]}
              icon={userIcon}
            >
              <Popup>You are here</Popup>
            </Marker>
            <Circle
              center={[safeUserLocation.lat, safeUserLocation.lng]}
              radius={500}
              pathOptions={{
                fillColor: "#00736D",
                fillOpacity: 0.08,
                color: "#00736D",
                weight: 1.5,
                dashArray: "6 4",
              }}
            />
          </>
        )}
      </MapContainer>

      <div className="pointer-events-none absolute left-4 top-4 z-[1000] rounded-2xl border border-[#80B9B6]/30 bg-white/80 px-3 py-2 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-bold text-[#002E2C]">
          <Star className="h-3.5 w-3.5 fill-[#00736D] text-[#00736D]" />
          <span>DNSC Campus · PrintFlow Hub</span>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 right-4 z-[1000] rounded-2xl border border-[#80B9B6]/30 bg-white/85 p-3 shadow-lg backdrop-blur-md">
        <p className="mb-2 text-xs font-black text-[#002E2C]">Wait Times</p>
        <div className="space-y-1.5">
          {[
            { color: "bg-[#00736D]", label: "≤ 5 min" },
            { color: "bg-amber-500", label: "6–10 min" },
            { color: "bg-orange-500", label: "> 10 min" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <div className={`h-3 w-3 rounded-full ${color}`} />
              <span className="font-medium text-[#002E2C]/70">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {safeUserLocation && (
        <div className="pointer-events-none absolute right-4 top-4 z-[1000] rounded-xl border border-[#80B9B6]/30 bg-white/85 px-3 py-2 shadow-md backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-bold text-[#00736D]">
            <Navigation className="h-3 w-3" />
            <span>Geofence · 500m</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function PrintStationsMap(props: PrintStationsMapProps) {
  const fallback = (
    <div className="flex h-[420px] w-full items-center justify-center rounded-3xl border border-[#80B9B6]/30 bg-[#E6F1F0]/30 backdrop-blur-sm">
      <div className="space-y-2 px-6 text-center">
        <MapPin className="mx-auto h-10 w-10 text-[#80B9B6] opacity-60" />
        <p className="text-sm font-semibold text-[#002E2C]">
          Map could not load
        </p>
        <p className="text-xs text-[#80B9B6]">
          Use the list below to select a partner shop.
        </p>
      </div>
    </div>
  );

  return (
    <MapErrorBoundary fallback={fallback}>
      <PrintStationsMapInner {...props} />
    </MapErrorBoundary>
  );
}
