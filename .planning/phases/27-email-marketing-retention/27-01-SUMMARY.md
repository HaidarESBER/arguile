---
phase: 27-email-marketing-retention
plan: 01
subsystem: email
tags: [newsletter, resend, react-email, hmac, gdpr, unsubscribe]

# Dependency graph
requires:
  - phase: 11-email-notifications
    provides: Resend email service, React Email templates, fire-and-forget pattern
  - phase: 09-supabase-migration-auth
    provides: Supabase admin client, RLS patterns, snake_case DB conventions
provides:
  - Newsletter subscribers table with subscribe/unsubscribe lifecycle
  - Newsletter form component for footer/standalone use
  - HMAC-SHA256 signed unsubscribe token system
  - Welcome email template with brand styling
  - getUnsubscribeUrl helper for all marketing emails
affects: [27-02-email-campaigns]

# Tech tracking
tech-stack:
  added: []
  patterns: [HMAC-SHA256 signed tokens for email unsubscribe, newsletter-tokens utility separation from server actions]

key-files:
  created:
    - supabase/migration-newsletter.sql
    - src/types/newsletter.ts
    - src/lib/newsletter.ts
    - src/lib/newsletter-tokens.ts
    - src/app/api/newsletter/subscribe/route.ts
    - src/app/api/newsletter/unsubscribe/route.ts
    - src/components/newsletter/NewsletterForm.tsx
    - src/emails/WelcomeEmail.tsx
    - src/app/desabonnement/page.tsx
    - src/app/desabonnement/UnsubscribeContent.tsx
  modified:
    - src/lib/email.ts
    - src/components/layout/Footer.tsx

key-decisions:
  - "Separated token functions into newsletter-tokens.ts to avoid 'use server' sync function constraint"
  - "CRON_SECRET reused as HMAC key (no new env var needed)"
  - "getUnsubscribeUrl kept as private helper in email.ts (internal to marketing email functions)"

patterns-established:
  - "HMAC-SHA256 signed tokens for email action verification"
  - "Newsletter form with multi-state UI (idle/loading/success/error/already)"

issues-created: []

# Metrics
duration: 8min
completed: 2026-02-13
---

# Phase 27 Plan 01: Newsletter Subscription System Summary

**Newsletter subscribers table with HMAC-signed unsubscribe tokens, footer signup form, branded welcome email, and GDPR-compliant /desabonnement page**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-13
- **Completed:** 2026-02-13
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Newsletter subscribers table with RLS, email/status indexes, and subscribe/unsubscribe lifecycle
- Subscribe and unsubscribe API endpoints with email validation and signed token verification
- HMAC-SHA256 signed unsubscribe token system reusing CRON_SECRET (no new env var)
- Branded WelcomeEmail template matching existing email style (Nuage colors, CTA button, unsubscribe link)
- NewsletterForm component with 5-state UI and Framer Motion transitions in footer
- /desabonnement page supporting both token-based and manual unsubscribe flows

## Task Commits

Each task was committed atomically:

1. **Task 1: Create newsletter subscribers table, types, and API endpoints** - `168273b` (feat)
2. **Task 2: Create footer newsletter form, welcome email, and unsubscribe page** - `511cafe` (feat)

## Files Created/Modified
- `supabase/migration-newsletter.sql` - Newsletter subscribers table with RLS and indexes
- `src/types/newsletter.ts` - NewsletterSubscriber and SubscribeResult types
- `src/lib/newsletter.ts` - Server-side subscribe/unsubscribe/query functions
- `src/lib/newsletter-tokens.ts` - HMAC-SHA256 token generation and verification
- `src/lib/email.ts` - Added sendWelcomeEmail and getUnsubscribeUrl helper
- `src/app/api/newsletter/subscribe/route.ts` - POST subscribe endpoint with welcome email
- `src/app/api/newsletter/unsubscribe/route.ts` - GET (token) and POST (manual) unsubscribe
- `src/components/newsletter/NewsletterForm.tsx` - Compact inline form with state management
- `src/emails/WelcomeEmail.tsx` - React Email welcome template with brand styling
- `src/components/layout/Footer.tsx` - Added newsletter section with form
- `src/app/desabonnement/page.tsx` - Unsubscribe confirmation/error/manual page
- `src/app/desabonnement/UnsubscribeContent.tsx` - Manual unsubscribe form client component

## Decisions Made
- Separated token utilities into `newsletter-tokens.ts` to avoid Next.js "use server" constraint on synchronous exports (server action files require async exports)
- Reused `CRON_SECRET` as HMAC signing key for unsubscribe tokens (no new environment variable needed)
- `getUnsubscribeUrl` kept as module-private helper in `email.ts` since all marketing emails will be sent from that module

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Separated sync token functions from "use server" module**
- **Found during:** Task 1 (Newsletter library creation)
- **Issue:** Next.js "use server" files require all exported functions to be async. The `generateUnsubscribeToken` and `verifyUnsubscribeToken` functions are synchronous (pure crypto operations)
- **Fix:** Created separate `newsletter-tokens.ts` file without "use server" directive for sync token functions. Imports in email.ts and API routes point to this file directly.
- **Files modified:** src/lib/newsletter-tokens.ts (new), src/lib/newsletter.ts, src/lib/email.ts, src/app/api/newsletter/unsubscribe/route.ts
- **Verification:** TypeScript compiles, build succeeds
- **Committed in:** 168273b (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary architectural split to comply with Next.js server actions constraint. No scope creep.

## Issues Encountered
None

## Next Phase Readiness
- Newsletter infrastructure ready for Plan 02 (email campaigns and automated flows)
- `getUnsubscribeUrl` helper available for all future marketing emails
- Subscriber management functions ready for campaign targeting

---
*Phase: 27-email-marketing-retention*
*Completed: 2026-02-13*
