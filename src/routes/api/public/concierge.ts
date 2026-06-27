import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/api/public/concierge")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { query, language } = (await request.json()) as { query?: string; language?: string };
          if (!query || query.length < 2) return json({ error: "Query required" }, 400);
          const langMap: Record<string, string> = {
            en: "English",
            yo: "Yoruba",
            ig: "Igbo",
            ha: "Hausa",
            pcm: "Nigerian Pidgin English",
          };
          const langName = langMap[language || "en"] || "English";

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

          const models = [
            "google/gemini-3-flash-preview",
            "google/gemini-2.5-flash-lite",
            "google/gemini-2.5-flash",
          ];
          let aiRes: Response | null = null;
          let lastErr = "";
          for (const model of models) {
            aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
              body: JSON.stringify({
                model,
                messages: [{ role: "system", content: sys }, { role: "user", content: user }],
                response_format: { type: "json_object" },
              }),
            });
            if (aiRes.ok) break;
            lastErr = `${model}: ${aiRes.status}`;
            if (aiRes.status !== 429 && aiRes.status < 500) break;
          }
          if (!aiRes || !aiRes.ok) {
            const t = aiRes ? await aiRes.text() : "";
            const msg = aiRes?.status === 429
              ? "I'm getting a lot of questions right now — please try again in a few seconds."
              : aiRes?.status === 402
              ? "AI credits are exhausted. Please ask the platform admin to top up."
              : "I couldn't reach the AI service. Please try again shortly.";
            return json({ answer: msg, vendors: [], debug: (lastErr + " " + t).slice(0, 300) });
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
