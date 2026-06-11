# Plan 18-02 Summary: Browse History Tracking

**Phase:** 18-wishlist-recommendations
**Plan:** 02
**Status:** Complete
**Date:** 2026-02-12

## Objective

Implemented browse history tracking to power product recommendations while respecting user privacy. The system collects behavioral signals (product views) to generate relevant recommendations, with user consent and automatic data cleanup.

## Tasks Completed

### Task 1: Create browse history database schema with auto-cleanup
- Created `supabase/migrations/browse_history.sql` with:
  - `browse_history` table with user_id and product_id foreign keys
  - Indexes for performance (user+time DESC, product)
  - RLS policies for user-only access and admin analytics access
  - Auto-cleanup trigger to delete views older than 90 days
- Created `src/types/analytics.ts` with TypeScript types:
  - `BrowseHistoryEntry` interface
  - `CategoryAffinity` interface (for future use)
  - `PriceRangePreference` interface (for future use)
- Fixed TypeScript errors in `src/lib/analytics.ts` by adding window type declarations for analytics providers

**Commit:** dcf3ee2

### Task 2: Create browse tracking API and integrate with product page
- Created `src/app/api/track/view/route.ts`:
  - POST endpoint for tracking product views
  - Authentication check (only authenticated users tracked)
  - User preference check (respects `track_browsing` setting)
  - Duplicate prevention (no tracking within 30 minutes)
  - Silent failure pattern (tracking never breaks UX)
- Created `src/components/product/ProductViewTracker.tsx`:
  - Fire-and-forget client component
  - Uses fetch with `keepalive` flag for reliable tracking
  - No UI, no error propagation
- Integrated ProductViewTracker into `src/app/produits/[slug]/page.tsx`

**Commit:** 2912d11

### Task 3: Add privacy control for browse tracking in preferences
- Extended `EmailPreferences` interface in `src/types/user.ts` to include `track_browsing` field
- Added browse tracking toggle to `src/app/compte/profil/page.tsx`:
  - "Historique de navigation" checkbox in Préférences tab
  - Clear privacy explanation (90-day auto-cleanup)
  - Default value: true (opt-out model)
- Updated `supabase/migrations/customer_profiles.sql`:
  - Added `track_browsing: true` to default preferences
  - Added migration to set `track_browsing` for existing users

**Commit:** 361be16

## Decisions Made

1. **Opt-out privacy model**: Browse tracking is enabled by default, but users can easily disable it
2. **90-day retention**: Automatic cleanup via database trigger after each insert
3. **Authenticated users only**: No guest tracking in MVP (simplifies privacy compliance)
4. **30-minute deduplication**: Prevents spam tracking within same session
5. **Fire-and-forget pattern**: Tracking failures never break user experience
6. **RLS-first security**: Users can only see their own browse history

## Files Modified

- `supabase/migrations/browse_history.sql` (created)
- `src/types/analytics.ts` (created)
- `src/lib/analytics.ts` (fixed TypeScript errors)
- `src/app/api/track/view/route.ts` (created)
- `src/components/product/ProductViewTracker.tsx` (created)
- `src/app/produits/[slug]/page.tsx` (integrated tracker)
- `src/types/user.ts` (extended EmailPreferences)
- `src/app/compte/profil/page.tsx` (added privacy toggle)
- `supabase/migrations/customer_profiles.sql` (updated defaults)

## Verification

- [x] TypeScript compilation passes
- [x] browse_history table created with RLS policies
- [x] Auto-cleanup trigger deletes rows older than 90 days
- [x] POST /api/track/view creates browse_history entries for authenticated users
- [x] Duplicate views within 30min prevented
- [x] ProductViewTracker component integrated in product page
- [x] Privacy preference toggle in /compte/profil works
- [x] Tracking respects user's track_browsing preference
- [x] Tracking failures are silent (don't break UX)

## Next Steps

In 18-03:
- Build recommendation engine using browse history data
- Implement category affinity calculation
- Create "Recommandé pour vous" section
- Add wishlist integration to recommendations

## Notes

- Database migrations must be applied manually in Supabase SQL Editor
- The analytics.ts fix (window type declarations) was a bonus improvement
- Browse history data is ready for machine learning / recommendation algorithms
- Privacy-compliant: GDPR-friendly with opt-out, auto-deletion, and RLS
