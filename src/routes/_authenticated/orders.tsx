import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { OrderTimeline } from "@/components/site/OrderTimeline";
import { STATUS_PILL, STATUS_LABEL } from "@/lib/order-status";
import { Clock, ShoppingBag, ArrowRight, MapPin, Truck, Package, Phone, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "My orders — RedeemServe" }] }),
  component: MyOrders,
});

function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [events, setEvents] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    const { data } = await supabase.from("orders" as any)
      .select("*, vendors(business_name, zone, phone), order_items(*)")
      .eq("buyer_id", user.id).order("created_at", { ascending: false });
    const list = (data as any) ?? [];
    setOrders(list);
    if (list.length) {
      const ids = list.map((o: any) => o.id);
      const { data: ev } = await supabase.from("order_tracking_events" as any)
        .select("*").in("order_id", ids).order("created_at", { ascending: true });
      const grouped: Record<string, any[]> = {};
      (ev ?? []).forEach((e: any) => { (grouped[e.order_id] ??= []).push(e); });
      setEvents(grouped);
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, [user?.id]);
  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("buyer-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `buyer_id=eq.${user.id}` }, () => load())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "order_tracking_events" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

  return (
    <SiteLayout>
      <section className="border-b border-emerald-deep/10 bg-emerald-soft/40">
        <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-8">
          <h1 className="font-display text-3xl font-extrabold text-emerald-deep">My orders</h1>
          <p className="mt-1 text-sm text-emerald-deep/65">Live status & delivery tracking from every vendor.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 py-10 sm:px-8">
        {loading ? <p className="text-emerald-deep/60">Loading…</p> :
          orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-emerald-deep/20 bg-surface p-12 text-center">
              <ShoppingBag className="mx-auto h-10 w-10 text-emerald-deep/30" />
              <p className="mt-3 text-emerald-deep/65">No orders yet.</p>
              <Link to="/discover" className="mt-4 inline-flex rounded-full bg-emerald-deep px-5 py-3 text-sm font-semibold text-cream">Browse vendors <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((o) => (
                <article key={o.id} className="grid gap-5 rounded-2xl border border-emerald-deep/10 bg-surface p-5 shadow-card md:grid-cols-[1fr_18rem]">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg font-bold text-emerald-deep">{o.vendors?.business_name ?? "Vendor"}</p>
                        <p className="mt-0.5 text-xs text-emerald-deep/60">
                          <Clock className="mr-1 inline h-3 w-3" />{new Date(o.created_at).toLocaleString()} ·
                          {o.fulfillment_type === "delivery"
                            ? <> <Truck className="mx-1 inline h-3 w-3" /> Delivery</>
                            : <> <Package className="mx-1 inline h-3 w-3" /> Pickup · Zone {o.pickup_zone}</>}
                        </p>
                      </div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${STATUS_PILL[o.status]}`}>{STATUS_LABEL[o.status] ?? o.status}</span>
                    </div>

                    <ul className="mt-3 space-y-1 text-sm">
                      {(o.order_items ?? []).map((it: any) => (
                        <li key={it.id} className="flex justify-between text-emerald-deep/85">
                          <span>{it.quantity}× {it.name}</span>
                          <span className="tabular">₦{(it.unit_price_naira * it.quantity).toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>

                    {o.fulfillment_type === "delivery" && o.delivery_address && (
                      <p className="mt-3 rounded-lg bg-emerald-soft/50 p-2 text-xs text-emerald-deep/80"><MapPin className="mr-1 inline h-3 w-3" />{o.delivery_address}{o.delivery_landmark ? ` · ${o.delivery_landmark}` : ""}</p>
                    )}

                    {o.courier_name && (
                      <p className="mt-2 text-xs text-emerald-deep/80"><Truck className="mr-1 inline h-3 w-3" />Courier: <strong>{o.courier_name}</strong>{o.courier_phone && <> · <a href={`tel:${o.courier_phone}`} className="underline"><Phone className="ml-1 inline h-3 w-3" />{o.courier_phone}</a></>}</p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-emerald-deep/10 pt-3 text-sm">
                      <div className="flex items-center gap-2 text-xs text-emerald-deep/70">
                        <span>Tracking:</span>
                        <code className="rounded bg-emerald-deep/5 px-2 py-0.5 font-mono text-emerald-deep">{o.tracking_code}</code>
                        <button onClick={() => { navigator.clipboard.writeText(o.tracking_code); toast.success("Tracking code copied"); }} className="text-emerald-deep/60 hover:text-emerald-deep"><Copy className="h-3.5 w-3.5" /></button>
                        <Link to="/track/$code" params={{ code: o.tracking_code }} className="ml-2 text-emerald-deep underline">Share link</Link>
                      </div>
                      <span className="font-semibold text-emerald-deep tabular">₦{o.total_naira.toLocaleString()}</span>
                    </div>
                  </div>

                  <aside className="rounded-xl border border-emerald-deep/10 bg-emerald-soft/30 p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald">Live tracking</p>
                    <OrderTimeline status={o.status} fulfillment={o.fulfillment_type} events={events[o.id]} />
                  </aside>
                </article>
              ))}
            </div>
          )}
      </section>
    </SiteLayout>
  );
}
