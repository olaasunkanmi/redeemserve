import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Store, Search, User, ShoppingBag, Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/lib/cart";
import { DarkModeToggle } from "./DarkModeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useI18n } from "@/lib/i18n";

const linkDefs = [
  { to: "/", key: "nav.home" },
  { to: "/discover", key: "nav.discover" },
  { to: "/favorites", key: "nav.saved" },
  { to: "/orders", key: "nav.orders" },
  { to: "/dashboard", key: "nav.sell" },
  { to: "/referrals", key: "nav.refer" },
  { to: "/about", key: "nav.about" },
];

// Keep desktop nav lean — overflow items go into the hamburger sheet on desktop too.
const primaryDesktopKeys = new Set(["nav.home", "nav.discover", "nav.sell", "nav.about"]);

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { count } = useCart();
  const { t } = useI18n();
  const links = linkDefs.map((l) => ({ to: l.to, label: t(l.key), key: l.key }));
  const primaryLinks = links.filter((l) => primaryDesktopKeys.has(l.key));

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-deep/10 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-deep text-cream">
            <Store className="h-4 w-4" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-emerald-deep">
            Redeem<span className="text-gold">Serve</span>
          </span>
        </Link>

        {/* Desktop primary nav — only the essentials */}
        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {primaryLinks.map((l) => (
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

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-2">
          {/* Search — desktop only */}
          <Link
            to="/discover"
            className="hidden h-9 items-center gap-2 rounded-full border border-emerald-deep/15 bg-surface px-3 text-sm text-emerald-deep/60 hover:border-emerald-deep/30 hover:text-emerald-deep lg:flex"
          >
            <Search className="h-4 w-4" />
            <span>{t("common.search")}</span>
          </Link>

          {/* Toggles — desktop only */}
          <div className="hidden items-center gap-1 lg:flex">
            <LanguageToggle />
            <DarkModeToggle />
          </div>

          {/* Cart — always visible */}
          <Link
            to="/checkout"
            className="relative grid h-9 w-9 place-items-center rounded-full border border-emerald-deep/15 text-emerald-deep hover:bg-emerald-soft"
            aria-label="Cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-emerald-deep">
                {count}
              </span>
            )}
          </Link>

          {/* Auth — desktop only */}
          {user ? (
            <Link
              to="/dashboard"
              className="hidden h-9 items-center gap-2 rounded-full bg-emerald-deep px-4 text-sm font-semibold text-cream hover:bg-emerald lg:inline-flex"
            >
              <User className="h-4 w-4" /> {t("nav.portal")}
            </Link>
          ) : (
            <Link
              to="/auth"
              className="hidden h-9 items-center rounded-full bg-emerald-deep px-4 text-sm font-semibold text-cream hover:bg-emerald lg:inline-flex"
            >
              {t("nav.signin")}
            </Link>
          )}

          {/* Hamburger — mobile + tablet, also acts as "more" on desktop */}
          <button
            className="grid h-9 w-9 place-items-center rounded-md border border-emerald-deep/15 text-emerald-deep hover:bg-emerald-soft"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Slide-down panel */}
      {open && (
        <div className="border-t border-emerald-deep/10 bg-cream">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-1 px-4 py-4 sm:px-6 lg:px-8">
            {/* Mobile-only auth + search row */}
            <div className="flex flex-col gap-2 pb-3 lg:hidden">
              <Link
                to="/discover"
                onClick={() => setOpen(false)}
                className="flex h-10 items-center gap-2 rounded-full border border-emerald-deep/15 bg-surface px-4 text-sm text-emerald-deep/70"
              >
                <Search className="h-4 w-4" />
                <span>{t("common.search")}</span>
              </Link>
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-emerald-deep px-4 text-sm font-semibold text-cream"
                >
                  <User className="h-4 w-4" /> {t("nav.portal")}
                </Link>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-deep px-4 text-sm font-semibold text-cream"
                >
                  {t("nav.signin")}
                </Link>
              )}
            </div>

            {/* Full link list */}
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-emerald-deep/80 hover:bg-emerald-soft"
                activeProps={{ className: "bg-emerald-soft text-emerald-deep" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.key === "nav.saved" && <Heart className="h-4 w-4" />}
                {l.label}
              </Link>
            ))}

            {/* Toggles inside panel for mobile/tablet */}
            <div className="mt-3 flex items-center gap-2 border-t border-emerald-deep/10 pt-3 lg:hidden">
              <LanguageToggle />
              <DarkModeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
