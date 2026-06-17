import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { isValidNigerianPhone, toE164Nigerian, NG_PHONE_HINT } from "@/lib/phone";
import { ArrowUpRight } from "lucide-react";
import { BackButton } from "@/components/site/BackButton";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — RedeemServe" },
      { name: "description", content: "Sign in or register a vendor account on RedeemServe." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [intent, setIntent] = useState<"buyer" | "vendor">("buyer");
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const destination = () => {
    if (redirectTo && redirectTo.startsWith("/")) return redirectTo;
    return intent === "vendor" ? "/dashboard" : "/discover";
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const ref = url.searchParams.get("ref");
      const i = url.searchParams.get("intent");
      const r = url.searchParams.get("redirect");
      if (i === "vendor" || i === "buyer") setIntent(i);
      if (r) setRedirectTo(r);
      if (ref) {
        setReferralCode(ref.toUpperCase());
        try { sessionStorage.setItem("rs_ref", ref.toUpperCase()); } catch {}
        setMode("signup");
      } else {
        try { const saved = sessionStorage.getItem("rs_ref"); if (saved) setReferralCode(saved); } catch {}
      }
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const url = new URL(window.location.href);
        const i = url.searchParams.get("intent");
        const r = url.searchParams.get("redirect");
        const to = (r && r.startsWith("/")) ? r : (i === "vendor" ? "/dashboard" : "/discover");
        navigate({ to });
      }
    });
  }, [navigate]);

  async function redeemIfAny() {
    const code = referralCode.trim();
    if (!code) return;
    try {
      await supabase.rpc("redeem_referral_code" as any, { _code: code });
      try { sessionStorage.removeItem("rs_ref"); } catch {}
    } catch { /* non-fatal */ }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        if (phone && !isValidNigerianPhone(phone)) {
          throw new Error(NG_PHONE_HINT);
        }
        const normalizedPhone = phone ? toE164Nigerian(phone) : "";
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + destination(),
            data: { full_name: fullName, phone: normalizedPhone, intent },
          },
        });
        if (error) throw error;
        await redeemIfAny();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await redeemIfAny();
      }
      navigate({ to: destination() });
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }


  async function google() {
    setErr(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + destination(),
    });
    if (result.error) setErr(result.error.message);
    else if (!result.redirected) navigate({ to: destination() });
  }


  return (
    <main className="relative min-h-screen bg-cream">
      <div className="absolute left-4 top-4 z-10 sm:left-6 sm:top-6">
        <BackButton fallbackTo="/" />
      </div>
      <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 lg:grid-cols-2">
        <aside className="hidden flex-col justify-between bg-emerald-deep p-12 text-cream lg:flex">
          <Link to="/" className="font-display text-2xl font-extrabold">
            Redeem<span className="text-gold">Serve</span>
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gold">For vendors & attendees</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight">
              One account. Every service. Every vendor.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-cream/80">
              Register your stall, manage your storefront, receive AI demand
              forecasts and reach every attendee on the grounds — without an app.
            </p>
          </div>
          <p className="text-xs text-cream/50">The marketplace for Redemption City events</p>
        </aside>

        <section className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <Link to="/" className="font-display text-xl font-extrabold text-emerald-deep lg:hidden">
              Redeem<span className="text-gold">Serve</span>
            </Link>
            <h2 className="mt-8 font-display text-3xl font-extrabold text-emerald-deep lg:mt-0">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mt-2 text-sm text-emerald-deep/65">
              {mode === "signup" ? "Sell or shop on RedeemServe." : "Sign in to manage your storefront."}
            </p>

            <button
              onClick={google}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-emerald-deep/15 bg-surface px-4 py-3 text-sm font-semibold text-emerald-deep transition-colors hover:bg-emerald-soft"
            >
              <GoogleIcon /> Continue with Google
            </button>

            <div className="my-6 flex items-center gap-3 text-xs text-emerald-deep/45">
              <span className="h-px flex-1 bg-emerald-deep/10" />
              or with email
              <span className="h-px flex-1 bg-emerald-deep/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <>
                  <Input label="Full name" value={fullName} onChange={setFullName} required placeholder="Jane Adekunle" />
                  <Input label="WhatsApp / Phone" value={phone} onChange={setPhone} placeholder="08031234567 or +2348031234567" hint={NG_PHONE_HINT} invalid={!!phone && !isValidNigerianPhone(phone)} type="tel" />
                </>
              )}
              <Input label="Email" type="email" value={email} onChange={setEmail} required placeholder="you@example.com" />
              <Input label="Password" type="password" value={password} onChange={setPassword} required placeholder="At least 8 characters" />

              {mode === "signup" && (
                <Input label="Referral code (optional)" value={referralCode} onChange={(v) => setReferralCode(v.toUpperCase())} placeholder="e.g. AB12CD" />
              )}

              {err && <p className="text-sm text-rose-600">{err}</p>}

              <button
                type="submit" disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-deep px-4 py-3 text-sm font-semibold text-cream hover:bg-emerald disabled:opacity-50"
              >
                {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </form>


            <p className="mt-6 text-center text-sm text-emerald-deep/65">
              {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
              <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="font-semibold text-emerald-deep underline-offset-4 hover:underline">
                {mode === "signup" ? "Sign in" : "Create one"}
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Input({
  label, value, onChange, type = "text", required, placeholder, hint, invalid,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string; hint?: string; invalid?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-emerald-deep">{label}</span>
      <input
        type={type} value={value} required={required} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1.5 w-full rounded-lg border bg-surface px-3 py-2.5 text-sm text-emerald-deep outline-none transition-colors focus:ring-2 ${invalid ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200" : "border-emerald-deep/15 focus:border-emerald focus:ring-emerald/20"}`}
      />
      {hint && <span className={`mt-1 block text-[11px] ${invalid ? "text-rose-600" : "text-emerald-deep/55"}`}>{hint}</span>}
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C40.9 35.6 44 30.3 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
