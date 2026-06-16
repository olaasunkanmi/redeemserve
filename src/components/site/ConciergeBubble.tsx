import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

type Msg = { role: "user" | "assistant"; content: string; vendors?: { id: string; name: string; reason: string }[] };

export function ConciergeBubble() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm your RedeemServe concierge. Tell me what you need — e.g. 'jollof rice under ₦2k in Zone B' or 'somewhere to charge my phone near Family Camp'." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);

  useEffect(() => { scroll.current?.scrollTo({ top: 9e9, behavior: "smooth" }); }, [msgs, open]);

  async function send() {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const r = await fetch("/api/public/concierge", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await r.json();
      setMsgs((m) => [...m, { role: "assistant", content: data.answer || "I couldn't find a match.", vendors: data.vendors }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "Network hiccup. Try again." }]);
    } finally { setLoading(false); }
  }

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
            <div>
              <p className="text-sm font-semibold">AI Concierge</p>
              <p className="text-[10px] text-cream/60">Powered by Lovable AI · finds vendors in seconds</p>
            </div>
          </div>
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
              placeholder="Ask anything…"
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
