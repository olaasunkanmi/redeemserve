import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Clock, ShoppingBag, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "My orders — RedeemServe" }] }),
  component: MyOrders,
});

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800",
  accepted: "bg-blue-50 text-blue-800",
  ready: "bg-emerald-50 text-emerald-800",
  delivered: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-rose-50 text-rose-700",
};

function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    const { data } = await supabase.from("orders" as any)
      .select("*, vendors(business_name, zone), order_items(*)")
      .eq("buyer_id", user.id).order("created_at", { ascending: false });
    setOrders((data as any) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [user?.id]);
  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("buyer-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `buyer_id=eq.${user.id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

  return (
    <SiteLayout>
      <section className="border-b border-emerald-deep/10 bg-emerald-soft/40">
        <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-8">
          <h1 className="font-display text-3xl font-extrabold text-emerald-deep">My orders</h1>
          <p className="mt-1 text-sm text-emerald-deep/65">Live status from every vendor you've ordered from.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 py-10 sm:px-8">
        {loading ? <p className="text-emerald-deep/60">Loading…</p> :
          orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-emerald-deep/20 bg-surface p-12 text-center">
              <ShoppingBag className="mx-auto h-10 w-10 text-emerald-deep/30"/>
              <p className="mt-3 text-emerald-deep/65">No orders yet.</p>
              <Link to="/discover" className="mt-4 inline-flex rounded-full bg-emerald-deep px-5 py-3 text-sm font-semibold text-cream">Browse vendors <ArrowRight className="ml-1 h-4 w-4"/></Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="rounded-2xl border border-emerald-deep/10 bg-surface p-5 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-bold text-emerald-deep">{o.vendors?.business_name ?? "Vendor"}</p>
                      <p className="mt-0.5 text-xs text-emerald-deep/60"><Clock className="mr-1 inline h-3 w-3"/>{new Date(o.created_at).toLocaleString()} · Zone {o.pickup_zone}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm">
                    {(o.order_items ?? []).map((it: any) => (
                      <li key={it.id} className="flex justify-between text-emerald-deep/85">
                        <span>{it.quantity}× {it.name}</span>
                        <span className="tabular">₦{(it.unit_price_naira * it.quantity).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex justify-between border-t border-emerald-deep/10 pt-3 text-sm font-semibold text-emerald-deep">
                    <span>Total</span><span className="tabular">₦{o.total_naira.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
      </section>
    </SiteLayout>
  );
}
