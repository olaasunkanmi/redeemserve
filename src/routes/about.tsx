import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Masthead — RedeemServe" },
      {
        name: "description",
        content:
          "Why RedeemServe exists, who it serves, and how it sustains itself. The coordination paper for Redemption City.",
      },
      { property: "og:title", content: "Masthead — RedeemServe" },
      {
        property: "og:description",
        content: "A meeting point for the world's largest monthly gathering.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section className="paper border-b border-emerald-deep/15">
        <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-8 sm:py-20">
          <p className="kicker">Section V · Masthead</p>
          <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight text-emerald-deep text-balance sm:text-7xl">
            A meeting point for the world's
            <br />
            largest <span className="font-italic-serif text-gold">monthly</span> gathering.
          </h1>
          <div className="rule-thick mt-10" />
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-8">
        <div className="grid gap-16 lg:grid-cols-12">
          {/* Left rail */}
          <aside className="lg:col-span-3">
            <p className="kicker">Filed</p>
            <p className="mt-2 font-display text-xl text-emerald-deep">May 2026</p>

            <p className="kicker mt-8">Dateline</p>
            <p className="mt-2 text-sm text-emerald-deep/80">
              Redemption City<br />Ogun State, Nigeria
            </p>

            <p className="kicker mt-8">By</p>
            <p className="mt-2 text-sm text-emerald-deep/80">
              The RedeemServe team<br />for Kingdom Hack 3.0
            </p>

            <div className="rule-thick mt-10" />

            <p className="mt-6 font-italic-serif text-xl leading-snug text-emerald-deep">
              "Supply and demand exist in the same place. They simply never meet."
            </p>
          </aside>

          {/* Article body */}
          <article className="lg:col-span-9">
            <p className="drop-cap text-lg leading-9 text-emerald-deep/90">
              Redemption City is the international headquarters of the Redeemed Christian
              Church of God — a self-sustaining municipality along the Lagos-Ibadan
              Expressway. Every month, it hosts the Holy Ghost Service: between five
              hundred thousand and over two million people gathered in a single event.
              Once a year, the RCCG Convention multiplies that scale across several days.
            </p>

            <p className="mt-6 text-lg leading-9 text-emerald-deep/85">
              Despite this scale and frequency, vendors and attendees have no coordinated
              meeting point. Food sellers run out by 10am. Transport operators cluster at
              the wrong gates. Families and international visitors wander, looking for a
              plate of food. Supply and demand exist in the same space — they simply never
              connect.
            </p>

            <h2 className="mt-14 font-display text-4xl leading-tight text-emerald-deep">
              Why this works <span className="font-italic-serif text-gold">here.</span>
            </h2>
            <div className="hairline-gold mt-3 w-12" />
            <p className="mt-6 text-lg leading-9 text-emerald-deep/85">
              RedeemServe is not a generic marketplace. It is built around the specific
              rhythms of this city — the monthly Holy Ghost cadence, the known attendee
              profile, the existing vendor ecosystem, and the physical layout of the
              grounds. The AI demand forecasting is trained on RCCG patterns. The
              attendee interface is built for first-time visitors and those without
              reliable data access — which is why every key feature is also available
              over WhatsApp.
            </p>

            <h2 className="mt-14 font-display text-4xl leading-tight text-emerald-deep">
              Built for <span className="font-italic-serif text-gold">trust.</span>
            </h2>
            <div className="hairline-gold mt-3 w-12" />
            <p className="mt-6 text-lg leading-9 text-emerald-deep/85">
              Vendors are verified before being listed. Attendees see real availability,
              not stale information. The platform sustains itself through small, fair fees
              — never through ads or attention tactics that don't belong in a place of
              worship.
            </p>

            <h2 className="mt-14 font-display text-4xl leading-tight text-emerald-deep">
              How it <span className="font-italic-serif text-gold">sustains itself.</span>
            </h2>
            <div className="hairline-gold mt-3 w-12" />
            <ol className="mt-8 space-y-6">
              {[
                { n: "01", title: "Vendor registration", body: "A small flat fee per event for a verified listing. From launch." },
                { n: "02", title: "Transaction commission", body: "Five to seven percent on bookings made through the platform. From launch." },
                { n: "03", title: "Verified Vendor subscription", body: "₦5,000–₦15,000/month for priority placement and demand reports. Month 3 onward." },
                { n: "04", title: "Premium analytics", body: "Detailed demand forecasts and performance dashboards for serious operators. Month 6 onward." },
              ].map((i) => (
                <li key={i.n} className="grid grid-cols-[auto_1fr] gap-x-6 border-t border-emerald-deep/15 pt-5">
                  <span className="font-display text-3xl tabular text-gold leading-none">{i.n}</span>
                  <div>
                    <h3 className="font-display text-2xl leading-tight text-emerald-deep">{i.title}</h3>
                    <p className="mt-2 text-base leading-7 text-emerald-deep/75">{i.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-16 flex flex-wrap gap-4 border-t-2 border-emerald-deep pt-8">
              <Link
                to="/discover"
                className="group inline-flex items-center gap-2 border-2 border-emerald-deep bg-emerald-deep px-6 py-3 font-display text-lg text-cream hover:bg-gold hover:border-gold hover:text-emerald-deep"
              >
                Open the directory <ArrowUpRight className="h-5 w-5" />
              </Link>
              <Link
                to="/vendors"
                className="group inline-flex items-center gap-2 border-2 border-emerald-deep px-6 py-3 font-display text-lg text-emerald-deep hover:bg-emerald-deep hover:text-cream"
              >
                Become a vendor <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>
          </article>
        </div>
      </section>
    </SiteLayout>
  );
}
