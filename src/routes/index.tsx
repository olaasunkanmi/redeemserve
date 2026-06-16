import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { VENDORS } from "@/lib/vendors";
import {
  ArrowRight,
  MapPin,
  Sparkles,
  Users,
  TrendingUp,
  ShieldCheck,
  Smartphone,
  MessageCircle,
  Store,
  Search,
  Clock,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RedeemServe — Vendors & attendees, connected at Redemption City" },
      {
        name: "description",
        content:
          "RedeemServe is the coordination platform for Redemption City events — helping vendors plan supply and helping attendees find food, transport and services in real time.",
      },
      { property: "og:title", content: "RedeemServe — Connecting vendors and attendees at Redemption City" },
      {
        property: "og:description",
        content:
          "Live vendor directory, AI demand forecasting and WhatsApp access — built for the Holy Ghost Service and RCCG Convention.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      <Hero />
      <Stats />
      <ProblemSplit />
      <HowItWorks />
      <LiveDirectoryPreview />
      <Monetization />
      <CTA />
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-grain">
      <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-secondary/70 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pt-24">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Built for the Holy Ghost Service · 500K – 2M+ attendees monthly
          </div>

          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground text-balance sm:text-6xl lg:text-7xl">
            Find what you need,
            <br />
            <span className="text-accent">when you need it.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Redemption City has the infrastructure of a city — but none of the discovery
            tools a city provides. RedeemServe is the missing meeting point: a live
            directory connecting vendors and attendees at every Holy Ghost Service and
            Convention.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elev transition-transform hover:scale-[1.02]"
            >
              <Search className="h-4 w-4" />
              Find a vendor
            </Link>
            <Link
              to="/vendors"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-soft transition-colors hover:bg-secondary"
            >
              <Store className="h-4 w-4" />
              Register as a vendor
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> No app download</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> WhatsApp access</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> AI demand forecasts</div>
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <HeroCard />
        </div>
      </div>
    </section>
  );
}

function HeroCard() {
  const featured = VENDORS.slice(0, 3);
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] gradient-warm opacity-10 blur-2xl" />
      <div className="rounded-3xl border border-border bg-card p-5 shadow-elev">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Live near you</p>
            <p className="font-display text-lg font-semibold">Zone A · Main Auditorium</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
            42 vendors open
          </span>
        </div>

        <div className="mt-4 space-y-2.5">
          {featured.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/60 p-3 transition-colors hover:border-accent/40"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <Store className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{v.name}</p>
                <p className="truncate text-xs text-muted-foreground">{v.location}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-foreground">★ {v.rating}</p>
                <p className="text-[10px] text-muted-foreground">{v.category}</p>
              </div>
            </div>
          ))}
        </div>

        <Link
          to="/discover"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Open full directory <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="absolute -bottom-6 -left-6 hidden rotate-[-4deg] rounded-2xl border border-border bg-card p-4 shadow-elev sm:block">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-full gradient-gold text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">AI forecast</p>
            <p className="text-sm font-semibold">+1,820 customers today</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stats() {
  const stats = [
    { value: "500K–2M+", label: "attendees per Holy Ghost Service" },
    { value: "12+", label: "monthly events per year" },
    { value: "Multi-day", label: "RCCG Annual Convention" },
    { value: "City-scale", label: "grounds footprint" },
  ];
  return (
    <section className="border-y border-border/60 bg-card/50">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
              {s.value}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProblemSplit() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">The Gap</p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          A vendor 200m away is invisible to an attendee who needs them.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          At every Holy Ghost Service, supply and demand exist in the same space —
          but never connect efficiently. RedeemServe closes that gap.
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <ProblemCard
          tag="For Vendors"
          icon={<Store className="h-5 w-5" />}
          title="Guessing instead of planning"
          points={[
            "Food vendors sell out by 10am — no demand signal to plan against.",
            "Transport operators cluster at the wrong gates and miss the rush.",
            "New vendors arrive with no onboarding, no location, no briefing.",
            "Specialty services (repair, medical) go entirely undiscovered.",
          ]}
        />
        <ProblemCard
          tag="For Attendees"
          icon={<Users className="h-5 w-5" />}
          title="Wandering through a city of millions"
          points={[
            "No directory, no map, no way to know what is available.",
            "Families and elderly worshippers walk in circles looking for food.",
            "International visitors arrive without any local knowledge.",
            "First-timers go hungry — or settle for less than they need.",
          ]}
        />
      </div>
    </section>
  );
}

function ProblemCard({
  tag,
  title,
  points,
  icon,
}: {
  tag: string;
  title: string;
  points: string[];
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-soft transition-shadow hover:shadow-elev">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">
          {icon}
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{tag}</span>
      </div>
      <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight">{title}</h3>
      <ul className="mt-5 space-y-3">
        {points.map((p) => (
          <li key={p} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HowItWorks() {
  const vendorSteps = [
    { icon: <ShieldCheck className="h-5 w-5" />, title: "Pre-event registration", body: "Register your category, location and capacity ahead of each Holy Ghost Service." },
    { icon: <TrendingUp className="h-5 w-5" />, title: "AI demand forecasting", body: "Get a predicted demand range for your category, trained on RCCG event patterns." },
    { icon: <Store className="h-5 w-5" />, title: "Digital storefront", body: "A simple, searchable profile showing what you sell and where you are." },
    { icon: <Sparkles className="h-5 w-5" />, title: "Automated onboarding", body: "Personalised AI video briefing — no more figuring it out on event day." },
  ];
  const attendeeSteps = [
    { icon: <MapPin className="h-5 w-5" />, title: "Live vendor map", body: "See every active vendor on the grounds — by zone, category and availability." },
    { icon: <Clock className="h-5 w-5" />, title: "Real-time stock", body: "When a vendor sells out, the directory updates so you don't waste a trip." },
    { icon: <Smartphone className="h-5 w-5" />, title: "Pre-arrival planning", body: "Browse before you leave home — arrive informed, not guessing." },
    { icon: <MessageCircle className="h-5 w-5" />, title: "WhatsApp access", body: "No data? Get vendor info via WhatsApp — no app download required." },
  ];
  return (
    <section className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">How it works</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            One platform. Both sides served.
          </h2>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <FeatureColumn title="For Vendors" steps={vendorSteps} accent />
          <FeatureColumn title="For Attendees" steps={attendeeSteps} />
        </div>
      </div>
    </section>
  );
}

function FeatureColumn({
  title,
  steps,
  accent = false,
}: {
  title: string;
  steps: { icon: React.ReactNode; title: string; body: string }[];
  accent?: boolean;
}) {
  return (
    <div className={`rounded-3xl border border-border bg-card p-8 shadow-soft ${accent ? "lg:translate-y-2" : ""}`}>
      <h3 className="font-display text-2xl font-semibold tracking-tight">{title}</h3>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {steps.map((s) => (
          <div key={s.title} className="rounded-2xl border border-border/60 bg-background/60 p-5">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${accent ? "gradient-warm text-cream" : "bg-secondary text-primary"}`}>
              {s.icon}
            </span>
            <p className="mt-4 font-semibold text-foreground">{s.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveDirectoryPreview() {
  const sample = VENDORS.slice(0, 6);
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Live directory</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Every vendor. Every zone. Real-time.
          </h2>
        </div>
        <Link
          to="/discover"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold shadow-soft hover:bg-secondary"
        >
          Open directory <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {sample.map((v) => (
          <Link
            key={v.id}
            to="/discover"
            className="group rounded-3xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elev"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                {v.category}
              </span>
              <span className="text-xs text-muted-foreground">Zone {v.zone}</span>
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold leading-tight">{v.name}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{v.description}</p>
            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{v.priceRange}</span>
              <span className="text-amber-600">★ {v.rating}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Monetization() {
  const streams = [
    { title: "Vendor registration", body: "Small flat fee per event for a verified listing.", when: "From launch" },
    { title: "Transaction commission", body: "5–7% on bookings and pre-orders made through RedeemServe.", when: "From launch" },
    { title: "Verified Vendor subscription", body: "Monthly ₦5,000 – ₦15,000 for priority placement and demand reports.", when: "Month 3+" },
    { title: "Premium analytics", body: "Detailed demand forecasts and post-event performance dashboards.", when: "Month 6+" },
  ];
  return (
    <section className="bg-grain">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Sustainable by design</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            A model that grows with the vendors it serves.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {streams.map((s, i) => (
            <div key={s.title} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-warm text-cream font-display text-sm font-semibold">
                {i + 1}
              </div>
              <p className="mt-4 font-display text-lg font-semibold">{s.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              <p className="mt-4 text-xs font-medium uppercase tracking-wider text-accent">{s.when}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2rem] gradient-warm p-10 text-cream shadow-elev sm:p-14">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
              Be ready for the next Holy Ghost Service.
            </h2>
            <p className="mt-4 max-w-lg text-base/relaxed text-cream/80">
              Whether you're serving thousands or simply trying to find a meal — RedeemServe
              gets you there. Join the platform built for Redemption City.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link
              to="/vendors"
              className="inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-semibold text-primary shadow-elev transition-transform hover:scale-[1.02]"
            >
              <Store className="h-4 w-4" /> I'm a vendor
            </Link>
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 rounded-full border border-cream/40 bg-transparent px-6 py-3 text-sm font-semibold text-cream hover:bg-cream/10"
            >
              <Search className="h-4 w-4" /> I'm an attendee
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
