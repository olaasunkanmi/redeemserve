import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, MapPin, Users, Lightbulb, Clock } from "lucide-react";

export type EventRow = {
  id: string;
  name: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  expected_attendance: number | null;
  category: string | null;
  prep_tips: string | null;
};

function daysUntil(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(ms / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return `In ${days} days`;
  if (days < 30) return `In ${Math.round(days / 7)} week${days >= 14 ? "s" : ""}`;
  return `In ${Math.round(days / 30)} month${days >= 60 ? "s" : ""}`;
}

export function UpcomingEvents({
  variant = "vendor",
  limit = 4,
  title,
  subtitle,
}: {
  variant?: "vendor" | "public";
  limit?: number;
  title?: string;
  subtitle?: string;
}) {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("events" as any)
        .select("*")
        .gte("starts_at", new Date(Date.now() - 6 * 3600_000).toISOString())
        .order("starts_at", { ascending: true })
        .limit(limit);
      setEvents(((data as any) ?? []) as EventRow[]);
      setLoading(false);
    })();
  }, [limit]);

  if (loading) return null;
  if (events.length === 0) return null;

  const isVendor = variant === "vendor";
  const defaultTitle = isVendor ? "Upcoming events — plan ahead" : "What's coming up at Redemption City";
  const defaultSub = isVendor
    ? "Stock, staff and supplies you'll need for the next services."
    : "Major gatherings drawing pilgrims from across the world.";

  return (
    <section className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-8">
      <div className="rounded-2xl border border-emerald-deep/10 bg-surface p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-gold" />
              <h2 className="font-display text-xl font-extrabold text-emerald-deep">{title ?? defaultTitle}</h2>
            </div>
            <p className="mt-1 text-xs text-emerald-deep/60">{subtitle ?? defaultSub}</p>
          </div>
          <span className="rounded-full bg-emerald-soft px-3 py-1 text-[11px] font-semibold text-emerald-deep">
            {events.length} scheduled
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {events.map((e) => {
            const start = new Date(e.starts_at);
            return (
              <article key={e.id} className="rounded-xl border border-emerald-deep/10 bg-cream p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-deep px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cream">
                      {e.category || "Event"}
                    </span>
                    <h3 className="mt-2 font-display text-lg font-extrabold text-emerald-deep">{e.name}</h3>
                  </div>
                  <div className="shrink-0 rounded-lg bg-gold/30 px-3 py-2 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-deep/70">{daysUntil(e.starts_at)}</p>
                    <p className="font-display text-lg font-extrabold leading-none text-emerald-deep">
                      {start.toLocaleDateString(undefined, { day: "2-digit" })}
                    </p>
                    <p className="text-[10px] font-semibold uppercase text-emerald-deep/70">
                      {start.toLocaleDateString(undefined, { month: "short" })}
                    </p>
                  </div>
                </div>

                {e.description && <p className="mt-3 text-sm text-emerald-deep/75">{e.description}</p>}

                <dl className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-emerald-deep/70">
                  <div className="flex items-start gap-1.5">
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" />
                    <span>{start.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}</span>
                  </div>
                  {e.location && (
                    <div className="flex items-start gap-1.5">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" />
                      <span>{e.location}</span>
                    </div>
                  )}
                  {e.expected_attendance ? (
                    <div className="col-span-2 flex items-start gap-1.5">
                      <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" />
                      <span><b className="text-emerald-deep">{e.expected_attendance.toLocaleString()}+</b> expected attendees</span>
                    </div>
                  ) : null}
                </dl>

                {isVendor && e.prep_tips && (
                  <div className="mt-4 rounded-lg border border-gold/40 bg-gold/10 p-3">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-deep">Prep tips</p>
                        <p className="mt-1 text-xs text-emerald-deep/80">{e.prep_tips}</p>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
