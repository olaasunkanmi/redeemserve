import { createFileRoute } from "@tanstack/react-router";

const LANG_NAMES: Record<string, string> = {
  en: "English",
  yo: "Yoruba",
  ig: "Igbo",
};

export const Route = createFileRoute("/api/public/translate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { lang, texts } = (await request.json()) as { lang?: string; texts?: string[] };
          if (!lang || lang === "en" || !Array.isArray(texts) || texts.length === 0) {
            return json({ translations: texts ?? [] });
          }
          const target = LANG_NAMES[lang];
          if (!target) return json({ translations: texts });

          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) return json({ translations: texts });

          // Cap batch to keep tokens sane
          const batch = texts.slice(0, 120).map((t) => (t ?? "").slice(0, 400));

          const sys = `You are a professional translator. Translate each item in the JSON array from English into ${target}. Preserve numbers, brand names (RedeemServe, Redemption City, RCCG, Holy Ghost Service, WhatsApp), punctuation, emoji and placeholder symbols (₦, →, ·, %, →). Keep length similar. Reply ONLY with valid JSON of the exact shape: {"translations": ["...", "..."]} with the SAME length and order as input.`;
          const user = JSON.stringify({ items: batch });

          const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: sys },
                { role: "user", content: user },
              ],
              response_format: { type: "json_object" },
            }),
          });
          if (!aiRes.ok) return json({ translations: texts });
          const data = await aiRes.json();
          const raw = data.choices?.[0]?.message?.content ?? "{}";
          let parsed: any = {};
          try { parsed = JSON.parse(raw); } catch { parsed = {}; }
          const out = Array.isArray(parsed.translations) ? parsed.translations : texts;
          // Pad/truncate to match length
          const fixed = batch.map((_, i) => (typeof out[i] === "string" && out[i].length > 0 ? out[i] : batch[i]));
          // If input was longer than batch, leave remaining untouched
          const tail = texts.slice(batch.length);
          return json({ translations: [...fixed, ...tail] });
        } catch (e: any) {
          return json({ translations: [], error: e?.message }, 200);
        }
      },
    },
  },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}
