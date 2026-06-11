# Roadmap: Nuage E-Commerce

## Milestones

- ✅ [v1.0 MVP](milestones/v1.0-ROADMAP.md) (Phases 1-4) — SHIPPED 2026-02-09
- ✅ **v1.1 - Enhanced Experience** (Phases 5-8) — SHIPPED 2026-02-09
- ✅ **v2.0 - Production Launch** (Phases 9-13) — SHIPPED 2026-02-12
- ✅ **v3.0 - Content & Growth** (Phase 14) — SHIPPED 2026-02-12
- ✅ [**v4.0 - UX Heaven**](milestones/v4.0-ROADMAP.md) (Phases 15-19) — SHIPPED 2026-02-12
- ✅ **v5.0 - Analytics & Insights** (Phases 20-23) — SHIPPED 2026-02-12
- ✅ **v6.0 - Growth & Marketing** (Phases 24-27) — SHIPPED 2026-02-13

## Completed Milestones

<details>
<summary>v1.0 MVP (Phases 1-4) — SHIPPED 2026-02-09</summary>

- [x] Phase 1: Foundation & Brand (3/3 plans) — 2026-02-09
- [x] Phase 2: Product Catalog (2/2 plans) — 2026-02-09
- [x] Phase 3: Shopping Experience (3/3 plans) — 2026-02-09
- [x] Phase 4: Launch Prep (3/3 plans) — 2026-02-09

**Delivered:** Complete premium e-commerce storefront with shopping cart, checkout, order management, and mobile-responsive design.

See [v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md) for full details.

</details>

<details>
<summary>v1.1 - Enhanced Experience (Phases 5-8) — COMPLETE 2026-02-09</summary>

- [x] Phase 5: Motion Foundation (1/1 plans) — 2026-02-09
- [x] Phase 6: Product Experience (1/1 plans) — 2026-02-09
- [x] Phase 7: Cart & Checkout Polish (1/1 plans) — 2026-02-09
- [x] Phase 8: Character & Delight (8/8 plans) — 2026-02-09

**Delivered:** Dynamic animations, interactive product galleries, smooth cart operations, mobile gestures, trust signals, exit intent, and performance optimization with SEO foundation.

</details>

### ✅ v2.0 - Production Launch (COMPLETE 2026-02-12)

**Milestone Goal:** Transform the MVP into a production-ready store with real payments, proper database, and an automated product sourcing pipeline.

#### Phase 9: Supabase Migration & Auth

**Goal**: Migrate from file-based JSON to Supabase PostgreSQL and secure admin panel with Supabase Auth
**Depends on**: Previous milestone complete (v1.1)
**Research**: Likely (new database integration + auth system)
**Research topics**: Supabase setup with Next.js 15, database schema design, Supabase Auth with App Router, middleware for protected routes
**Plans**: 3 plans, 1 wave

Plans:
- [x] 09-01: Supabase Foundation (packages, client helpers, schema, seed data)
- [x] 09-02: Migrate data access layer to Supabase
- [x] 09-03: Supabase Auth & admin protection

#### Phase 10: Stripe Checkout

**Goal**: Integrate Stripe Checkout for payment processing with webhook handling and order lifecycle management
**Depends on**: Phase 9 (orders in database)
**Research**: Likely (external payment API, French market requirements)
**Research topics**: Stripe Checkout with Next.js, webhook verification, EUR currency handling, French payment methods (Carte Bancaire), Stripe France compliance
**Plans**: 2 plans, 2 waves

Plans:
- [x] 10-01: Stripe Setup & Checkout Integration (Wave 1)
- [x] 10-02: Webhook, Success & Admin (Wave 2)

#### Phase 11: Email Notifications

**Goal**: Send branded transactional emails for order confirmation and status updates
**Depends on**: Phase 10 (payment confirmation triggers emails)
**Research**: Likely (external email service integration)
**Research topics**: Resend or similar service with Next.js, email template design, transactional email best practices for French market
**Plans**: 2 plans, 2 waves

Plans:
- [x] 11-01: Email Service & Status Template (Wave 1)
- [x] 11-02: Wire Email Triggers into Order Lifecycle (Wave 2)

#### Phase 12: Product Sourcing Pipeline

**Goal**: Build multi-source web scraper to find and extract product data from AliExpress, EU wholesalers, and competitor sites
**Depends on**: Phase 9 (products in database)
**Research**: Likely (web scraping tools, source-specific strategies)
**Research topics**: Web scraping libraries (Puppeteer, Playwright, Cheerio), AliExpress product API/scraping, rate limiting, anti-bot considerations, data extraction patterns
**Plans**: 2 plans, 2 waves

Plans:
- [x] 12-01: Scraping Infrastructure (Wave 1) -- 2026-02-12
- [x] 12-02: Admin UI & Pipeline Bridge (Wave 2) -- 2026-02-12

#### Phase 13: AI Curation & Automation

**Goal**: Auto-translate and rewrite scraped products in premium French brand tone, with scheduled scraping and admin review queue
**Depends on**: Phase 12 (scraping engine provides raw data)
**Research**: Likely (AI API integration, scheduled functions)
**Research topics**: Claude/OpenAI API for product translation, prompt engineering for brand-consistent copy, Vercel Cron or Supabase Edge Functions for scheduling, admin review queue UX
**Plans**: 2 plans, 2 waves

Plans:
- [x] 13-01: AI Translation Engine & Curation Schema (Wave 1) -- 2026-02-11
- [x] 13-02: Admin Review Queue & Automation (Wave 2) -- 2026-02-11

### ✅ v3.0 - Content & Growth (COMPLETE 2026-02-12)

**Milestone Goal:** Drive organic traffic and brand authority with a blog system for hookah guides, culture articles, and SEO landing pages.

#### Phase 14: Blog & Content Marketing

**Goal**: Build a blog system with hookah guides, culture articles, and SEO landing pages to drive organic traffic
**Depends on**: Previous milestones (storefront, database, admin panel all in place)
**Research**: Likely (CMS approach — MDX vs database-driven, SEO structured data for articles)
**Research topics**: MDX with Next.js 15 App Router, blog SEO best practices, structured data for articles, French content marketing patterns
**Plans**: TBD

Plans:
- [x] 14-01: MDX Infrastructure & Blog Utilities (packages, config, types, utilities, Article schema)
- [x] 14-02: Blog Pages & Content

<details>
<summary>✅ v4.0 - UX Heaven (Phases 15-19) — SHIPPED 2026-02-12</summary>

- [x] Phase 15: Smart Search & Filtering (3/3 plans) — 2026-02-12
- [x] Phase 16: Social Proof & Reviews (3/3 plans) — 2026-02-12
- [x] Phase 17: Customer Accounts & Profiles (1/1 plan) — 2026-02-12
- [x] Phase 18: Wishlist & Recommendations (3/3 plans) — 2026-02-12
- [x] Phase 19: Mobile UX Excellence (2/2 plans) — 2026-02-12

**Delivered:** Advanced search, social proof, personalized recommendations, and Progressive Web App with mobile-native features.

See [milestones/v4.0-ROADMAP.md](milestones/v4.0-ROADMAP.md) for full details.

</details>

## Progress

**Execution Order:**
Phases execute in numeric order: 9 → ... → 23 → 24 → 25 → 26 → 27

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation & Brand | v1.0 | 3/3 | Complete | 2026-02-09 |
| 2. Product Catalog | v1.0 | 2/2 | Complete | 2026-02-09 |
| 3. Shopping Experience | v1.0 | 3/3 | Complete | 2026-02-09 |
| 4. Launch Prep | v1.0 | 3/3 | Complete | 2026-02-09 |
| 5. Motion Foundation | v1.1 | 1/1 | Complete | 2026-02-09 |
| 6. Product Experience | v1.1 | 1/1 | Complete | 2026-02-09 |
| 7. Cart & Checkout Polish | v1.1 | 1/1 | Complete | 2026-02-09 |
| 8. Character & Delight | v1.1 | 8/8 | Complete | 2026-02-09 |
| 9. Supabase Migration & Auth | v2.0 | 3/3 | Complete | 2026-02-11 |
| 10. Stripe Checkout | v2.0 | 2/2 | Complete | 2026-02-11 |
| 11. Email Notifications | v2.0 | 2/2 | Complete | 2026-02-11 |
| 12. Product Sourcing Pipeline | v2.0 | 2/2 | Complete | 2026-02-12 |
| 13. AI Curation & Automation | v2.0 | 2/2 | Complete | 2026-02-11 |
| 14. Blog & Content Marketing | v3.0 | 2/2 | Complete | 2026-02-12 |
| 15. Smart Search & Filtering | v4.0 | 3/3 | Complete | 2026-02-12 |
| 16. Social Proof & Reviews | v4.0 | 3/3 | Complete | 2026-02-12 |
| 17. Customer Accounts & Profiles | v4.0 | 1/1 | Complete | 2026-02-12 |
| 18. Wishlist & Recommendations | v4.0 | 3/3 | Complete | 2026-02-12 |
| 19. Mobile UX Excellence | v4.0 | 2/2 | Complete | 2026-02-12 |

### ✅ v5.0 - Analytics & Insights (COMPLETE 2026-02-12)

**Milestone Goal:** Provide comprehensive analytics and insights into business performance, customer behavior, and sales trends through admin dashboards and intelligence tools.

#### Phase 20: Analytics Foundation

**Goal**: Set up analytics infrastructure with event tracking, data collection pipeline, and core metrics database
**Depends on**: Previous milestones complete (v4.0)
**Research**: Likely (analytics platforms and architectures)
**Research topics**: Analytics libraries (Plausible, PostHog, custom), event tracking patterns, time-series data in Supabase, real-time vs batch processing
**Plans**: 2 plans, 2 waves

Plans:
- [x] 20-01: Event Tracking Infrastructure (Wave 1) -- 2026-02-12
- [x] 20-02: Core Metrics & Aggregation (Wave 2) -- 2026-02-12

#### Phase 21: Admin Dashboard

**Goal**: Build comprehensive admin dashboard with KPIs, revenue metrics, order tracking, and real-time statistics
**Depends on**: Phase 20
**Research**: Unlikely (dashboard UI with established patterns)
**Plans**: 3 plans, 1 wave

Plans:
- [x] 21-01: Enhanced Dashboard Overview (KPIs, real-time activity) -- 2026-02-12
- [x] 21-02: Revenue Analytics Page (charts, trends, financial metrics) -- 2026-02-12
- [x] 21-03: Product Analytics Page (best sellers, search insights) -- 2026-02-12

#### Phase 22: Sales Analytics

**Goal**: Implement detailed sales analytics with product performance, revenue breakdowns, order trends, and inventory insights
**Depends on**: Phase 21
**Research**: Unlikely (data visualization with existing stack)
**Plans**: 3 plans, 1 wave

Plans:
- [x] 22-01: Sales Performance Dashboard (revenue by category, top sellers, AOV) -- 2026-02-12
- [x] 22-02: Inventory Management Dashboard (stock alerts, velocity, restock) -- 2026-02-12
- [x] 22-03: Order Intelligence Dashboard (time patterns, shipping, funnel) -- 2026-02-12

#### Phase 23: Customer Intelligence

**Goal**: Add customer segmentation, behavioral analytics, cohort analysis, and lifetime value tracking
**Depends on**: Phase 22
**Research**: Likely (customer analytics algorithms)
**Research topics**: Segmentation strategies, cohort analysis methods, LTV calculation approaches, RFM analysis
**Plans**: 2 plans, 2 waves

Plans:
- [x] 23-01: Customer Segmentation & RFM Analysis (Wave 1)
- [x] 23-02: Cohort Analysis & LTV Tracking (Wave 2)
| 20. Analytics Foundation | v5.0 | 2/2 | Complete | 2026-02-12 |
| 21. Admin Dashboard | v5.0 | 3/3 | Complete | 2026-02-12 |
| 22. Sales Analytics | v5.0 | 3/3 | Complete | 2026-02-12 |
| 23. Customer Intelligence | v5.0 | 2/2 | Complete | 2026-02-12 |

### ✅ v6.0 - Growth & Marketing (COMPLETE 2026-02-13)

**Milestone Goal:** Drive customer acquisition and retention through SEO optimization, promotional tools, social media integration, and email marketing campaigns.

#### Phase 24: SEO & Organic Growth

**Goal**: Optimize the site for search engines with technical SEO improvements, structured data enhancements, sitemap generation, and meta tag optimization for French market
**Depends on**: Previous milestones complete (v5.0)
**Research**: Likely (French SEO best practices, Google Search Console integration)
**Research topics**: Next.js SEO patterns, French-market SEO, sitemap generation, Open Graph optimization, Core Web Vitals
**Plans**: 2 plans, 1 wave

Plans:
- [x] 24-01: Technical SEO & Sitemap Completeness (Wave 1) -- 2026-02-13
- [x] 24-02: Enhanced Structured Data & Homepage SEO (Wave 1) -- 2026-02-13

#### Phase 25: Promotions & Discount Codes

**Goal**: Build a promotional system with discount codes, flash sales, bundle deals, and automated pricing rules for marketing campaigns
**Depends on**: Phase 24
**Research**: Likely (Stripe coupon/promotion integration, pricing strategies)
**Research topics**: Stripe Coupons API, promotion code validation, cart-level vs item-level discounts, time-limited offers
**Plans**: 2 plans, 2 waves

Plans:
- [x] 25-01: Promotions Backend & Admin Management (Wave 1) -- 2026-02-13
- [x] 25-02: Checkout Discount Integration (Wave 2) -- 2026-02-13

#### Phase 26: Social Media Integration

**Goal**: Integrate social sharing, Instagram feed display, social login options, and referral tracking for organic growth
**Depends on**: Phase 24
**Research**: Likely (social platform APIs, sharing SDKs)
**Research topics**: Instagram Basic Display API, social share buttons, Open Graph previews, UTM tracking, referral systems
**Plans**: 3 plans, 1 wave

Plans:
- [x] 26-01: Social Share Buttons & Enhanced OG Images (Wave 1) -- 2026-02-13
- [ ] 26-02: Instagram Feed Integration (Wave 1) -- Skipped
- [x] 26-03: Referral & UTM Tracking (Wave 1) -- 2026-02-13

#### Phase 27: Email Marketing & Retention

**Goal**: Build email marketing capabilities with newsletter signup, automated campaigns, abandoned cart recovery, and customer re-engagement flows
**Depends on**: Phase 25
**Research**: Likely (email marketing platforms, automation patterns)
**Research topics**: Resend broadcast emails, newsletter management, abandoned cart detection, drip campaign architecture, unsubscribe handling
**Plans**: 2 plans, 2 waves

Plans:
- [x] 27-01: Newsletter Subscription System (Wave 1) -- 2026-02-13
- [x] 27-02: Email Campaigns & Automated Flows (Wave 2) -- 2026-02-13

| 24. SEO & Organic Growth | v6.0 | 2/2 | Complete | 2026-02-13 |
| 25. Promotions & Discount Codes | v6.0 | 2/2 | Complete | 2026-02-13 |
| 26. Social Media Integration | v6.0 | 2/3 | Complete | 2026-02-13 |
| 27. Email Marketing & Retention | v6.0 | 2/2 | Complete | 2026-02-13 |
