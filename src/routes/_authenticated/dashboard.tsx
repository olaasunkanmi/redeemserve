import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { VENDOR_CATEGORIES, ZONES, STATUS_META } from "@/lib/vendors";
import { ArrowUpRight, Play, TrendingUp, MapPin, Clock, Phone, LogOut, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Your Portal — RedeemServe" }] }),
  component: Dashboard,
});

type VendorRow = {
  id: string;
  business_name: string;
  category: string;
  zone: string;
  description: string;
  capacity: number;
  popular_items: string[];
  price_range: string;
  phone: string | null;
  whatsapp: string | null;
  opens_at: string;
  status: "live" | "low-stock" | "sold-out" | "closed";
  rating: number;
  expected_customers: number;
  demand: string;
  pos_x: number;
  pos_y: number;
  verified: boolean;
};

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: string; email: string | undefined } | null>(null);
  const [vendor, setVendor] = useState<VendorRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  async function load() {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    setUser({ id: u.user.id, email: u.user.email });
    const { data } = await supabase
      .from("vendors")
      .select("*")
      .eq("owner_id", u.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setVendor((data as any) ?? null);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (loading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-[1400px] px-8 py-24 text-emerald-deep/60">Loading your portal…</div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="border-b border-emerald-deep/15 bg-emerald-deep text-cream">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-6 px-4 py-10 sm:px-8 sm:py-12">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-gold">
              {vendor ? "Vendor portal" : "Welcome to RedeemServe"}
            </p>
            <h2 className="mt-3 font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl">
              {vendor ? (
                <>
                  Welcome, <span className="font-italic-serif text-gold">{vendor.business_name}.</span>
                </>
              ) : (
                <>
                  Hello, <span className="font-italic-serif text-gold">{user?.email}.</span>
                </>
              )}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-cream/80">
              {vendor
                ? "Your storefront is live in The Directory. Manage your listing below."
                : "Register your business below to publish your storefront in The Directory."}
            </p>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 border border-cream/40 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-cream hover:border-gold hover:text-gold"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </section>

      {!vendor || editing ? (
        <VendorForm
          existing={editing ? vendor : null}
          ownerId={user!.id}
          onDone={() => {
            setEditing(false);
            load();
          }}
        />
      ) : (
        <VendorDashboard
          vendor={vendor}
          onEdit={() => setEditing(true)}
          onDelete={async () => {
            if (!confirm("Delete this vendor listing?")) return;
            await supabase.from("vendors").delete().eq("id", vendor.id);
            load();
          }}
        />
      )}
    </SiteLayout>
  );
}

function VendorForm({
  existing, ownerId, onDone,
}: { existing: VendorRow | null; ownerId: string; onDone: () => void }) {
  const [f, setF] = useState({
    business_name: existing?.business_name ?? "",
    category: existing?.category ?? "Food & Drinks",
    zone: existing?.zone ?? "A",
    description: existing?.description ?? "",
    capacity: existing?.capacity?.toString() ?? "",
    popular: existing?.popular_items?.join(", ") ?? "",
    price_range: existing?.price_range ?? "",
    phone: existing?.phone ?? "",
    whatsapp: existing?.whatsapp ?? "",
    opens_at: existing?.opens_at ?? "6:00 AM",
    status: existing?.status ?? "live",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    const payload = {
      owner_id: ownerId,
      business_name: f.business_name,
      category: f.category,
      zone: f.zone,
      description: f.description,
      capacity: parseInt(f.capacity || "0", 10),
      popular_items: f.popular.split(",").map((s) => s.trim()).filter(Boolean),
      price_range: f.price_range,
      phone: f.phone || null,
      whatsapp: f.whatsapp || null,
      opens_at: f.opens_at,
      status: f.status,
      pos_x: Math.floor(20 + Math.random() * 60),
      pos_y: Math.floor(20 + Math.random() * 60),
    };
    const { error } = existing
      ? await supabase.from("vendors").update(payload).eq("id", existing.id)
      : await supabase.from("vendors").insert(payload as any);
    setSaving(false);
    if (error) setErr(error.message);
    else onDone();
  }

  return (
    <section className="border-b border-emerald-deep/15">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-14 sm:px-8 lg:grid-cols-12">
        <form onSubmit={save} className="lg:col-span-7">
          <p className="font-italic-serif text-2xl text-emerald-deep">
            {existing ? "Edit your listing" : "Vendor registration"}
          </p>
          <div className="hairline-gold mt-3 w-12" />

          <div className="mt-8 space-y-7">
            <Field n="01" label="Business name" required>
              <input required value={f.business_name} onChange={(e) => setF({ ...f, business_name: e.target.value })} className="ed-input" placeholder="e.g. Mama Ngozi's Jollof Kitchen" />
            </Field>
            <Field n="02" label="Category & zone" required>
              <div className="grid gap-4 sm:grid-cols-2">
                <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className="ed-input">
                  {VENDOR_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={f.zone} onChange={(e) => setF({ ...f, zone: e.target.value })} className="ed-input">
                  {ZONES.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}
                </select>
              </div>
            </Field>
            <Field n="03" label="What you offer" required>
              <textarea required rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="ed-input resize-none" placeholder="A short line attendees will read on your storefront…" />
            </Field>
            <Field n="04" label="Popular items (comma-separated)">
              <input value={f.popular} onChange={(e) => setF({ ...f, popular: e.target.value })} className="ed-input" placeholder="Jollof Rice, Plantain, Grilled Chicken" />
            </Field>
            <Field n="05" label="Daily capacity & price range" required>
              <div className="grid gap-4 sm:grid-cols-2">
                <input required type="number" min="1" value={f.capacity} onChange={(e) => setF({ ...f, capacity: e.target.value })} className="ed-input" placeholder="e.g. 500" />
                <input value={f.price_range} onChange={(e) => setF({ ...f, price_range: e.target.value })} className="ed-input" placeholder="₦500 – ₦3,500" />
              </div>
            </Field>
            <Field n="06" label="Contact" required>
              <div className="grid gap-4 sm:grid-cols-2">
                <input required type="tel" value={f.phone ?? ""} onChange={(e) => setF({ ...f, phone: e.target.value })} className="ed-input" placeholder="Phone" />
                <input value={f.whatsapp ?? ""} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} className="ed-input" placeholder="WhatsApp (optional)" />
              </div>
            </Field>
            <Field n="07" label="Opens & status">
              <div className="grid gap-4 sm:grid-cols-2">
                <input value={f.opens_at} onChange={(e) => setF({ ...f, opens_at: e.target.value })} className="ed-input" placeholder="6:00 AM" />
                <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as any })} className="ed-input">
                  <option value="live">Open now</option>
                  <option value="low-stock">Low stock</option>
                  <option value="sold-out">Sold out</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </Field>
          </div>

          {err && <p className="mt-6 text-xs text-rose-600">{err}</p>}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t-2 border-emerald-deep pt-6">
            <p className="max-w-sm text-[11px] uppercase tracking-[0.2em] text-emerald-deep/55">
              By registering you agree to the RedeemServe vendor terms.
            </p>
            <button type="submit" disabled={saving} className="group inline-flex items-center gap-3 border-2 border-emerald-deep bg-emerald-deep px-6 py-3.5 text-cream hover:bg-gold hover:border-gold hover:text-emerald-deep disabled:opacity-50">
              <span className="font-display text-lg">{saving ? "Saving…" : existing ? "Save changes" : "Publish storefront"}</span>
              <ArrowUpRight className="h-5 w-5" />
            </button>
          </div>

          <style>{`
            .ed-input { width:100%; background:transparent; border:none; border-bottom:1.5px solid var(--ink); padding:.5rem .25rem; font-family:var(--font-sans); font-size:1rem; color:var(--ink); outline:none; transition:border-color .15s; }
            .ed-input:focus { border-color: var(--gold); }
            .ed-input::placeholder { color: oklch(0.32 0.06 160 / 0.45); }
          `}</style>
        </form>

        <aside className="lg:col-span-5 lg:pl-6">
          <div className="border-l-2 border-emerald-deep pl-8">
            <p className="kicker">What you receive</p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-emerald-deep">Five tools, one account.</h2>
            <ol className="mt-8 space-y-5">
              {[
                ["01","AI demand forecast","Predicted hourly customers, trained on RCCG event patterns."],
                ["02","Live storefront","A digital plate every attendee sees in The Directory."],
                ["03","Verified badge","A trust mark for approved Redemption City vendors."],
                ["04","Onboarding briefing","A personalised AI video explaining setup & logistics."],
                ["05","Post-event report","What sold, what didn't, and what to prepare next month."],
              ].map(([n,t,b]) => (
                <li key={n} className="grid grid-cols-[auto_1fr] gap-x-5 border-t border-emerald-deep/10 pt-4 first:border-t-0 first:pt-0">
                  <span className="font-display text-2xl tabular text-gold leading-none">{n}</span>
                  <div>
                    <h3 className="font-display text-lg leading-tight text-emerald-deep">{t}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-emerald-deep/70">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Field({ n, label, required, children }: { n: string; label: string; required?: boolean; children: React.ReactNode }) {
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

function VendorDashboard({ vendor, onEdit, onDelete }: { vendor: VendorRow; onEdit: () => void; onDelete: () => void }) {
  const forecast = {
    customers: vendor.expected_customers || Math.max(vendor.capacity * 3, 800),
    revenue: Math.max(vendor.capacity * 800, 200000),
    peakHour: "11:00 – 13:00",
    demand: vendor.demand,
    hourly: [220, 380, 540, 720, 920, 1100, 1320, 1450, 1320, 1180, 980, 720, 520, 380, 240, 180],
  };
  const items = vendor.popular_items.slice(0, 4);

  return (
    <section>
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-8">
        <div className="mb-8 flex flex-wrap gap-3">
          <button onClick={onEdit} className="inline-flex items-center gap-2 border border-emerald-deep px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-emerald-deep hover:bg-emerald-deep hover:text-cream">
            <Pencil className="h-3.5 w-3.5" /> Edit listing
          </button>
          <Link to="/discover" className="inline-flex items-center gap-2 border border-emerald-deep/30 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-emerald-deep/70 hover:border-emerald-deep hover:text-emerald-deep">
            View in directory <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <button onClick={onDelete} className="ml-auto inline-flex items-center gap-2 border border-rose-300 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-rose-600 hover:bg-rose-50">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>

        <div className="grid gap-10 lg:grid-cols-12">
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
            <div className="mt-10 border-t-2 border-emerald-deep pt-6">
              <div className="mb-3 flex items-end justify-between">
                <p className="font-italic-serif text-xl text-emerald-deep">Hourly demand curve</p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-deep/55">04:00 → 20:00</p>
              </div>
              <HourlyChart values={forecast.hourly} />
            </div>

            <div className="mt-12 border-2 border-emerald-deep p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="kicker">Plate II · Onboarding Briefing</p>
                  <h3 className="mt-2 font-display text-3xl leading-tight text-emerald-deep">Your AI video is ready.</h3>
                </div>
                <span className="border border-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">4 min · personalised</span>
              </div>
              <div className="mt-6 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
                <button className="group relative grid h-32 w-full place-items-center overflow-hidden border border-emerald-deep bg-emerald-deep/5 sm:w-56">
                  <span className="absolute inset-0 bg-gradient-to-br from-emerald-deep/5 via-transparent to-gold/10" />
                  <span className="relative grid h-14 w-14 place-items-center rounded-full bg-gold text-emerald-deep transition-transform group-hover:scale-110">
                    <Play className="h-5 w-5 fill-current" />
                  </span>
                </button>
                <ul className="space-y-3 text-sm leading-relaxed text-emerald-deep/80">
                  <li className="flex gap-3"><span className="font-display text-sm tabular text-gold">01</span> Gate access — {vendor.zone === "A" ? "Gate 1 (Main)" : vendor.zone === "B" ? "Gate 2 (North)" : vendor.zone === "C" ? "Gate 3 (Family)" : "Gate 4 (South)"}</li>
                  <li className="flex gap-3"><span className="font-display text-sm tabular text-gold">02</span> Setup zone — {ZONES.find((z) => z.id === vendor.zone)?.label}</li>
                  <li className="flex gap-3"><span className="font-display text-sm tabular text-gold">03</span> Ground rules, hours, and what to bring</li>
                  <li className="flex gap-3"><span className="font-display text-sm tabular text-gold">04</span> Your contact runner and how to escalate</li>
                </ul>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 lg:border-l-2 lg:border-emerald-deep lg:pl-8">
            <p className="kicker">Plate III · Live Storefront</p>
            <p className="mt-2 text-sm text-emerald-deep/65">Exactly what attendees see in The Directory.</p>
            <div className="mt-5 border border-emerald-deep/25 bg-cream p-5">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-sm tabular text-emerald-deep/40">01 / live</span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-emerald-deep/55">Zone {vendor.zone}</span>
              </div>
              <div className="hairline mt-2" />
              <p className="kicker mt-4">{vendor.category}</p>
              <h3 className="mt-2 font-display text-2xl leading-tight text-emerald-deep">{vendor.business_name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-emerald-deep/75">{vendor.description}</p>
              {items.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {items.map((it) => (
                    <li key={it} className="border border-emerald-deep/25 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-emerald-deep/70">{it}</li>
                  ))}
                </ul>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-emerald-deep/60">
                <span className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[vendor.status as keyof typeof STATUS_META]?.dot ?? "bg-emerald-500"}`} />
                  {STATUS_META[vendor.status as keyof typeof STATUS_META]?.label ?? vendor.status}
                </span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Zone {vendor.zone}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Opens {vendor.opens_at}</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <a href={`tel:${vendor.phone ?? ""}`} className="flex items-center justify-center gap-1.5 border border-emerald-deep bg-emerald-deep py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cream"><Phone className="h-3 w-3" /> Call</a>
                <a href={`https://wa.me/${(vendor.whatsapp ?? vendor.phone ?? "").replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 border border-emerald-deep py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-deep">WhatsApp</a>
              </div>
            </div>

            <div className="mt-8 border-t-2 border-emerald-deep pt-6">
              <p className="kicker">Plate IV · Post-event</p>
              <h3 className="mt-2 font-display text-2xl leading-tight text-emerald-deep">A one-page report after every service.</h3>
              <p className="mt-3 text-sm leading-relaxed text-emerald-deep/70">Units sold, peak hour, sell-out time, returning customers — and what to bring next month.</p>
              <div className="mt-5 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-gold">
                <TrendingUp className="h-3.5 w-3.5" /> Next report: Sat, 9:00 AM
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, unit, tone }: { label: string; value: string; unit?: string; tone?: "gold" }) {
  return (
    <div className="border-t-2 border-emerald-deep pt-3">
      <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-deep/55">{label}</p>
      <p className={`mt-1 font-display text-3xl leading-none tabular ${tone === "gold" ? "text-gold" : "text-emerald-deep"}`}>{value}</p>
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
            <div className={`w-full transition-all ${peak ? "bg-gold" : "bg-emerald-deep/70 group-hover:bg-emerald-deep"}`} style={{ height: `${h}%` }} title={`Hour ${4 + i}:00 — ~${v} customers`} />
          </div>
        );
      })}
    </div>
  );
}
