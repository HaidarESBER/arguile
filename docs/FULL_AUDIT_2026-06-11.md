# Full Site Audit — Nuage (chicha-ecommerce)

**Date:** 2026-06-11
**Scope:** Security, code quality & architecture, performance, SEO/accessibility/legal (FR), dependencies & build health.
**Method:** Five parallel specialized audits over the full codebase, including running `npm install`, `npm audit`, `npm run build`, `npx tsc --noEmit`, `npm test`, and `npm run lint`. Every finding below was verified in the actual code (file:line given).

---

## Toolchain health snapshot

| Check | Result |
|---|---|
| TypeScript (`tsc --noEmit`, strict) | ✅ 0 errors |
| Production build (`next build`) | ✅ Succeeds (70 pages) — but see BLOCKER-3 (empty catalog masked) |
| Tests (vitest) | ⚠️ 181 / 182 pass — 1 stale test in `__tests__/lib/seo.test.ts` (expects relative og:image; implementation correctly absolutizes) |
| Lint (eslint) | ❌ 348 problems (224 errors, 124 warnings) |
| `npm audit` | ❌ 25 vulnerabilities (5 critical, 9 high, 11 moderate) |

---

## 🚨 BLOCKERS — the store cannot operate correctly as-is

### BLOCKER-1. Checkout is broken: no customer can complete a purchase
`src/app/commande/page.tsx:69-83` builds `shippingAddress` without `email` (and without `country`, with `zip` instead of `postalCode`). `src/app/api/checkout/route.ts:33` rejects any request lacking `shippingAddress.email` with 400. **Every real checkout fails**, and the catch block (`commande/page.tsx:92-95`) only does `console.error` — the user sees nothing.
A complete, working checkout implementation (`src/components/checkout/CheckoutForm.tsx` + `ShippingForm` with email field + `DiscountCodeInput`) exists but is **mounted nowhere**.
**Fix:** mount the real `CheckoutForm` on `/commande` (or port email/country fields + error display into the current form).

### BLOCKER-2. Customer PII and password hashes are committed to git (CRITICAL security)
`data/users.json` (tracked) contains real bcrypt hashes including the admin account (`admin@nuage.fr`); `data/orders.json` contains customer names, addresses, emails. Leftover from pre-Supabase file auth, but exposed to anyone with repo access and offline-crackable.
**Fix:** `git rm --cached data/users.json data/orders.json`, add to `.gitignore`, purge history (`git filter-repo`), rotate the admin credential, assess notification obligations (RGPD) if the repo was ever shared.

### BLOCKER-3. Build "succeeds" with an empty store when env vars are missing
`src/lib/supabase/admin.ts:17` falls back to `https://placeholder.supabase.co` when Supabase env vars are unset. The build swallows all fetch errors and prerendered **0 product pages** with empty catalog data — a misconfigured deploy ships an empty store with a green build.
**Fix:** fail the production build loudly when `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are absent. Also: `.env.example` is badly out of date (missing all Supabase/CRON/AI vars actually required).

### BLOCKER-4. Age verification never runs (legal exposure, 18+ tobacco-adjacent commerce)
`src/components/legal/AgeVerification.tsx` is fully built but imported nowhere. The site has **no age gate**.
**Fix:** mount it in `src/app/layout.tsx`; add `role="dialog"`, `aria-modal`, focus trap.

### BLOCKER-5. Mentions légales contain unfilled placeholders (LCEN violation)
`src/app/mentions-legales/page.tsx:28-37,133` — `[À compléter]` for capital social, siège social, RCS, SIRET, TVA, téléphone, directeur de la publication.
**Fix:** fill real company data; add a CI grep for `[À compléter]`.

### BLOCKER-6. Contact form is fake
`src/app/contact/page.tsx:16-26` — `handleSubmit` is a `setTimeout` simulation that always shows success and discards the message. Customers believe they reached support.
**Fix:** wire to an API route using the existing Resend integration (`src/lib/email.ts`).

---

## HIGH — money, security, and correctness

### Payment & order flow
- **H1. Client-controlled shipping cost** — `src/app/api/checkout/route.ts:23,83,126-144` takes `shippingCost` verbatim from the request body into the order total and Stripe `shipping_options`. POST `shippingCost: 0` → free shipping. Server-side calculator exists unused (`src/lib/shipping-server.ts`). Recompute server-side from region+method.
- **H2. No stock or quantity validation** — `checkout/route.ts:44-61` never checks `item.quantity` (0/negative/fractional accepted) nor `inStock`/`stockLevel`; stock is **never decremented** after a sale anywhere in the codebase. Validate at checkout; decrement in the `checkout.session.completed` webhook.
- **H3. Promo codes shown in cart are fake and silently dropped at payment** — `src/app/panier/page.tsx:45-62` validates against hardcoded `{WELCOME10, SAVE20}` client-side and shows a discounted total; `/commande` then sends **no** `discountCode` to the API — customer pays full price after seeing a discount. The real DB-backed promotions system (`/api/promotions/validate`, admin UI, `DiscountCodeInput`) is unmounted. Wire it in.
- **H4. Stripe webhook maps order rows against columns that don't exist** — `webhooks/stripe/route.ts:28-37` reads `shipping_first_name` etc., but the schema stores `shipping_address JSONB`. All address fields come back `undefined`; the abandoned-cart email check (`route.ts:198`) is always falsy and never sends. Delete the duplicate mapper; reuse `getOrderById()` from `src/lib/orders.ts:64`.
- **H5. Confirmation email timing is inverted** — `src/lib/orders.ts:176-179` sends the confirmation at order *creation* (`pending_payment` — unpaid customers get confirmations). The post-payment webhook email (`webhooks/stripe/route.ts:152-156`) HTTP-calls `/api/send-order-email`, which middleware now requires **admin** for → silent 401, paid email never sends. Call `sendOrderConfirmationEmail()` directly from the webhook; remove it from `createOrder`.
- **H6. Webhook swallows processing errors with 200** — `webhooks/stripe/route.ts:212-215`: a transient DB failure on a *paid* order is never retried by Stripe; order stuck `pending_payment` forever. Return 500 for retryable failures.

### Security
- **H7. Publicly invokable server actions over the admin data layer** — `src/lib/orders.ts`, `lib/products.ts`, `lib/promotions.ts` are whole-module `"use server"` files using the service-role client (RLS bypass) with **no auth checks inside**. `src/components/admin/OrderStatusSelect.tsx:6` imports `updateOrderStatus` from a client component, compiling it into a server-action endpoint reachable outside `/admin` middleware protection — order-status mutation (and product create/update/delete) is effectively reachable without admin auth. **Fix:** remove `"use server"` from data-layer modules, add `import "server-only"`, expose only thin `actions.ts` wrappers that call `requireAdmin()`.
- **H8. No rate limiting** on `auth/login`, `auth/register`, `checkout`, `chat/support` (Groq spend + service-role product load per anonymous request), `verify-order` (enumeration). Add IP-based limiting (e.g. Upstash) — strict on auth.
- **H9. Next.js 16.1.6 has ~12 known advisories** incl. middleware/proxy auth bypass (directly relevant to `/admin` protection), request smuggling, Server Actions CSRF bypass. **Upgrade `next`, `@next/mdx`, `eslint-config-next` to 16.2.9.**
- **H10. `remove.bg` is unused** and is the sole carrier of the critical no-fix `form-data`/`qs`/`tough-cookie` vulnerability chain. Uninstall it, then `npm audit fix` (also fixes vitest critical, undici, rollup, etc.).

### Catalog / pages showing wrong data
- **H11. Favorites & comparison pages use hardcoded seed products** — `src/app/favoris/page.tsx:8,17`, `src/app/comparaison/page.tsx:9,22` filter the 8-item `src/data/products.ts` seed (ids "1"–"8"); real Supabase UUID products render as empty. Header links to `/compte/wishlist` (correct, DB-backed); `/favoris` is a divergent duplicate. Delete/redirect `/favoris`; fix `/comparaison` to use `lib/products`.
- **H12. Cart upsells are mock products with broken image paths** — `src/app/panier/page.tsx:21-42` references `/images/products/*.jpg` (directory doesn't exist); "adding" them puts fake products in the cart.

### Performance / infrastructure
- **H13. Hand-rolled service worker serves stale everything forever** — `public/sw.js` is cache-first for every same-origin GET with a fixed `nuage-v1` cache name: returning users never see new deploys, `/api/products` is cached permanently, old chunks accumulate unbounded, and `ServiceWorkerRegister.tsx:31-33` force-reloads users mid-session on SW updates. Serwist is installed but never wired (`withSerwist` absent from `next.config.ts`). Adopt `@serwist/next` properly; delete `public/sw.js`.
- **H14. Storefront bypasses next/image entirely** — 19 files use raw `<img>`, including the homepage (`HomeClient.tsx` — incl. a 488 KB `/bowl.jpg` category tile), product grid (`ProduitsClientEnhanced.tsx:595`), product gallery (`ProductDetailClient.tsx:449,...`), cart and checkout. No resizing/WebP/lazy-loading on the money pages despite a fully configured optimizer. Replace with `next/image` + `sizes` + `priority` on LCP images.
- **H15. ~31 MB of unreferenced files publicly served from `public/`** — incl. `nuage1old.mp4` (20 MB), `Video Project 8.mp4` (4.8 MB), `nuage-loading-video1.mp4`, `showcase.mp4`, `aaa.mp4`, two unused logos, and a stray Polish procurement spreadsheet `zalacznik_nr_2_do_swz_4536223.xlsx`. Delete all.
- **H16. Full catalog serialized into every page** — `/produits` is fully dynamic, fetches all products per request, and ships the entire array (full descriptions, `select("*")`) to a 772-line client component for client-side filtering (`produits/page.tsx:66-100`). Product detail pages embed the whole catalog for "related products" (`produits/[slug]/page.tsx:107-144`). Cache reads (`unstable_cache` + tags), trim fields, compute related server-side.
- **H17. Header search downloads the entire catalog per keystroke** — `HeaderSearch.tsx:40-67` and `SearchOverlay.tsx:59-81` fetch `/api/products` (all products, full descriptions) on every debounced query change and filter client-side. Meanwhile the well-built flexsearch module (`src/lib/search/`) has **zero importers**. Wire it up or add a `?q=` endpoint.
- **H18. Playwright in production dependencies / scrape cron will fail on Vercel** — `src/lib/scraper/browser.ts` does `chromium.launch()`, invoked by `/api/cron/scrape` (scheduled in vercel.json). No browser binaries on Vercel serverless; the dep bloats every deploy. Move scraping off-platform (the `sd-processor/` companion pattern exists) or use `playwright-core` + `@sparticuz/chromium`.

---

## MEDIUM

### Security
- **M1. Cron endpoints fail open** — all four scheduled crons (`scrape`, `curate`, `email-campaigns`, `translate-reviews`) skip the auth check entirely if `CRON_SECRET` is unset (`if (cronSecret) {...}`). Only `cleanup-analytics` fails closed. Anyone could trigger scraping, AI spend, or mass marketing emails. Fail closed everywhere.
- **M2. Admin Server Actions lack in-function authz** — `src/app/admin/*/actions.ts` rely solely on middleware path-matching; add `await requireAdmin()` to each (defense-in-depth; H7 shows why this matters).
- **M3. Unsubscribe tokens fall back to a hardcoded HMAC key** — `src/lib/newsletter-tokens.ts:9-11` uses `CRON_SECRET || "dev-secret-key"`. Use a dedicated secret; fail closed.
- **M4. No CSRF protection** on cookie-authenticated mutating routes (profile, wishlist, reviews, password). SameSite=Lax mitigates partially; validate `Origin` on mutations.
- **M5. `verify-order` enables enumeration** — distinct error messages for unknown order vs wrong email (`verify-order/route.ts:39-55`) + no rate limit. Return one generic message.
- **M6. Analytics ingestion floodable** — `analytics/track/route.ts` rate-limits by client-supplied `sessionId` and inserts via service-role. Key by IP.
- **M7. Reviews API schema drift** — `reviews/submit/route.ts` inserts columns (`reviewer_email`, `status`, `images`, nullable `user_id`) that don't exist in the committed migration; image URLs unvalidated. Commit the real schema; whitelist image URL domains.
- **M8. JSON-LD injected without escaping on product pages** — `produits/[slug]/page.tsx:127-134` uses raw `JSON.stringify` while `safeJsonLd()` exists (`lib/seo.ts:225`). Product descriptions come from a scraper pipeline (third-party-controlled) — a `</script>` in scraped text becomes stored XSS. Use `safeJsonLd()` everywhere.
- **M9. No Content-Security-Policy** — good headers otherwise (`next.config.ts:66-98`); add a nonce-based CSP given inline analytics scripts.

### Correctness
- **M10. Order number generation race** — `lib/orders.ts:101-115` read-max-then-insert; concurrent checkouts collide → 500. Use a Postgres sequence.
- **M11. Promotion usage counted at session creation, not payment** — `checkout/route.ts:186-191`: abandoned sessions burn limited-use codes; fallback counter is non-atomic (`lib/promotions.ts:183-196`). Increment in webhook, atomically.
- **M12. Product pages SSG with no revalidation** — prices/stock freeze at build while checkout charges live DB prices; displayed ≠ charged. Add `revalidate` or tag-based revalidation; admin mutations also never revalidate `/` (homepage stays stale).
- **M13. Register route races a DB trigger with `setTimeout(500)`** — `auth/register/route.ts:85`. Use upsert.
- **M14. WishlistContext issues** — `isLoading` never set, guest fallback skipped on non-401 errors, per-item migration POSTs, `clearWishlist` never syncs to DB (`contexts/WishlistContext.tsx`); fires `/api/wishlist` for every anonymous visitor.
- **M15. Middleware does a Supabase auth network round-trip on every request** — including anonymous visitors with no cookies (`lib/supabase/middleware.ts:34-37`); +50–200 ms TTFB site-wide. Skip when no `sb-*` cookies; narrow the matcher.

### SEO / legal / UX
- **M16. No `error.tsx` / `not-found.tsx` / `loading.tsx` / `Suspense` anywhere** — default English 404 on a French store; unstyled error screens; no loading states on dynamic pages.
- **M17. 9 client pages have no metadata** (contact, panier, commande, suivi, favoris, comparaison, compte/*) — all share the root title. Wrap each in a server `page.tsx` with `metadata`.
- **M18. No noindex on private/transactional pages** (account, order confirmation/tracking, cart, checkout, unsubscribe) and robots.ts doesn't disallow them.
- **M19. Canonicals missing on most pages**; `/produits?categorie=&page=&q=` variants indexable as duplicates; sitemap lists query-string category URLs (`sitemap.ts:19-25`) — consider real path-based category routes.
- **M20. No default OG image site-wide; blog posts have no og:image/twitter card.** Hardcoded `https://nuage.fr` in 6+ files — centralize on `NEXT_PUBLIC_SITE_URL`.
- **M21. Health warning banner delayed 6 s and session-dismissible** (`HealthWarning.tsx:27-31`) — should be immediate and persistent for tobacco-adjacent commerce (loi Evin expectations).
- **M22. Cookie banner delayed until scroll/10 s; "Refuser" forces a full reload; controls are 11 px text / ~26 px tall** (CNIL: consent UI must be immediately available; touch targets ≥44 px). Positive: analytics/pixels genuinely don't load before consent.
- **M23. Modals/drawers lack dialog semantics & focus traps** — mobile menu (`Header.tsx:293-497`), QuickViewModal, SearchOverlay, CookieConsent. `BottomSheet.tsx` already implements the correct pattern — reuse it. Search inputs lack accessible names.
- **M24. Contrast failures on the dark theme** — `--color-error: #a0522d` on `#2b251f` ≈ 2.7:1 (needs 4.5:1); widespread `/40` opacity text; 9 px privacy link.
- **M25. PWA manifest issues** — 192/512 icons are `maskable`-only (breaks installability scoring); manifest colors (cream) don't match the dark theme; no apple-touch-icon.
- **M26. Vercel config** — 4 crons require a Pro plan (Hobby allows 2); `cleanup-analytics` route exists but is never scheduled; deprecated `middleware` file convention (Next 16 wants `proxy`).

### Architecture / duplication
- **M27. Entire `src/components/checkout/` tree (8 components) is dead** — the drift between it and the hand-rolled `/commande` page directly caused BLOCKER-1 and H3. Pick one implementation.
- **M28. Heavy duplication** — snake↔camel row mappers re-implemented in 6 modules (+ the buggy webhook copy, H4); Supabase cookie boilerplate inlined in all 4 auth routes instead of `lib/supabase/server.ts`; Resend init duplicated 3×.
- **M29. Root `template.tsx` wraps every page in a framer-motion client component** — re-mounts on every navigation, resets page state, forces motion runtime into the entry chunk; the `exit` prop is dead. Remove it.
- **M30. Context providers pass unmemoized value objects** (Cart/Wishlist/Comparison) — every consumer re-renders on any change; `ProductCard` not memoized; `ProductDetailClient` is 1,283 lines with zero `useMemo`; Header re-renders fully on wishlist/comparison changes.
- **M31. Render-blocking Google Fonts CSS for Material Icons** in `layout.tsx:58-59` (third icon system alongside lucide + heroicons); FOUT of raw ligature text. Self-host or consolidate on lucide.
- **M32. Mock review data still displayed** — `comparaison/page.tsx` + dead `RelatedProducts.tsx` consume `src/data/reviews.ts` seed ratings instead of DB stats.

---

## LOW (selected)

- Dead code inventory (verified zero importers): ~20 components incl. `AgeVerification.tsx` (see BLOCKER-4), `LoadingScreen.tsx`, `TrustBadges.tsx`, `NewsletterForm.tsx`, PWA install components; `lib/shipping-server.ts` (also writes to local disk — broken on Vercel); `lib/search/smart-search.ts`; `scripts/create-admin.ts` (contains hardcoded default admin password `AdminNuage2026!` — delete).
- 13 root-level planning/audit `.md` files — move to `docs/` or delete.
- 396 `console.*` statements (stripped in prod by `removeConsole`, but noisy); admin-status debug logging in Header.
- `@types/*` packages in `dependencies` → move to devDependencies.
- Outdated majors: @supabase/ssr 0.8→0.12, stripe 20→22, react-email 5→6, eslint 9→10, typescript 5.9→6, lucide-react 0.563→1.17.
- `.gitignore` doesn't cover plain `.env.development`/`.env.production` — use `.env*` + `!.env.example`.
- Stray 85-byte `package-lock.json` one directory above the project root (workspace-root warning).
- Sitemap `lastModified: new Date()` on every entry; `/about`, `/contact` missing from sitemap; mixed FR/EN routes (`/about`, `/compte/wishlist` vs `/favoris`).
- Missing French accents in indexed metadata ("detente", "qualite", "Decouvrez"...).
- Desktop CartButton double-navigates; header logo animation loops forever and ignores `prefers-reduced-motion`.
- `schema-dts` installed but never imported (all JSON-LD untyped); `generateItemListSchema`, `jsonLdScriptProps` dead.
- Stale test in `__tests__/lib/seo.test.ts` (update expectation to absolute URL).
- Test coverage limited to pure helpers — nothing for contexts, API routes, checkout/webhook flows.
- `images.minimumCacheTTL: 60` too low; `deviceSizes` up to 3840 wasteful.

---

## What's in good shape ✅

- Strict TypeScript passes clean; no `@ts-ignore` anywhere.
- Checkout re-derives **product prices** and discount amounts from the DB — client prices are not trusted.
- Stripe webhook verifies signatures on the raw body and has an idempotency check.
- All money math is integer cents with proper rounding — no floating-point money.
- Middleware centralizes admin gating for `/admin` + `/api/admin`; `orders/by-email` enforces self-or-admin; password change verifies the current password.
- Service-role key confined to server-only modules; browser uses anon key; RLS policies defined on all main tables.
- No real secrets committed (`.env.example` placeholders only) — except the legacy data files (BLOCKER-2).
- Strong password policy (12+ chars, complexity, common-password list).
- Analytics/pixels correctly gated behind cookie consent.
- CGV are genuinely complete (rétractation L221-18, médiation L612-1, RGPD contact).
- robots.ts/sitemap.ts exist with dynamic product/blog coverage; `<html lang="fr">`; forms use proper labels; CartContext hydration handling is textbook.
- Most fixes claimed in the previous `SECURITY_AUDIT.md` are genuinely implemented (admin auth, webhook signatures, password policy, session migration to Supabase Auth).

---

## Recommended action order

**Week 1 — revenue & legal blockers**
1. Fix `/commande` checkout (BLOCKER-1) — mount the real `CheckoutForm`.
2. Purge `data/users.json` / `data/orders.json` from git history; rotate admin credentials (BLOCKER-2).
3. Mount `AgeVerification`; fill mentions légales; wire the contact form (BLOCKERS 4–6).
4. Server-side shipping recomputation + quantity/stock validation (H1, H2).
5. Fix the webhook mapper and email flow (H4, H5, H6).
6. Remove `remove.bg`, run `npm audit fix`, upgrade Next.js to 16.2.9 (H9, H10).

**Week 2 — security hardening & data integrity**
7. Strip `"use server"` from data-layer libs; `server-only` + `requireAdmin()` wrappers (H7, M2).
8. Rate limiting on auth/checkout/chatbot/verify-order (H8, M5, M6).
9. Fail-closed cron secrets + dedicated newsletter HMAC secret (M1, M3).
10. Wire real promotions into the cart; remove fake codes and mock upsells (H3, H12).
11. Fix favoris/comparaison data sources; delete seed products (H11, M32).
12. Fail build on missing Supabase env vars; sync `.env.example` (BLOCKER-3).

**Week 3 — performance & UX**
13. Replace `public/sw.js` with proper Serwist setup (H13).
14. Convert storefront `<img>` → `next/image`; delete 31 MB of junk in `public/` (H14, H15).
15. Cache product reads; stop serializing the full catalog; fix header search (H16, H17).
16. Move the scraper off the web app (H18); decide the Vercel cron strategy (M26).
17. Add error/not-found/loading pages; metadata + canonicals + noindex pass (M16–M20).
18. Accessibility pass: dialog semantics, contrast tokens, consent banner sizing (M21–M24).
