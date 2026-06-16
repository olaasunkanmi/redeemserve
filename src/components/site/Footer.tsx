import { Link } from "@tanstack/react-router";
import { Store } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-emerald-deep/10 bg-surface">
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-deep text-cream">
                <Store className="h-4 w-4" />
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight text-emerald-deep">
                Redeem<span className="text-gold">Serve</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-emerald-deep/70">
              The multivendor marketplace for Redemption City events — connecting
              food sellers, transport operators, traders and service providers with
              the millions who gather for the Holy Ghost Service.
            </p>
          </div>

          <FooterCol title="Marketplace" items={[
            { label: "Browse vendors", to: "/discover" },
            { label: "Categories", to: "/discover" },
            { label: "Grounds map", to: "/discover" },
            { label: "About RedeemServe", to: "/about" },
          ]} />
          <FooterCol title="For vendors" items={[
            { label: "Sell on RedeemServe", to: "/dashboard" },
            { label: "Vendor dashboard", to: "/dashboard" },
            { label: "Demand forecasts", to: "/dashboard" },
            { label: "Sign in", to: "/auth" },
          ]} />
          <FooterCol title="Support" items={[
            { label: "Help center", to: "/about" },
            { label: "Contact", to: "/about" },
            { label: "Vendor terms", to: "/about" },
            { label: "Privacy", to: "/about" },
          ]} />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-emerald-deep/10 pt-6 text-xs text-emerald-deep/55 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} RedeemServe · Redemption City, Ogun State</span>
          <span>hello@redeemserve.app · WhatsApp +234 800 000 0000</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; to: string }[] }) {
  return (
    <div className="lg:col-span-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-deep">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm text-emerald-deep/70">
        {items.map((i) => (
          <li key={i.label}>
            <Link to={i.to} className="hover:text-emerald-deep">{i.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
