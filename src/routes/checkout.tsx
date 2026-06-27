import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { ZONES } from "@/lib/vendors";
import { isValidNigerianPhone, toE164Nigerian, NG_PHONE_HINT } from "@/lib/phone";
import { categoryCopy, isServiceCategory } from "@/lib/categories";
import { ShoppingBag, ArrowRight, CheckCircle2, MapPin, Package, Truck, CalendarDays, Users } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — RedeemServe" }] }),
  component: Checkout,
});

const DELIVERY_FEE = 1000;

function Checkout() {
  const { cart, total: subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isService = isServiceCategory(cart?.vendor_category);
  const copy = categoryCopy(cart?.vendor_category);
  const [f, setF] = useState({
    name: "",
    phone: "",
    fulfillment: (isService ? "pickup" : "pickup") as "pickup" | "delivery",
    zone: "A",
    address: "",
    landmark: "",
    notes: "",
    // booking fields (service vendors only)
    bookingDate: "",
    bookingTime: "",
    party: 1,
    nights: 1,
  });
  const [placing, setPlacing] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; code: string } | null>(null);

  const isDelivery = !isService && f.fulfillment === "delivery";
  const deliveryFee = isDelivery ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  async function place(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!user) { navigate({ to: "/auth" }); return; }
    if (!cart || !cart.items.length) return;
    const e164 = toE164Nigerian(f.phone);
    if (!e164) { setErr(NG_PHONE_HINT); return; }
    if (isService) {
      if (!f.bookingDate) { setErr(`Please pick a ${copy.scheduleLabel.toLowerCase()}.`); return; }
    } else if (isDelivery && f.address.trim().length < 6) {
      setErr("Please enter a delivery address inside Redemption Camp."); return;
    }
    setPlacing(true);
    const bookingSummary = isService
      ? `[${copy.fulfillmentLabel}] ${copy.scheduleLabel}: ${f.bookingDate}${f.bookingTime ? ` ${f.bookingTime}` : ""} · ${copy.partyLabel}: ${f.party}${copy.askDuration ? ` · ${copy.durationLabel}: ${f.nights}` : ""}`
      : "";
    const composedNotes = [bookingSummary, f.notes].filter(Boolean).join("\n");
    const { data: order, error } = await supabase.from("orders" as any).insert({
      buyer_id: user.id,
      vendor_id: cart.vendor_id,
      subtotal_naira: subtotal,
      service_fee_naira: deliveryFee,
      delivery_fee_naira: deliveryFee,
      total_naira: total,
      buyer_name: f.name,
      buyer_phone: e164,
      pickup_zone: f.zone,
      fulfillment_type: isService ? "pickup" : f.fulfillment,
      delivery_address: !isService && isDelivery ? f.address : "",
      delivery_landmark: !isService && isDelivery ? f.landmark : "",
      notes: composedNotes,
    }).select("id, tracking_code").single();
    if (error || !order) { setErr(error?.message ?? "Failed to place order"); setPlacing(false); return; }
    const oid = (order as any).id;
    await supabase.from("order_items" as any).insert(cart.items.map((i) => ({
      order_id: oid, name: i.name, unit_price_naira: i.unit_price_naira, quantity: i.quantity,
    })));
    clear();
    setDone({ id: oid, code: (order as any).tracking_code });
    setPlacing(false);
  }

  if (done) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-soft">
            <CheckCircle2 className="h-8 w-8 text-emerald-deep" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-extrabold text-emerald-deep">{isService ? "Booking confirmed" : "Order placed"}</h1>
          <p className="mt-2 text-emerald-deep/65">{isService ? "The vendor will call to confirm your booking shortly." : "The vendor has been notified. Track your order in real time."}</p>
          <div className="mt-6 inline-flex flex-col items-center rounded-2xl border border-emerald-deep/15 bg-emerald-soft/50 px-6 py-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald">{isService ? "Booking code" : "Tracking code"}</span>
            <span className="mt-1 font-display text-2xl font-extrabold text-emerald-deep">{done.code}</span>
            <span className="mt-1 text-xs text-emerald-deep/60">Share this with anyone — no sign-in needed to {isService ? "view" : "track"}.</span>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/track/$code" params={{ code: done.code }} className="inline-flex items-center gap-2 rounded-full bg-emerald-deep px-5 py-3 text-sm font-semibold text-cream">{isService ? "View booking" : "Track this order"} <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/orders" className="inline-flex items-center gap-2 rounded-full border border-emerald-deep px-5 py-3 text-sm font-semibold text-emerald-deep">My orders</Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-emerald-deep/40" />
          <h1 className="mt-4 font-display text-2xl font-extrabold text-emerald-deep">Your cart is empty</h1>
          <Link to="/discover" className="mt-6 inline-flex rounded-full bg-emerald-deep px-5 py-3 text-sm font-semibold text-cream">Browse vendors</Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-[1100px] gap-8 px-4 py-12 sm:px-8 lg:grid-cols-[1fr_22rem]">
        <form onSubmit={place} className="rounded-2xl border border-emerald-deep/10 bg-surface p-6 shadow-card sm:p-8">
          <h1 className="font-display text-2xl font-extrabold text-emerald-deep">{isService ? `${copy.fulfillmentLabel}` : "Checkout"}</h1>
          <p className="mt-1 text-sm text-emerald-deep/60">{isService ? "Booking with" : "Ordering from"} <strong>{cart.vendor_name}</strong></p>

          <div className="mt-6 grid gap-5">
            {isService ? (
              <div className="rounded-xl border border-emerald-deep/15 bg-emerald-soft/40 p-4 text-xs text-emerald-deep/80">
                <p className="flex items-center gap-2 font-semibold text-emerald-deep"><CalendarDays className="h-4 w-4" /> {copy.fulfillmentLabel}</p>
                <p className="mt-1">{copy.fulfillmentHelp}</p>
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-emerald-deep">How would you like to get it? <span className="text-rose-500">*</span></label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <FulfillmentCard active={!isDelivery} icon={<Package className="h-5 w-5" />} title="Pickup" sub="Collect from vendor" onClick={() => setF({ ...f, fulfillment: "pickup" })} />
                  <FulfillmentCard active={isDelivery} icon={<Truck className="h-5 w-5" />} title="Delivery" sub={`+ ₦${DELIVERY_FEE.toLocaleString()} in-camp`} onClick={() => setF({ ...f, fulfillment: "delivery" })} />
                </div>
              </div>
            )}

            <Field label="Your name" required>
              <input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="ed-input" placeholder="Full name" />
            </Field>
            <Field label={isService ? "Phone (vendor will call to confirm)" : "Phone (vendor & courier will call)"} required>
              <input required type="tel" inputMode="tel" autoComplete="tel" value={f.phone}
                onChange={(e) => setF({ ...f, phone: e.target.value })}
                className={`ed-input ${f.phone && !isValidNigerianPhone(f.phone) ? "!border-rose-400" : ""}`}
                placeholder="08031234567 or +2348031234567" />
              <p className="mt-1 text-[11px] text-emerald-deep/55">{NG_PHONE_HINT}</p>
            </Field>

            {isService ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={copy.scheduleLabel} required>
                    <input required type="date" min={new Date().toISOString().slice(0,10)} value={f.bookingDate} onChange={(e) => setF({ ...f, bookingDate: e.target.value })} className="ed-input" />
                  </Field>
                  <Field label={copy.timeLabel}>
                    <input type="time" value={f.bookingTime} onChange={(e) => setF({ ...f, bookingTime: e.target.value })} className="ed-input" />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={copy.partyLabel} required>
                    <input required type="number" min={1} max={50} value={f.party} onChange={(e) => setF({ ...f, party: Math.max(1, parseInt(e.target.value || "1", 10)) })} className="ed-input" />
                  </Field>
                  {copy.askDuration && (
                    <Field label={copy.durationLabel!} required>
                      <input required type="number" min={1} max={60} value={f.nights} onChange={(e) => setF({ ...f, nights: Math.max(1, parseInt(e.target.value || "1", 10)) })} className="ed-input" />
                    </Field>
                  )}
                </div>
                <p className="flex items-center gap-1.5 text-[11px] text-emerald-deep/55"><Users className="h-3 w-3" /> The vendor will confirm availability via call/SMS.</p>
              </>
            ) : isDelivery ? (
              <>
                <Field label="Delivery address inside Redemption Camp" required>
                  <textarea required rows={2} value={f.address}
                    onChange={(e) => setF({ ...f, address: e.target.value })}
                    className="ed-input resize-none"
                    placeholder="e.g. Chalet 12, Bethel Estate, Zone B" />
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald-deep/55"><MapPin className="h-3 w-3" /> Couriers operate within Redemption Camp only.</p>
                </Field>
                <Field label="Nearest landmark (helps the courier)">
                  <input value={f.landmark} onChange={(e) => setF({ ...f, landmark: e.target.value })} className="ed-input" placeholder="e.g. opposite Auditorium" />
                </Field>
              </>
            ) : (
              <Field label="Pickup zone" required>
                <select value={f.zone} onChange={(e) => setF({ ...f, zone: e.target.value })} className="ed-input">
                  {ZONES.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}
                </select>
              </Field>
            )}

            <Field label={isService ? "Special requests" : "Notes (allergies, time)"}>
              <textarea rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} className="ed-input resize-none" />
            </Field>
          </div>

          {err && <p className="mt-4 text-sm text-rose-600">{err}</p>}
          {!user && <p className="mt-4 text-sm text-emerald-deep/70">You'll be asked to sign in to place this order.</p>}

          <button disabled={placing} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-deep px-6 py-3 text-sm font-semibold text-cream hover:bg-emerald disabled:opacity-50">
            {placing ? (isService ? "Booking…" : "Placing…") : `${isService ? "Confirm booking" : "Place order"} · ₦${total.toLocaleString()}`} <ArrowRight className="h-4 w-4" />
          </button>
          <style>{`.ed-input{width:100%;border:1px solid oklch(0.32 0.06 160 / 0.18);border-radius:10px;padding:.65rem .85rem;font-size:.9rem;color:var(--ink);background:var(--surface);outline:none}.ed-input:focus{border-color:var(--emerald);box-shadow:0 0 0 3px oklch(0.5 0.1 162 / 0.18)}`}</style>
        </form>

        <aside className="rounded-2xl border border-emerald-deep/10 bg-emerald-soft/40 p-6 lg:sticky lg:top-24 lg:h-fit">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald">Order summary</p>
          <ul className="mt-4 space-y-2 text-sm">
            {cart.items.map((i) => (
              <li key={i.name} className="flex justify-between gap-2">
                <span className="text-emerald-deep">{i.quantity}× {i.name}</span>
                <span className="tabular text-emerald-deep/75">₦{(i.unit_price_naira * i.quantity).toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1 border-t border-emerald-deep/15 pt-3 text-sm text-emerald-deep/75">
            <div className="flex justify-between"><span>Subtotal</span><span className="tabular">₦{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>{isService ? copy.fulfillmentLabel : isDelivery ? "Delivery fee" : "Pickup"}</span><span className="tabular">{isDelivery ? `₦${DELIVERY_FEE.toLocaleString()}` : isService ? "Included" : "Free"}</span></div>
          </div>
          <div className="mt-3 flex justify-between border-t border-emerald-deep/15 pt-3 font-display text-lg font-extrabold text-emerald-deep">
            <span>Total</span><span className="tabular">₦{total.toLocaleString()}</span>
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
}

function FulfillmentCard({ active, icon, title, sub, onClick }: { active: boolean; icon: React.ReactNode; title: string; sub: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition ${active ? "border-emerald-deep bg-emerald-soft/60" : "border-emerald-deep/15 bg-surface hover:border-emerald-deep/30"}`}>
      <span className={`${active ? "text-emerald-deep" : "text-emerald-deep/60"}`}>{icon}</span>
      <span className="text-sm font-bold text-emerald-deep">{title}</span>
      <span className="text-[11px] text-emerald-deep/60">{sub}</span>
    </button>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div><label className="text-xs font-semibold text-emerald-deep">{label} {required && <span className="text-rose-500">*</span>}</label><div className="mt-1.5">{children}</div></div>;
}
