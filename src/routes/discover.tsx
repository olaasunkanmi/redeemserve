import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import {
  VENDORS,
  VENDOR_CATEGORIES,
  ZONES,
  STATUS_META,
  type Vendor,
  type VendorCategory,
} from "@/lib/vendors";
import { MapPin, Search, Star, Clock, Phone, X, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover Vendors — RedeemServe" },
      {
        name: "description",
        content:
          "Browse a live, searchable directory of every vendor active on the Redemption City grounds — food, transport, goods, services and more.",
      },
      { property: "og:title", content: "Live Vendor Directory — RedeemServe" },
      {
        property: "og:description",
        content: "Find food, transport, goods and services across Redemption City in real time.",
      },
    ],
  }),
  component: Discover,
});

function Discover() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<VendorCategory | "All">("All");
  const [zone, setZone] = useState<"All" | "A" | "B" | "C" | "D">("All");
  const [selected, setSelected] = useState<Vendor | null>(null);

  const filtered = useMemo(() => {
    return VENDORS.filter((v) => {
      if (category !== "All" && v.category !== category) return false;
      if (zone !== "All" && v.zone !== zone) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !v.name.toLowerCase().includes(q) &&
          !v.description.toLowerCase().includes(q) &&
          !v.popularItems.some((i) => i.toLowerCase().includes(q))
        )
          return false;
      }
      return true;
    });
  }, [query, category, zone]);

  return (
    <SiteLayout>
      <section className="border-b border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Live directory</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Find a vendor at Redemption City
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Search by name, category or zone. Status updates in real time as vendors open,
            run low or sell out.
          </p>

          <div className="mt-8 grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:grid-cols-[1fr_auto_auto]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search jollof, water, keke, charger…"
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:border-ring"
              />
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as VendorCategory | "All")}
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring"
            >
              <option value="All">All categories</option>
              {VENDOR_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value as typeof zone)}
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring"
            >
              <option value="All">All zones</option>
              {ZONES.map((z) => (
                <option key={z.id} value={z.id}>{z.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
        <div>
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <p>{filtered.length} {filtered.length === 1 ? "vendor" : "vendors"} found</p>
            <p className="hidden sm:block">Tap a card for details</p>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
              <p className="font-display text-xl font-semibold">No vendors match your filters</p>
              <p className="mt-2 text-sm text-muted-foreground">Try clearing search or selecting a different zone.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((v) => (
                <VendorCard key={v.id} vendor={v} onSelect={() => setSelected(v)} />
              ))}
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <GroundsMap vendors={filtered} selected={selected} onSelect={setSelected} />
        </aside>
      </section>

      {selected && <VendorSheet vendor={selected} onClose={() => setSelected(null)} />}
    </SiteLayout>
  );
}

function VendorCard({ vendor, onSelect }: { vendor: Vendor; onSelect: () => void }) {
  const status = STATUS_META[vendor.status];
  return (
    <button
      onClick={onSelect}
      className="group rounded-3xl border border-border bg-card p-5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-elev"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
          {vendor.category}
        </span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.bg} ${status.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot} ${vendor.status === "live" ? "animate-pulse-dot" : ""}`} />
          {status.label}
        </span>
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold leading-tight text-foreground">{vendor.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{vendor.description}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Zone {vendor.zone}</span>
        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {vendor.opensAt}</span>
        <span className="inline-flex items-center gap-1 text-amber-600"><Star className="h-3.5 w-3.5 fill-current" /> {vendor.rating}</span>
      </div>
    </button>
  );
}

function GroundsMap({
  vendors,
  selected,
  onSelect,
}: {
  vendors: Vendor[];
  selected: Vendor | null;
  onSelect: (v: Vendor) => void;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Grounds map</p>
          <p className="font-display text-lg font-semibold">Redemption City</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
          Live
        </span>
      </div>

      <div className="relative mt-4 aspect-square w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-secondary/60 to-background">
        {/* schematic ground references */}
        <svg className="absolute inset-0 h-full w-full text-border" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          {/* roads */}
          <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.6" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.6" />
          {/* auditorium */}
          <rect x="38" y="40" width="24" height="20" rx="2" fill="oklch(0.36 0.06 155 / 0.12)" stroke="oklch(0.36 0.06 155 / 0.4)" strokeWidth="0.4" />
        </svg>

        {/* zone labels */}
        <span className="absolute left-3 top-3 rounded-md bg-background/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Zone B · North Gate</span>
        <span className="absolute right-3 top-3 rounded-md bg-background/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Zone C · Family Camp</span>
        <span className="absolute bottom-3 left-3 rounded-md bg-background/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Zone D · South Parking</span>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-wider text-primary/80">Main Auditorium</span>

        {vendors.map((v) => {
          const isActive = selected?.id === v.id;
          const color =
            v.status === "live"
              ? "bg-emerald-500"
              : v.status === "low-stock"
                ? "bg-amber-500"
                : "bg-rose-500";
          return (
            <button
              key={v.id}
              onClick={() => onSelect(v)}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${v.x}%`, top: `${v.y}%` }}
              aria-label={v.name}
            >
              <span className="relative flex items-center justify-center">
                {v.status === "live" && (
                  <span className={`absolute h-5 w-5 rounded-full ${color} opacity-30 animate-ping`} />
                )}
                <span
                  className={`relative grid place-items-center rounded-full border-2 border-white shadow-md transition-transform ${color} ${
                    isActive ? "h-5 w-5 scale-110 ring-2 ring-accent" : "h-3.5 w-3.5 hover:scale-125"
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Open</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Low stock</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Sold out</span>
      </div>
    </div>
  );
}

function VendorSheet({ vendor, onClose }: { vendor: Vendor; onClose: () => void }) {
  const status = STATUS_META[vendor.status];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="relative w-full max-w-lg overflow-hidden rounded-t-3xl border border-border bg-card shadow-elev sm:rounded-3xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="gradient-warm p-6 text-cream">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/15 px-2.5 py-1 text-xs font-medium">
            {vendor.category}
          </span>
          <h2 className="mt-3 font-display text-2xl font-semibold leading-tight">{vendor.name}</h2>
          <p className="mt-1 text-sm text-cream/80">{vendor.location}</p>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.bg} ${status.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
              <Clock className="h-3 w-3" /> Opens {vendor.opensAt}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
              <Star className="h-3 w-3 fill-current" /> {vendor.rating}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">{vendor.description}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Price range</p>
              <p className="mt-1 font-display text-lg font-semibold">{vendor.priceRange}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Forecast today</p>
              <p className="mt-1 font-display text-lg font-semibold">
                {vendor.forecast.expectedCustomers.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{vendor.forecast.demand} demand</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Popular items</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {vendor.popularItems.map((i) => (
                <span key={i} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">{i}</span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
              <Phone className="h-4 w-4" /> Call vendor
            </button>
            <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
