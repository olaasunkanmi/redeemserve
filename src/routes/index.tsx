import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { LiveStats } from "@/components/site/LiveStats";
import { UpcomingEvents } from "@/components/site/UpcomingEvents";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_META, VENDOR_CATEGORIES } from "@/lib/vendors";
import cityAsset from "@/assets/redemption-city.jpg.asset.json";
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
      <section className="relative overflow-hidden bg-emerald-deep text-cream">
        {/* Background image with gradient blend */}
        <div className="absolute inset-0">
          <img
            src={cityAsset.url}
            alt="Aerial view of Redemption City"
            className="h-full w-full object-cover object-center opacity-20 contrast-125 brightness-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-deep/80 via-emerald-deep/50 to-emerald-deep/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/90 via-transparent to-emerald-deep/20" />
        </div>

        <div className="relative mx-auto max-w-[1400px] px-4 py-20 sm:px-8 sm:py-28 lg:py-36">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-cream/25 bg-cream/10 px-3 py-1 text-xs font-medium text-cream backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-gold" />
              {liveCount > 0 ? `${liveCount} vendors live on the grounds` : "Live marketplace"}
            </span>

            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-balance sm:text-7xl">
              Redemption City,{" "}
              <span className="bg-gradient-to-r from-gold via-gold to-cream bg-clip-text text-transparent">
                served.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-cream/85 sm:text-lg">
              Every vendor. One marketplace. Find food, transport, goods and services across the grounds.
            </p>

            <div className="relative mt-8">
              <div className="flex items-center gap-2 rounded-2xl bg-surface/95 p-2 shadow-card backdrop-blur">
                <div className="flex flex-1 items-center gap-3 pl-3">
                  <Search className="h-5 w-5 text-emerald-deep/50" />
                  <input
                    name="q"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Try ‘jollof’, ‘keke to Mowe’…"
                    className="w-full bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-emerald-deep/40"
                  />
                </div>
                <Link
                  to="/discover"
                  search={q ? ({ q } as any) : undefined}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-deep px-5 text-sm font-semibold text-cream hover:bg-emerald"
                >
                  See all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {q.trim().length >= 2 && (() => {
                const needle = q.trim().toLowerCase();
                const hits = vendors.filter((v) =>
                  v.business_name?.toLowerCase().includes(needle) ||
                  v.category?.toLowerCase().includes(needle) ||
                  v.description?.toLowerCase().includes(needle) ||
                  (v.popular_items || []).some((i) => i?.toLowerCase().includes(needle))
                ).slice(0, 6);
                return (
                  <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-emerald-deep/10 bg-surface text-ink shadow-card">
                    {hits.length === 0 ? (
                      <p className="px-4 py-4 text-sm text-emerald-deep/60">
                        No vendors match “{q}”. Try a different term.
                      </p>
                    ) : (
                      <ul className="divide-y divide-emerald-deep/10">
                        {hits.map((v) => {
                          const s = STATUS_META[(v.status === "closed" ? "sold-out" : v.status) as keyof typeof STATUS_META];
                          return (
                            <li key={v.id}>
                              <Link
                                to="/vendor/$id"
                                params={{ id: v.id }}
                                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-emerald-soft/60"
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-emerald-deep">{v.business_name}</p>
                                  <p className="truncate text-[11px] text-emerald-deep/60">
                                    {v.category} · Zone {v.zone} · {v.price_range || "—"}
                                  </p>
                                </div>
                                <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${s?.bg ?? "bg-emerald-50"} ${s?.text ?? "text-emerald-700"}`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${s?.dot ?? "bg-emerald-500"}`} />
                                  {s?.label ?? v.status}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <Link
                      to="/discover"
                      search={{ q } as any}
                      className="block border-t border-emerald-deep/10 bg-emerald-soft/40 px-4 py-2.5 text-center text-xs font-semibold text-emerald-deep hover:bg-emerald-soft"
                    >
                      See all results for “{q}” →
                    </Link>
                  </div>
                );
              })()}
            </div>


            <div className="mt-6 flex flex-wrap gap-2">
              {VENDOR_CATEGORIES.slice(0, 4).map((c) => (
                <Link
                  key={c}
                  to="/discover"
                  className="rounded-full border border-cream/25 bg-cream/5 px-3 py-1.5 text-xs font-medium text-cream/90 backdrop-blur hover:border-gold hover:text-gold"
                >
                  {c}
                </Link>
              ))}
            </div>

            {/* Inline stat strip */}
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-cream/15 pt-6">
              <Stat value={vendors.length.toString()} label="Vendors" />
              <Stat value={liveCount.toString()} label="Live now" />
              <Stat value="500k+" label="Worshippers" />
            </div>
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />
      </section>

      <LiveStats />

      <UpcomingEvents variant="public" limit={3} />



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
              <Link to="/auth" search={{ intent: "vendor" } as any} className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-deep px-4 py-2 text-sm font-semibold text-cream hover:bg-emerald">
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
            cta={{ label: "Start selling", to: "/auth", search: { intent: "vendor" } }}
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
              <Link to="/auth" search={{ intent: "vendor" } as any} className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-emerald-deep hover:opacity-90">
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-extrabold text-cream tabular sm:text-3xl">{value}</p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-gold/90">{label}</p>
    </div>
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
      to="/vendor/$id" params={{ id: v.id }}
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
  cta: { label: string; to: string; search?: Record<string, string> };
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
        to={cta.to as any}
        search={cta.search as any}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-deep px-5 py-2.5 text-sm font-semibold text-cream hover:bg-emerald"
      >
        {cta.label} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
