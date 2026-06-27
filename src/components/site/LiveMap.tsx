import { Link } from "@tanstack/react-router";
import { Star, MapPin, ExternalLink } from "lucide-react";

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

// Redemption Camp, Ofada 110113, Ogun State
// https://share.google/p6X58jlIb3IgSfIGU
const PLACE_QUERY = "Redemption Camp, Ofada 110113, Ogun State";
const EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(PLACE_QUERY)}&z=15&output=embed`;
const OPEN_IN_MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(PLACE_QUERY)}`;

function statusMeta(status: string) {
  if (status === "live") return { dot: "bg-emerald-500", label: "Open" };
  if (status === "low-stock") return { dot: "bg-amber-500", label: "Low" };
  return { dot: "bg-rose-500", label: "Sold out" };
}

export function LiveMap({ vendors }: { vendors: V[] }) {
  const top = vendors.slice(0, 8);
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-deep/10 bg-surface shadow-card">
      <div className="relative" style={{ height: 360 }}>
        <iframe
          title="Redemption Camp map"
          src={EMBED_SRC}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <a
          href={OPEN_IN_MAPS}
          target="_blank"
          rel="noreferrer"
          className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-cream/95 px-3 py-1.5 text-xs font-semibold text-emerald-deep shadow-card hover:bg-cream"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Open in Google Maps
        </a>
      </div>
      {top.length > 0 && (
        <div className="border-t border-emerald-deep/10 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-deep/60">
            Nearby vendors at Redemption Camp
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {top.map((v) => {
              const s = statusMeta(v.status);
              return (
                <li key={v.id}>
                  <Link
                    to="/vendor/$id"
                    params={{ id: v.id }}
                    className="flex items-center justify-between gap-3 rounded-xl border border-emerald-deep/10 bg-cream/40 px-3 py-2 hover:bg-emerald-soft/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-emerald-deep">{v.business_name}</p>
                      <p className="truncate text-[11px] text-emerald-deep/60">
                        {v.category} · Zone {v.zone}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-[11px] text-emerald-deep/70">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {Number(v.rating).toFixed(1)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} /> {s.label}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          <a
            href={OPEN_IN_MAPS}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-deep hover:text-gold"
          >
            <MapPin className="h-3.5 w-3.5" /> Get directions to Redemption Camp →
          </a>
        </div>
      )}
    </div>
  );
}
