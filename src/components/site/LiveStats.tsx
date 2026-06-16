import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Store, ShieldCheck, Users, MapPin } from "lucide-react";

function useCount(target: number, duration = 1200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.floor(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

export function LiveStats() {
  const [stats, setStats] = useState({ vendors: 0, live: 0, zones: 4, attendees: 92000 });
  useEffect(() => {
    (async () => {
      const { count: vendors } = await supabase.from("vendors").select("*", { count: "exact", head: true });
      const { count: live } = await supabase.from("vendors").select("*", { count: "exact", head: true }).eq("status", "live");
      setStats((s) => ({ ...s, vendors: vendors ?? 0, live: live ?? 0 }));
    })();
    const ch = supabase.channel("vendors-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "vendors" }, async () => {
        const { count: live } = await supabase.from("vendors").select("*", { count: "exact", head: true }).eq("status", "live");
        setStats((s) => ({ ...s, live: live ?? 0 }));
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const v = useCount(stats.vendors);
  const l = useCount(stats.live);
  const a = useCount(stats.attendees);

  return (
    <section className="border-y border-emerald-deep/10 bg-emerald-deep text-cream">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px bg-cream/10 px-0 sm:grid-cols-4">
        {[
          { icon: Store, label: "Verified vendors", value: v.toLocaleString() },
          { icon: ShieldCheck, label: "Open right now", value: l.toLocaleString(), pulse: true },
          { icon: MapPin, label: "Zones covered", value: stats.zones.toString() },
          { icon: Users, label: "Attendees served / month", value: `${(a / 1000).toFixed(0)}k+` },
        ].map((s) => (
          <div key={s.label} className="bg-emerald-deep px-6 py-7">
            <div className="flex items-center gap-2 text-gold">
              <s.icon className="h-4 w-4" />
              {s.pulse && <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"/><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"/></span>}
            </div>
            <p className="mt-3 font-display text-3xl font-extrabold tabular sm:text-4xl">{s.value}</p>
            <p className="mt-1 text-xs text-cream/65">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
