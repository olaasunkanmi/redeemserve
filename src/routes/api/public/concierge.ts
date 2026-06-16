import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/api/public/concierge")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { query } = (await request.json()) as { query?: string };
          if (!query || query.length < 2) return json({ error: "Query required" }, 400);

          const supa = createClient<Database>(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
          );
          const { data: vendors } = await supa.from("vendors")
            .select("id,business_name,category,zone,description,popular_items,price_range,status,rating")
            .limit(60);

          const list = (vendors ?? []).map((v) => ({
            id: v.id,
            summary: `${v.business_name} | ${v.category} | Zone ${v.zone} | ${v.status} | ★${v.rating} | items: ${(v.popular_items || []).join(", ")} | ${v.price_range} | ${v.description}`,
          }));

          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) return json({ answer: "AI is not configured yet.", vendors: [] });

          const sys = `You are the RedeemServe concierge for Redemption City marketplace. Given a user's need, pick up to 3 vendors from the catalog that best match. Reply ONLY with valid JSON: {"answer": "<one warm sentence>", "vendors": [{"id":"<vendor uuid>","name":"<business name>","reason":"<why, <=15 words>"}]}. If nothing matches, return an empty vendors array and explain briefly.`;
          const user = `Catalog:\n${list.map((l) => l.summary + " | id=" + l.id).join("\n")}\n\nUser query: ${query}`;

          const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [{ role: "system", content: sys }, { role: "user", content: user }],
              response_format: { type: "json_object" },
            }),
          });
          if (!aiRes.ok) {
            const t = await aiRes.text();
            return json({ answer: "AI service busy — please retry in a moment.", vendors: [], debug: t.slice(0, 200) });
          }
          const aiData = await aiRes.json();
          const raw = aiData.choices?.[0]?.message?.content ?? "{}";
          let parsed: any = {};
          try { parsed = JSON.parse(raw); } catch { parsed = { answer: raw, vendors: [] }; }
          return json(parsed);
        } catch (e: any) {
          return json({ answer: "Something went wrong. Try again.", error: e?.message }, 500);
        }
      },
    },
  },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}
