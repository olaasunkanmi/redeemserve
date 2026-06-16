import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { VENDOR_CATEGORIES, ZONES } from "@/lib/vendors";
import { CheckCircle2, Store, TrendingUp, Users, Sparkles, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/vendors")({
  head: () => ({
    meta: [
      { title: "Vendor Portal — Register with RedeemServe" },
      {
        name: "description",
        content:
          "Register your business for the next Holy Ghost Service. Get AI demand forecasts, a digital storefront, and reach hundreds of thousands of attendees.",
      },
      { property: "og:title", content: "Register as a vendor — RedeemServe" },
      {
        property: "og:description",
        content: "AI demand forecasts, digital storefront and automated onboarding for Redemption City vendors.",
      },
    ],
  }),
  component: VendorPortal,
});

function VendorPortal() {
  return (
    <SiteLayout>
      <section className="border-b border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Vendor portal</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Be visible. Be prepared. Be paid.
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Join the next Holy Ghost Service with confidence. RedeemServe gives you demand
            intelligence, a digital storefront and a direct line to attendees.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8">
        <RegistrationForm />
        <Benefits />
      </section>
    </SiteLayout>
  );
}

function RegistrationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    business: "",
    owner: "",
    phone: "",
    category: "Food & Drinks",
    zone: "A",
    capacity: "",
    description: "",
  });

  if (submitted) {
    return (
      <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full gradient-warm text-cream">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="mt-5 font-display text-3xl font-semibold">You're on the platform.</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          <strong>{form.business}</strong> has been registered for the next Holy Ghost Service in
          Zone {form.zone}. We'll send your AI demand forecast and onboarding video to{" "}
          <strong>{form.phone}</strong> within 24 hours.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
        >
          Register another vendor
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="rounded-3xl border border-border bg-card p-8 shadow-soft"
    >
      <h2 className="font-display text-2xl font-semibold">Register for the next event</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Free to register. Verified listing fee applies per event.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Business name" required>
          <input
            required
            value={form.business}
            onChange={(e) => setForm({ ...form, business: e.target.value })}
            placeholder="e.g. Mama Ngozi's Jollof Kitchen"
            className="input"
          />
        </Field>
        <Field label="Owner / contact name" required>
          <input
            required
            value={form.owner}
            onChange={(e) => setForm({ ...form, owner: e.target.value })}
            placeholder="Full name"
            className="input"
          />
        </Field>
        <Field label="WhatsApp / Phone" required>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+234 800 000 0000"
            className="input"
          />
        </Field>
        <Field label="Category" required>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="input"
          >
            {VENDOR_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Preferred zone" required>
          <select
            value={form.zone}
            onChange={(e) => setForm({ ...form, zone: e.target.value })}
            className="input"
          >
            {ZONES.map((z) => (
              <option key={z.id} value={z.id}>{z.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Daily capacity (estimated)" required>
          <input
            required
            type="number"
            min="1"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            placeholder="e.g. 500 plates"
            className="input"
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="What do you sell or offer?">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="A brief description attendees will see on your storefront…"
              className="input resize-none"
            />
          </Field>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <p className="text-xs text-muted-foreground">
          By registering you agree to the RedeemServe vendor terms.
        </p>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elev transition-transform hover:scale-[1.02]"
        >
          <Store className="h-4 w-4" /> Register vendor
        </button>
      </div>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--input);
          background: var(--background);
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus { border-color: var(--ring); }
      `}</style>
    </form>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-accent">*</span>}
      </span>
      {children}
    </label>
  );
}

function Benefits() {
  const items = [
    { icon: <TrendingUp className="h-5 w-5" />, title: "AI demand forecast", body: "Know how many customers to expect — by hour, by zone, by category." },
    { icon: <Users className="h-5 w-5" />, title: "Reach 500K+ attendees", body: "Your storefront appears in the live directory used by every attendee." },
    { icon: <ShieldCheck className="h-5 w-5" />, title: "Verified listing", body: "A trust badge so attendees know you're an approved Redemption City vendor." },
    { icon: <Sparkles className="h-5 w-5" />, title: "AI onboarding video", body: "Personalised briefing — where to set up, what to bring, ground rules." },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl gradient-warm p-8 text-cream shadow-elev">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/70">Why RedeemServe</p>
        <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">
          Stop guessing. Start serving.
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-cream/80">
          Vendors who plan against real demand data make 2–3× more revenue per event,
          waste less stock, and earn returning customers.
        </p>
      </div>

      <div className="grid gap-4">
        {items.map((b) => (
          <div key={b.title} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
              {b.icon}
            </span>
            <div>
              <p className="font-semibold">{b.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{b.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
