import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { VENDOR_CATEGORIES, ZONES, STATUS_META } from "@/lib/vendors";
import { ArrowRight, Play, TrendingUp, MapPin, Clock, Phone, LogOut, Pencil, Trash2, Store, Star, Sparkles, Zap, Crown, Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Vendor dashboard — RedeemServe" }] }),
  component: Dashboard,
});

type VendorRow = {
  id: string; business_name: string; category: string; zone: string; description: string;
  capacity: number; popular_items: string[]; price_range: string; phone: string | null;
  whatsapp: string | null; opens_at: string; status: "live" | "low-stock" | "sold-out" | "closed";
  rating: number; expected_customers: number; demand: string; pos_x: number; pos_y: number; verified: boolean;
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
    const { data } = await supabase.from("vendors").select("*").eq("owner_id", u.user.id)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    setVendor((data as any) ?? null);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (loading) {
    return <SiteLayout><div className="mx-auto max-w-[1400px] px-8 py-24 text-emerald-deep/60">Loading…</div></SiteLayout>;
  }

  return (
    <SiteLayout>
      <section className="border-b border-emerald-deep/10 bg-emerald-deep text-cream">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6 px-4 py-10 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gold">
              {vendor ? "Vendor dashboard" : "Welcome"}
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
              {vendor ? vendor.business_name : `Hello, ${user?.email}`}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-cream/75">
              {vendor
                ? "Your storefront is live in the marketplace. Manage your listing below."
                : "Create your storefront to start selling at the next Holy Ghost Service."}
            </p>
          </div>
          <button onClick={signOut} className="inline-flex items-center gap-2 rounded-full border border-cream/30 px-4 py-2 text-xs font-semibold text-cream hover:bg-cream/10">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </section>

      {!vendor || editing ? (
        <VendorForm existing={editing ? vendor : null} ownerId={user!.id} onDone={() => { setEditing(false); load(); }} />
      ) : (
        <>
          <VendorOrdersPanel vendorId={vendor.id} />
          <KycPanel vendor={vendor as any} onChange={load} />
          <RevenuePanel vendor={vendor as any} onChange={load} />
          <VendorDashboard vendor={vendor} onEdit={() => setEditing(true)} onDelete={async () => {
            if (!confirm("Delete this vendor listing?")) return;
            await supabase.from("vendors").delete().eq("id", vendor.id);
            load();
          }} />
        </>
      )}
    </SiteLayout>
  );
}

function VendorOrdersPanel({ vendorId }: { vendorId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  async function load() {
    const { data } = await supabase.from("orders" as any)
      .select("*, order_items(*)").eq("vendor_id", vendorId)
      .order("created_at", { ascending: false }).limit(20);
    setOrders((data as any) ?? []);
  }
  useEffect(() => {
    load();
    const ch = supabase.channel(`vendor-orders-${vendorId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `vendor_id=eq.${vendorId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [vendorId]);
  async function setStatus(id: string, status: string) {
    await supabase.from("orders" as any).update({ status }).eq("id", id);
  }
  const pending = orders.filter((o) => o.status === "pending").length;
  return (
    <section className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-8">
      <div className="rounded-2xl border border-emerald-deep/10 bg-surface p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-extrabold text-emerald-deep">Incoming orders</h2>
            <p className="text-xs text-emerald-deep/60">Live · updates instantly when new orders arrive</p>
          </div>
          {pending > 0 && <span className="inline-flex items-center gap-2 rounded-full bg-gold px-3 py-1 text-xs font-bold text-emerald-deep">{pending} new</span>}
        </div>
        {orders.length === 0 ? (
          <p className="mt-6 text-sm text-emerald-deep/55">No orders yet. Share your vendor link to start receiving them.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="rounded-xl border border-emerald-deep/10 bg-cream p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-emerald-deep">{o.buyer_name || "Buyer"} · {o.buyer_phone}</p>
                    <p className="text-xs text-emerald-deep/60">{new Date(o.created_at).toLocaleString()} · Zone {o.pickup_zone}</p>
                  </div>
                  <span className="rounded-full bg-emerald-soft px-3 py-1 text-[11px] font-semibold uppercase text-emerald-deep">{o.status}</span>
                </div>
                <ul className="mt-3 text-sm text-emerald-deep/85">
                  {(o.order_items ?? []).map((i: any) => <li key={i.id}>• {i.quantity}× {i.name} — ₦{(i.unit_price_naira * i.quantity).toLocaleString()}</li>)}
                </ul>
                {o.notes && <p className="mt-2 text-xs text-emerald-deep/60">Note: {o.notes}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {o.status === "pending" && <button onClick={() => setStatus(o.id, "accepted")} className="rounded-full bg-emerald-deep px-3 py-1 text-xs font-semibold text-cream">Accept</button>}
                  {o.status === "accepted" && <button onClick={() => setStatus(o.id, "ready")} className="rounded-full bg-emerald-deep px-3 py-1 text-xs font-semibold text-cream">Mark ready</button>}
                  {o.status === "ready" && <button onClick={() => setStatus(o.id, "delivered")} className="rounded-full bg-emerald-deep px-3 py-1 text-xs font-semibold text-cream">Mark delivered</button>}
                  {o.status !== "cancelled" && o.status !== "delivered" && <button onClick={() => setStatus(o.id, "cancelled")} className="rounded-full border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-600">Cancel</button>}
                  <span className="ml-auto font-display text-sm font-bold text-emerald-deep tabular">₦{o.total_naira.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function VendorForm({ existing, ownerId, onDone }: { existing: VendorRow | null; ownerId: string; onDone: () => void }) {
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
  const [step, setStep] = useState(existing ? 4 : 1);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const STEPS = [
    { n: 1, label: "Basics", hint: "Name, category, zone" },
    { n: 2, label: "Offer", hint: "What you sell" },
    { n: 3, label: "Logistics", hint: "Capacity & pricing" },
    { n: 4, label: "Contact", hint: "Phone, hours, publish" },
  ];

  function stepValid(s: number) {
    if (s === 1) return f.business_name.trim() && f.category && f.zone;
    if (s === 2) return f.description.trim().length >= 10;
    if (s === 3) return parseInt(f.capacity || "0", 10) > 0;
    if (s === 4) return f.phone.trim();
    return true;
  }

  async function save() {
    setErr(null); setSaving(true);
    const payload = {
      owner_id: ownerId,
      business_name: f.business_name, category: f.category, zone: f.zone,
      description: f.description, capacity: parseInt(f.capacity || "0", 10),
      popular_items: f.popular.split(",").map((s) => s.trim()).filter(Boolean),
      price_range: f.price_range, phone: f.phone || null, whatsapp: f.whatsapp || null,
      opens_at: f.opens_at, status: f.status,
      pos_x: Math.floor(20 + Math.random() * 60), pos_y: Math.floor(20 + Math.random() * 60),
    };
    const { error } = existing
      ? await supabase.from("vendors").update(payload).eq("id", existing.id)
      : await supabase.from("vendors").insert(payload as any);
    setSaving(false);
    if (error) setErr(error.message); else onDone();
  }

  function next(e?: React.FormEvent) {
    e?.preventDefault();
    if (!stepValid(step)) { setErr("Please complete this step before continuing."); return; }
    setErr(null);
    if (step < 4) setStep(step + 1); else save();
  }

  return (
    <section className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 sm:px-8 lg:grid-cols-3">
      <form onSubmit={next} className="lg:col-span-2 rounded-2xl border border-emerald-deep/10 bg-surface p-6 shadow-card sm:p-8">
        <h2 className="font-display text-2xl font-extrabold text-emerald-deep">
          {existing ? "Edit your storefront" : "Create your storefront"}
        </h2>
        <p className="mt-1 text-sm text-emerald-deep/65">Step {step} of 4 — {STEPS[step - 1].hint}</p>

        {/* Stepper */}
        <ol className="mt-6 flex items-center gap-2">
          {STEPS.map((s) => (
            <li key={s.n} className="flex-1">
              <button type="button" onClick={() => setStep(s.n)} className="group block w-full text-left">
                <div className={`h-1.5 rounded-full ${step >= s.n ? "bg-emerald-deep" : "bg-emerald-deep/15"}`} />
                <p className={`mt-1.5 text-[11px] font-semibold ${step >= s.n ? "text-emerald-deep" : "text-emerald-deep/40"}`}>{s.n}. {s.label}</p>
              </button>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-5">
          {step === 1 && (
            <>
              <Field label="Business name" required>
                <input required value={f.business_name} onChange={(e) => setF({ ...f, business_name: e.target.value })} className="ed-input" placeholder="e.g. Mama Ngozi's Jollof Kitchen" />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Category" required>
                  <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className="ed-input">
                    {VENDOR_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Zone" required>
                  <select value={f.zone} onChange={(e) => setF({ ...f, zone: e.target.value })} className="ed-input">
                    {ZONES.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}
                  </select>
                </Field>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <Field label="What you offer" required>
                <textarea required rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="ed-input resize-none" placeholder="A short line attendees will read on your card…" />
              </Field>
              <Field label="Popular items (comma-separated)">
                <input value={f.popular} onChange={(e) => setF({ ...f, popular: e.target.value })} className="ed-input" placeholder="Jollof Rice, Plantain, Grilled Chicken" />
              </Field>
            </>
          )}

          {step === 3 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Daily capacity" required>
                <input required type="number" min="1" value={f.capacity} onChange={(e) => setF({ ...f, capacity: e.target.value })} className="ed-input" placeholder="500" />
              </Field>
              <Field label="Price range">
                <input value={f.price_range} onChange={(e) => setF({ ...f, price_range: e.target.value })} className="ed-input" placeholder="₦500 – ₦3,500" />
              </Field>
            </div>
          )}

          {step === 4 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Phone" required>
                  <input required type="tel" value={f.phone ?? ""} onChange={(e) => setF({ ...f, phone: e.target.value })} className="ed-input" placeholder="+234…" />
                </Field>
                <Field label="WhatsApp (optional)">
                  <input value={f.whatsapp ?? ""} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} className="ed-input" placeholder="+234…" />
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Opens at">
                  <input value={f.opens_at} onChange={(e) => setF({ ...f, opens_at: e.target.value })} className="ed-input" placeholder="6:00 AM" />
                </Field>
                <Field label="Status">
                  <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as any })} className="ed-input">
                    <option value="live">Open now</option>
                    <option value="low-stock">Low stock</option>
                    <option value="sold-out">Sold out</option>
                    <option value="closed">Closed</option>
                  </select>
                </Field>
              </div>
            </>
          )}
        </div>

        {err && <p className="mt-5 text-sm text-rose-600">{err}</p>}

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-emerald-deep/10 pt-6">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="inline-flex items-center gap-2 rounded-full border border-emerald-deep/20 px-5 py-3 text-sm font-semibold text-emerald-deep hover:bg-emerald-soft">
              Back
            </button>
          ) : <span className="text-xs text-emerald-deep/55">By publishing you agree to the RedeemServe vendor terms.</span>}
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-emerald-deep px-6 py-3 text-sm font-semibold text-cream hover:bg-emerald disabled:opacity-50">
            {step < 4 ? "Continue" : saving ? "Saving…" : existing ? "Save changes" : "Publish storefront"} <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <style>{`
          .ed-input { width:100%; border:1px solid oklch(0.32 0.06 160 / 0.18); border-radius: 10px; padding:.65rem .85rem; font-family:var(--font-sans); font-size:.9rem; color:var(--ink); background:var(--surface); outline:none; transition:border-color .15s, box-shadow .15s; }
          .ed-input:focus { border-color: var(--emerald); box-shadow: 0 0 0 3px oklch(0.5 0.1 162 / 0.18); }
          .ed-input::placeholder { color: oklch(0.32 0.06 160 / 0.45); }
        `}</style>
      </form>

      <aside className="rounded-2xl border border-emerald-deep/10 bg-emerald-soft/50 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald">What you get</p>
        <h3 className="mt-2 font-display text-xl font-extrabold text-emerald-deep">Everything in one account.</h3>
        <ol className="mt-6 space-y-4">
          {[
            ["AI demand forecast", "Predicted hourly customers, trained on RCCG event patterns."],
            ["Live storefront", "A card every attendee sees in the marketplace."],
            ["Verified badge", "A trust mark for approved Redemption City vendors."],
            ["Onboarding briefing", "A short AI video explaining setup & logistics."],
            ["Post-event report", "What sold, what didn't, and what to prepare next month."],
          ].map(([t, b], i) => (
            <li key={t} className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-deep text-xs font-semibold text-cream tabular">{i + 1}</span>
              <div>
                <p className="text-sm font-semibold text-emerald-deep">{t}</p>
                <p className="mt-0.5 text-xs text-emerald-deep/65">{b}</p>
              </div>
            </li>
          ))}
        </ol>
      </aside>
    </section>
  );
}


function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-emerald-deep">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
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
  const statusMeta = STATUS_META[(vendor.status === "closed" ? "sold-out" : vendor.status) as keyof typeof STATUS_META];

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-8">
      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={onEdit} className="inline-flex items-center gap-2 rounded-full border border-emerald-deep px-4 py-2 text-xs font-semibold text-emerald-deep hover:bg-emerald-deep hover:text-cream">
          <Pencil className="h-3.5 w-3.5" /> Edit listing
        </button>
        <Link to="/discover" className="inline-flex items-center gap-2 rounded-full border border-emerald-deep/20 px-4 py-2 text-xs font-semibold text-emerald-deep/70 hover:border-emerald-deep hover:text-emerald-deep">
          View in marketplace <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <button onClick={onDelete} className="ml-auto inline-flex items-center gap-2 rounded-full border border-rose-300 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50">
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Stat label="Expected customers" value={forecast.customers.toLocaleString()} sub="next service" />
        <Stat label="Revenue band" value={`₦${(forecast.revenue / 1000).toFixed(0)}k`} sub="estimated" />
        <Stat label="Demand level" value={forecast.demand} sub={`Peak ${forecast.peakHour}`} tone="gold" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-emerald-deep/10 bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-emerald-deep">Hourly demand forecast</h3>
            <span className="text-xs text-emerald-deep/55">04:00 → 20:00</span>
          </div>
          <HourlyChart values={forecast.hourly} />

          <div className="mt-8 rounded-2xl bg-emerald-soft/50 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald">Onboarding briefing</p>
                <h4 className="mt-1 font-display text-lg font-bold text-emerald-deep">Your AI video is ready</h4>
              </div>
              <span className="rounded-full bg-gold-soft px-3 py-1 text-[11px] font-semibold text-emerald-deep">4 min · personalised</span>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <button className="grid h-28 w-full place-items-center rounded-xl bg-emerald-deep/5 sm:w-48">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-gold text-emerald-deep">
                  <Play className="h-5 w-5 fill-current" />
                </span>
              </button>
              <ul className="space-y-2 text-sm text-emerald-deep/80">
                <li>• Gate access — {vendor.zone === "A" ? "Gate 1 (Main)" : vendor.zone === "B" ? "Gate 2 (North)" : vendor.zone === "C" ? "Gate 3 (Family)" : "Gate 4 (South)"}</li>
                <li>• Setup zone — {ZONES.find((z) => z.id === vendor.zone)?.label}</li>
                <li>• Ground rules, hours, and what to bring</li>
                <li>• Your contact runner and how to escalate</li>
              </ul>
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-emerald-deep/10 bg-surface p-6 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald">Storefront preview</p>
          <p className="mt-1 text-xs text-emerald-deep/60">What attendees see in the marketplace.</p>
          <div className="mt-4 rounded-2xl border border-emerald-deep/10 bg-cream p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-soft text-emerald-deep">
                <Store className="h-5 w-5" />
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${statusMeta?.bg} ${statusMeta?.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusMeta?.dot}`} /> {statusMeta?.label}
              </span>
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-emerald-deep">{vendor.business_name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-emerald-deep/65">{vendor.description}</p>
            {items.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {items.map((it) => <span key={it} className="rounded-full bg-emerald-soft px-2.5 py-1 text-[11px] text-emerald-deep/75">{it}</span>)}
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-emerald-deep/65">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-deep"><Star className="h-3.5 w-3.5 fill-gold text-gold" /> {Number(vendor.rating).toFixed(1)}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Zone {vendor.zone}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {vendor.opens_at}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href={`tel:${vendor.phone ?? ""}`} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-deep py-2 text-xs font-semibold text-cream"><Phone className="h-3.5 w-3.5" /> Call</a>
              <a href={`https://wa.me/${(vendor.whatsapp ?? vendor.phone ?? "").replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-full border border-emerald-deep py-2 text-xs font-semibold text-emerald-deep">WhatsApp</a>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-emerald-soft/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald">Post-event report</p>
            <h4 className="mt-1 font-display text-base font-bold text-emerald-deep">A one-page report after every service.</h4>
            <p className="mt-2 text-xs text-emerald-deep/65">Units sold, peak hour, sell-out time, returning customers.</p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-gold">
              <TrendingUp className="h-3.5 w-3.5" /> Next report: Sat, 9:00 AM
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "gold" }) {
  return (
    <div className="rounded-2xl border border-emerald-deep/10 bg-surface p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-deep/60">{label}</p>
      <p className={`mt-2 font-display text-3xl font-extrabold tabular ${tone === "gold" ? "text-gold" : "text-emerald-deep"}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-emerald-deep/55">{sub}</p>}
    </div>
  );
}

function HourlyChart({ values }: { values: number[] }) {
  const max = Math.max(...values);
  return (
    <div className="mt-6 flex h-44 items-end gap-1.5">
      {values.map((v, i) => {
        const h = (v / max) * 100;
        const peak = v === max;
        return (
          <div key={i} className="group flex h-full flex-1 flex-col justify-end">
            <div className={`w-full rounded-t-md transition-all ${peak ? "bg-gold" : "bg-emerald/70 group-hover:bg-emerald"}`} style={{ height: `${h}%` }} title={`Hour ${4 + i}:00 — ~${v} customers`} />
          </div>
        );
      })}
    </div>
  );
}

function RevenuePanel({ vendor, onChange }: { vendor: any; onChange: () => void }) {
  const [stats, setStats] = useState({ gross: 0, payout: 0, commission: 0, count: 0 });
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from("orders" as any)
      .select("subtotal_naira,commission_naira,vendor_payout_naira,status")
      .eq("vendor_id", vendor.id)
      .neq("status", "cancelled");
    const rows = (data as any[]) ?? [];
    setStats({
      gross: rows.reduce((s, r) => s + Number(r.subtotal_naira || 0), 0),
      payout: rows.reduce((s, r) => s + Number(r.vendor_payout_naira || 0), 0),
      commission: rows.reduce((s, r) => s + Number(r.commission_naira || 0), 0),
      count: rows.length,
    });
  }
  useEffect(() => { load(); }, [vendor.id]);

  async function upgrade(plan: "free" | "pro" | "premium") {
    setBusy(plan);
    await supabase.from("vendors").update({
      plan,
      plan_renews_at: plan === "free" ? null : new Date(Date.now() + 30 * 864e5).toISOString(),
    }).eq("id", vendor.id);
    setBusy(null);
    onChange();
  }
  async function boost() {
    setBusy("boost");
    await supabase.from("vendors").update({
      featured_until: new Date(Date.now() + 7 * 864e5).toISOString(),
    }).eq("id", vendor.id);
    setBusy(null);
    onChange();
  }

  const plan = vendor.plan ?? "free";
  const rate = plan === "premium" ? 3 : plan === "pro" ? 6 : 9;
  const featured = vendor.featured_until && new Date(vendor.featured_until).getTime() > Date.now();

  return (
    <section className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-emerald-deep/10 bg-surface p-6 shadow-card sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-extrabold text-emerald-deep inline-flex items-center gap-2"><Wallet className="h-5 w-5"/> Earnings</h2>
              <p className="text-xs text-emerald-deep/60">Commission rate on your plan: <strong>{rate}%</strong></p>
            </div>
            <span className="rounded-full bg-emerald-soft px-3 py-1 text-[11px] font-semibold uppercase text-emerald-deep">{stats.count} orders</span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Stat label="Gross sales" value={`₦${stats.gross.toLocaleString()}`}/>
            <Stat label="Platform fee" value={`₦${stats.commission.toLocaleString()}`} tone="gold"/>
            <Stat label="Your payout" value={`₦${stats.payout.toLocaleString()}`}/>
          </div>
          <p className="mt-4 text-[11px] text-emerald-deep/55">Platform fees fund payment processing, the AI concierge, vendor support and infrastructure. Payouts settle every Friday.</p>
        </div>

        <div className="rounded-2xl border border-emerald-deep/10 bg-emerald-deep p-6 text-cream shadow-card sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">Grow with RedeemServe</p>
          <h3 className="mt-2 font-display text-lg font-bold">Plan & promotion</h3>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {([
              { id: "free", label: "Free", price: "₦0", rate: "9%", icon: Sparkles },
              { id: "pro", label: "Pro", price: "₦5k/mo", rate: "6%", icon: Zap },
              { id: "premium", label: "Premium", price: "₦15k/mo", rate: "3%", icon: Crown },
            ] as const).map((p) => (
              <button key={p.id} disabled={busy===p.id} onClick={() => upgrade(p.id)}
                className={`rounded-xl border p-3 text-left transition ${plan===p.id ? "border-gold bg-gold/15" : "border-cream/20 hover:border-cream/50"}`}>
                <p.icon className="h-4 w-4 text-gold"/>
                <p className="mt-2 text-sm font-bold">{p.label}</p>
                <p className="text-[11px] text-cream/70">{p.price}</p>
                <p className="mt-1 text-[11px] font-semibold text-gold">{p.rate} fee</p>
                {plan===p.id && <p className="mt-1 text-[10px] uppercase tracking-wider text-gold">Current</p>}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-cream/15 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-gold uppercase tracking-wider">Featured slot</p>
                <p className="mt-1 text-sm">Top of Discover & homepage for 7 days · <strong>₦3,000</strong></p>
              </div>
              <button disabled={busy==="boost"} onClick={boost}
                className="rounded-full bg-gold px-4 py-2 text-xs font-bold text-emerald-deep hover:brightness-95 disabled:opacity-50">
                {featured ? "Renew" : "Boost"}
              </button>
            </div>
            {featured && <p className="mt-2 text-[11px] text-cream/70">Featured until {new Date(vendor.featured_until).toLocaleDateString()}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
