import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// Smart demand forecast: refreshes each vendor's expected_customers + demand label
// using Lovable AI based on recent order velocity. Triggered by pg_cron hourly.
export const Route = createFileRoute("/api/public/hooks/forecast-demand")({
  server: {
    handlers: {
      GET: async () => runForecast(),
      POST: async () => runForecast(),
    },
  },
});

async function runForecast() {
  return (async () => {
        const SUPABASE_URL = process.env.SUPABASE_URL!;
        const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const LOVABLE_KEY = process.env.LOVABLE_API_KEY!;
        const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: vendors } = await admin
          .from("vendors")
          .select("id, business_name, category, capacity, status, expected_customers");
        if (!vendors?.length) return Response.json({ ok: true, updated: 0 });

        const sinceISO = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString();
        const { data: orders } = await admin
          .from("orders")
          .select("vendor_id, total_naira, created_at")
          .gte("created_at", sinceISO)
          .neq("status", "cancelled");

        const stats: Record<string, { count: number; gmv: number }> = {};
        for (const o of orders ?? []) {
          const s = stats[o.vendor_id] ||= { count: 0, gmv: 0 };
          s.count += 1; s.gmv += Number(o.total_naira || 0);
        }

        const summary = vendors.map((v) => ({
          id: v.id, name: v.business_name, category: v.category,
          capacity: v.capacity, status: v.status,
          orders_7d: stats[v.id]?.count ?? 0,
          gmv_7d: stats[v.id]?.gmv ?? 0,
        }));

        let predictions: Array<{ id: string; expected_customers: number; demand: string }> = [];
        try {
          const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_KEY}` },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: "You forecast vendor demand for the next Holy Ghost Service at Redemption Camp. Return strict JSON only." },
                { role: "user", content: `For each vendor below, predict expected_customers (integer, between 30% and 180% of capacity) and a 1-word demand label from [low, steady, rising, surging, peak]. Input: ${JSON.stringify(summary)}. Respond as JSON: {"predictions":[{"id","expected_customers","demand"}]}` },
              ],
              response_format: { type: "json_object" },
            }),
          });
          const j: any = await r.json();
          const content = j?.choices?.[0]?.message?.content ?? "{}";
          predictions = (JSON.parse(content)?.predictions ?? []) as any;
        } catch (e) {
          console.error("AI forecast failed, falling back to heuristic", e);
        }

        // Heuristic fallback for any vendor missing from AI output
        const predMap = new Map(predictions.map((p) => [p.id, p]));
        let updated = 0;
        for (const v of vendors) {
          let p = predMap.get(v.id);
          if (!p) {
            const recent = stats[v.id]?.count ?? 0;
            const cap = v.capacity || 100;
            const expected = Math.min(Math.round(cap * 1.4), Math.max(Math.round(cap * 0.4), recent * 8));
            const ratio = expected / cap;
            const demand = ratio > 1.2 ? "peak" : ratio > 0.95 ? "surging" : ratio > 0.7 ? "rising" : ratio > 0.4 ? "steady" : "low";
            p = { id: v.id, expected_customers: expected, demand };
          }
          const { error } = await admin.from("vendors").update({
            expected_customers: p.expected_customers,
            demand: p.demand,
          } as any).eq("id", v.id);
          if (!error) updated += 1;
        }

        return Response.json({ ok: true, updated, vendors: vendors.length });
      },
    },
  },
});
