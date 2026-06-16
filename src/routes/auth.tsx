import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { ArrowUpRight } from "lucide-react";

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
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/dashboard",
            data: { full_name: fullName, phone },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setErr(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (result.error) setErr(result.error.message);
    else if (!result.redirected) navigate({ to: "/dashboard" });
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 lg:grid-cols-2">
        {/* Left masthead */}
        <aside className="hidden flex-col justify-between border-r border-emerald-deep/15 bg-emerald-deep p-12 text-cream lg:flex">
          <Link to="/" className="font-display text-3xl text-cream">
            Redeem<span className="font-italic-serif text-gold">Serve</span>
          </Link>
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-gold">A vendor account</p>
            <h1 className="mt-4 font-display text-5xl leading-[0.95]">
              The coordination paper{" "}
              <span className="font-italic-serif text-gold">for every vendor</span> at Redemption City.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-cream/80">
              One free account. Register your stall, manage your storefront, receive AI demand
              forecasts, and reach every attendee on the grounds — without an app.
            </p>
          </div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50">
            Vol. III · Issue 06 · For the Holy Ghost Service
          </p>
        </aside>

        {/* Right form */}
        <section className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <Link to="/" className="font-display text-2xl text-emerald-deep lg:hidden">
              Redeem<span className="font-italic-serif text-gold">Serve</span>
            </Link>
            <p className="kicker mt-8 lg:mt-0">{mode === "signup" ? "Open an account" : "Welcome back"}</p>
            <h2 className="mt-3 font-display text-4xl leading-tight text-emerald-deep">
              {mode === "signup" ? (
                <>Register as a <span className="font-italic-serif text-gold">vendor</span> or attendee.</>
              ) : (
                <>Sign in to your <span className="font-italic-serif text-gold">portal.</span></>
              )}
            </h2>
            <div className="hairline-gold mt-4 w-12" />

            <button
              onClick={google}
              className="mt-8 flex w-full items-center justify-center gap-3 border-2 border-emerald-deep bg-cream px-4 py-3 text-sm font-medium text-emerald-deep transition-colors hover:bg-emerald-deep hover:text-cream"
            >
              <GoogleIcon /> Continue with Google
            </button>

            <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-emerald-deep/45">
              <span className="h-px flex-1 bg-emerald-deep/15" />
              or with email
              <span className="h-px flex-1 bg-emerald-deep/15" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <>
                  <Input label="Full name" value={fullName} onChange={setFullName} required placeholder="Jane Adekunle" />
                  <Input label="WhatsApp / Phone" value={phone} onChange={setPhone} placeholder="+234 …" />
                </>
              )}
              <Input label="Email" type="email" value={email} onChange={setEmail} required placeholder="you@example.com" />
              <Input label="Password" type="password" value={password} onChange={setPassword} required placeholder="At least 8 characters" />

              {err && <p className="text-xs text-rose-600">{err}</p>}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 border-2 border-emerald-deep bg-emerald-deep px-4 py-3 text-sm font-medium text-cream transition-colors hover:bg-gold hover:border-gold hover:text-emerald-deep disabled:opacity-50"
              >
                {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-6 text-center text-[12px] text-emerald-deep/65">
              {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
              <button
                onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                className="font-semibold text-emerald-deep underline-offset-4 hover:underline"
              >
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
  label, value, onChange, type = "text", required, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-deep">{label}</span>
      <input
        type={type} value={value} required={required} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b-2 border-emerald-deep/40 bg-transparent py-2 text-base text-emerald-deep outline-none transition-colors focus:border-gold"
      />
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
