import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { ArrowRight, ShieldCheck, BarChart3, MapPin, Users, Store, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — RedeemServe" },
      { name: "description", content: "Why RedeemServe exists, who it serves, and how the multivendor marketplace sustains itself." },
      { property: "og:title", content: "About RedeemServe" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section className="border-b border-emerald-deep/10 bg-emerald-soft/40">
        <div className="mx-auto max-w-[1100px] px-4 py-16 sm:px-8 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald">About RedeemServe</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight text-emerald-deep text-balance sm:text-5xl">
            A multivendor marketplace built for the world's largest monthly gathering.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-deep/75">
            Redemption City hosts between 500,000 and over 2 million people every
            month for the Holy Ghost Service. RedeemServe is the platform that
            finally connects the vendors serving them with the attendees searching
            for them.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 py-16 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-emerald-deep">The problem</h2>
            <p className="mt-4 text-emerald-deep/75 leading-7">
              Despite the scale and frequency of these events, vendors and
              attendees have no coordinated meeting point. Food sellers run out
              by 10am. Transport operators cluster at the wrong gates. Families
              and international visitors wander, looking for a plate of food.
              Supply and demand exist in the same space — they just never meet.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-extrabold text-emerald-deep">Our answer</h2>
            <p className="mt-4 text-emerald-deep/75 leading-7">
              One marketplace. Verified vendors. Live availability. WhatsApp
              ordering. Demand forecasts trained on RCCG event patterns. Every
              key feature works without an account, and every vendor is reachable
              from a phone — because that's the reality of the grounds.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-emerald-soft/40 py-16">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-8">
          <h2 className="font-display text-2xl font-extrabold text-emerald-deep">What you get</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, t, b }) => (
              <div key={t} className="rounded-2xl border border-emerald-deep/10 bg-surface p-6 shadow-card">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-soft text-emerald-deep">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-emerald-deep">{t}</h3>
                <p className="mt-2 text-sm text-emerald-deep/65">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 py-16 sm:px-8">
        <h2 className="font-display text-2xl font-extrabold text-emerald-deep">How RedeemServe sustains itself</h2>
        <p className="mt-2 max-w-2xl text-sm text-emerald-deep/65">Small, fair fees — no ads, no attention tactics.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {REVENUE.map((r, i) => (
            <div key={r.t} className="rounded-2xl border border-emerald-deep/10 bg-surface p-6">
              <span className="font-display text-2xl font-extrabold text-gold tabular">0{i + 1}</span>
              <h3 className="mt-2 font-display text-lg font-bold text-emerald-deep">{r.t}</h3>
              <p className="mt-2 text-sm text-emerald-deep/65">{r.b}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link to="/discover" className="inline-flex items-center gap-2 rounded-full bg-emerald-deep px-6 py-3 text-sm font-semibold text-cream hover:bg-emerald">
            Browse the marketplace <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-emerald-deep px-6 py-3 text-sm font-semibold text-emerald-deep hover:bg-emerald-deep hover:text-cream">
            Become a vendor
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}

const FEATURES = [
  { icon: Store, t: "Verified storefronts", b: "Every vendor is screened and listed with photos, items and live status." },
  { icon: MapPin, t: "Live grounds map", b: "Find vendors by zone with a real-time map of the Redemption City layout." },
  { icon: BarChart3, t: "AI demand forecasts", b: "Hourly customer projections so vendors prepare the right quantities." },
  { icon: MessageCircle, t: "WhatsApp ordering", b: "Attendees reach vendors directly — no account required to buy." },
  { icon: ShieldCheck, t: "Trust-first", b: "Ratings, verification badges and post-event reports keep quality high." },
  { icon: Users, t: "Built for the city", b: "Designed around RCCG's monthly rhythm and first-time visitor needs." },
] as const;

const REVENUE = [
  { t: "Vendor registration", b: "A small flat fee per event for a verified listing. From launch." },
  { t: "Transaction commission", b: "5–7% on bookings made through the platform. From launch." },
  { t: "Verified subscription", b: "₦5,000–₦15,000/month for priority placement and demand reports." },
  { t: "Premium analytics", b: "Detailed dashboards and post-event reports for serious operators." },
] as const;
