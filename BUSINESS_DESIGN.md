# RedeemServe — Business Design

> Companion to `SOLUTION_ARCHITECTURE.md`. This document defines **what** the business does, **who** it serves, **how** it makes money, and **how** it operates day-to-day — independent of the technical implementation.

---

## 1. Executive Summary

**RedeemServe** is a community-commerce platform that connects attendees, residents, and visitors of Redemption City with vetted on-site vendors offering food, essentials, services, and experiences. The platform combines a localized marketplace, AI-powered demand intelligence, and a multilingual concierge to make life inside the city seamless — for buyers and sellers alike.

**Vision:** Become the default digital high street for faith-based mega-communities across Africa, starting with Redemption Camp.

**Mission:** Empower verified small vendors with discoverability, fair fulfilment, and predictive insights — while giving attendees a trusted, frictionless way to shop and access services within the city.

---

## 2. Problem & Opportunity

| Stakeholder | Current Pain |
|---|---|
| **Attendees / Residents** | Fragmented vendor info, no price transparency, language barriers, queuing, hard to locate services on the vast grounds. |
| **Vendors** | Unpredictable demand, walk-in-only sales, no marketing reach, manual record-keeping, cash-only risk. |
| **Camp Administration** | No unified view of commerce activity, KYC compliance, or crowd-driven service gaps. |
| **Visitors (first-timers)** | Don't know what's available, where, or how to navigate convention seasons. |

**Opportunity:** Programs and conventions can draw **>1M people** to the camp. Even modest digital capture creates a high-frequency, high-density commerce flywheel with strong network effects.

---

## 3. Target Users & Personas

### 3.1 Buyer Personas
- **Resident Rita** — Lives on-site year-round; wants weekly groceries, laundry, repairs.
- **Convention Chidi** — Visits for monthly programs; needs food, lodging info, transport, souvenirs.
- **First-time Funmi** — Tourist/pilgrim; needs a guided, multilingual experience.

### 3.2 Seller Personas
- **Stallholder Sade** — Runs a small food stall; wants more orders, less idle time.
- **Service Sam** — Tailor / electrician / barber; needs bookings and reviews.
- **Cooperative Coordinator** — Manages multiple vendor units under one license.

### 3.3 Operator Personas
- **Admin Adaeze** — Camp commerce officer; approves KYC, monitors disputes.
- **Analyst Ade** — Reviews AI demand forecasts, plans events and capacity.

---

## 4. Value Proposition

**For Attendees**
- One trusted app for food, essentials, and services inside the camp.
- Multilingual (English, Yoruba, Igbo) — accessible to every demographic.
- Transparent pricing, ratings, and real-time vendor availability.
- AI concierge that answers "what's open near me right now?"

**For Vendors**
- Free storefront and digital order channel.
- Predictive demand forecasts (next-hour / next-day) to plan stock and staff.
- Verified badge after KYC → higher buyer trust → higher conversion.
- Referral program to grow the buyer base organically.

**For Administration**
- Centralized vendor registry with KYC audit trail.
- Aggregate commerce analytics — categories, gaps, peak hours.
- Compliance, dispute, and rating oversight tools.

---

## 5. Business Model

### 5.1 Revenue Streams

| # | Stream | Description | Stage |
|---|---|---|---|
| 1 | **Commission per order** | 5–10% take rate on marketplace transactions | Launch |
| 2 | **Vendor subscription (Pro)** | Monthly fee for boosted placement, analytics, multi-staff accounts | Phase 2 |
| 3 | **Featured listings** | Pay-to-promote slots on home, category, and search results | Phase 2 |
| 4 | **Payment processing margin** | Spread on integrated wallet / card payments | Phase 2 |
| 5 | **Logistics fee** | Last-mile delivery within the city (bike/cart partners) | Phase 3 |
| 6 | **Data & insights** | Aggregate, anonymized demand reports for the administration and large vendors | Phase 3 |
| 7 | **Event sponsorships** | Promoted bundles around conventions and programs | Phase 3 |

### 5.2 Pricing Principles
- **Free for buyers** — no subscription, no markup beyond vendor price.
- **Free baseline for vendors** — onboarding, listing, and order management at no cost.
- **Pay for growth, not access** — vendors only pay when they earn (commission) or want amplification (subscription/featured).

### 5.3 Unit Economics (illustrative)
- Avg. order value (AOV): ₦3,500
- Take rate: 8% → **Revenue per order: ₦280**
- Variable cost per order (infra + AI + payments): ~₦60
- Contribution margin per order: ~₦220
- Break-even: depends on monthly active vendors × orders/vendor/day.

---

## 6. Key Business Capabilities

1. **Vendor Onboarding & KYC** — Self-service signup, document upload, admin review, verified badge.
2. **Catalog Management** — Vendors create categories, products, prices, availability windows.
3. **Order Lifecycle** — Cart → checkout → fee computation → vendor acceptance → fulfilment → rating.
4. **Discovery** — Search, category browse, live map, "open now", featured slots.
5. **Trust & Safety** — Ratings, reviews, dispute flow, KYC enforcement, admin moderation.
6. **Demand Intelligence** — Hourly AI forecasts per vendor / category to drive stock and staffing decisions.
7. **Multilingual Concierge** — AI chat in EN/YO/IG for navigation, recommendations, FAQs.
8. **Referrals & Growth** — Unique codes per user; rewards on first qualifying order.
9. **Analytics & Reporting** — Vendor dashboards, admin oversight, aggregate camp commerce health.
10. **Notifications** — Order status, promos, low-stock alerts (in-app, email, WhatsApp later).

---

## 7. Customer Journeys

### 7.1 Attendee — First Order
1. Lands on home → sees live stats, featured vendors, "open now near me".
2. Switches language to Yoruba (one tap).
3. Searches "jollof" → results filtered by distance and rating.
4. Opens vendor → adds items → cart persists across pages.
5. Signs in with Google → checkout → fees shown transparently.
6. Receives order updates → rates the vendor → earns referral code.

### 7.2 Vendor — Onboarding to First Sale
1. Signs up → role auto-granted as `vendor` (pending KYC).
2. Uploads ID + business documents → status: `pending review`.
3. Admin approves → verified badge unlocked.
4. Adds products, sets hours, toggles availability.
5. Receives first order → accepts → fulfils → gets rated.
6. Reviews next-hour forecast → adjusts stock for evening peak.

### 7.3 Admin — Daily Operations
1. Reviews KYC queue → approves / requests more info.
2. Scans dispute queue → mediates and resolves.
3. Opens analytics → spots underserved categories → invites targeted vendors.

---

## 8. Operating Model

### 8.1 Roles & Responsibilities
- **Platform Team** — Product, engineering, AI, support.
- **Camp Liaison** — Relationship with Redemption Camp administration; compliance, comms.
- **Vendor Success** — Onboarding workshops, KYC support, performance coaching.
- **Trust & Safety** — Dispute resolution, fraud monitoring, review moderation.
- **Growth** — Referrals, campaigns around convention calendar, partnerships.

### 8.2 Governance
- **Vendor Code of Conduct** — pricing fairness, hygiene, service standards.
- **Dispute Policy** — SLA for response, refund matrix, escalation path.
- **Data Policy** — buyer data never sold; aggregate insights only.
- **AI Use Policy** — forecasts are advisory, not contractual; concierge disclosures.

### 8.3 SLAs (target)
- KYC review: < 48 hours.
- Order acceptance window: 10 minutes.
- Dispute first response: < 24 hours.
- Platform uptime: 99.5%.

---

## 9. Go-to-Market

### 9.1 Phase 1 — Anchor (Months 0–3)
- Onboard 50 anchor vendors across food, essentials, services.
- Launch in English + Yoruba; Igbo follows in week 6.
- Seed buyer demand via on-ground QR posters at high-traffic zones.
- Free commissions for first 60 days to drive vendor adoption.

### 9.2 Phase 2 — Density (Months 3–9)
- Activate commissions + featured listings.
- Launch convention-mode landing pages timed to monthly programs.
- Introduce referral rewards and vendor leaderboard.
- Open Vendor Pro subscription.

### 9.3 Phase 3 — Expansion (Months 9–18)
- Logistics partner network for in-camp delivery.
- Payments wallet + cashless checkout.
- Aggregate insights product for administration and large vendors.
- Pilot in a second mega-community campus.

### 9.4 Acquisition Channels
- On-ground signage, QR codes at gates and auditoriums.
- Partnerships with parish coordinators and convention organizers.
- WhatsApp broadcast lists and SMS for vendors.
- Referral codes and social sharing for buyers.

---

## 10. Key Performance Indicators (KPIs)

**Marketplace Health**
- Monthly Active Buyers (MAB), Monthly Active Vendors (MAV)
- Orders per active buyer / vendor / day
- Gross Merchandise Value (GMV)
- Take rate and net revenue

**Trust & Quality**
- KYC approval rate and time-to-approve
- Avg. vendor rating, % vendors ≥ 4.5
- Dispute rate per 1,000 orders; resolution SLA hit %

**Engagement**
- Search-to-order conversion
- Repeat order rate (30/60/90 day)
- Language mix (EN/YO/IG) and concierge usage

**AI Impact**
- Forecast MAPE (accuracy)
- % vendors viewing forecasts weekly
- Stock-out reduction vs. baseline

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Low vendor adoption | Free launch period, white-glove onboarding, anchor vendor incentives. |
| Buyer trust in new platform | KYC verified badges, ratings, transparent pricing, admin endorsement. |
| Connectivity gaps on-site | Lightweight SSR pages, offline-tolerant cart, WhatsApp fallback for order updates. |
| Payment friction | Cash-on-delivery default at launch; digital payments phased in. |
| AI forecast errors | Position as advisory; show confidence; learn from vendor feedback loop. |
| Regulatory / compliance | Clear vendor agreements, KYC, data minimization, audit logs. |
| Seasonality (between programs) | Resident-focused categories (groceries, services) to smooth demand. |

---

## 12. Roadmap Snapshot

| Quarter | Theme | Headline Deliverables |
|---|---|---|
| Q1 | Launch | Marketplace MVP, KYC, ratings, multilingual UI, concierge v1 |
| Q2 | Monetize | Commissions, featured listings, Vendor Pro, referral rewards |
| Q3 | Intelligence | Demand forecasts in vendor dashboard, admin analytics |
| Q4 | Fulfilment | In-camp delivery, digital wallet, WhatsApp notifications |
| Y2 | Expand | Second campus pilot, insights product, sponsorships |

---

## 13. Success Definition (12-month)

- **200+ verified vendors** active monthly.
- **25,000+ monthly active buyers** across residents and convention attendees.
- **₦150M+ GMV** with positive contribution margin.
- **≥ 4.6 avg vendor rating**, dispute rate < 1%.
- **One additional campus** signed for Year 2 expansion.

---

*Document owner: Product & Strategy. Companion docs: `SOLUTION_ARCHITECTURE.md`, `solution-architecture.mmd`.*
