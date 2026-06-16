import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_META, VENDOR_CATEGORIES } from "@/lib/vendors";
import {
  Search, MapPin, Star, ArrowRight, Utensils, Bus, ShoppingBag,
  Wrench, HeartPulse, Smartphone, Store, ShieldCheck, BarChart3,
  MessageCircle, Clock,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RedeemServe — Multivendor marketplace for Redemption City" },
      { name: "description", content: "Browse food, transport, goods, services and medical vendors at Redemption City. Live availability, ratings and WhatsApp ordering for the Holy Ghost Service." },
      { property: "og:title", content: "RedeemServe — Find any vendor at Redemption City" },
      { property: "og:description", content: "The official multivendor marketplace for the Holy Ghost Service and RCCG Convention." },
    ],
  }),
  component: Home,
});

const CATEGORY_ICONS: Record<string, any> = {
  "Food & Drinks": Utensils,
  Transport: Bus,
  Goods: ShoppingBag,
  Services: Wrench,
  Medical: HeartPulse,
  "Tech & Phones": Smartphone,
};

type V = {
  id: string; business_name: string; category: string; zone: string; description: string;
  price_range: string; rating: number; status: string; popular_items: string[]; opens_at: string;
};

function Home() {
  const [vendors, setVendors] = useState<V[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase.from("vendors").select("*").order("verified", { ascending: false })
      .order("rating", { ascending: false }).limit(60)
      .then(({ data }) => setVendors((data as any) ?? []));
  }, []);

  const counts: Record<string, number> = {};
  vendors.forEach((v) => { counts[v.category] = (counts[v.category] ?? 0) + 1; });
  const featured = vendors.slice(0, 6);
  const liveCount = vendors.filter((v) => v.status === "live").length;

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="hero-gradient text-cream">
        <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-8 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/10 px-3 py-1 text-xs font-medium text-cream backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-gold" />
                {liveCount > 0 ? `${liveCount} vendors live on the grounds` : "Live vendor marketplace"}
              </span>
              <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-6xl">
                Find any vendor at Redemption City — in seconds.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-cream/80">
                RedeemServe is the multivendor marketplace for the Holy Ghost
                Service and RCCG Convention. Search verified food sellers, transport
                operators, traders and services with live availability and WhatsApp
                ordering.
              </p>

              <form
                action="/discover"
                className="mt-8 flex items-center gap-2 rounded-2xl bg-surface p-2 shadow-card"
              >
                <div className="flex flex-1 items-center gap-3 pl-3">
                  <Search className="h-5 w-5 text-emerald-deep/50" />
                  <input
                    name="q"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Try ‘jollof’, ‘sachet water’, ‘keke to Mowe’…"
                    className="w-full bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-emerald-deep/40"
                  />
                </div>
                <Link
                  to="/discover"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-deep px-5 text-sm font-semibold text-cream hover:bg-emerald"
                >
                  Search <ArrowRight className="h-4 w-4" />
                </Link>
              </form>

              <div className="mt-5 flex flex-wrap gap-2">
                {VENDOR_CATEGORIES.slice(0, 4).map((c) => (
                  <Link
                    key={c}
                    to="/discover"
                    className="rounded-full border border-cream/20 bg-cream/5 px-3 py-1.5 text-xs font-medium text-cream/85 hover:border-gold hover:text-gold"
                  >
                    {c}
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Tile big label="Vendors on the platform" value={vendors.length.toString()} sub="and growing every service" />
                <Tile label="Avg. arrival" value="500k+" sub="per Holy Ghost Service" />
                <Tile label="Live now" value={liveCount.toString()} sub="open on the grounds" />
                <Tile label="Categories" value={Object.keys(counts).length || VENDOR_CATEGORIES.length + ""} sub="food · transport · goods…" />
              </div>
              <div className="mt-4 rounded-2xl border border-cream/15 bg-cream/5 p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-wider text-gold">Live now</p>
                <ul className="mt-3 space-y-2.5">
                  {(vendors.filter((v) => v.status === "live").slice(0, 3).length
                    ? vendors.filter((v) => v.status === "live").slice(0, 3)
                    : featured.slice(0, 3)
                  ).map((v) => (
                    <li key={v.id} className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2 truncate">
                        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-emerald-400" />
                        <span className="truncate font-medium text-cream">{v.business_name}</span>
                      </div>
                      <span className="shrink-0 text-xs text-cream/60">Zone {v.zone}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-extrabold text-emerald-deep">Shop by category</h2>
            <p className="mt-2 text-sm text-emerald-deep/65">Six categories cover every need on the grounds.</p>
          </div>
          <Link to="/discover" className="hidden text-sm font-semibold text-emerald-deep hover:text-gold sm:inline-flex">
            View all →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {VENDOR_CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICONS[c] ?? Store;
            return (
              <Link
                key={c}
                to="/discover"
                className="group rounded-2xl border border-emerald-deep/10 bg-surface p-5 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-soft text-emerald-deep transition-colors group-hover:bg-emerald-deep group-hover:text-cream">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-semibold text-emerald-deep">{c}</p>
                <p className="mt-1 text-xs text-emerald-deep/55">
                  {counts[c] ?? 0} {(counts[c] ?? 0) === 1 ? "vendor" : "vendors"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURED VENDORS */}
      <section className="bg-emerald-soft/50">
        <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-extrabold text-emerald-deep">Featured vendors</h2>
              <p className="mt-2 text-sm text-emerald-deep/65">Verified, top-rated and ready for the next service.</p>
            </div>
            <Link to="/discover" className="text-sm font-semibold text-emerald-deep hover:text-gold">View directory →</Link>
          </div>

          {featured.length === 0 ? (
            <div className="mt-8 rounded-2xl border-2 border-dashed border-emerald-deep/15 bg-surface p-10 text-center">
              <p className="text-sm text-emerald-deep/65">No vendors yet. Be the first to list your business.</p>
              <Link to="/dashboard" className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-deep px-4 py-2 text-sm font-semibold text-cream hover:bg-emerald">
                Become a vendor <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((v) => <VendorCard key={v.id} v={v} />)}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <Panel
            title="For attendees"
            color="emerald"
            cta={{ label: "Browse vendors", to: "/discover" }}
            steps={[
              { icon: Search, t: "Search what you need", b: "Food, water, transport, charging, medical — all in one directory." },
              { icon: MapPin, t: "See live availability", b: "Open, low stock or sold out — updated in real time across the grounds." },
              { icon: MessageCircle, t: "Order on WhatsApp", b: "Call or message the vendor directly. No accounts required to buy." },
            ]}
          />
          <Panel
            title="For vendors"
            color="gold"
            cta={{ label: "Start selling", to: "/dashboard" }}
            steps={[
              { icon: Store, t: "Create your storefront", b: "List your business, items and price range in under three minutes." },
              { icon: BarChart3, t: "Get demand forecasts", b: "AI-projected customer counts and peak hours, trained on RCCG patterns." },
              { icon: ShieldCheck, t: "Earn a verified badge", b: "Build trust and unlock priority placement in the directory." },
            ]}
          />
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-8">
        <div className="overflow-hidden rounded-3xl bg-emerald-deep p-10 text-cream sm:p-14">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
                A city of 2 million worshippers.<br />One marketplace to serve them.
              </h2>
              <p className="mt-3 max-w-xl text-cream/75">
                Whether you sell jollof, run a shuttle, or fix phones — list once,
                reach every attendee at the next Holy Ghost Service.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-emerald-deep hover:opacity-90">
                Open vendor portal <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/discover" className="inline-flex items-center gap-2 rounded-full border border-cream/30 px-6 py-3 text-sm font-semibold text-cream hover:bg-cream/10">
                Browse vendors
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Tile({ label, value, sub, big }: { label: string; value: string; sub?: string; big?: boolean }) {
  return (
    <div className={`rounded-2xl border border-cream/15 bg-cream/5 p-5 backdrop-blur ${big ? "row-span-1" : ""}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-gold">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold text-cream tabular">{value}</p>
      {sub && <p className="mt-1 text-xs text-cream/60">{sub}</p>}
    </div>
  );
}

function VendorCard({ v }: { v: V }) {
  const status = STATUS_META[(v.status === "closed" ? "sold-out" : v.status) as keyof typeof STATUS_META];
  const Icon = CATEGORY_ICONS[v.category] ?? Store;
  return (
    <Link
      to="/discover"
      className="group rounded-2xl border border-emerald-deep/10 bg-surface p-5 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-soft text-emerald-deep">
          <Icon className="h-5 w-5" />
        </span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${status?.bg ?? "bg-emerald-50"} ${status?.text ?? "text-emerald-700"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${status?.dot ?? "bg-emerald-500"}`} />
          {status?.label ?? v.status}
        </span>
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-emerald-deep group-hover:text-emerald">{v.business_name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-emerald-deep/65">{v.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-emerald-deep/65">
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-deep"><Star className="h-3.5 w-3.5 fill-gold text-gold" /> {Number(v.rating).toFixed(1)}</span>
        <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Zone {v.zone}</span>
        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {v.opens_at}</span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-emerald-deep/10 pt-3 text-sm">
        <span className="font-semibold text-emerald-deep">{v.price_range || "—"}</span>
        <span className="text-xs font-semibold text-emerald group-hover:text-gold">View →</span>
      </div>
    </Link>
  );
}

function Panel({ title, color, steps, cta }: {
  title: string; color: "emerald" | "gold";
  steps: { icon: any; t: string; b: string }[];
  cta: { label: string; to: string };
}) {
  return (
    <div className="rounded-3xl border border-emerald-deep/10 bg-surface p-8 shadow-card">
      <div className="flex items-center gap-3">
        <span className={`inline-block h-2 w-2 rounded-full ${color === "gold" ? "bg-gold" : "bg-emerald"}`} />
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-deep/70">{title}</p>
      </div>
      <h3 className="mt-3 font-display text-3xl font-extrabold text-emerald-deep">
        {title === "For vendors" ? "Run your stall like a real business." : "Stop wandering. Start finding."}
      </h3>
      <ul className="mt-8 space-y-5">
        {steps.map(({ icon: Icon, t, b }, i) => (
          <li key={i} className="flex gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-soft text-emerald-deep">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-emerald-deep">{t}</p>
              <p className="mt-1 text-sm text-emerald-deep/65">{b}</p>
            </div>
          </li>
        ))}
      </ul>
      <Link
        to={cta.to}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-deep px-5 py-2.5 text-sm font-semibold text-cream hover:bg-emerald"
      >
        {cta.label} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
