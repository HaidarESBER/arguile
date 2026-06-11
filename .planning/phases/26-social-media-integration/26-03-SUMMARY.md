---
phase: 26-social-media-integration
plan: 03
subsystem: analytics
tags: [utm, referral, tracking, supabase, analytics, conversion]

# Dependency graph
requires:
  - phase: 20-analytics-foundation
    provides: analytics_events table and tracking infrastructure
  - phase: 10-stripe-checkout
    provides: Stripe webhook handler for order confirmation
provides:
  - UTM parameter tracking for marketing attribution
  - Referral link generation and tracking system
  - Conversion tracking from click to purchase
  - User referral dashboard with stats and sharing
affects: [27-email-marketing, admin-analytics]

# Tech tracking
tech-stack:
  added: []
  patterns: [session-storage-tracking, fire-and-forget-analytics, conversion-funnel]

key-files:
  created:
    - supabase/migrations/00_run_all_migrations.sql (referral tables)
    - src/lib/referral.ts
    - src/components/analytics/UTMCapturer.tsx
    - src/components/account/ReferralDashboard.tsx
    - src/app/api/referral/convert/route.ts
  modified:
    - src/app/layout.tsx
    - src/app/compte/profil/page.tsx
    - src/app/api/webhooks/stripe/route.ts
    - src/app/api/checkout/route.ts
    - src/app/commande/page.tsx

key-decisions:
  - "Session storage for visitor ID (privacy-friendly, tab-scoped)"
  - "Auto-generate 8-char alphanumeric referral codes on insert"
  - "Track conversions server-side via Stripe webhook metadata"
  - "Fire-and-forget pattern for referral conversion API calls"
  - "Referral dashboard as new tab in profile page"

patterns-established:
  - "UTM capture on app load with session storage persistence"
  - "Referral code extraction from URL referrer parameter"
  - "Visitor ID passed through checkout to Stripe metadata"
  - "Server-side conversion tracking prevents client-side manipulation"

issues-created: []

# Metrics
duration: 24 min
completed: 2026-02-13
---

# Phase 26 Plan 03: Referral Tracking and UTM Attribution Summary

**Complete UTM and referral tracking system with visitor attribution from click to conversion, referral link generation with 8-char codes, user dashboard with share buttons, and server-side conversion tracking via Stripe webhooks.**

## Performance

- **Duration:** 24 min
- **Started:** 2026-02-13T17:00:00Z
- **Completed:** 2026-02-13T17:24:00Z
- **Tasks:** 5/5
- **Files modified:** 9

## Accomplishments

- UTM parameter tracking captures source, medium, campaign, term, and content from URL
- Referral link system with auto-generated 8-character alphanumeric codes
- User referral dashboard showing clicks, conversions, and conversion rate
- Share buttons for WhatsApp, Email, and copy with pre-filled message
- Complete attribution loop: visitor arrives → tracked → orders → conversion counted
- Server-side conversion tracking prevents client manipulation
- Session storage for privacy-friendly visitor identification

## Task Commits

Each task was committed atomically:

1. **Task 1: Create referral tracking database schema** - Migration file only (gitignored)
   - utm_visits table for UTM and referral source tracking
   - referral_links table with auto-generated codes
   - RLS policies and indexes

2. **Task 2: Create UTM capture and referral tracking library** - `26eb8a5` (feat)
   - captureUTMParams() for client-side URL parameter capture
   - trackVisit() to save UTM and referral data
   - generateReferralLink() to create/retrieve user codes
   - trackReferralClick() and trackReferralConversion() for attribution
   - Session storage for visitor ID persistence

3. **Task 3: Integrate UTM capture on app load** - `4c84ff1` (feat)
   - UTMCapturer client component
   - Integrated into root layout
   - Automatic capture on page load

4. **Task 4: Create referral dashboard for user accounts** - `fb2cbaa` (feat)
   - ReferralDashboard component with stats cards
   - Copy to clipboard with success feedback
   - Share buttons for WhatsApp, Email, Copy
   - New "Parrainage" tab in profile page

5. **Task 5: Connect referral tracking to order completion** - `28ba446` (feat)
   - /api/referral/convert endpoint for server-side tracking
   - Stripe webhook passes visitor_id in metadata
   - Checkout flow includes visitor ID
   - Complete conversion attribution loop

## Files Created/Modified

Created:
- `supabase/migrations/00_run_all_migrations.sql` - Added utm_visits and referral_links tables (gitignored)
- `src/lib/referral.ts` - Complete referral and UTM tracking library
- `src/components/analytics/UTMCapturer.tsx` - Client component for UTM capture
- `src/components/account/ReferralDashboard.tsx` - User-facing referral dashboard
- `src/app/api/referral/convert/route.ts` - Server-side conversion tracking endpoint

Modified:
- `src/app/layout.tsx` - Added UTMCapturer component
- `src/app/compte/profil/page.tsx` - Added Parrainage tab with ReferralDashboard
- `src/app/api/webhooks/stripe/route.ts` - Added referral conversion tracking on payment
- `src/app/api/checkout/route.ts` - Accept and pass visitor ID to Stripe metadata
- `src/app/commande/page.tsx` - Send visitor ID during checkout

## Decisions Made

**Session storage for visitor tracking:**
- Chose session storage over cookies for visitor ID (privacy-friendly, tab-scoped)
- Generates unique visitor IDs on first visit: `visitor_${timestamp}_${random}`
- UTM params stored in session to prevent duplicate tracking

**Auto-generated referral codes:**
- 8-character alphanumeric codes (A-Z, 0-9) for clean, shareable URLs
- Automatic generation via database trigger with uniqueness check
- Example: `https://nuage.fr/?ref=ABC12345`

**Server-side conversion tracking:**
- Visitor ID passed through checkout to Stripe session metadata
- Webhook calls /api/referral/convert after payment confirmed
- Prevents client-side manipulation of conversion stats

**Referral dashboard placement:**
- Integrated as new tab in profile page (not standalone page)
- Keeps user account features centralized
- Easier discoverability for authenticated users

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed successfully, build passed without TypeScript errors.

## Next Phase Readiness

**Ready for Phase 27 (Email Marketing):**
- UTM tracking in place for campaign attribution
- Referral codes can be included in email campaigns
- Conversion data available for measuring email ROI

**Referral system complete:**
- Users can generate and share referral links
- Attribution tracked from click to conversion
- Dashboard shows real-time stats
- Ready for potential future referral rewards program

**Analytics infrastructure:**
- UTM data complements existing analytics_events
- Referral data available for admin analytics dashboards
- Can add referral metrics to customer intelligence reports

---
*Phase: 26-social-media-integration*
*Completed: 2026-02-13*
