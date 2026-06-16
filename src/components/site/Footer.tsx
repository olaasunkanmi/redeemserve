import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-20 border-t-2 border-emerald-deep/20">
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="font-display text-4xl text-emerald-deep">
              Redeem<span className="font-italic-serif text-gold">Serve</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-emerald-deep/70">
              A coordination paper for Redemption City — printed, in spirit, every
              month. We close the gap between vendors who serve and attendees who
              search.
            </p>
            <div className="mt-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-emerald-deep/50">
              <span>Filed from Ogun State</span>
              <span className="h-px w-8 bg-emerald-deep/30" />
              <span>Kingdom Hack 3.0</span>
            </div>
          </div>

          <FooterCol title="Sections" items={[
            { label: "The Front Page", to: "/" },
            { label: "Vendor Directory", to: "/discover" },
            { label: "Vendor Portal", to: "/vendors" },
            { label: "Masthead & Mission", to: "/about" },
          ]} />
          <FooterCol title="For Vendors" items={[
            { label: "Register for next service", to: "/vendors" },
            { label: "Demand forecasts", to: "/vendors" },
            { label: "Onboarding briefing", to: "/vendors" },
            { label: "Post-event reports", to: "/vendors" },
          ]} />
          <FooterCol title="For Attendees" items={[
            { label: "Find food", to: "/discover" },
            { label: "Find transport", to: "/discover" },
            { label: "Find medical", to: "/discover" },
            { label: "WhatsApp directory", to: "/discover" },
          ]} />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-emerald-deep/15 pt-6 text-[11px] uppercase tracking-[0.22em] text-emerald-deep/55 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} RedeemServe · All rights reserved</span>
          <span>hello@redeemserve.app · WhatsApp +234 800 000 0000</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; to: string }[] }) {
  return (
    <div className="lg:col-span-2">
      <p className="font-display text-xs uppercase tracking-[0.28em] text-emerald-deep">
        {title}
      </p>
      <div className="hairline-gold mt-2 w-8" />
      <ul className="mt-4 space-y-2.5 text-sm text-emerald-deep/75">
        {items.map((i) => (
          <li key={i.label}><Link to={i.to} className="hover:text-emerald-deep hover:underline underline-offset-4 decoration-gold">{i.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
