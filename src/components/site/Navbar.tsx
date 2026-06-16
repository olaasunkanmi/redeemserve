import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Store, Search, User, ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/lib/cart";

const links = [
  { to: "/", label: "Home" },
  { to: "/discover", label: "Browse vendors" },
  { to: "/orders", label: "My orders" },
  { to: "/dashboard", label: "Sell" },
  { to: "/about", label: "About" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-deep/10 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-deep text-cream">
            <Store className="h-4 w-4" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-emerald-deep">
            Redeem<span className="text-gold">Serve</span>
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-emerald-deep/70 hover:bg-emerald-soft hover:text-emerald-deep"
              activeProps={{ className: "bg-emerald-soft text-emerald-deep" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/discover"
            className="hidden h-9 items-center gap-2 rounded-full border border-emerald-deep/15 bg-surface px-4 text-sm text-emerald-deep/60 hover:border-emerald-deep/30 hover:text-emerald-deep sm:flex"
          >
            <Search className="h-4 w-4" />
            <span>Search vendors…</span>
          </Link>
          <Link to="/checkout" className="relative grid h-9 w-9 place-items-center rounded-full border border-emerald-deep/15 text-emerald-deep hover:bg-emerald-soft" aria-label="Cart">
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-emerald-deep">{count}</span>}
          </Link>
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-deep px-4 text-sm font-semibold text-cream hover:bg-emerald"
            >
              <User className="h-4 w-4" /> My portal
            </Link>
          ) : (
            <Link
              to="/auth"
              className="inline-flex h-9 items-center rounded-full bg-emerald-deep px-4 text-sm font-semibold text-cream hover:bg-emerald"
            >
              Sign in
            </Link>
          )}
          <button
            className="grid h-9 w-9 place-items-center rounded-md border border-emerald-deep/15 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-emerald-deep/10 bg-cream md:hidden">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-1 px-4 py-3 sm:px-8">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-emerald-deep/75 hover:bg-emerald-soft"
                activeProps={{ className: "bg-emerald-soft text-emerald-deep" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
