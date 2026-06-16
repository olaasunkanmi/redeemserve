import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About RedeemServe — Kingdom Hack 3.0" },
      {
        name: "description",
        content:
          "RedeemServe is built for Redemption City — closing the coordination gap between vendors and attendees at the Holy Ghost Service and RCCG Convention.",
      },
      { property: "og:title", content: "About RedeemServe" },
      {
        property: "og:description",
        content: "Why we built it, who it serves, and how it sustains itself.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">About</p>
        <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight text-balance">
          A meeting point for the world's largest monthly gathering.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Redemption City is the international headquarters of the Redeemed Christian Church
          of God — a self-sustaining municipality along the Lagos-Ibadan Expressway. Every
          month, it hosts the Holy Ghost Service: between 500,000 and over 2 million people in
          a single event. Once a year, the RCCG Convention brings millions more.
        </p>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          Despite this scale, vendors and attendees have no coordinated meeting point. Food
          sellers run out by 10am. Transport operators cluster at the wrong gates. Families
          and international visitors wander, looking for a meal. Supply and demand exist in
          the same space — but never connect.
        </p>

        <div className="my-12 rounded-3xl border border-border bg-card p-8 shadow-soft">
          <p className="font-display text-2xl font-semibold leading-snug text-balance">
            "A vendor 200 metres away is invisible to an attendee who needs them. That is
            the problem RedeemServe solves."
          </p>
          <p className="mt-4 text-sm font-medium uppercase tracking-wider text-accent">
            The Gap — Problem Validation, Kingdom Hack 3.0
          </p>
        </div>

        <h2 className="font-display text-3xl font-semibold tracking-tight">Why this works here</h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          RedeemServe is not a generic marketplace. It is built around the specific rhythms
          of Redemption City — the monthly Holy Ghost Service cadence, the known attendee
          profile, the existing vendor ecosystem, and the physical layout of the grounds. The
          AI demand forecasting is trained on RCCG event patterns specifically. The
          attendee interface is built for first-time visitors and those without reliable data
          access — which is why every key feature is also available over WhatsApp.
        </p>

        <h2 className="mt-12 font-display text-3xl font-semibold tracking-tight">Built for trust</h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Vendors are verified before being listed. Attendees see real availability, not
          stale information. The platform sustains itself through small, fair fees — never
          through ads or attention-grabbing tactics that don't belong in a place of worship.
        </p>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elev hover:scale-[1.02]"
          >
            Explore the directory <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/vendors"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-secondary"
          >
            Become a vendor
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
