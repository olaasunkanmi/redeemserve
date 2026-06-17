import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Gift, Copy, Share2, Users, Coins, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/referrals")({
  head: () => ({ meta: [{ title: "Refer & earn — RedeemServe" }] }),
  component: ReferralsPage,
});

function ReferralsPage() {
  const [code, setCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  async function load() {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setLoading(false); return; }
    const { data: codeData } = await supabase.rpc("get_or_create_referral_code" as any);
    setCode(codeData as any);
    const { data: refs } = await supabase
      .from("referrals" as any)
      .select("*")
      .eq("referrer_id", u.user.id)
      .order("created_at", { ascending: false });
    setReferrals((refs as any) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const link = code ? `${typeof window !== "undefined" ? window.location.origin : ""}/auth?ref=${code}` : "";
  const earned = referrals.filter((r) => r.status === "rewarded").reduce((s, r) => s + r.reward_naira, 0);
  const pending = referrals.filter((r) => r.status === "pending").length;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Fallback for older browsers / insecure contexts
      const ta = document.createElement("textarea");
      ta.value = link; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch {}
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function share() {
    const payload = {
      title: "Join me on RedeemServe",
      text: "Use my code to get ₦500 off your first order on RedeemServe.",
      url: link,
    };
    // Web Share API (mobile + some desktop browsers)
    if (typeof navigator !== "undefined" && typeof (navigator as any).share === "function") {
      try {
        await (navigator as any).share(payload);
        return;
      } catch (e: any) {
        // User cancelled — do nothing. Any other error → fall through to fallback.
        if (e?.name === "AbortError") return;
      }
    }
    // Desktop fallback: open WhatsApp web share with the message pre-filled.
    const msg = `${payload.text}\n${link}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    const win = window.open(waUrl, "_blank", "noopener,noreferrer");
    if (!win) await copy(); // popup blocked → copy as last resort
  }

  return (
    <SiteLayout>
      <section className="border-b border-emerald-deep/10 bg-gradient-to-br from-emerald-deep to-emerald text-cream">
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-8 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold">
            <Gift className="h-3 w-3" /> Refer & earn
          </div>
          <h1 className="mt-4 max-w-2xl font-display text-3xl font-extrabold sm:text-5xl">Earn ₦500 for every friend you bring</h1>
          <p className="mt-3 max-w-2xl text-cream/80">Share your code. They get ₦500 off their first order. You get ₦500 credit when they complete it.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-8">
        {loading ? (
          <p className="text-sm text-emerald-deep/60">Loading…</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Friends referred" value={referrals.length.toString()} icon={<Users className="h-5 w-5" />} />
              <Stat label="Pending rewards" value={pending.toString()} icon={<Gift className="h-5 w-5" />} />
              <Stat label="Total earned" value={`₦${earned.toLocaleString()}`} icon={<Coins className="h-5 w-5" />} tone="gold" />
            </div>

            <div className="mt-8 rounded-2xl border border-emerald-deep/10 bg-surface p-6 shadow-card sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald">Your referral link</p>
              <div className="mt-3 flex flex-wrap gap-2 sm:flex-nowrap">
                <input readOnly value={link} className="flex-1 rounded-full border border-emerald-deep/15 bg-emerald-soft/40 px-4 py-2.5 text-sm text-emerald-deep" />
                <button onClick={copy} className="inline-flex items-center gap-2 rounded-full bg-emerald-deep px-5 py-2.5 text-sm font-semibold text-cream hover:bg-emerald">
                  {copied ? <><CheckCircle2 className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}
                </button>
                <button onClick={share} className="inline-flex items-center gap-2 rounded-full border border-emerald-deep px-5 py-2.5 text-sm font-semibold text-emerald-deep hover:bg-emerald-soft">
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>
              <div className="mt-5 rounded-xl bg-gold-soft p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-deep/60">Or share just the code</p>
                <p className="mt-1 font-display text-3xl font-extrabold tracking-widest text-emerald-deep">{code ?? "——"}</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-emerald-deep/10 bg-surface p-6 shadow-card sm:p-8">
              <h2 className="font-display text-xl font-extrabold text-emerald-deep">Your referrals</h2>
              {referrals.length === 0 ? (
                <p className="mt-3 text-sm text-emerald-deep/60">No referrals yet. Share your link to start earning.</p>
              ) : (
                <ul className="mt-4 divide-y divide-emerald-deep/10">
                  {referrals.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <p className="text-sm font-semibold text-emerald-deep">Friend joined</p>
                        <p className="text-[11px] text-emerald-deep/60">{new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${r.status === "rewarded" ? "bg-emerald-soft text-emerald-deep" : "bg-gold-soft text-emerald-deep/70"}`}>
                        {r.status === "rewarded" ? `+₦${r.reward_naira}` : "Pending first order"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </section>
    </SiteLayout>
  );
}

function Stat({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone?: "gold" }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-card ${tone === "gold" ? "border-gold/40 bg-gold-soft" : "border-emerald-deep/10 bg-surface"}`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-deep/60">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-soft text-emerald-deep">{icon}</span>
        {label}
      </div>
      <p className="mt-3 font-display text-3xl font-extrabold text-emerald-deep tabular">{value}</p>
    </div>
  );
}
