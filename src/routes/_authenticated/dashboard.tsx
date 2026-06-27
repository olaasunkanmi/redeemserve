import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { UpcomingEvents } from "@/components/site/UpcomingEvents";
import { supabase } from "@/integrations/supabase/client";
import { VENDOR_CATEGORIES, ZONES, STATUS_META } from "@/lib/vendors";
import { isValidNigerianPhone, toE164Nigerian, NG_PHONE_HINT } from "@/lib/phone";
import { ArrowRight, Play, TrendingUp, MapPin, Clock, Phone, LogOut, Pencil, Trash2, Store, Star, Sparkles, Zap, Crown, Wallet, ShieldCheck, Camera, FileText, IdCard, CheckCircle2, Upload, Power, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

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
          <UpcomingEvents variant="vendor" limit={4} />
          <VendorOrdersPanel vendorId={vendor.id} />
          <KycPanel vendor={vendor as any} onChange={load} />
          <RevenuePanel vendor={vendor as any} onChange={load} />
          <VendorDashboard vendor={vendor} onReload={load} onEdit={() => setEditing(true)} onDelete={async () => {
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
  const [courierEdit, setCourierEdit] = useState<Record<string, { name: string; phone: string }>>({});

  async function load() {
    const { data } = await supabase.from("orders" as any)
      .select("*, order_items(*)").eq("vendor_id", vendorId)
      .order("created_at", { ascending: false }).limit(30);
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
    const { error } = await supabase.from("orders" as any).update({ status }).eq("id", id);
    if (error) toast.error(error.message); else toast.success(`Marked ${status.replace(/_/g, " ")}`);
  }
  async function saveCourier(id: string) {
    const c = courierEdit[id]; if (!c?.name) { toast.error("Courier name required"); return; }
    const phone = c.phone ? (toE164Nigerian(c.phone) ?? c.phone) : null;
    const { error } = await supabase.from("orders" as any).update({ courier_name: c.name, courier_phone: phone }).eq("id", id);
    if (error) toast.error(error.message); else toast.success("Courier assigned");
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
            {orders.map((o) => {
              const isDelivery = o.fulfillment_type === "delivery";
              const ce = courierEdit[o.id] ?? { name: o.courier_name ?? "", phone: o.courier_phone ?? "" };
              return (
                <div key={o.id} className="rounded-xl border border-emerald-deep/10 bg-cream p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-emerald-deep">{o.buyer_name || "Buyer"} · <a href={`tel:${o.buyer_phone}`} className="underline">{o.buyer_phone}</a></p>
                      <p className="text-xs text-emerald-deep/60">
                        {new Date(o.created_at).toLocaleString()} · {isDelivery ? "🛵 Delivery" : `📦 Pickup · Zone ${o.pickup_zone}`} · <code className="text-[10px]">{o.tracking_code}</code>
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-soft px-3 py-1 text-[11px] font-semibold uppercase text-emerald-deep">{o.status.replace(/_/g, " ")}</span>
                  </div>

                  {isDelivery && o.delivery_address && (
                    <p className="mt-2 rounded-md bg-emerald-soft/50 px-2 py-1 text-xs text-emerald-deep/80">📍 {o.delivery_address}{o.delivery_landmark ? ` · ${o.delivery_landmark}` : ""}</p>
                  )}

                  <ul className="mt-3 text-sm text-emerald-deep/85">
                    {(o.order_items ?? []).map((i: any) => <li key={i.id}>• {i.quantity}× {i.name} — ₦{(i.unit_price_naira * i.quantity).toLocaleString()}</li>)}
                  </ul>
                  {o.notes && <p className="mt-2 text-xs text-emerald-deep/60">Note: {o.notes}</p>}

                  {isDelivery && ["accepted", "preparing", "ready"].includes(o.status) && (
                    <div className="mt-3 flex flex-wrap items-end gap-2 rounded-lg border border-emerald-deep/15 bg-surface p-2">
                      <div className="flex-1 min-w-[140px]">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-emerald-deep/60">Courier name</label>
                        <input value={ce.name} onChange={(e) => setCourierEdit({ ...courierEdit, [o.id]: { ...ce, name: e.target.value } })} className="w-full rounded-md border border-emerald-deep/20 bg-surface px-2 py-1.5 text-xs text-emerald-deep outline-none focus:border-emerald" placeholder="e.g. Tunde" />
                      </div>
                      <div className="flex-1 min-w-[140px]">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-emerald-deep/60">Courier phone</label>
                        <input value={ce.phone} onChange={(e) => setCourierEdit({ ...courierEdit, [o.id]: { ...ce, phone: e.target.value } })} className="w-full rounded-md border border-emerald-deep/20 bg-surface px-2 py-1.5 text-xs text-emerald-deep outline-none focus:border-emerald" placeholder="0803..." />
                      </div>
                      <button onClick={() => saveCourier(o.id)} className="rounded-full border border-emerald-deep px-3 py-1.5 text-[11px] font-semibold text-emerald-deep">Save courier</button>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {o.status === "pending" && <button onClick={() => setStatus(o.id, "accepted")} className="rounded-full bg-emerald-deep px-3 py-1 text-xs font-semibold text-cream">Accept</button>}
                    {o.status === "accepted" && <button onClick={() => setStatus(o.id, "preparing")} className="rounded-full bg-emerald-deep px-3 py-1 text-xs font-semibold text-cream">Start preparing</button>}
                    {o.status === "preparing" && <button onClick={() => setStatus(o.id, "ready")} className="rounded-full bg-emerald-deep px-3 py-1 text-xs font-semibold text-cream">Mark ready</button>}
                    {o.status === "ready" && isDelivery && <button onClick={() => setStatus(o.id, "out_for_delivery")} className="rounded-full bg-emerald-deep px-3 py-1 text-xs font-semibold text-cream">Out for delivery</button>}
                    {o.status === "ready" && !isDelivery && <button onClick={() => setStatus(o.id, "delivered")} className="rounded-full bg-emerald-deep px-3 py-1 text-xs font-semibold text-cream">Mark picked up</button>}
                    {o.status === "out_for_delivery" && <button onClick={() => setStatus(o.id, "delivered")} className="rounded-full bg-emerald-deep px-3 py-1 text-xs font-semibold text-cream">Mark delivered</button>}
                    {o.status !== "cancelled" && o.status !== "delivered" && <button onClick={() => setStatus(o.id, "cancelled")} className="rounded-full border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-600">Cancel</button>}
                    <span className="ml-auto font-display text-sm font-bold text-emerald-deep tabular">₦{o.total_naira.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
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
    if (s === 4) {
      if (!isValidNigerianPhone(f.phone)) return false;
      if (f.whatsapp && !isValidNigerianPhone(f.whatsapp)) return false;
      return true;
    }
    return true;
  }

  async function save() {
    setErr(null); setSaving(true);
    const phoneE164 = toE164Nigerian(f.phone);
    const waE164 = f.whatsapp ? toE164Nigerian(f.whatsapp) : null;
    if (!phoneE164) { setErr(NG_PHONE_HINT); setSaving(false); return; }
    if (f.whatsapp && !waE164) { setErr(`WhatsApp: ${NG_PHONE_HINT}`); setSaving(false); return; }
    const payload = {
      owner_id: ownerId,
      business_name: f.business_name, category: f.category, zone: f.zone,
      description: f.description, capacity: parseInt(f.capacity || "0", 10),
      popular_items: f.popular.split(",").map((s) => s.trim()).filter(Boolean),
      price_range: f.price_range, phone: phoneE164, whatsapp: waE164,
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
    if (!stepValid(step)) {
      if (step === 4) setErr(NG_PHONE_HINT);
      else setErr("Please complete this step before continuing.");
      return;
    }
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
                  <input required type="tel" inputMode="tel" autoComplete="tel" value={f.phone ?? ""} onChange={(e) => setF({ ...f, phone: e.target.value })} className={`ed-input ${f.phone && !isValidNigerianPhone(f.phone) ? "!border-rose-400" : ""}`} placeholder="08031234567" />
                  <p className="mt-1 text-[11px] text-emerald-deep/55">{NG_PHONE_HINT}</p>
                </Field>
                <Field label="WhatsApp (optional)">
                  <input type="tel" inputMode="tel" value={f.whatsapp ?? ""} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} className={`ed-input ${f.whatsapp && !isValidNigerianPhone(f.whatsapp) ? "!border-rose-400" : ""}`} placeholder="08031234567" />
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

function VendorDashboard({ vendor, onEdit, onDelete, onReload }: { vendor: VendorRow; onEdit: () => void; onDelete: () => void; onReload: () => void }) {
  const forecast = {
    customers: vendor.expected_customers || Math.max(vendor.capacity * 3, 800),
    revenue: Math.max(vendor.capacity * 800, 200000),
    peakHour: "11:00 – 13:00",
    demand: vendor.demand,
    hourly: [220, 380, 540, 720, 920, 1100, 1320, 1450, 1320, 1180, 980, 720, 520, 380, 240, 180],
  };
  const items = vendor.popular_items.slice(0, 4);
  const statusMeta = STATUS_META[(vendor.status === "closed" ? "sold-out" : vendor.status) as keyof typeof STATUS_META];
  const isOpen = vendor.status !== "closed" && vendor.status !== "sold-out";
  const [busy, setBusy] = useState<null | "open" | "close" | "lowstock" | "soldout">(null);

  async function setStoreStatus(next: VendorRow["status"], key: "open" | "close" | "lowstock" | "soldout") {
    setBusy(key);
    const { error } = await supabase.from("vendors").update({ status: next }).eq("id", vendor.id);
    setBusy(null);
    if (error) { toast.error("Could not update store status"); return; }
    toast.success(
      next === "live" ? "Store is now OPEN — visible to attendees" :
      next === "closed" ? "Store is now CLOSED — hidden from new orders" :
      next === "low-stock" ? "Marked as Low stock" : "Marked as Sold out"
    );
    onReload();
  }

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-8">
      <div className={`mb-6 rounded-2xl border p-5 shadow-card ${isOpen ? "border-emerald-deep/15 bg-emerald-soft/40" : "border-rose-300/60 bg-rose-50 dark:bg-rose-950/30"}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`grid h-11 w-11 place-items-center rounded-full ${isOpen ? "bg-emerald-deep text-cream" : "bg-rose-600 text-white"}`}>
              {isOpen ? <Power className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald">Store status</p>
              <h3 className="font-display text-lg font-bold text-emerald-deep">
                {isOpen ? "Open — accepting orders" : vendor.status === "sold-out" ? "Sold out — hidden from buyers" : "Closed — hidden from buyers"}
              </h3>
              <p className="text-xs text-emerald-deep/65">Toggle anytime. Closed stores stop receiving new orders instantly.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isOpen ? (
              <>
                <button disabled={busy !== null} onClick={() => setStoreStatus("low-stock", "lowstock")} className="rounded-full border border-amber-400 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50">
                  {busy === "lowstock" ? "…" : "Mark low stock"}
                </button>
                <button disabled={busy !== null} onClick={() => setStoreStatus("sold-out", "soldout")} className="rounded-full border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50">
                  {busy === "soldout" ? "…" : "Mark sold out"}
                </button>
                <button disabled={busy !== null} onClick={() => { if (confirm("Close your store? Buyers won't be able to place new orders until you re-open.")) setStoreStatus("closed", "close"); }} className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50">
                  <Power className="h-3.5 w-3.5" /> {busy === "close" ? "Closing…" : "Close store"}
                </button>
              </>
            ) : (
              <button disabled={busy !== null} onClick={() => setStoreStatus("live", "open")} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-deep px-4 py-2 text-xs font-bold text-cream hover:bg-emerald disabled:opacity-50">
                <Power className="h-3.5 w-3.5" /> {busy === "open" ? "Opening…" : "Open store"}
              </button>
            )}
          </div>
        </div>
      </div>

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

// ───────── Fiverr-style KYC flow ─────────
const KYC_ID_TYPES = [
  { id: "nin",      label: "NIN (National Identity Number)", needsBack: false, idPattern: /^\d{11}$/, idHint: "11 digits" },
  { id: "bvn",      label: "BVN (Bank Verification Number)", needsBack: false, idPattern: /^\d{11}$/, idHint: "11 digits" },
  { id: "drivers",  label: "Driver's Licence",               needsBack: true,  idPattern: /^[A-Z]{3}\d{5}[A-Z]{2}\d$/i, idHint: "e.g. ABC12345DE1" },
  { id: "passport", label: "International Passport",         needsBack: false, idPattern: /^[A-Z]\d{8}$/i, idHint: "1 letter + 8 digits" },
  { id: "voters",   label: "Voter's Card (PVC)",             needsBack: true,  idPattern: /^[A-Z0-9]{8,20}$/i, idHint: "8–20 letters/digits" },
  { id: "cac",      label: "CAC Certificate (Business)",     needsBack: false, idPattern: /^(RC|BN)\s?\d{3,8}$/i, idHint: "e.g. RC1234567 or BN123456" },
] as const;

function KycPanel({ vendor, onChange }: { vendor: any; onChange: () => void }) {
  const status = vendor.kyc_status || "unsubmitted";
  const submitted = status !== "unsubmitted";
  const [open, setOpen] = useState(!submitted);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const initialType = vendor.kyc_type || "nin";
  const [form, setForm] = useState({
    type: initialType as string,
    full_name: vendor.kyc_full_name || "",
    id_number: vendor.kyc_id_number || "",
    dob: vendor.kyc_dob || "",
    address: vendor.kyc_address || "",
  });
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  const typeDef = KYC_ID_TYPES.find((t) => t.id === form.type) ?? KYC_ID_TYPES[0];

  const badge = ({
    unsubmitted: { txt: "Not submitted", cls: "bg-emerald-deep/10 text-emerald-deep/70" },
    pending:     { txt: "Pending review", cls: "bg-amber-100 text-amber-800" },
    approved:    { txt: "Approved ✓", cls: "bg-emerald-soft text-emerald-deep" },
    rejected:    { txt: "Action required", cls: "bg-rose-100 text-rose-700" },
  } as any)[status] ?? { txt: status, cls: "bg-emerald-deep/10" };

  async function uploadOne(file: File, slot: "front" | "back" | "selfie") {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${vendor.id}/${slot}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("kyc-documents")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) throw upErr;
    return path;
  }

  function validateStep(s: number): string | null {
    if (s === 1) return form.type ? null : "Choose an ID type to continue.";
    if (s === 2) {
      if (!form.full_name.trim()) return "Enter the full name on your ID.";
      if (!form.id_number.trim()) return "Enter the ID number.";
      if (!typeDef.idPattern.test(form.id_number.trim())) return `Invalid ${typeDef.label} format (${typeDef.idHint}).`;
      if (form.type !== "cac" && !form.dob) return "Enter your date of birth.";
      if (!form.address.trim() || form.address.trim().length < 8) return "Enter your residential / business address.";
      return null;
    }
    if (s === 3) {
      if (!frontFile && !vendor.kyc_doc_path) return "Upload the front of your ID.";
      if (typeDef.needsBack && !backFile && !vendor.kyc_doc_back_path) return "Upload the back of your ID.";
      return null;
    }
    if (s === 4) {
      if (!selfieFile && !vendor.kyc_selfie_path) return "Upload a selfie holding your ID.";
      return null;
    }
    return null;
  }

  async function submit() {
    setErr(null); setBusy(true);
    try {
      const updates: any = {
        kyc_type: form.type,
        kyc_full_name: form.full_name.trim(),
        kyc_id_number: form.id_number.trim().toUpperCase(),
        kyc_dob: form.dob || null,
        kyc_address: form.address.trim(),
        kyc_status: "pending",
        kyc_submitted_at: new Date().toISOString(),
        kyc_notes: null,
      };
      if (frontFile)  updates.kyc_doc_path      = await uploadOne(frontFile,  "front");
      if (backFile)   updates.kyc_doc_back_path = await uploadOne(backFile,   "back");
      if (selfieFile) updates.kyc_selfie_path   = await uploadOne(selfieFile, "selfie");
      const { error: dbErr } = await supabase.from("vendors").update(updates).eq("id", vendor.id);
      if (dbErr) throw dbErr;
      setStep(5);
      onChange();
    } catch (e: any) { setErr(e.message || "Upload failed"); }
    finally { setBusy(false); }
  }

  const STEPS = [
    { n: 1, label: "ID type",  icon: IdCard },
    { n: 2, label: "Details",  icon: FileText },
    { n: 3, label: "Document", icon: Upload },
    { n: 4, label: "Selfie",   icon: Camera },
  ];

  return (
    <section className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-8">
      <div className="rounded-2xl border border-emerald-deep/10 bg-surface p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-extrabold text-emerald-deep inline-flex items-center gap-2">
              <ShieldCheck className="h-5 w-5"/> Identity verification (KYC)
            </h2>
            <p className="text-xs text-emerald-deep/60">A 4-step check (ID type → details → document → selfie). Approved vendors get a verified badge, priority listing & higher payout limits.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${badge.cls}`}>{badge.txt}</span>
            {submitted && (
              <button onClick={() => { setOpen((v) => !v); setStep(1); }} className="rounded-full border border-emerald-deep/20 px-3 py-1 text-[11px] font-semibold text-emerald-deep hover:bg-emerald-soft">
                {open ? "Close" : status === "rejected" ? "Re-submit" : "Update"}
              </button>
            )}
          </div>
        </div>

        {vendor.kyc_notes && status === "rejected" && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">Reviewer note: {vendor.kyc_notes}</p>
        )}

        {open && (
          <>
            {/* Stepper */}
            <ol className="mt-6 grid grid-cols-4 gap-2">
              {STEPS.map((s) => {
                const Icon = s.icon;
                const active = step === s.n;
                const done = step > s.n;
                return (
                  <li key={s.n} className={`rounded-xl border p-3 text-left transition ${active ? "border-emerald-deep bg-emerald-soft/50" : done ? "border-emerald/40 bg-emerald-soft/20" : "border-emerald-deep/10"}`}>
                    <div className="flex items-center gap-2">
                      <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${active || done ? "bg-emerald-deep text-cream" : "bg-emerald-deep/10 text-emerald-deep/60"}`}>
                        {done ? <CheckCircle2 className="h-4 w-4"/> : <Icon className="h-3.5 w-3.5"/>}
                      </span>
                      <span className={`text-[11px] font-semibold ${active || done ? "text-emerald-deep" : "text-emerald-deep/55"}`}>{s.n}. {s.label}</span>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-6">
              {step === 1 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {KYC_ID_TYPES.map((t) => (
                    <button key={t.id} type="button" onClick={() => setForm({ ...form, type: t.id, id_number: "" })}
                      className={`rounded-xl border p-4 text-left transition ${form.type === t.id ? "border-emerald-deep bg-emerald-soft/40" : "border-emerald-deep/15 hover:border-emerald-deep/40"}`}>
                      <p className="text-sm font-semibold text-emerald-deep">{t.label}</p>
                      <p className="mt-1 text-[11px] text-emerald-deep/60">Format: {t.idHint}{t.needsBack ? " · front & back required" : ""}</p>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-5">
                  <Field label="Full legal name (as on ID)" required>
                    <input className="ed-input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="e.g. Adekunle Janet Olamide"/>
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label={`${typeDef.label} number`} required>
                      <input className="ed-input" value={form.id_number} onChange={(e) => setForm({ ...form, id_number: e.target.value })} placeholder={typeDef.idHint}/>
                      <p className="mt-1 text-[11px] text-emerald-deep/55">Expected: {typeDef.idHint}</p>
                    </Field>
                    {form.type !== "cac" && (
                      <Field label="Date of birth" required>
                        <input type="date" className="ed-input" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} max={new Date().toISOString().slice(0,10)}/>
                      </Field>
                    )}
                  </div>
                  <Field label="Residential / business address" required>
                    <textarea rows={2} className="ed-input resize-none" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House/street, city, state"/>
                  </Field>
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FileSlot label={`Front of ${typeDef.label}`} file={frontFile} existing={!!vendor.kyc_doc_path} onPick={setFrontFile}/>
                  {typeDef.needsBack && (
                    <FileSlot label={`Back of ${typeDef.label}`} file={backFile} existing={!!vendor.kyc_doc_back_path} onPick={setBackFile}/>
                  )}
                  <p className="sm:col-span-2 text-[11px] text-emerald-deep/55">Use a clear, well-lit photo. JPG, PNG or PDF · max 10 MB. All four corners must be visible and no glare.</p>
                </div>
              )}

              {step === 4 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FileSlot label="Selfie holding your ID" file={selfieFile} existing={!!vendor.kyc_selfie_path} onPick={setSelfieFile} accept="image/*" capture/>
                  <div className="rounded-xl bg-emerald-soft/40 p-4 text-xs text-emerald-deep/75">
                    <p className="font-semibold text-emerald-deep">How to take it</p>
                    <ul className="mt-2 space-y-1 list-disc pl-4">
                      <li>Hold the same ID next to your face.</li>
                      <li>Your face and the ID details must both be readable.</li>
                      <li>Good lighting · no filters, hats, or sunglasses.</li>
                    </ul>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="rounded-xl bg-emerald-soft/40 p-6 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-deep"/>
                  <p className="mt-3 font-display text-lg font-bold text-emerald-deep">Submitted for review</p>
                  <p className="mt-1 text-xs text-emerald-deep/70">Our team typically reviews KYC within 24 hours. You'll get an email when it's approved.</p>
                </div>
              )}
            </div>

            {err && <p className="mt-4 text-sm text-rose-600">{err}</p>}

            {step < 5 && (
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-emerald-deep/10 pt-5">
                {step > 1 ? (
                  <button onClick={() => { setErr(null); setStep(step - 1); }} className="rounded-full border border-emerald-deep/20 px-5 py-2 text-xs font-semibold text-emerald-deep hover:bg-emerald-soft">Back</button>
                ) : <span className="text-[11px] text-emerald-deep/55">Your information is encrypted & only used for verification.</span>}
                <button
                  disabled={busy}
                  onClick={() => {
                    const msg = validateStep(step);
                    if (msg) { setErr(msg); return; }
                    setErr(null);
                    if (step < 4) setStep(step + 1); else submit();
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-deep px-5 py-2 text-xs font-semibold text-cream hover:bg-emerald disabled:opacity-50">
                  {busy ? "Submitting…" : step < 4 ? "Continue" : "Submit for review"} <ArrowRight className="h-3.5 w-3.5"/>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function FileSlot({ label, file, existing, onPick, accept = "image/*,application/pdf", capture }: {
  label: string; file: File | null; existing?: boolean; onPick: (f: File) => void; accept?: string; capture?: boolean;
}) {
  return (
    <label className="block cursor-pointer rounded-xl border-2 border-dashed border-emerald-deep/20 bg-cream p-4 hover:border-emerald-deep/50">
      <p className="text-xs font-semibold text-emerald-deep">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-soft text-emerald-deep">
          {capture ? <Camera className="h-5 w-5"/> : <Upload className="h-5 w-5"/>}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-emerald-deep/80">
            {file ? file.name : existing ? "Replace existing file…" : "Tap to upload (or take a photo)"}
          </p>
          <p className="text-[11px] text-emerald-deep/50">JPG · PNG · PDF · max 10 MB</p>
        </div>
      </div>
      <input
        type="file"
        accept={accept}
        {...(capture ? { capture: "user" as any } : {})}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          if (f.size > 10 * 1024 * 1024) { alert("Max file size is 10 MB"); return; }
          onPick(f);
        }}
      />
    </label>
  );
}
