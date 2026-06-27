import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2, Languages } from "lucide-react";
import { Link } from "@tanstack/react-router";

type Msg = { role: "user" | "assistant"; content: string; vendors?: { id: string; name: string; reason: string }[] };

const LANGUAGES = [
  { code: "en", label: "English", greeting: "Hi! I'm your RedeemServe concierge. Tell me what you need — e.g. 'jollof rice under ₦2k in Zone B' or 'somewhere to charge my phone near Family Camp'." },
  { code: "yo", label: "Yorùbá", greeting: "Ẹ kú àbọ̀! Èmi ni olùrànlọ́wọ́ RedeemServe rẹ. Sọ ohun tí o nílò — bí àpẹẹrẹ, 'jollof rice tí kò ju ₦2k lọ ní Zone B'." },
  { code: "ig", label: "Igbo", greeting: "Ndewo! Abụ m onye nnyemaka RedeemServe gị. Gwa m ihe ị chọrọ — dịka 'jollof rice na-erughị ₦2k na Zone B'." },
  { code: "ha", label: "Hausa", greeting: "Sannu! Ni ne mai ba ka shawara na RedeemServe. Gaya mini abin da kake bukata — misali 'jollof rice ƙasa da ₦2k a Zone B'." },
  { code: "pcm", label: "Pidgin", greeting: "How far! Na me be your RedeemServe concierge. Tell me wetin you want — like 'jollof rice wey no pass ₦2k for Zone B'." },
] as const;

export function ConciergeBubble() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<string>("en");
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", content: LANGUAGES[0].greeting }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);

  useEffect(() => { scroll.current?.scrollTo({ top: 9e9, behavior: "smooth" }); }, [msgs, open]);

  function pickLanguage(code: string) {
    const lang = LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
    setLanguage(lang.code);
    setShowLang(false);
    setMsgs([{ role: "assistant", content: lang.greeting }]);
  }

  async function send() {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const r = await fetch("/api/public/concierge", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: q, language }),
      });
      const data = await r.json();
      setMsgs((m) => [...m, { role: "assistant", content: data.answer || "I couldn't find a match.", vendors: data.vendors }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "Network hiccup. Try again." }]);
    } finally { setLoading(false); }
  }

  const currentLang = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-emerald-deep text-cream shadow-card-lg ring-4 ring-gold/30 transition hover:scale-105"
        aria-label="Open concierge"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6 text-gold" />}
      </button>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-emerald-deep/15 bg-cream shadow-card-lg">
          <div className="flex items-center gap-2 border-b border-emerald-deep/10 bg-emerald-deep px-4 py-3 text-cream">
            <Sparkles className="h-4 w-4 text-gold" />
            <div className="flex-1">
              <p className="text-sm font-semibold">AI Concierge</p>
              <p className="text-[10px] text-cream/60">Powered by Lovable AI · {currentLang.label}</p>
            </div>
            <button
              onClick={() => setShowLang((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full bg-cream/10 px-2.5 py-1 text-[11px] font-medium text-cream hover:bg-cream/20"
              aria-label="Change language"
            >
              <Languages className="h-3 w-3" /> {currentLang.label}
            </button>
          </div>
          {showLang && (
            <div className="border-b border-emerald-deep/10 bg-surface px-3 py-2">
              <p className="mb-1.5 text-[10px] uppercase tracking-wide text-emerald-deep/60">Choose language</p>
              <div className="flex flex-wrap gap-1.5">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => pickLanguage(l.code)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${l.code === language ? "bg-emerald-deep text-cream" : "bg-cream text-emerald-deep ring-1 ring-emerald-deep/15 hover:bg-emerald-soft"}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div ref={scroll} className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "ml-8" : "mr-8"}>
                <div className={`rounded-2xl px-3.5 py-2.5 text-sm ${m.role === "user" ? "bg-emerald-deep text-cream" : "bg-emerald-soft text-emerald-deep"}`}>
                  {m.content}
                </div>
                {m.vendors && m.vendors.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {m.vendors.map((v) => (
                      <Link key={v.id} to="/vendor/$id" params={{ id: v.id }} onClick={() => setOpen(false)}
                        className="block rounded-xl border border-emerald-deep/15 bg-surface px-3 py-2 text-xs hover:border-emerald-deep/40">
                        <p className="font-semibold text-emerald-deep">{v.name}</p>
                        <p className="mt-0.5 text-emerald-deep/65">{v.reason}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="mr-8 inline-flex items-center gap-2 rounded-2xl bg-emerald-soft px-3.5 py-2.5 text-sm text-emerald-deep">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
              </div>
            )}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t border-emerald-deep/10 bg-cream p-3">
            <input
              value={input} onChange={(e) => setInput(e.target.value)} disabled={loading}
              placeholder={`Ask in ${currentLang.label}…`}
              className="flex-1 rounded-full border border-emerald-deep/15 bg-surface px-4 py-2 text-sm text-emerald-deep outline-none focus:border-emerald-deep"
            />
            <button type="submit" disabled={loading || !input.trim()} className="grid h-9 w-9 place-items-center rounded-full bg-emerald-deep text-cream disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
