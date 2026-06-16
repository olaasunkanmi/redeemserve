import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { ZONES } from "@/lib/vendors";
import { ShoppingBag, ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — RedeemServe" }] }),
  component: Checkout,
});

function Checkout() {
  const { cart, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", phone: "", zone: "A", notes: "" });
  const [placing, setPlacing] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function place(e: React.FormEvent) {
    e.preventDefault(); setErr(null);
    if (!user) { navigate({ to: "/auth" }); return; }
    if (!cart || !cart.items.length) return;
    setPlacing(true);
    const { data: order, error } = await supabase.from("orders" as any).insert({
      buyer_id: user.id, vendor_id: cart.vendor_id,
      total_naira: total, buyer_name: f.name, buyer_phone: f.phone,
      pickup_zone: f.zone, notes: f.notes,
    }).select().single();
    if (error || !order) { setErr(error?.message ?? "Failed"); setPlacing(false); return; }
    const oid = (order as any).id;
    await supabase.from("order_items" as any).insert(cart.items.map((i) => ({
      order_id: oid, name: i.name, unit_price_naira: i.unit_price_naira, quantity: i.quantity,
    })));
    clear();
    setDone(oid);
    setPlacing(false);
  }

  if (done) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-soft">
            <CheckCircle2 className="h-8 w-8 text-emerald-deep"/>
          </div>
          <h1 className="mt-6 font-display text-3xl font-extrabold text-emerald-deep">Order placed</h1>
          <p className="mt-2 text-emerald-deep/65">The vendor has been notified. You'll see status updates in real time.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/orders" className="inline-flex items-center gap-2 rounded-full bg-emerald-deep px-5 py-3 text-sm font-semibold text-cream">View my orders <ArrowRight className="h-4 w-4"/></Link>
            <Link to="/discover" className="inline-flex items-center gap-2 rounded-full border border-emerald-deep px-5 py-3 text-sm font-semibold text-emerald-deep">Keep browsing</Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-emerald-deep/40"/>
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
          <h1 className="font-display text-2xl font-extrabold text-emerald-deep">Checkout</h1>
          <p className="mt-1 text-sm text-emerald-deep/60">Ordering from <strong>{cart.vendor_name}</strong></p>

          <div className="mt-6 grid gap-5">
            <Field label="Your name" required>
              <input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="ed-input" placeholder="Full name"/>
            </Field>
            <Field label="Phone (vendor will call)" required>
              <input required type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className="ed-input" placeholder="+234…"/>
            </Field>
            <Field label="Pickup zone" required>
              <select value={f.zone} onChange={(e) => setF({ ...f, zone: e.target.value })} className="ed-input">
                {ZONES.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}
              </select>
            </Field>
            <Field label="Notes (allergies, time)">
              <textarea rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} className="ed-input resize-none"/>
            </Field>
          </div>

          {err && <p className="mt-4 text-sm text-rose-600">{err}</p>}
          {!user && <p className="mt-4 text-sm text-emerald-deep/70">You'll be asked to sign in to place this order.</p>}

          <button disabled={placing} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-deep px-6 py-3 text-sm font-semibold text-cream hover:bg-emerald disabled:opacity-50">
            {placing ? "Placing…" : `Place order · ₦${total.toLocaleString()}`} <ArrowRight className="h-4 w-4"/>
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
          <div className="mt-4 flex justify-between border-t border-emerald-deep/15 pt-3 font-display text-lg font-extrabold text-emerald-deep">
            <span>Total</span><span className="tabular">₦{total.toLocaleString()}</span>
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div><label className="text-xs font-semibold text-emerald-deep">{label} {required && <span className="text-rose-500">*</span>}</label><div className="mt-1.5">{children}</div></div>;
}
