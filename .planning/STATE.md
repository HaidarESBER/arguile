# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-12)

**Core value:** The brand looks so premium and legitimate that visitors trust it instantly — visual identity drives conversion.
**Current focus:** v6.0 Growth & Marketing — COMPLETE

## Current Position

Phase: 27 of 27 (Email Marketing & Retention)
Plan: 2 of 2 in current phase
Status: Phase complete, milestone complete
Last activity: 2026-02-13 — Completed 27-02-PLAN.md

Progress: ██████████ 100% (v6.0: 4/4 phases, 27: 2/2 plans)

## Milestone Summary

**v6.0 Growth & Marketing (COMPLETE 2026-02-13)**

- 4 phases planned (24-27), 4 complete
- Focus: SEO, promotions, social media, email marketing
- Started: 2026-02-13, Completed: 2026-02-13

**v5.0 Analytics & Insights (COMPLETE 2026-02-12)**

- 4 phases planned (20-23), 4 complete
- Focus: Analytics infrastructure, admin dashboards, sales analytics, customer intelligence
- Started: 2026-02-12, Completed: 2026-02-12

**v4.0 UX Heaven (SHIPPED 2026-02-12)**

- 5 phases planned (15-19), 5 complete
- Focus: Smart search, social proof, accounts, recommendations, mobile excellence
- Started: 2026-02-12, Completed: 2026-02-12

**v3.0 Content & Growth (complete)**

- 1 phase planned (14), 2 plans total
- Focus: Blog & content marketing for organic traffic
- Started: 2026-02-12, Completed: 2026-02-12

**v2.0 Production Launch (complete)**

- 5 phases planned (9-13), 5 complete
- Focus: Payments, database, email, product sourcing, AI curation
- Started: 2026-02-11, Completed: 2026-02-12

**v1.1 Enhanced Experience shipped 2026-02-09**

- 4 phases, 10 plans executed
- Animations, interactions, trust signals, performance

**v1.0 MVP shipped 2026-02-09**

- 4 phases, 11 plans executed
- 4,540 lines TypeScript, 80 files

## Performance Metrics

**Velocity:**
- Total plans completed: 58
- Average duration: 9.8 min
- Total execution time: 9.5 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-brand | 3/3 | 23 min | 7.7 min |
| 02-product-catalog | 2/2 | 25 min | 12.5 min |
| 03-shopping-experience | 3/3 | 45 min | 15 min |
| 04-launch-prep | 3/3 | 22 min | 7.3 min |
| 05-motion-foundation | 1/1 | 5 min | 5 min |
| 06-product-experience | 1/1 | 8 min | 8 min |
| 07-cart-checkout-polish | 1/1 | 8 min | 8 min |
| 08-character-delight | 8/8 | 92 min | 11.5 min |
| 09-supabase-migration-auth | 3/3 | 25 min | 8.3 min |
| 10-stripe-checkout | 2/2 | 18 min | 9 min |
| 11-email-notifications | 2/2 | 7 min | 3.5 min |
| 12-product-sourcing-pipeline | 2/2 | 10 min | 5 min |
| 13-ai-curation-automation | 2/2 | 27 min | 13.5 min |
| 14-blog-content-marketing | 2/2 | 14 min | 7 min |
| 15-smart-search-filtering | 2/3 | 40 min | 20 min |
| 16-social-proof-reviews | 2/2 | 20 min | 10 min |
| 17-customer-accounts-profiles | 1/1 | 45 min | 45 min |
| 18-wishlist-recommendations | 3/3 | 65 min | 21.7 min |
| 19-mobile-ux-excellence | 2/3 | 27 min | 13.5 min |
| 20-analytics-foundation | 2/2 | 10 min | 5 min |
| 21-admin-dashboard | 3/3 | 30 min | 10 min |
| 22-sales-analytics | 2/2 | 33 min | 16.5 min |
| 23-customer-intelligence | 2/2 | 19 min | 9.5 min |
| 24-seo-organic-growth | 2/2 | 10 min | 5 min |
| 25-promotions-discount-codes | 2/2 | 16 min | 8 min |
| 26-social-media-integration | 3/3 | 37 min | 12.3 min |
| 27-email-marketing-retention | 2/2 | 15 min | 7.5 min |

## Accumulated Context

### Roadmap Evolution

- Milestone v1.1 created: Enhanced Experience with animations and dynamism, 4 phases (Phase 5-8)
- Milestone v2.0 created: Production Launch with payments, database, sourcing, 5 phases (Phase 9-13)
- Milestone v3.0 created: Content & Growth with blog & content marketing, 1 phase (Phase 14)
- Milestone v4.0 created: UX Heaven with search, social proof, accounts, recommendations, mobile, 5 phases (Phase 15-19)
- Milestone v5.0 created: Analytics & Insights with tracking, dashboards, sales analytics, customer intelligence, 4 phases (Phase 20-23)
- Milestone v6.0 created: Growth & Marketing with SEO, promotions, social media, email marketing, 4 phases (Phase 24-27)

### Key Decisions

**v1.0:** Brand (Nuage), typography (Cormorant Garamond + Inter), colors (Charcoal/Mist/Stone/Blush/Cream), file-based JSON, cents-based pricing.

**v1.1:** 300ms transitions, scroll-once animations, hybrid SSG, spring animations, mobile gestures, guest checkout, shipping tiers, SEO structured data.

**v2.0 (09-01):** @supabase/ssr for cookie-based sessions in Next.js 15, snake_case DB columns, RLS-first security (public product reads, admin writes via profiles.is_admin), service role key for server admin ops.

**v2.0 (11-01):** Server-only email service wrapping Resend SDK (never throws), status-based email content switching via getStatusContent helper.

**v2.0 (11-02):** Fire-and-forget email pattern for all order lifecycle triggers, previousStatus captured before update for status email context.

**v2.0 (10-01):** Stripe redirect mode (not embedded), DB-verified pricing in checkout API, dynamic payment methods (auto Carte Bancaire/Apple Pay), pending_payment status before pending in flow.

**v2.0 (13-01):** claude-sonnet-4-5-20250929 for translation (quality/cost balance), createAdminClient for server-side RLS bypass, effective-value pattern (curated > AI > raw) for product display fields.

**v2.0 (09-02):** createAdminClient for ALL queries (reads + writes) to avoid cookies() in static generation, toProduct/toOrder mapping layer preserves interfaces unchanged, order items in separate table with Supabase join queries, updateOrderStripeData helper replaces direct file I/O.

**v2.0 (09-03):** supabase.auth.getUser() for server-validated middleware auth (not getSession), broadened middleware matcher for consistent session refresh, password validation kept server-side before Supabase signUp.

**v2.0 (13-02):** 6-hour Vercel Cron interval for batch translation, CRON_SECRET authentication for production cron endpoint, server actions with revalidatePath for admin form mutations.

**v3.0 (14-01):** String-based remark/rehype plugin names for Turbopack compatibility in Next.js 16, safeJsonLd helper with XSS prevention for Article schema, blog content in content/blog/ directory.

**v3.0 (14-02):** Dual MDX metadata pattern (YAML frontmatter for gray-matter listing + export const metadata for dynamic import), remark-frontmatter to suppress YAML rendering, @/content/* path alias for content directory imports.

**v2.0 (12-01):** Cheerio for lightweight HTML parsing (no headless browser), adapter pattern for site-specific extraction (SourceAdapter interface with canHandle/extract), URL-based deduplication (source_url UNIQUE constraint), rate limiting (1s delay between batch requests), failed scrapes saved with error_message for admin debugging.

**v2.0 (12-02):** Admin scraper UI with single/bulk URL input, server actions with revalidatePath for mutations, sendToCurationAction bridges scraped_products to product_drafts via createDraftFromScrapedProduct, automated scrape cron (12-hour interval) with SCRAPE_URLS environment config, full pipeline integration (scrape → draft → AI translate → curate → publish).

**v4.0 (15-01):** FlexSearch client-side search (zero hosting costs), LatinBalance encoder for French text normalization, resolution: 9 with bidirectional context for fuzzy matching, buildSearchQuery helper with filters/sorting/facets/pagination.

**v4.0 (15-02):** URL searchParams pattern for filter state (bookmarkable, SEO-friendly), use-debounce with 300ms delay for search input, uncontrolled input with defaultValue (Next.js best practice), Suspense boundaries for streaming search/filters/grid, reset pagination to page 1 on search/filter changes.

**v4.0 (16-01):** Reviews table in Supabase with RLS (public read, auth write own), verified_purchase flag from order_items lookup, createAdminClient for public reads (bypasses RLS), createClient for writes (enforces RLS), server-side review data fetching with props to client components.

**v4.0 (16-02):** Client-side validation before API submission (rating required, 10-1000 chars), optimistic UI pattern (form closes immediately, router.refresh() re-fetches), AnimatePresence for smooth form transitions, API-enforced authentication (no client-side auth checks).

**v4.0 (16-03):** localStorage-based recently viewed tracking (max 6 items, client-side only), RecentlyViewed horizontal carousel component with stagger animation, TrendingBadge overlay on featured products (fire emoji + "Tendance"), automatic product view tracking on detail page mount, privacy-friendly social proof (no server tracking).

**v4.0 (17-01):** JSONB columns for profiles (saved_addresses array, preferences object), UUID for address IDs via crypto.randomUUID(), server-side default address enforcement (only one default), password validation with 12+ chars + complexity requirements, modal-based address CRUD UI, French postal code validation (5 digits).

**v4.0 (18-01):** Dual-mode wishlist (API sync for authenticated users, localStorage fallback for guests), optimistic UI updates with automatic error rollback, RLS policies enforce user-only access to wishlist items, admins can view all wishlists for analytics.

**v4.0 (18-02):** browse_history table with auto-cleanup trigger (90-day retention), RLS policies for user privacy and admin analytics, fire-and-forget tracking pattern via ProductViewTracker component, 30-minute deduplication window, opt-out privacy model with track_browsing preference, authenticated-users-only tracking.

**v4.0 (18-03):** SQL-based recommendations using Supabase (category affinity from browse history), GET /api/recommendations endpoint with productId/limit params, RecommendationsSection component with loading states and stagger animations, recommendations on homepage/product pages/wishlist, graceful fallback to featured products for guests, excludes wishlisted items from suggestions.

**v4.0 (19-01):** Manual service worker (Serwist incompatible with Next.js 16 Turbopack), cache-first strategy for static assets, offline fallback page with auto-reload on reconnection, PWA manifest with Nuage branding (Charcoal/Cream theme colors), 8 icon sizes (72x72 to 512x512) with maskable support, ServiceWorkerRegister component for production-only registration, automated icon generation via sharp library.

**v4.0 (19-02):** PullToRefresh component with 80px threshold touch gesture detection, haptic feedback via navigator.vibrate, InstallPrompt banner with 3-second delay and localStorage dismissal persistence, beforeinstallprompt event capture for PWA install control, Framer Motion page transitions (300ms fade+slide) in template.tsx, mobile-only guards (<768px) for native-like features, router.refresh() pattern for pull-to-refresh data revalidation.

**v5.0 (20-01):** analytics_events table with time-series indexes for server-side event persistence, anonymous session_id in sessionStorage (privacy-friendly, tab-scoped), POST /api/analytics/track endpoint with service role access and in-memory rate limiting (100 events/session/minute), DNT header respect and PII sanitization for privacy compliance, fire-and-forget client-side integration via sendToServer() with keepalive flag, 90-day auto-cleanup trigger for GDPR compliance, preserves existing localStorage and provider integrations (GA4, Meta, TikTok, Clarity).

**v5.0 (20-02):** daily_metrics table for pre-aggregated analytics KPIs (total_events, unique_sessions, unique_users, page_views, product_views, purchases, total_revenue, etc.), idempotent aggregate_daily_metrics() function with delete-then-insert pattern for safe daily rollups, analytics-server.ts library with getDailyMetrics/getMetricsSummary/getTopEvents/getRealtimeEvents helpers, POST /api/analytics/aggregate endpoint with admin authentication for manual/cron triggering, application-level aggregation for top events (GROUP BY JSONB in-app), ready for Phase 21 admin dashboard integration.

**v5.0 (21-01):** Admin dashboard analytics integration with DashboardKPIs component (6 KPI cards: sessions, users, revenue, purchases, avg revenue per user, conversion rate) and RealtimeActivity feed component (last 10 visitor events with emoji icons, French relative timestamps), server components with error handling fallbacks, French number/currency formatting via Intl.NumberFormat, replaced basic product/order stats with business performance metrics, quick actions maintained.

**v5.0 (21-02):** Pure HTML/CSS charts for revenue analytics (no external library - lightweight, zero dependencies), RevenueChart component with flexbox bar chart and percentage-based scaling, OrderTrends component with StatCard pattern and SVG line charts, French number formatting with space thousand separator (1 234€), force-dynamic export pattern for real-time analytics data, analytics navigation section in admin sidebar for discoverability, error handling with graceful empty state fallback.

**v5.0 (21-03):** Product analytics dashboard at /admin/analytics/products with TopProducts component (most viewed/cart products in side-by-side tables), SearchAnalytics component (top 20 queries with 0-result highlighting), French number formatting via toLocaleString('fr-FR'), top-3 highlighting with accent color, alternating row backgrounds (Mist/Cream), monospace font for search queries, empty state handling, error boundaries for each data source, admin navigation already added in 21-02.

**v5.0 (22-01):** Sales analytics helpers in analytics-server.ts (getRevenueByCategory, getTopSellingProducts, getAOVTrends) with application-level Map aggregation for order_items queries, /admin/analytics/sales page with category revenue breakdown, top sellers ranking, and AOV trend visualization, pure SVG line charts with area fill (no external libraries), graceful error handling per data source to prevent page-level failures, French formatting throughout, top items highlighted with accent color.

**v5.0 (22-02):** Inventory analytics helpers in analytics-server.ts (getStockAlerts, getInventoryVelocity, getRestockRecommendations) with sales velocity calculation (unitsSold / days), days remaining calculation (stockLevel / dailyVelocity), and automated restock quantity recommendations rounded to nearest 5, /admin/analytics/inventory dashboard with stock alerts (urgency levels: 0 = critical, 1-5 = urgent, 6-10 = limited), velocity table highlighting < 30 days remaining, and restock recommendations highlighting < 14 days urgent, 30-day velocity window, 60-day restock target, French date formatting via toLocaleDateString('fr-FR'), urgency-based color coding (red/orange/yellow badges).

**v5.0 (22-03):** Order intelligence helpers in analytics-server.ts (getOrdersByTimePattern with 7x24 day/hour heatmap, getShippingDistribution with tier classification, getOrderStatusFunnel with drop-off rate calculation), /admin/analytics/orders dashboard with pure CSS heatmap using color intensity gradients (bg-blush/20 to bg-blush), horizontal flexbox bar charts for shipping distribution, conversion funnel with decreasing widths and drop-off warnings (red text if >20%), insights section with peak times and payment abandon rate alerts, complete heatmap data (all 168 day/hour cells even if zero), French day names (Lundi, Mardi, etc.), separated cancelled orders from main funnel for clarity.

**v5.0 (23-01):** Customer intelligence library in customer-analytics.ts (getRFMSegments, getCustomerSegmentStats, getTopCustomers) with quintile-based RFM scoring (1-5 scale) for Recency/Frequency/Monetary dimensions, 5-tier customer segmentation (VIP, Champions, Fideles, A Risque, Inactifs) based on RFM score combinations, application-level Map aggregation for customer metrics calculation, recency score inversion (lower days = higher score), /admin/analytics/customers dashboard with 5 KPIs (Total, VIP, Active, At Risk, Inactive), RFMDistribution horizontal bar chart with segment-specific colors, CustomerSegments stats table with VIP/Champions highlighting, TopCustomers ranking table with top 3 accent highlighting, French labels throughout.

**v5.0 (23-02):** Cohort analysis and LTV tracking in customer-analytics.ts (getCohorts, getCustomerLTV, getBehavioralMetrics) with monthly cohort grouping by first purchase (YYYY-MM), cumulative retention calculation (% ordering by month N), 90-day purchase frequency projection for LTV forecasting, French month labels via Intl.DateTimeFormat, behavioral metrics combining browse_history/wishlist/orders for conversion funnel, CohortRetention heatmap component, LTVMetrics component with summary cards and top 20 customers table, CustomerBehavior funnel, all sections integrated into /admin/analytics/customers dashboard.

**v6.0 (24-01):** Complete sitemap with blog/category/legal URLs (removed panier/checkout/favoris/comparaison), generateMetadata with searchParams for dynamic category-specific French SEO on /produits, robots.txt sufficient for admin noindex (no meta tag needed), OpenGraph locale fr_FR for French market, category URLs use query parameter format matching existing routing.

**v6.0 (24-02):** WebSite schema with SearchAction on homepage for Google sitelinks search box (targets /produits?q=), ItemList schema generator for collections (limited to 10 items), page-specific schema in page component (WebSite on homepage) vs site-wide schema in layout (Organization), safeJsonLd for XSS-safe JSON-LD serialization, enhanced homepage metadata with "Chicha Premium en France" keywords and canonical URL.

**v6.0 (25-01):** Promotions table with RLS (public read active, admin full access), cents-based fixed_amount storage, BIENVENUE10 seed, createAdminClient CRUD pattern (toPromotion mapping), validatePromotion with French error messages (code lookup, active check, date range, usage limits, minimum order), calculateDiscount capped at subtotal, admin /admin/promotions page with inline create/edit forms and server actions, Tag icon in sidebar.

**v6.0 (25-02):** Discount code validation API at /api/promotions/validate, DiscountCodeInput component with auto-uppercase and sessionStorage auto-apply, server-side re-validation in checkout API (never trust client discount), Stripe coupon creation on-the-fly for receipt display, discount fields in Order/CreateOrderData types and createOrder insert, ExitIntentModal stores BIENVENUE10 in sessionStorage for seamless checkout flow, fire-and-forget incrementPromotionUses after Stripe session creation.

**v6.0 (26-01):** Social share buttons with Web Share API (mobile) and window.open fallback (desktop), share event tracking via trackEvent('share', {platform, url, title}), enhanced Open Graph images with dimensions (1200x630px), type detection (jpeg/png/webp), and absolute URLs for optimal social platform rendering, SocialShareButtons component integrated on product pages (after description) and blog pages (after content), lucide-react icons with tooltips.

**v6.0 (26-03):** Session storage for visitor ID (privacy-friendly, tab-scoped), auto-generate 8-char alphanumeric referral codes on insert, track conversions server-side via Stripe webhook metadata, fire-and-forget pattern for referral conversion API calls, referral dashboard as new tab in profile page, UTM capture on app load with session storage persistence, referral code extraction from URL referrer parameter, visitor ID passed through checkout to Stripe metadata, server-side conversion tracking prevents client-side manipulation.

**v6.0 (27-01):** Newsletter subscribers table with RLS (admin-only, service role for API routes), HMAC-SHA256 signed unsubscribe tokens using CRON_SECRET as key (no new env var), newsletter-tokens.ts separated from "use server" newsletter.ts to allow sync token functions, fire-and-forget welcome email on subscribe, NewsletterForm with 5-state UI (idle/loading/success/error/already), /desabonnement page with token-based and manual unsubscribe flows, getUnsubscribeUrl private helper in email.ts for all marketing emails.

**v6.0 (27-02):** Abandoned cart email on Stripe checkout.session.expired with order items and BIENVENUE10 incentive, marketing from address (bonjour@nuage.fr) vs transactional (commandes@nuage.fr), win-back email for 30+ day inactive customers with product recommendations and RETOUR15 code, email-campaigns.ts with rate-limited batch sending (max 50/run), weekly Monday 10 AM cron at /api/cron/email-campaigns, unsubscribe preference enforcement in all campaign targeting.

### Deferred Issues

- Legal pages content (already in place per user)

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-13
Stopped at: Completed 27-02-PLAN.md (Email campaigns & automated flows) - v6.0 milestone complete
Resume file: None
