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
import { Search, X, MapPin, Clock, Phone, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "The Directory — RedeemServe" },
      {
        name: "description",
        content:
          "A living index of every verified vendor on the Redemption City grounds — food, transport, goods, services, medical and tech.",
      },
      { property: "og:title", content: "The Directory — RedeemServe" },
      {
        property: "og:description",
        content: "Search, filter and find vendors in real time across Redemption City.",
      },
    ],
  }),
  component: Discover,
});

function Discover() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<VendorCategory | "All">("All");
  const [zone, setZone] = useState<"All" | "A" | "B" | "C" | "D">("All");
  const [status, setStatus] = useState<"All" | "live" | "low-stock" | "sold-out">("All");
  const [selected, setSelected] = useState<Vendor | null>(null);

  const filtered = useMemo(() => {
    return VENDORS.filter((v) => {
      if (category !== "All" && v.category !== category) return false;
      if (zone !== "All" && v.zone !== zone) return false;
      if (status !== "All" && v.status !== status) return false;
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
  }, [query, category, zone, status]);

  return (
    <SiteLayout>
      {/* Header */}
      <section className="paper border-b border-emerald-deep/15">
        <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-8 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="kicker">Section II · The Directory</p>
              <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight text-emerald-deep text-balance sm:text-7xl">
                Find a vendor.
                <br />
                <span className="font-italic-serif text-gold">Right this minute.</span>
              </h1>
            </div>
            <p className="text-[15px] leading-7 text-emerald-deep/75 lg:col-span-4">
              Search by name, by zone, by what they sell. Live status updates as vendors
              open, run low or sell out across the grounds.
            </p>
          </div>
          <div className="rule-thick mt-10" />
        </div>
      </section>

      {/* Filter bar */}
      <section className="sticky top-0 z-20 border-b border-emerald-deep/15 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-4 sm:px-8 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-deep/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jollof, water, keke, charger…"
              className="w-full border-b border-emerald-deep/30 bg-transparent py-2 pl-6 pr-3 text-sm outline-none placeholder:text-emerald-deep/40 focus:border-gold"
            />
          </label>
          <FilterSelect value={category} onChange={(v) => setCategory(v as VendorCategory | "All")} options={["All", ...VENDOR_CATEGORIES]} />
          <FilterSelect value={zone} onChange={(v) => setZone(v as typeof zone)} options={["All", "A", "B", "C", "D"]} format={(o) => (o === "All" ? "All zones" : `Zone ${o}`)} />
          <FilterSelect
            value={status}
            onChange={(v) => setStatus(v as typeof status)}
            options={["All", "live", "low-stock", "sold-out"]}
            format={(o) => (o === "All" ? "Any status" : STATUS_META[o as keyof typeof STATUS_META].label)}
          />
        </div>
      </section>

      {/* Body: directory + map */}
      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_440px]">
          <div>
            <div className="mb-6 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-emerald-deep/55">
              <p>
                {filtered.length} {filtered.length === 1 ? "vendor" : "vendors"} match
              </p>
              <p className="hidden sm:block">Click a listing for the full plate</p>
            </div>

            {filtered.length === 0 ? (
              <div className="border-2 border-dashed border-emerald-deep/20 p-12 text-center">
                <p className="font-display text-3xl text-emerald-deep">No matches in this issue.</p>
                <p className="mt-2 text-sm text-emerald-deep/65">
                  Try clearing your search or selecting a different zone.
                </p>
              </div>
            ) : (
              <ul className="divide-y-2 divide-emerald-deep/15">
                {filtered.map((v, i) => (
                  <li key={v.id}>
                    <button
                      onClick={() => setSelected(v)}
                      className="group grid w-full gap-4 py-6 text-left transition-colors hover:bg-emerald-deep/[0.03] sm:grid-cols-[64px_1fr_auto] sm:items-baseline"
                    >
                      <span className="font-display text-3xl tabular text-emerald-deep/35">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="kicker">{v.category} · Zone {v.zone}</p>
                        <h3 className="mt-1 font-display text-3xl leading-tight text-emerald-deep transition-colors group-hover:text-gold">
                          {v.name}
                        </h3>
                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-emerald-deep/75">
                          {v.description}
                        </p>
                        <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] uppercase tracking-[0.2em] text-emerald-deep/55">
                          <span className="flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[v.status].dot} ${v.status === "live" ? "animate-pulse-dot" : ""}`} />
                            {STATUS_META[v.status].label}
                          </span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {v.location}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {v.opensAt}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-2xl text-emerald-deep tabular">★ {v.rating}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-emerald-deep/55">
                          {v.priceRange}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <GroundsMap vendors={filtered} selected={selected} onSelect={setSelected} />
          </aside>
        </div>
      </section>

      {selected && <VendorSheet vendor={selected} onClose={() => setSelected(null)} />}
    </SiteLayout>
  );
}

function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  format,
}: {
  value: T;
  onChange: (v: T) => void;
  options: T[];
  format?: (o: T) => string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="border-b border-emerald-deep/30 bg-transparent py-2 pr-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-deep outline-none focus:border-gold"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {format ? format(o) : o}
        </option>
      ))}
    </select>
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
    <div className="border-2 border-emerald-deep p-4">
      <div className="flex items-baseline justify-between">
        <p className="kicker">Plate · Grounds Map</p>
        <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-emerald-deep">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-gold" />
          Live
        </span>
      </div>

      <div className="relative mt-4 aspect-square w-full overflow-hidden border border-emerald-deep/30 bg-cream">
        <svg className="absolute inset-0 h-full w-full text-emerald-deep/15" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="oklch(0.32 0.06 160 / 0.3)" strokeWidth="0.5" strokeDasharray="2 2" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="oklch(0.32 0.06 160 / 0.3)" strokeWidth="0.5" strokeDasharray="2 2" />
          <rect x="38" y="40" width="24" height="20" fill="oklch(0.32 0.06 160 / 0.1)" stroke="oklch(0.32 0.06 160 / 0.5)" strokeWidth="0.4" />
        </svg>

        <span className="absolute left-2 top-2 border border-emerald-deep/30 bg-cream px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-deep/70">Zone B</span>
        <span className="absolute right-2 top-2 border border-emerald-deep/30 bg-cream px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-deep/70">Zone C</span>
        <span className="absolute bottom-2 left-2 border border-emerald-deep/30 bg-cream px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-deep/70">Zone D</span>
        <span className="absolute bottom-2 right-2 border border-emerald-deep/30 bg-cream px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-deep/70">Zone A</span>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[10px] uppercase tracking-[0.2em] text-emerald-deep/70">
          Main Auditorium
        </span>

        {vendors.map((v) => {
          const isActive = selected?.id === v.id;
          const color = v.status === "live" ? "bg-emerald-deep" : v.status === "low-stock" ? "bg-gold" : "bg-destructive";
          return (
            <button
              key={v.id}
              onClick={() => onSelect(v)}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${v.x}%`, top: `${v.y}%` }}
              aria-label={v.name}
            >
              <span className="relative flex items-center justify-center">
                {v.status === "live" && <span className={`absolute h-5 w-5 rounded-full ${color} opacity-25 animate-ping`} />}
                <span
                  className={`relative border-2 border-cream shadow ${color} ${isActive ? "h-5 w-5 ring-2 ring-gold" : "h-3 w-3 hover:h-4 hover:w-4"} transition-all`}
                  style={{ borderRadius: 0 }}
                />
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.22em] text-emerald-deep/70">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-emerald-deep" /> Open</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-gold" /> Low</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-destructive" /> Sold out</span>
      </div>
    </div>
  );
}

function VendorSheet({ vendor, onClose }: { vendor: Vendor; onClose: () => void }) {
  const status = STATUS_META[vendor.status];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-emerald-deep/50 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="relative w-full max-w-xl border-2 border-emerald-deep bg-cream sm:max-w-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center border border-emerald-deep/30 bg-cream text-emerald-deep hover:bg-emerald-deep hover:text-cream"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="ink-grad p-7 text-cream">
          <p className="text-[10px] uppercase tracking-[0.28em] text-gold">
            Listing · {vendor.category} · Zone {vendor.zone}
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight text-cream">{vendor.name}</h2>
          <p className="mt-2 text-sm text-cream/75">{vendor.location}</p>
        </div>

        <div className="space-y-6 p-7">
          <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em]">
            <span className={`flex items-center gap-1.5 border border-emerald-deep/20 px-3 py-1 ${status.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <span className="flex items-center gap-1.5 border border-emerald-deep/20 px-3 py-1 text-emerald-deep/70">
              <Clock className="h-3 w-3" /> Opens {vendor.opensAt}
            </span>
            <span className="flex items-center gap-1.5 border border-emerald-deep/20 px-3 py-1 text-emerald-deep/70 tabular">
              ★ {vendor.rating}
            </span>
          </div>

          <p className="drop-cap text-[15px] leading-7 text-emerald-deep/85">{vendor.description}</p>

          <div className="grid grid-cols-2 gap-6 border-t-2 border-emerald-deep pt-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-deep/55">Price range</p>
              <p className="mt-1 font-display text-2xl text-emerald-deep">{vendor.priceRange}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-deep/55">Forecast today</p>
              <p className="mt-1 font-display text-2xl text-emerald-deep tabular">
                {vendor.forecast.expectedCustomers.toLocaleString()}
              </p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-deep/55">
                {vendor.forecast.demand} demand
              </p>
            </div>
          </div>

          <div>
            <p className="kicker">Popular items</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {vendor.popularItems.map((i) => (
                <span key={i} className="border border-emerald-deep/25 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-emerald-deep/75">
                  {i}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t-2 border-emerald-deep pt-5">
            <button className="flex items-center justify-center gap-2 border-2 border-emerald-deep bg-emerald-deep py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-cream hover:bg-gold hover:border-gold hover:text-emerald-deep">
              <Phone className="h-3.5 w-3.5" /> Call vendor
            </button>
            <button className="flex items-center justify-center gap-2 border-2 border-emerald-deep py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-deep hover:bg-emerald-deep hover:text-cream">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
