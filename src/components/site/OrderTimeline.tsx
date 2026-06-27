import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { flowFor, STATUS_LABEL, progressIndex } from "@/lib/order-status";

type Event = { status: string; note?: string | null; created_at: string };

export function OrderTimeline({
  status,
  fulfillment,
  events,
}: {
  status: string;
  fulfillment: string;
  events?: Event[];
}) {
  const flow = flowFor(fulfillment);
  const idx = progressIndex(status, fulfillment);
  const cancelled = status === "cancelled";

  const eventMap = new Map<string, string>();
  (events ?? []).forEach((e) => { if (!eventMap.has(e.status)) eventMap.set(e.status, e.created_at); });

  return (
    <ol className="space-y-3">
      {flow.map((s, i) => {
        const done = !cancelled && i <= idx;
        const current = !cancelled && i === idx;
        const ts = eventMap.get(s);
        return (
          <li key={s} className="flex items-start gap-3">
            <div className="mt-0.5">
              {done ? (
                <CheckCircle2 className={`h-5 w-5 ${current ? "text-emerald-deep" : "text-emerald-600"}`} />
              ) : (
                <Circle className="h-5 w-5 text-emerald-deep/25" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold ${done ? "text-emerald-deep" : "text-emerald-deep/40"}`}>
                {STATUS_LABEL[s]}
                {current && <span className="ml-2 rounded-full bg-emerald-deep px-2 py-0.5 text-[10px] font-bold text-cream">NOW</span>}
              </p>
              {ts && <p className="text-[11px] text-emerald-deep/55">{new Date(ts).toLocaleString()}</p>}
            </div>
          </li>
        );
      })}
      {cancelled && (
        <li className="flex items-start gap-3 border-t border-emerald-deep/10 pt-3">
          <XCircle className="mt-0.5 h-5 w-5 text-rose-500" />
          <p className="text-sm font-semibold text-rose-600">Order cancelled</p>
        </li>
      )}
    </ol>
  );
}
