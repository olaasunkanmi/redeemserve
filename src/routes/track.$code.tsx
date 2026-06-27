import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { OrderTimeline } from "@/components/site/OrderTimeline";
import { STATUS_PILL, STATUS_LABEL } from "@/lib/order-status";
import { MapPin, Truck, Package, Phone, Search, Loader2 } from "lucide-react";

export const Route = createFileRoute("/track/$code")({
  head: ({ params }) => ({ meta: [{ title: `Track ${params.code} — RedeemServe` }] }),
  component: TrackPage,
});

function TrackPage() {
  const { code } = Route.useParams();
  const [input, setInput] = useState(code);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const fetchOrder = useCallback(async (c: string) => {
    setLoading(true); setErr(null);
    const { data: res, error } = await supabase.rpc("track_order" as any, { _code: c.trim() });
    if (error) { setErr(error.message); setData(null); }
    else if (!res) { setErr("No order found for this tracking code."); setData(null); }
    else setData(res);
    setLoading(false);
  }, []);

  useEffect(() => { setInput(code); fetchOrder(code); }, [code, fetchOrder]);

  // Realtime: refetch when this order changes
  useEffect(() => {
    if (!data?.tracking_code) return;
    const ch = supabase.channel(`track-${data.tracking_code}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "order_tracking_events" }, () => fetchOrder(data.tracking_code))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [data?.tracking_code, fetchOrder]);

  return (
    <SiteLayout>
      <section className="border-b border-emerald-deep/10 bg-emerald-deep text-cream">
        <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">Order tracking</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Track your order</h1>
          <form onSubmit={(e) => { e.preventDefault(); fetchOrder(input); }} className="mt-5 flex max-w-md gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-full bg-cream/15 px-4 ring-1 ring-cream/25 focus-within:ring-cream/60">
              <Search className="h-4 w-4 text-cream/70" />
              <input value={input} onChange={(e) => setInput(e.target.value.toUpperCase())} placeholder="RS-XXXXXXXX"
                className="w-full bg-transparent py-2.5 text-sm uppercase tracking-wider text-cream placeholder:text-cream/50 focus:outline-none" />
            </div>
            <button className="rounded-full bg-gold px-4 py-2 text-xs font-bold text-emerald-deep">Track</button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-[900px] px-4 py-10 sm:px-8">
        {loading ? <p className="flex items-center gap-2 text-emerald-deep/65"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
        : err ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{err}</div>
        : data && (
          <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
            <div className="rounded-2xl border border-emerald-deep/10 bg-surface p-6 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald">Tracking · {data.tracking_code}</p>
                  <h2 className="mt-1 font-display text-2xl font-extrabold text-emerald-deep">{data.vendor?.business_name}</h2>
                  <p className="mt-1 text-xs text-emerald-deep/65">
                    {data.fulfillment_type === "delivery"
                      ? <><Truck className="mr-1 inline h-3 w-3" />In-camp delivery</>
                      : <><Package className="mr-1 inline h-3 w-3" />Pickup · Zone {data.pickup_zone}</>}
                  </p>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${STATUS_PILL[data.status]}`}>
                  {STATUS_LABEL[data.status] ?? data.status}
                </span>
              </div>

              {data.fulfillment_type === "delivery" && data.delivery_address && (
                <div className="mt-4 rounded-lg bg-emerald-soft/50 p-3 text-sm text-emerald-deep/85">
                  <MapPin className="mr-1 inline h-4 w-4" />{data.delivery_address}{data.delivery_landmark ? ` · ${data.delivery_landmark}` : ""}
                </div>
              )}

              {data.courier_name && (
                <div className="mt-3 rounded-lg border border-emerald-deep/15 p-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald">Courier assigned</p>
                  <p className="mt-1 font-semibold text-emerald-deep"><Truck className="mr-1 inline h-4 w-4" />{data.courier_name}</p>
                  {data.courier_phone && <a href={`tel:${data.courier_phone}`} className="mt-1 inline-flex items-center gap-1 text-sm text-emerald underline"><Phone className="h-3 w-3" />{data.courier_phone}</a>}
                </div>
              )}

              {data.vendor?.phone && (
                <p className="mt-3 text-xs text-emerald-deep/65">
                  Vendor: <a href={`tel:${data.vendor.phone}`} className="font-semibold text-emerald-deep underline">{data.vendor.phone}</a>
                </p>
              )}

              <p className="mt-4 text-right font-display text-lg font-extrabold text-emerald-deep">₦{Number(data.total_naira).toLocaleString()}</p>
            </div>

            <aside className="rounded-2xl border border-emerald-deep/10 bg-emerald-soft/30 p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald">Live progress</p>
              <OrderTimeline status={data.status} fulfillment={data.fulfillment_type} events={data.events ?? []} />
            </aside>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
