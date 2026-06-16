import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl gradient-warm text-cream">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="M5 8h14l-1.5 11a2 2 0 0 1-2 1.7h-9a2 2 0 0 1-2-1.7L5 8Z"/><path d="M9 12h6"/></svg>
            </span>
            <span className="font-display text-xl font-semibold">
              Redeem<span className="text-accent">Serve</span>
            </span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Connecting vendors and attendees at Redemption City events — closing the
            coordination gap at the world's largest monthly gathering, one event at a time.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">Platform</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/discover" className="hover:text-foreground">Discover Vendors</Link></li>
            <li><Link to="/vendors" className="hover:text-foreground">Vendor Portal</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">Contact</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Redemption City, Ogun State</li>
            <li>hello@redeemserve.app</li>
            <li>WhatsApp: +234 800 000 0000</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} RedeemServe. Built for Kingdom Hack 3.0.</p>
          <p>Made with care for the RCCG community.</p>
        </div>
      </div>
    </footer>
  );
}
