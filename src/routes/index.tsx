import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { VENDORS, STATUS_META } from "@/lib/vendors";
import { ArrowUpRight, MapPin, Quote } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RedeemServe — The City's Coordination Paper" },
      {
        name: "description",
        content:
          "A live directory, AI demand forecasts and WhatsApp access — built for Redemption City's Holy Ghost Service and the RCCG Convention.",
      },
      { property: "og:title", content: "RedeemServe — Vendors & attendees, connected" },
      {
        property: "og:description",
        content: "The coordination paper for the world's largest monthly gathering.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      <Ticker />
      <FrontPage />
      <Directory />
      <CapabilitiesSpread />
      <DispatchPullquote />
      <NumbersStrip />
      <ClosingPlate />
    </SiteLayout>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Ticker — live vendor status, marquee-style                  */
/* ──────────────────────────────────────────────────────────── */

function Ticker() {
  const items = VENDORS.slice(0, 8);
  const row = (
    <div className="flex shrink-0 items-center gap-10 px-6">
      {items.map((v) => {
        const meta = STATUS_META[v.status];
        return (
          <span key={v.id} className="flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-cream/85">
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            <span className="font-semibold text-cream">{v.name}</span>
            <span className="text-cream/55">— {meta.label} · Zone {v.zone}</span>
          </span>
        );
      })}
    </div>
  );
  return (
    <div className="overflow-hidden border-b border-emerald-deep/30 bg-emerald-deep py-2.5">
      <div className="marquee-track flex w-max">
        {row}
        {row}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Front page — editorial split                                */
/* ──────────────────────────────────────────────────────────── */

function FrontPage() {
  return (
    <section className="paper border-b border-emerald-deep/15">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Left rail — issue metadata */}
          <aside className="lg:col-span-2">
            <p className="font-display text-7xl leading-none text-emerald-deep">No. 06</p>
            <div className="hairline-gold mt-3 w-12" />
            <dl className="mt-6 space-y-4 text-[11px] uppercase tracking-[0.22em] text-emerald-deep/65">
              <div>
                <dt className="text-emerald-deep/40">Filed</dt>
                <dd className="mt-1">May 2026</dd>
              </div>
              <div>
                <dt className="text-emerald-deep/40">Dateline</dt>
                <dd className="mt-1">Redemption City, Ogun</dd>
              </div>
              <div>
                <dt className="text-emerald-deep/40">Service</dt>
                <dd className="mt-1">Holy Ghost · Friday</dd>
              </div>
              <div>
                <dt className="text-emerald-deep/40">Forecast</dt>
                <dd className="mt-1 font-display text-2xl normal-case tracking-normal text-emerald-deep">
                  ~1.4M
                </dd>
              </div>
            </dl>
          </aside>

          {/* Lede — main story */}
          <div className="lg:col-span-7">
            <p className="kicker">Cover Story · The Solution</p>
            <h1 className="mt-4 font-display text-[56px] leading-[0.95] tracking-tight text-emerald-deep text-balance sm:text-[88px]">
              The directory the city
              <br />
              has been{" "}
              <span className="font-italic-serif text-gold">waiting for.</span>
            </h1>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <p className="drop-cap text-[15px] leading-7 text-emerald-deep/85">
                RedeemServe is a live coordination layer for Redemption City — a single,
                trusted record of who is open, where they are, and what they have left.
                Vendors arrive prepared. Attendees arrive informed. The world's largest
                monthly gathering finally has the discovery tools a city of its size
                deserves.
              </p>
              <p className="text-[15px] leading-7 text-emerald-deep/75">
                Built around the rhythms of the Holy Ghost Service and the annual RCCG
                Convention, the platform combines a real-time vendor map, AI demand
                forecasting, automated onboarding, and a WhatsApp interface for those
                without data. No app to download. No friction. Just clarity for both
                sides of the meeting point.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                to="/discover"
                className="group inline-flex items-center gap-2 border-b-2 border-emerald-deep px-1 pb-1 font-display text-xl text-emerald-deep transition-all hover:border-gold hover:text-gold"
              >
                Open the directory
                <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                to="/vendors"
                className="group inline-flex items-center gap-2 border-b-2 border-transparent px-1 pb-1 font-display text-xl text-emerald-deep/70 transition-all hover:border-gold hover:text-emerald-deep"
              >
                Register as a vendor
                <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>

          {/* Right column — featured plate */}
          <div className="lg:col-span-3">
            <FeaturedPlate />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedPlate() {
  return (
    <div className="border border-emerald-deep/20 bg-cream/60 p-5">
      <p className="kicker">Now live · Zone A</p>
      <div className="hairline-gold mt-2 w-10" />
      <p className="mt-4 font-display text-2xl leading-tight text-emerald-deep">
        42 vendors trading at the Main Auditorium right now.
      </p>

      <ul className="mt-5 space-y-3">
        {VENDORS.slice(0, 4).map((v, i) => {
          const meta = STATUS_META[v.status];
          return (
            <li key={v.id} className="flex items-start gap-3 border-t border-emerald-deep/10 pt-3 first:border-t-0 first:pt-0">
              <span className="font-display text-sm tabular text-emerald-deep/50">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-deep">{v.name}</p>
                <p className="mt-0.5 text-[12px] text-emerald-deep/60">{v.popularItems[0]} · ★ {v.rating}</p>
              </div>
              <span className={`h-1.5 w-1.5 translate-y-1.5 rounded-full ${meta.dot}`} />
            </li>
          );
        })}
      </ul>

      <Link
        to="/discover"
        className="mt-5 block border-t-2 border-emerald-deep pt-3 text-center font-display text-sm uppercase tracking-[0.2em] text-emerald-deep hover:text-gold"
      >
        See all 42 →
      </Link>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  The Directory — featured plate grid                         */
/* ──────────────────────────────────────────────────────────── */

function Directory() {
  const featured = VENDORS.slice(0, 6);
  return (
    <section className="border-b border-emerald-deep/15">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="kicker">Section II · The Directory</p>
            <h2 className="mt-3 font-display text-5xl leading-[0.95] tracking-tight text-emerald-deep sm:text-6xl">
              Who is open, <span className="font-italic-serif text-gold">right now.</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-emerald-deep/70">
              A living index of every verified vendor on the grounds. Filter by zone, by
              category, by what's actually in stock at this minute.
            </p>
          </div>
          <Link
            to="/discover"
            className="group inline-flex items-center gap-2 border-b border-emerald-deep pb-1 font-display text-lg text-emerald-deep hover:border-gold hover:text-gold"
          >
            Browse all vendors <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="rule-thick mt-8" />

        {/* Editorial grid: 1 large + 5 smaller */}
        <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <DirectoryEntry vendor={featured[0]} large index={1} />
          {featured.slice(1).map((v, i) => (
            <DirectoryEntry key={v.id} vendor={v} index={i + 2} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DirectoryEntry({
  vendor,
  large = false,
  index,
}: {
  vendor: (typeof VENDORS)[number];
  large?: boolean;
  index: number;
}) {
  const meta = STATUS_META[vendor.status];
  return (
    <Link
      to="/discover"
      className={`group block ${large ? "md:col-span-2 lg:row-span-2" : ""}`}
    >
      <div className="flex items-baseline justify-between">
        <span className="font-display text-sm tabular text-emerald-deep/40">
          {String(index).padStart(2, "0")} / {String(VENDORS.length).padStart(2, "0")}
        </span>
        <span className="text-[10px] uppercase tracking-[0.22em] text-emerald-deep/55">
          Zone {vendor.zone}
        </span>
      </div>
      <div className="hairline mt-2" />
      <p className="kicker mt-4">{vendor.category}</p>
      <h3
        className={`mt-2 font-display tracking-tight text-emerald-deep transition-colors group-hover:text-gold ${
          large ? "text-5xl leading-[0.95] sm:text-6xl" : "text-2xl leading-tight"
        }`}
      >
        {vendor.name}
      </h3>
      <p className={`mt-3 leading-relaxed text-emerald-deep/75 ${large ? "text-base max-w-md" : "text-sm"}`}>
        {vendor.description}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] uppercase tracking-[0.18em] text-emerald-deep/60">
        <span className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {vendor.location}</span>
        <span className="tabular">★ {vendor.rating}</span>
      </div>
    </Link>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Capabilities spread — two-page editorial                    */
/* ──────────────────────────────────────────────────────────── */

const VENDOR_CAPS = [
  { num: "01", title: "Pre-event registration", body: "Claim your zone, category and capacity ahead of every service. Be listed before the gates even open." },
  { num: "02", title: "AI demand forecasting", body: "Trained on RCCG event patterns. Know — by hour, by category — what to prepare." },
  { num: "03", title: "Live storefront", body: "A profile attendees can find, with live stock and a direct WhatsApp line." },
  { num: "04", title: "AI onboarding briefing", body: "A personalised video the day you register. No more arriving blind." },
  { num: "05", title: "Post-event report", body: "What sold, what didn't, what to bring next month. Plain numbers, no fluff." },
];

const ATTENDEE_CAPS = [
  { num: "01", title: "Live grounds map", body: "Every active vendor, every zone — visible before you take a step." },
  { num: "02", title: "Real-time stock", body: "Sold out at one stall? The next one over surfaces automatically." },
  { num: "03", title: "Pre-arrival planning", body: "Browse vendors from home. Arrive informed, not improvising." },
  { num: "04", title: "WhatsApp access", body: "No data? Text RedeemServe and get the directory by message." },
  { num: "05", title: "Saved itineraries", body: "Bookmark vendors for your family, your team, your travel group." },
];

function CapabilitiesSpread() {
  return (
    <section className="paper border-b border-emerald-deep/15">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-8 sm:py-20">
        <div className="text-center">
          <p className="kicker">Section III · The Apparatus</p>
          <h2 className="mt-3 font-display text-5xl leading-[0.95] tracking-tight text-emerald-deep sm:text-6xl">
            One paper. <span className="font-italic-serif text-gold">Two readerships.</span>
          </h2>
        </div>

        <div className="rule-thick mx-auto mt-8 max-w-xs" />

        <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-20">
          <CapColumn label="For the Vendor" items={VENDOR_CAPS} cta={{ label: "Open the vendor portal", to: "/vendors" }} />
          <div className="hidden border-l border-emerald-deep/15 lg:block" style={{ marginLeft: "-2.5rem" }} />
          <div className="lg:-ml-10">
            <CapColumn label="For the Attendee" items={ATTENDEE_CAPS} cta={{ label: "Open the directory", to: "/discover" }} />
          </div>
        </div>
      </div>
    </section>
  );
}

function CapColumn({
  label,
  items,
  cta,
}: {
  label: string;
  items: { num: string; title: string; body: string }[];
  cta: { label: string; to: string };
}) {
  return (
    <div>
      <p className="font-italic-serif text-2xl text-emerald-deep">{label}</p>
      <div className="hairline-gold mt-3 w-12" />

      <ol className="mt-8 space-y-7">
        {items.map((i) => (
          <li key={i.num} className="grid grid-cols-[auto_1fr] gap-x-6 border-t border-emerald-deep/10 pt-5 first:border-t-0 first:pt-0">
            <span className="font-display text-3xl tabular text-gold leading-none">{i.num}</span>
            <div>
              <h3 className="font-display text-2xl leading-tight text-emerald-deep">{i.title}</h3>
              <p className="mt-2 text-[15px] leading-7 text-emerald-deep/75">{i.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <Link
        to={cta.to}
        className="mt-10 inline-flex items-center gap-2 border-b border-emerald-deep pb-1 font-display text-lg text-emerald-deep hover:border-gold hover:text-gold"
      >
        {cta.label} <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Dispatch pull quote                                          */
/* ──────────────────────────────────────────────────────────── */

function DispatchPullquote() {
  return (
    <section className="ink-grad text-cream">
      <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-3">
            <Quote className="h-12 w-12 text-gold" strokeWidth={1} />
            <p className="mt-6 text-[11px] uppercase tracking-[0.28em] text-cream/55">
              Field Dispatch
              <br />
              Holy Ghost Service · Mar 2026
            </p>
          </div>
          <blockquote className="lg:col-span-9">
            <p className="font-display text-3xl leading-[1.15] text-balance text-cream sm:text-5xl">
              "A vendor two hundred metres away is{" "}
              <span className="text-gold font-italic-serif">invisible</span> to an
              attendee who needs them. Supply and demand exist in the same place —
              they simply never meet. That is the gap RedeemServe closes."
            </p>
            <footer className="mt-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-cream/60">
              <span className="h-px w-12 bg-gold" />
              From the founding brief
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Numbers strip — typographic, not "stat cards"                */
/* ──────────────────────────────────────────────────────────── */

function NumbersStrip() {
  const numbers = [
    { value: "1.4M", label: "expected attendees · next service" },
    { value: "12", label: "monthly events · per calendar year" },
    { value: "42", label: "verified vendors · Zone A right now" },
    { value: "5", label: "languages supported · over WhatsApp" },
  ];
  return (
    <section className="border-b border-emerald-deep/15 bg-cream">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-8">
        <div className="grid gap-y-10 sm:grid-cols-2 sm:divide-x sm:divide-emerald-deep/15 lg:grid-cols-4">
          {numbers.map((n) => (
            <div key={n.label} className="px-2 text-center sm:px-6">
              <p className="font-display text-6xl tabular text-emerald-deep sm:text-7xl">
                {n.value}
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-emerald-deep/55">
                {n.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Closing plate                                                */
/* ──────────────────────────────────────────────────────────── */

function ClosingPlate() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-8 sm:py-24">
      <div className="grid gap-10 border-y-2 border-emerald-deep py-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="kicker">The Subscription · Free Forever</p>
          <h2 className="mt-3 font-display text-5xl leading-[0.95] tracking-tight text-emerald-deep text-balance sm:text-7xl">
            Be ready for the
            <br />
            next <span className="font-italic-serif text-gold">Holy Ghost</span> Service.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-emerald-deep/75">
            Whether you're serving thousands of plates or simply looking for one — pick
            your side and join. No accounts to verify endlessly. No noise. Just the
            directory you needed last month.
          </p>
        </div>
        <div className="flex flex-col justify-end gap-3 lg:col-span-5 lg:items-end">
          <Link
            to="/vendors"
            className="group inline-flex items-center justify-between gap-6 border-2 border-emerald-deep bg-emerald-deep px-7 py-4 text-cream transition-colors hover:bg-gold hover:border-gold hover:text-emerald-deep lg:min-w-[340px]"
          >
            <span className="font-display text-xl">I am a vendor</span>
            <ArrowUpRight className="h-5 w-5" />
          </Link>
          <Link
            to="/discover"
            className="group inline-flex items-center justify-between gap-6 border-2 border-emerald-deep px-7 py-4 text-emerald-deep transition-colors hover:bg-emerald-deep hover:text-cream lg:min-w-[340px]"
          >
            <span className="font-display text-xl">I am an attendee</span>
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
