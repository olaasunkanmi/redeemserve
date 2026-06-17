import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "@tanstack/react-router";
import { Star, MapPin, Navigation } from "lucide-react";

// Fix default icon (Vite bundles assets weirdly)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const REDEMPTION_CITY = { lat: 6.8030, lng: 3.2130 };

type V = {
  id: string;
  business_name: string;
  category: string;
  zone: string;
  status: string;
  rating: number;
  lat: number | null;
  lng: number | null;
};

function statusColor(status: string) {
  if (status === "live") return "#10b981";
  if (status === "low-stock") return "#f59e0b";
  return "#ef4444";
}

function RecenterButton({ vendors }: { vendors: V[] }) {
  const map = useMap();
  function fit() {
    const pts = vendors.filter((v) => v.lat && v.lng).map((v) => [v.lat!, v.lng!] as [number, number]);
    if (pts.length) map.fitBounds(pts as any, { padding: [40, 40] });
    else map.setView(REDEMPTION_CITY, 16);
  }
  return (
    <button
      onClick={fit}
      className="absolute right-3 top-3 z-[400] inline-flex items-center gap-1.5 rounded-full bg-cream/95 px-3 py-1.5 text-xs font-semibold text-emerald-deep shadow-card hover:bg-cream"
    >
      <Navigation className="h-3.5 w-3.5" /> Fit all
    </button>
  );
}

function NearMeButton() {
  const map = useMap();
  const [loading, setLoading] = useState(false);
  function locate() {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 17);
        L.circleMarker([pos.coords.latitude, pos.coords.longitude], { color: "#3b82f6", radius: 8 }).addTo(map);
        setLoading(false);
      },
      () => setLoading(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }
  return (
    <button
      onClick={locate}
      disabled={loading}
      className="absolute right-3 top-12 z-[400] inline-flex items-center gap-1.5 rounded-full bg-cream/95 px-3 py-1.5 text-xs font-semibold text-emerald-deep shadow-card hover:bg-cream disabled:opacity-60"
    >
      <MapPin className="h-3.5 w-3.5" /> {loading ? "Locating…" : "Near me"}
    </button>
  );
}

export function LiveMap({ vendors }: { vendors: V[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div ref={ref} className="aspect-square w-full rounded-2xl bg-emerald-soft/40" />;

  const withCoords = vendors.filter((v) => v.lat && v.lng);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-deep/10 shadow-card" style={{ height: 480 }}>
      <MapContainer center={[REDEMPTION_CITY.lat, REDEMPTION_CITY.lng]} zoom={16} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterButton vendors={vendors} />
        <NearMeButton />
        {withCoords.map((v) => (
          <CircleMarker
            key={v.id}
            center={[v.lat!, v.lng!]}
            radius={10}
            pathOptions={{ color: statusColor(v.status), fillColor: statusColor(v.status), fillOpacity: 0.85, weight: 2 }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-display text-sm font-bold text-emerald-deep">{v.business_name}</p>
                <p className="mt-0.5 text-[11px] text-emerald-deep/60">{v.category} · Zone {v.zone}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-[11px]"><Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {Number(v.rating).toFixed(1)}</p>
                <Link to="/vendor/$id" params={{ id: v.id }} className="mt-2 inline-block text-[11px] font-semibold text-emerald-deep underline">
                  View vendor →
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
