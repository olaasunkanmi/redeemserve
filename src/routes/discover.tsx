import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import {
  VENDOR_CATEGORIES, STATUS_META,
  type Vendor, type VendorCategory,
} from "@/lib/vendors";
import {
  Search, X, MapPin, Clock, Phone, MessageCircle, Star,
  Utensils, Bus, ShoppingBag, Wrench, HeartPulse, Smartphone, Store, SlidersHorizontal,
} from "lucide-react";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Browse vendors — RedeemServe" },
      { name: "description", content: "Search every verified vendor at Redemption City — food, transport, goods, services, medical and tech." },
      { property: "og:title", content: "Browse vendors — RedeemServe" },
    ],
  }),
  component: Discover,
});

const CATEGORY_ICONS: Record<string, any> = {
  "Food & Drinks": Utensils, Transport: Bus, Goods: ShoppingBag,
  Services: Wrench, Medical: HeartPulse, "Tech & Phones": Smartphone,
};

function Discover() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<VendorCategory | "All">("All");
  const [zone, setZone] = useState<"All" | "A" | "B" | "C" | "D">("All");
  const [status, setStatus] = useState<"All" | "live" | "low-stock" | "sold-out">("All");
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [view, setView] = useState<"grid" | "map">("grid");

  useEffect(() => {
    supabase.from("vendors").select("*")
      .order("verified", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        setVendors(data.map((d: any) => ({
          id: d.id, name: d.business_name, category: d.category as VendorCategory,
          description: d.description, location: d.location || `Zone ${d.zone}`,
          zone: d.zone as Vendor["zone"], x: d.pos_x, y: d.pos_y,
          status: (d.status === "closed" ? "sold-out" : d.status) as Vendor["status"],
          rating: Number(d.rating), popularItems: d.popular_items || [],
          priceRange: d.price_range,
          forecast: { demand: (d.demand as any) || "Medium", expectedCustomers: d.expected_customers },
          opensAt: d.opens_at,
        })));
      });
  }, []);

  const filtered = useMemo(() => vendors.filter((v) => {
    if (category !== "All" && v.category !== category) return false;
    if (zone !== "All" && v.zone !== zone) return false;
    if (status !== "All" && v.status !== status) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!v.name.toLowerCase().includes(q) && !v.description.toLowerCase().includes(q)
        && !v.popularItems.some((i) => i.toLowerCase().includes(q))) return false;
    }
    return true;
  }), [vendors, query, category, zone, status]);

  return (
    <SiteLayout>
      {/* Header */}
      <section className="border-b border-emerald-deep/10 bg-emerald-soft/40">
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8 sm:py-12">
          <h1 className="font-display text-3xl font-extrabold text-emerald-deep sm:text-4xl">Browse vendors</h1>
          <p className="mt-2 max-w-2xl text-sm text-emerald-deep/65">
            {vendors.length} verified vendors across Redemption City. Search by name, item or zone — see who's open right now.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="sticky top-16 z-30 border-b border-emerald-deep/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-4 sm:px-8 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-deep/50" />
            <input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jollof, water, keke, charger…"
              className="w-full rounded-full border border-emerald-deep/15 bg-surface py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-emerald-deep/40 focus:border-emerald focus:ring-2 focus:ring-emerald/20"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={category} onChange={(v) => setCategory(v as any)} options={["All", ...VENDOR_CATEGORIES]} />
            <Select value={zone} onChange={(v) => setZone(v as any)} options={["All", "A", "B", "C", "D"]} format={(o) => o === "All" ? "All zones" : `Zone ${o}`} />
            <Select value={status} onChange={(v) => setStatus(v as any)} options={["All", "live", "low-stock", "sold-out"]} format={(o) => o === "All" ? "Any status" : STATUS_META[o as keyof typeof STATUS_META].label} />
            <div className="ml-auto inline-flex rounded-full border border-emerald-deep/15 bg-surface p-0.5 text-xs font-semibold">
              <button onClick={() => setView("grid")} className={`rounded-full px-3 py-1.5 ${view === "grid" ? "bg-emerald-deep text-cream" : "text-emerald-deep/60"}`}>Grid</button>
              <button onClick={() => setView("map")} className={`rounded-full px-3 py-1.5 ${view === "map" ? "bg-emerald-deep text-cream" : "text-emerald-deep/60"}`}>Map</button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8">
        {view === "grid" ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              <p className="mb-5 text-sm text-emerald-deep/60">
                {filtered.length} {filtered.length === 1 ? "vendor" : "vendors"} found
              </p>
              {filtered.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  {filtered.map((v) => <VendorCard key={v.id} v={v} onOpen={() => setSelected(v)} />)}
                </div>
              )}
            </div>
            <aside className="lg:sticky lg:top-36 lg:self-start">
              <GroundsMap vendors={filtered} selected={selected} onSelect={setSelected} />
            </aside>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <ul className="max-h-[70vh] space-y-3 overflow-auto pr-2">
              {filtered.map((v) => (
                <li key={v.id}>
                  <button onClick={() => setSelected(v)} className="flex w-full items-start gap-3 rounded-2xl border border-emerald-deep/10 bg-surface p-4 text-left hover:border-emerald-deep/30">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-soft text-emerald-deep">
                      {(() => { const I = CATEGORY_ICONS[v.category] ?? Store; return <I className="h-5 w-5" />; })()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-emerald-deep">{v.name}</p>
                      <p className="text-xs text-emerald-deep/60">{v.category} · Zone {v.zone}</p>
                    </div>
                    <StatusPill status={v.status} />
                  </button>
                </li>
              ))}
            </ul>
            <GroundsMap vendors={filtered} selected={selected} onSelect={setSelected} />
          </div>
        )}
      </section>

      {selected && <VendorSheet vendor={selected} onClose={() => setSelected(null)} />}
    </SiteLayout>
  );
}

function StatusPill({ status }: { status: Vendor["status"] }) {
  const s = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} /> {s.label}
    </span>
  );
}

function VendorCard({ v, onOpen }: { v: Vendor; onOpen: () => void }) {
  const Icon = CATEGORY_ICONS[v.category] ?? Store;
  return (
    <button onClick={onOpen} className="group rounded-2xl border border-emerald-deep/10 bg-surface p-5 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-soft text-emerald-deep">
          <Icon className="h-5 w-5" />
        </span>
        <StatusPill status={v.status} />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-emerald-deep group-hover:text-emerald">{v.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-emerald-deep/65">{v.description}</p>
      {v.popularItems.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {v.popularItems.slice(0, 3).map((i) => (
            <span key={i} className="rounded-full bg-emerald-soft px-2.5 py-1 text-[11px] text-emerald-deep/75">{i}</span>
          ))}
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-emerald-deep/65">
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-deep"><Star className="h-3.5 w-3.5 fill-gold text-gold" /> {v.rating.toFixed(1)}</span>
        <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {v.location}</span>
        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {v.opensAt}</span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-emerald-deep/10 pt-3">
        <span className="text-sm font-semibold text-emerald-deep">{v.priceRange}</span>
        <span className="text-xs font-semibold text-emerald group-hover:text-gold">View →</span>
      </div>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-emerald-deep/15 bg-surface p-12 text-center">
      <SlidersHorizontal className="mx-auto h-8 w-8 text-emerald-deep/40" />
      <p className="mt-4 font-display text-xl font-bold text-emerald-deep">No vendors match</p>
      <p className="mt-1 text-sm text-emerald-deep/60">Try clearing your search or selecting a different category.</p>
    </div>
  );
}

function Select<T extends string>({ value, onChange, options, format }: {
  value: T; onChange: (v: T) => void; options: T[]; format?: (o: T) => string;
}) {
  return (
    <select
      value={value} onChange={(e) => onChange(e.target.value as T)}
      className="rounded-full border border-emerald-deep/15 bg-surface px-3 py-2 text-xs font-semibold text-emerald-deep outline-none focus:border-emerald"
    >
      {options.map((o) => <option key={o} value={o}>{format ? format(o) : o}</option>)}
    </select>
  );
}

function GroundsMap({ vendors, selected, onSelect }: {
  vendors: Vendor[]; selected: Vendor | null; onSelect: (v: Vendor) => void;
}) {
  return (
    <div className="rounded-2xl border border-emerald-deep/10 bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-emerald-deep">Grounds map</p>
        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-deep/60">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-emerald-500" /> Live
        </span>
      </div>
      <div className="relative mt-3 aspect-square w-full overflow-hidden rounded-xl border border-emerald-deep/10 bg-emerald-soft/40">
        <svg className="absolute inset-0 h-full w-full text-emerald-deep/15" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          <rect x="38" y="40" width="24" height="20" fill="oklch(0.32 0.06 160 / 0.12)" stroke="oklch(0.32 0.06 160 / 0.5)" strokeWidth="0.4" rx="1" />
        </svg>
        {(["A","B","C","D"] as const).map((z, i) => (
          <span key={z} className="absolute rounded-md bg-surface/90 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-deep/70" style={{
            top: i < 2 ? 8 : "auto", bottom: i >= 2 ? 8 : "auto",
            left: i % 2 === 0 ? 8 : "auto", right: i % 2 === 1 ? 8 : "auto",
          }}>Zone {z}</span>
        ))}
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-wider text-emerald-deep/70">Main Auditorium</span>
        {vendors.map((v) => {
          const isActive = selected?.id === v.id;
          const color = v.status === "live" ? "bg-emerald-500" : v.status === "low-stock" ? "bg-amber-500" : "bg-rose-500";
          return (
            <button key={v.id} onClick={() => onSelect(v)}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${v.x}%`, top: `${v.y}%` }} aria-label={v.name}>
              <span className="relative flex items-center justify-center">
                {v.status === "live" && <span className={`absolute h-5 w-5 rounded-full ${color} opacity-30 animate-ping`} />}
                <span className={`relative rounded-full border-2 border-surface shadow ${color} ${isActive ? "h-5 w-5 ring-2 ring-gold" : "h-3 w-3 hover:h-4 hover:w-4"} transition-all`} />
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-emerald-deep/70">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Open</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Low</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Sold out</span>
      </div>
    </div>
  );
}

function VendorSheet({ vendor, onClose }: { vendor: Vendor; onClose: () => void }) {
  const status = STATUS_META[vendor.status];
  const Icon = CATEGORY_ICONS[vendor.category] ?? Store;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-emerald-deep/40 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div className="relative w-full max-w-xl rounded-t-3xl bg-surface sm:max-w-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-emerald-deep/15 bg-surface text-emerald-deep hover:bg-emerald-soft" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
        <div className="rounded-t-3xl bg-emerald-deep p-6 text-cream sm:rounded-t-3xl">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-cream/10 text-gold">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gold">{vendor.category} · Zone {vendor.zone}</p>
              <h2 className="mt-1 font-display text-2xl font-extrabold">{vendor.name}</h2>
              <p className="mt-1 text-sm text-cream/70">{vendor.location}</p>
            </div>
          </div>
        </div>
        <div className="space-y-5 p-6">
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.bg} ${status.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} /> {status.label}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-soft px-3 py-1 text-xs text-emerald-deep"><Clock className="h-3 w-3" /> Opens {vendor.opensAt}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-soft px-3 py-1 text-xs text-emerald-deep"><Star className="h-3 w-3 fill-gold text-gold" /> {vendor.rating.toFixed(1)}</span>
          </div>
          <p className="text-sm leading-7 text-emerald-deep/85">{vendor.description}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-emerald-soft/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-deep/60">Price range</p>
              <p className="mt-1 font-display text-xl font-bold text-emerald-deep">{vendor.priceRange}</p>
            </div>
            <div className="rounded-xl bg-emerald-soft/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-deep/60">Forecast today</p>
              <p className="mt-1 font-display text-xl font-bold text-emerald-deep tabular">{vendor.forecast.expectedCustomers.toLocaleString()}</p>
              <p className="text-xs text-emerald-deep/60">{vendor.forecast.demand} demand</p>
            </div>
          </div>
          {vendor.popularItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-deep/60">Popular items</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {vendor.popularItems.map((i) => (
                  <span key={i} className="rounded-full bg-emerald-soft px-2.5 py-1 text-xs text-emerald-deep">{i}</span>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-deep py-3 text-sm font-semibold text-cream hover:bg-emerald">
              <Phone className="h-4 w-4" /> Call vendor
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-deep py-3 text-sm font-semibold text-emerald-deep hover:bg-emerald-deep hover:text-cream">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
