import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { VENDOR_CATEGORIES, ZONES, STATUS_META } from "@/lib/vendors";
import { ArrowUpRight, Play, TrendingUp, MapPin, Clock, Phone } from "lucide-react";

export const Route = createFileRoute("/vendors")({
  head: () => ({
    meta: [
      { title: "Vendor Portal — RedeemServe" },
      {
        name: "description",
        content:
          "Register for the next Holy Ghost Service. Receive AI demand forecasts, a live storefront, and a personalised onboarding briefing.",
      },
      { property: "og:title", content: "Vendor Portal — RedeemServe" },
      {
        property: "og:description",
        content: "Demand intelligence and discovery for every vendor at Redemption City.",
      },
    ],
  }),
  component: VendorPortal,
});

type FormState = {
  business: string;
  owner: string;
  phone: string;
  category: string;
  zone: string;
  capacity: string;
  description: string;
  popular: string;
};

function VendorPortal() {
  const [registered, setRegistered] = useState(false);
  const [form, setForm] = useState<FormState>({
    business: "",
    owner: "",
    phone: "",
    category: "Food & Drinks",
    zone: "A",
    capacity: "",
    description: "",
    popular: "",
  });

  return (
    <SiteLayout>
      {/* Section header */}
      <section className="paper border-b border-emerald-deep/15">
        <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-8 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="kicker">Section IV · The Vendor Portal</p>
              <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight text-emerald-deep text-balance sm:text-7xl">
                Be visible. Be prepared.
                <br />
                <span className="font-italic-serif text-gold">Be paid.</span>
              </h1>
            </div>
            <p className="text-[15px] leading-7 text-emerald-deep/75 lg:col-span-4">
              Three minutes to register. Twenty-four hours to receive your forecast,
              your AI onboarding briefing, and your live storefront. No app required.
            </p>
          </div>
          <div className="rule-thick mt-10" />
        </div>
      </section>

      {registered ? (
        <VendorDashboard form={form} onReset={() => setRegistered(false)} />
      ) : (
        <RegistrationView
          form={form}
          setForm={setForm}
          onSubmit={() => setRegistered(true)}
        />
      )}
    </SiteLayout>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Registration view                                            */
/* ──────────────────────────────────────────────────────────── */

function RegistrationView({
  form,
  setForm,
  onSubmit,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onSubmit: () => void;
}) {
  return (
    <section className="border-b border-emerald-deep/15">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-16 sm:px-8 lg:grid-cols-12">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="lg:col-span-7"
        >
          <p className="font-italic-serif text-2xl text-emerald-deep">Vendor Registration</p>
          <div className="hairline-gold mt-3 w-12" />

          <p className="mt-6 max-w-xl text-[15px] leading-7 text-emerald-deep/75">
            Tell us who you are and what you sell. We'll match you to a zone, project
            your demand for the next service, and prepare your storefront.
          </p>

          <div className="mt-10 space-y-8">
            <Field n="01" label="Business name" required>
              <input
                required
                value={form.business}
                onChange={(e) => setForm({ ...form, business: e.target.value })}
                placeholder="e.g. Mama Ngozi's Jollof Kitchen"
                className="ed-input"
              />
            </Field>
            <Field n="02" label="Owner / contact" required>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                  placeholder="Full name"
                  className="ed-input"
                />
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="WhatsApp / Phone"
                  className="ed-input"
                />
              </div>
            </Field>
            <Field n="03" label="Category & zone" required>
              <div className="grid gap-4 sm:grid-cols-2">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="ed-input"
                >
                  {VENDOR_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={form.zone}
                  onChange={(e) => setForm({ ...form, zone: e.target.value })}
                  className="ed-input"
                >
                  {ZONES.map((z) => (
                    <option key={z.id} value={z.id}>{z.label}</option>
                  ))}
                </select>
              </div>
            </Field>
            <Field n="04" label="Daily capacity (est.)" required>
              <input
                required
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                placeholder="e.g. 500 plates · 200 rides · 80 charges"
                className="ed-input"
              />
            </Field>
            <Field n="05" label="What you offer">
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="A short line attendees will read on your storefront…"
                className="ed-input resize-none"
              />
            </Field>
            <Field n="06" label="Popular items (comma-separated)">
              <input
                value={form.popular}
                onChange={(e) => setForm({ ...form, popular: e.target.value })}
                placeholder="Jollof Rice, Plantain, Grilled Chicken"
                className="ed-input"
              />
            </Field>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t-2 border-emerald-deep pt-6">
            <p className="max-w-sm text-[11px] uppercase tracking-[0.2em] text-emerald-deep/55">
              By registering you agree to the RedeemServe vendor terms.
            </p>
            <button
              type="submit"
              className="group inline-flex items-center gap-3 border-2 border-emerald-deep bg-emerald-deep px-6 py-3.5 text-cream transition-colors hover:bg-gold hover:border-gold hover:text-emerald-deep"
            >
              <span className="font-display text-lg">Submit registration</span>
              <ArrowUpRight className="h-5 w-5" />
            </button>
          </div>

          <style>{`
            .ed-input {
              width: 100%;
              background: transparent;
              border: none;
              border-bottom: 1.5px solid var(--ink);
              padding: 0.5rem 0.25rem;
              font-family: var(--font-sans);
              font-size: 1rem;
              color: var(--ink);
              outline: none;
              transition: border-color 0.15s;
            }
            .ed-input:focus { border-color: var(--gold); }
            .ed-input::placeholder { color: oklch(0.32 0.06 160 / 0.45); }
            select.ed-input { background: transparent; }
          `}</style>
        </form>

        {/* Side rail */}
        <aside className="lg:col-span-5 lg:pl-6">
          <PerksColumn />
        </aside>
      </div>
    </section>
  );
}

function Field({
  n,
  label,
  required,
  children,
}: {
  n: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="font-display text-sm tabular text-gold">{n}</span>
        <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-deep">
          {label} {required && <span className="text-gold">*</span>}
        </label>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function PerksColumn() {
  const items = [
    {
      n: "01",
      title: "AI demand forecast",
      body: "Predicted hourly customer counts for your category, trained on RCCG event patterns.",
    },
    {
      n: "02",
      title: "Live storefront",
      body: "A digital plate every attendee sees — with your zone, stock and WhatsApp.",
    },
    {
      n: "03",
      title: "Verified badge",
      body: "A trust mark that signals you are an approved Redemption City vendor.",
    },
    {
      n: "04",
      title: "Onboarding briefing",
      body: "A personalised AI video explaining setup, ground rules and logistics.",
    },
    {
      n: "05",
      title: "Post-event report",
      body: "What sold, what didn't, and what to prepare next month — in one page.",
    },
  ];
  return (
    <div className="border-l-2 border-emerald-deep pl-8">
      <p className="kicker">What you receive</p>
      <h2 className="mt-3 font-display text-3xl leading-tight text-emerald-deep">
        Five tools, one registration.
      </h2>

      <ol className="mt-8 space-y-6">
        {items.map((i) => (
          <li key={i.n} className="grid grid-cols-[auto_1fr] gap-x-5 border-t border-emerald-deep/10 pt-5 first:border-t-0 first:pt-0">
            <span className="font-display text-2xl tabular text-gold leading-none">{i.n}</span>
            <div>
              <h3 className="font-display text-xl leading-tight text-emerald-deep">{i.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-emerald-deep/70">{i.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 border-t-2 border-emerald-deep pt-6">
        <p className="kicker">Monetisation</p>
        <p className="mt-3 text-sm leading-relaxed text-emerald-deep/75">
          Free to register. A small <span className="font-semibold">verified listing fee</span>{" "}
          applies per event. Optional commission of 5–7% on bookings made through the
          platform. Verified Vendor subscription from{" "}
          <span className="font-semibold text-emerald-deep">₦5,000/mo</span> unlocks priority placement and
          analytics.
        </p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Dashboard — what a vendor sees after registering            */
/* ──────────────────────────────────────────────────────────── */

function VendorDashboard({ form, onReset }: { form: FormState; onReset: () => void }) {
  const businessName = form.business || "Your Business";
  const items = (form.popular || form.description || "Featured item, Daily special, Top seller")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  // Synthesised forecast based on category
  const forecast = {
    customers: 1820,
    revenue: 412000,
    peakHour: "11:00 – 13:00",
    demand: "High" as const,
    hourly: [220, 380, 540, 720, 920, 1100, 1320, 1450, 1320, 1180, 980, 720, 520, 380, 240, 180],
  };

  return (
    <section>
      {/* Welcome banner */}
      <div className="border-b border-emerald-deep/15 bg-emerald-deep text-cream">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-6 px-4 py-10 sm:px-8 sm:py-14">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-gold">
              Registration confirmed · Service in 18 days
            </p>
            <h2 className="mt-3 font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl">
              Welcome, <span className="font-italic-serif text-gold">{businessName}.</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-cream/80">
              Your storefront is live. Your onboarding briefing is ready. Below is your
              control board for the next Holy Ghost Service.
            </p>
          </div>
          <button
            onClick={onReset}
            className="group inline-flex items-center gap-2 border border-cream/40 px-5 py-2.5 text-sm font-medium text-cream hover:border-gold hover:text-gold"
          >
            Register another vendor <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Left: forecast */}
          <div className="lg:col-span-8">
            <p className="kicker">Plate I · AI Demand Forecast</p>
            <h3 className="mt-3 font-display text-4xl leading-tight text-emerald-deep">
              ~{forecast.customers.toLocaleString()} customers <span className="font-italic-serif text-gold">expected.</span>
            </h3>
            <div className="hairline-gold mt-3 w-16" />

            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
              <Stat label="Expected" value={forecast.customers.toLocaleString()} unit="customers" />
              <Stat label="Revenue band" value={`₦${(forecast.revenue / 1000).toFixed(0)}k`} unit="estimated" />
              <Stat label="Peak window" value={forecast.peakHour} unit="busiest" />
              <Stat label="Demand" value={forecast.demand} unit="level" tone="gold" />
            </div>

            {/* Hourly chart */}
            <div className="mt-10 border-t-2 border-emerald-deep pt-6">
              <div className="mb-3 flex items-end justify-between">
                <p className="font-italic-serif text-xl text-emerald-deep">Hourly demand curve</p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-deep/55">
                  04:00 → 20:00
                </p>
              </div>
              <HourlyChart values={forecast.hourly} />
            </div>

            {/* Briefing */}
            <div className="mt-12 border-2 border-emerald-deep p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="kicker">Plate II · Onboarding Briefing</p>
                  <h3 className="mt-2 font-display text-3xl leading-tight text-emerald-deep">
                    Your AI video is ready.
                  </h3>
                </div>
                <span className="border border-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
                  4 min · personalised
                </span>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
                <button className="group relative grid h-32 w-full place-items-center overflow-hidden border border-emerald-deep bg-emerald-deep/5 sm:w-56">
                  <span className="absolute inset-0 bg-gradient-to-br from-emerald-deep/5 via-transparent to-gold/10" />
                  <span className="relative grid h-14 w-14 place-items-center rounded-full bg-gold text-emerald-deep transition-transform group-hover:scale-110">
                    <Play className="h-5 w-5 fill-current" />
                  </span>
                </button>
                <ul className="space-y-3 text-sm leading-relaxed text-emerald-deep/80">
                  <li className="flex gap-3"><span className="font-display text-sm tabular text-gold">01</span> Where to enter — Gate {form.zone === "A" ? "1 (Main)" : form.zone === "B" ? "2 (North)" : form.zone === "C" ? "3 (Family)" : "4 (South)"}</li>
                  <li className="flex gap-3"><span className="font-display text-sm tabular text-gold">02</span> Where to set up — {ZONES.find((z) => z.id === form.zone)?.label}</li>
                  <li className="flex gap-3"><span className="font-display text-sm tabular text-gold">03</span> Ground rules, hours, and what to bring</li>
                  <li className="flex gap-3"><span className="font-display text-sm tabular text-gold">04</span> Your contact runner and how to escalate</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right: storefront preview */}
          <aside className="lg:col-span-4 lg:border-l-2 lg:border-emerald-deep lg:pl-8">
            <p className="kicker">Plate III · Live Storefront</p>
            <p className="mt-2 text-sm text-emerald-deep/65">
              This is exactly what attendees see in The Directory.
            </p>

            <div className="mt-5 border border-emerald-deep/25 bg-cream p-5">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-sm tabular text-emerald-deep/40">01 / 42</span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-emerald-deep/55">Zone {form.zone}</span>
              </div>
              <div className="hairline mt-2" />
              <p className="kicker mt-4">{form.category}</p>
              <h3 className="mt-2 font-display text-2xl leading-tight text-emerald-deep">{businessName}</h3>
              <p className="mt-3 text-sm leading-relaxed text-emerald-deep/75">
                {form.description || "A short description of what you offer will appear here for every attendee browsing the directory."}
              </p>

              {items.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {items.map((it) => (
                    <li key={it} className="border border-emerald-deep/25 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-emerald-deep/70">
                      {it}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-emerald-deep/60">
                <span className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META.live.dot}`} />
                  {STATUS_META.live.label}
                </span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Ground assignment pending</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Opens 6:00 AM</span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-1.5 border border-emerald-deep bg-emerald-deep py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cream">
                  <Phone className="h-3 w-3" /> Call
                </button>
                <button className="flex items-center justify-center gap-1.5 border border-emerald-deep py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-deep">
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Post-event */}
            <div className="mt-8 border-t-2 border-emerald-deep pt-6">
              <p className="kicker">Plate IV · Post-event</p>
              <h3 className="mt-2 font-display text-2xl leading-tight text-emerald-deep">
                A one-page report after every service.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-emerald-deep/70">
                Units sold, peak hour, sell-out time, returning customers — and what to
                bring next month. Delivered to WhatsApp by Monday morning.
              </p>
              <div className="mt-5 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-gold">
                <TrendingUp className="h-3.5 w-3.5" />
                Next report: Sat, 9:00 AM
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: "gold";
}) {
  return (
    <div className="border-t-2 border-emerald-deep pt-3">
      <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-deep/55">{label}</p>
      <p
        className={`mt-1 font-display text-3xl leading-none tabular ${
          tone === "gold" ? "text-gold" : "text-emerald-deep"
        }`}
      >
        {value}
      </p>
      {unit && <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-emerald-deep/45">{unit}</p>}
    </div>
  );
}

function HourlyChart({ values }: { values: number[] }) {
  const max = Math.max(...values);
  return (
    <div className="flex h-44 items-end gap-1">
      {values.map((v, i) => {
        const h = (v / max) * 100;
        const peak = v === max;
        return (
          <div key={i} className="group flex h-full flex-1 flex-col justify-end">
            <div
              className={`w-full transition-all ${
                peak ? "bg-gold" : "bg-emerald-deep/70 group-hover:bg-emerald-deep"
              }`}
              style={{ height: `${h}%` }}
              title={`Hour ${4 + i}:00 — ~${v} customers`}
            />
          </div>
        );
      })}
    </div>
  );
}
