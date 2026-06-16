import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const links = [
  { to: "/", label: "Front Page" },
  { to: "/discover", label: "The Directory" },
  { to: "/dashboard", label: "Vendor Portal" },
  { to: "/about", label: "Masthead" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="border-b border-emerald-deep/15 bg-cream">
      {/* Top meta strip */}
      <div className="border-b border-emerald-deep/10 bg-emerald-deep text-cream">
        <div className="mx-auto flex h-8 max-w-[1400px] items-center justify-between px-4 text-[10px] font-medium uppercase tracking-[0.22em] sm:px-8">
          <span>Vol. III · Issue 06 · May 2026</span>
          <span className="hidden sm:inline">Redemption City · Ogun State · Nigeria</span>
          <span className="tabular">
            <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-gold align-middle" />
            Next service in 18d 04h
          </span>
        </div>
      </div>

      {/* Masthead */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
        <div className="flex items-center justify-between gap-6 py-5">
          <div className="hidden flex-1 text-[11px] uppercase tracking-[0.22em] text-emerald-deep/60 md:block">
            est. 2026 · for the<br />Holy Ghost Service
          </div>
          <Link to="/" className="flex-1 text-center">
            <div className="font-display text-[42px] leading-none tracking-tight text-emerald-deep sm:text-[64px]">
              Redeem<span className="font-italic-serif text-gold">Serve</span>
            </div>
            <div className="mt-1.5 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.3em] text-emerald-deep/60">
              <span className="h-px w-10 bg-emerald-deep/30" />
              The City's Coordination Paper
              <span className="h-px w-10 bg-emerald-deep/30" />
            </div>
          </Link>
          <div className="hidden flex-1 text-right text-[11px] uppercase tracking-[0.22em] text-emerald-deep/60 md:block">
            500,000 – 2,000,000+<br />souls served monthly
          </div>

          <button
            className="ml-auto grid h-10 w-10 place-items-center rounded border border-emerald-deep/20 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        <div className="rule-thick" />
        <nav className="hidden items-center justify-center gap-8 py-3 text-[12px] font-medium uppercase tracking-[0.2em] md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-emerald-deep/70 transition-colors hover:text-emerald-deep"
              activeProps={{ className: "text-emerald-deep border-b-2 border-gold pb-0.5" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <Link to="/dashboard" className="border border-emerald-deep px-3 py-1.5 text-emerald-deep hover:bg-emerald-deep hover:text-cream">My Portal</Link>
          ) : (
            <Link to="/auth" className="border border-emerald-deep px-3 py-1.5 text-emerald-deep hover:bg-emerald-deep hover:text-cream">Sign in</Link>
          )}
        </nav>
        <div className="hairline" />
      </div>

      {open && (
        <div className="border-t border-emerald-deep/10 bg-cream md:hidden">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-1 px-4 py-3 sm:px-8">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded px-3 py-2.5 text-sm font-medium uppercase tracking-[0.18em] text-emerald-deep/70 hover:bg-secondary"
                activeProps={{ className: "text-emerald-deep bg-secondary" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to={user ? "/dashboard" : "/auth"}
              onClick={() => setOpen(false)}
              className="rounded border border-emerald-deep px-3 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-deep"
            >
              {user ? "My Portal" : "Sign in"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
