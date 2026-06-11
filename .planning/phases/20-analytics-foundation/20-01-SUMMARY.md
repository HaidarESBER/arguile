# Plan 20-01: Server-Side Analytics Tracking Infrastructure

**Phase:** 20-analytics-foundation
**Status:** Complete
**Date:** 2026-02-12

## Objective

Create server-side event tracking infrastructure to persist analytics events in Supabase for admin dashboards and business intelligence.

**Purpose:** Move from localStorage-only event storage to database persistence, enabling historical analysis, admin dashboards, and business insights.

## What Was Built

### 1. Analytics Events Table
- **File:** `supabase/migrations/analytics_events.sql`
- Created `analytics_events` table with time-series optimization
- Columns: event_type, event_data (JSONB), session_id (anonymous), user_id (nullable), created_at, url, referrer, user_agent
- Time-series indexes for efficient querying (type, session, user, created_at)
- GIN index on JSONB event_data for flexible queries
- RLS policies: admin-only reads, service role for writes (no public access)
- Auto-cleanup trigger for 90-day retention
- Privacy-compliant: anonymous session IDs, GDPR-ready

### 2. Server-Side Event Tracking API
- **File:** `src/app/api/analytics/track/route.ts`
- POST endpoint for event persistence
- Uses `createAdminClient()` (service role) to bypass RLS
- In-memory rate limiting (100 events/session/minute)
- Privacy compliance:
  - DNT header respect (returns 200 but doesn't track)
  - PII sanitization (removes email, phone, address, etc.)
- Fire-and-forget error handling (always returns 200)
- Extracts user_id from session if authenticated
- Extracts user_agent from request headers
- Silently drops events on rate limit or error (never breaks UX)

### 3. Client-Side Integration
- **File:** `src/lib/analytics.ts`
- Added `getOrCreateSessionId()` using sessionStorage
  - Generates anonymous UUID per browser tab
  - Resets on tab close (privacy-friendly)
  - GDPR-compliant (short-lived, anonymous identifier)
- Added `sendToServer()` fire-and-forget helper
  - POST to `/api/analytics/track` with keepalive flag
  - Non-blocking async (never waits for response)
  - Includes eventType, eventData, sessionId, url, referrer
- Integrated server forwarding into `trackEvent()`
  - Called after existing localStorage storage
  - Called after existing provider integrations (GA4, Meta, TikTok, Clarity)
  - Preserves all existing behavior (zero breaking changes)

### 4. TypeScript Types
- **File:** `src/types/analytics.ts`
- Added `ServerAnalyticsEvent` interface (matches table schema)
- Added `EventTrackingOptions` interface (API payload)

## Technical Decisions

1. **sessionStorage vs localStorage for session ID:**
   - sessionStorage resets on tab close (better privacy)
   - Each tab = new session (more accurate session tracking)
   - GDPR-compliant (anonymous, short-lived identifier)

2. **Fire-and-forget pattern:**
   - Analytics should never block user experience
   - Failed tracking is acceptable (better than failed page load)
   - Consistent with browse_history tracking pattern (Phase 18-02)

3. **Rate limiting in-memory:**
   - Simple Map-based rate limiting (100 events/session/minute)
   - Resets every minute automatically
   - Prevents spam without external dependencies

4. **Service role for writes:**
   - API uses `createAdminClient()` to bypass RLS
   - No public write access to analytics_events table
   - Prevents client-side manipulation of analytics data

5. **90-day retention:**
   - Auto-cleanup trigger deletes old events after each insert
   - Balances data storage costs with analytics needs
   - Consistent with browse_history retention policy

## Files Modified

- `supabase/migrations/analytics_events.sql` (new)
- `src/app/api/analytics/track/route.ts` (new)
- `src/lib/analytics.ts` (modified)
- `src/types/analytics.ts` (modified)

## Verification

- ✅ npm run build succeeds without TypeScript errors
- ✅ Migration creates analytics_events table with correct schema
- ✅ API endpoint created at /api/analytics/track
- ✅ Client-side integration preserves existing localStorage behavior
- ✅ Client-side integration preserves existing provider integrations
- ✅ Session ID generation in sessionStorage
- ✅ Fire-and-forget pattern implemented (no blocking)

## Commits

- `0b7ee09` - feat(20-01): create analytics events table with time-series optimization
- `247ea29` - feat(20-01): create server-side event tracking API
- `73e599d` - feat(20-01): integrate client-side analytics with server persistence

## Impact

- **Before:** Analytics events only stored in localStorage (max 100 events, client-only, no historical data)
- **After:** All events persisted to database with anonymous session tracking, ready for admin dashboards

## Next Steps

Future plans can now:
- Build admin analytics dashboards (Plan 20-02)
- Query historical event data for business insights
- Analyze user behavior patterns across sessions
- Track conversion funnels server-side
- Generate sales analytics reports

## Notes

- Events are fire-and-forget (never block UX)
- Privacy-first: anonymous sessions, DNT respect, PII sanitization
- GDPR-compliant: short-lived session IDs, 90-day retention
- Backwards compatible: preserves all existing analytics behavior
- No breaking changes to existing codebase
