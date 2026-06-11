---
phase: 27-email-marketing-retention
plan: 02
subsystem: email
tags: [abandoned-cart, win-back, resend, react-email, cron, marketing-automation]

# Dependency graph
requires:
  - phase: 27-01-email-marketing-retention
    provides: Newsletter subscribers table, unsubscribe token system, getUnsubscribeUrl helper
  - phase: 11-email-notifications
    provides: Resend email service, React Email templates, fire-and-forget pattern
  - phase: 10-stripe-checkout
    provides: Stripe webhook handler, checkout session expiry events
provides:
  - Abandoned cart recovery email triggered on Stripe session expiry
  - Win-back re-engagement email campaign for inactive customers
  - Email campaigns cron job running weekly
  - Marketing email from address separation (bonjour@ vs commandes@)
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [marketing vs transactional email from-address separation, rate-limited batch campaign execution, application-level customer inactivity detection]

key-files:
  created:
    - src/emails/AbandonedCartEmail.tsx
    - src/emails/WinBackEmail.tsx
    - src/lib/email-campaigns.ts
    - src/app/api/cron/email-campaigns/route.ts
  modified:
    - src/lib/email.ts
    - src/app/api/webhooks/stripe/route.ts
    - vercel.json

key-decisions:
  - "Marketing emails use bonjour@nuage.fr vs transactional commandes@nuage.fr"
  - "Rate limit of 50 emails per cron run for Resend free tier"
  - "30-day inactivity threshold for win-back campaigns"
  - "Weekly Monday 10 AM schedule for marketing email cron"

patterns-established:
  - "Marketing vs transactional from-address separation"
  - "Rate-limited batch campaign execution with summary reporting"

issues-created: []

# Metrics
duration: 7min
completed: 2026-02-13
---

# Phase 27 Plan 02: Email Campaigns & Automated Flows Summary

**Abandoned cart recovery email on Stripe session expiry with order items display, plus weekly win-back campaign cron for 30+ day inactive customers with product recommendations**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-13
- **Completed:** 2026-02-13
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Abandoned cart email automatically sent when Stripe checkout session expires, showing order items, subtotal, and BIENVENUE10 discount incentive
- Win-back email template with product recommendations and RETOUR15 exclusive code for inactive customers
- Email campaigns library with customer inactivity detection, product recommendation fetching, and rate-limited batch sending
- Cron endpoint at /api/cron/email-campaigns running weekly (Monday 10 AM) with CRON_SECRET auth
- All marketing emails include HMAC-signed unsubscribe links and respect newsletter unsubscribe preferences

## Task Commits

Each task was committed atomically:

1. **Task 1: Create abandoned cart email and trigger from Stripe webhook** - `abfc153` (feat)
2. **Task 2: Create re-engagement cron job and win-back email** - `ecf4bad` (feat)

## Files Created/Modified
- `src/emails/AbandonedCartEmail.tsx` - Abandoned cart recovery email with order items, subtotal, CTA, unsubscribe
- `src/emails/WinBackEmail.tsx` - Win-back email with product recommendations, RETOUR15 incentive, unsubscribe
- `src/lib/email-campaigns.ts` - Campaign runners: getInactiveCustomers, getRecentProducts, runWinBackCampaign
- `src/app/api/cron/email-campaigns/route.ts` - GET cron endpoint with CRON_SECRET auth
- `src/lib/email.ts` - Added sendAbandonedCartEmail, sendWinBackEmail, MARKETING_FROM_ADDRESS
- `src/app/api/webhooks/stripe/route.ts` - Trigger abandoned cart email on checkout.session.expired
- `vercel.json` - Added email-campaigns cron (Monday 10 AM)

## Decisions Made
- Marketing emails use separate from address `Nuage <bonjour@nuage.fr>` to distinguish from transactional emails (`commandes@nuage.fr`)
- Rate limited to 50 emails per cron run to stay within Resend free tier limits
- 30-day inactivity threshold chosen for win-back campaigns (balances re-engagement timing vs spam avoidance)
- Weekly Monday 10 AM schedule for marketing cron (optimal engagement timing for marketing emails)
- Unsubscribed newsletter subscribers are excluded from all campaign emails

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## Next Phase Readiness
- Phase 27 complete: full email marketing system with newsletter, abandoned cart recovery, and win-back campaigns
- v6.0 Growth & Marketing milestone complete
- All marketing emails respect unsubscribe preferences via HMAC-signed tokens
- runAbandonedCartFollowUp stub ready for future multi-touch abandoned cart sequences

---
*Phase: 27-email-marketing-retention*
*Completed: 2026-02-13*
