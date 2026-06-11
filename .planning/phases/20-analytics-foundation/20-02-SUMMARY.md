# Plan 20-02: Daily Metrics Aggregation System

**Phase:** 20-analytics-foundation
**Status:** Complete
**Date:** 2026-02-12

## Objective

Create metrics aggregation system to pre-compute daily analytics rollups for fast admin dashboard queries.

**Purpose:** Avoid expensive real-time queries on analytics_events table (millions of rows), pre-aggregate metrics daily for instant dashboard loads.

## What Was Built

### 1. Daily Metrics Table

- **File:** `supabase/migrations/daily_metrics.sql`
- Created `daily_metrics` table for pre-aggregated daily KPIs
- Columns:
  - `date` (DATE, unique) - the day being measured
  - `total_events` - total events that day
  - `unique_sessions` - count of distinct session_ids
  - `unique_users` - count of distinct user_ids (authenticated only)
  - `page_views` - count of page_view events
  - `product_views` - count of product_view events
  - `add_to_cart_count` - count of add_to_cart events
  - `purchases` - count of purchase events
  - `total_revenue` - sum of purchase amounts in cents
  - `search_queries` - count of search events
  - `avg_session_duration` - placeholder for future calculation
  - `bounce_rate` - placeholder for future calculation
- Unique index on date (one row per day)
- RLS policies: admin-only reads, service role for writes
- Created `aggregate_daily_metrics(target_date)` function:
  - Idempotent upsert pattern (deletes existing, inserts fresh)
  - Aggregates stats from `analytics_events` table
  - Uses SQL `COUNT(DISTINCT)` and `COUNT(*) FILTER (WHERE)`
  - Safe for cron retries and manual backfill

### 2. Admin Analytics Query Helpers

- **File:** `src/lib/analytics-server.ts`
- Server-side analytics library (not to be confused with client-side `src/lib/analytics.ts`)
- Uses `createAdminClient()` for admin-only access
- Export helper functions:
  - `getDailyMetrics(startDate, endDate)` - Query daily_metrics for date range
  - `getMetricsSummary(days)` - Aggregate last N days with calculated metrics
    - Returns: totalSessions, totalUsers, totalRevenue, totalPurchases, avgRevenuePerUser, conversionRate
    - Conversion rate = (purchases / unique_sessions) * 100
  - `getTopEvents(eventType, limit)` - Group events by key (productId, query, etc.), count occurrences
    - Aggregates in application (Supabase doesn't support GROUP BY JSONB fields easily)
    - Returns top N events sorted by count
  - `getRealtimeEvents(limit)` - Query most recent events for activity feed
  - `triggerDailyAggregation(date)` - Call aggregate_daily_metrics() function
    - Defaults to yesterday if no date provided
    - Used for manual backfill and API endpoint
- TypeScript types:
  - `DailyMetrics` interface (matches daily_metrics table)
  - `MetricsSummary` interface (aggregated summary)
  - `TopEvent` interface (event type with count)
- All functions throw errors on database failures (admin-only, safe to surface)

### 3. Aggregation API Endpoint

- **File:** `src/app/api/analytics/aggregate/route.ts`
- POST endpoint for triggering daily aggregation
- Authentication: requires admin user (profiles.is_admin = true)
- Request body: `{ date?: string }` - date in YYYY-MM-DD format, defaults to yesterday
- Validates date format and user permissions
- Calls `triggerDailyAggregation(date)` from analytics-server.ts
- Returns `200` with `{ success: true, date, metrics }` on success
- Returns `401` if not authenticated
- Returns `403` if not admin
- Returns `400` on invalid date format
- Returns `500` on database errors
- Use cases:
  - Manual backfill of historical data (call with past dates)
  - Testing aggregation logic before setting up cron
  - On-demand refresh from admin dashboard (Phase 21)
  - Future: Vercel Cron will call this endpoint daily

## Technical Decisions

1. **Idempotent aggregation function:**
   - Delete-then-insert pattern ensures fresh data on re-run
   - Safe for cron retries
   - Allows backfill of historical data
   - No risk of duplicate rows

2. **Pre-aggregated metrics vs real-time queries:**
   - Daily metrics table queries are instant (simple SELECT on small table)
   - Real-time queries on analytics_events would scan millions of rows
   - Trade-off: metrics are up to 1 day old (acceptable for admin dashboards)
   - Real-time events still available via getRealtimeEvents() for activity feed

3. **Admin-only access:**
   - RLS policies enforce admin read access
   - API endpoint validates profiles.is_admin flag
   - Service role used for aggregation writes (bypasses RLS)

4. **Placeholder metrics:**
   - avg_session_duration and bounce_rate set to 0 for now
   - Future plans can implement session duration tracking
   - Future plans can calculate bounce rate (single-page sessions)

5. **Application-level aggregation for getTopEvents():**
   - Supabase client doesn't support GROUP BY JSONB fields easily
   - Querying raw events (max 10,000) and aggregating in-app
   - Acceptable for admin-only queries
   - Could optimize with database functions in future if needed

## Files Modified

- `supabase/migrations/daily_metrics.sql` (new)
- `src/lib/analytics-server.ts` (new)
- `src/app/api/analytics/aggregate/route.ts` (new)

## Verification

- ✅ npm run build succeeds without TypeScript errors
- ✅ daily_metrics table created with correct schema
- ✅ aggregate_daily_metrics() function callable and idempotent
- ✅ analytics-server.ts exports all query helpers
- ✅ TypeScript types defined for all interfaces
- ✅ POST /api/analytics/aggregate endpoint created
- ✅ Admin authentication enforced on API endpoint

## Commits

- `640c9b2` - feat(20-02): create daily metrics table with aggregation function
- `c4333ec` - feat(20-02): create admin analytics query helpers
- `94d91bb` - feat(20-02): create aggregation API endpoint for manual/cron triggering

## Impact

- **Before:** No pre-computed metrics, admin dashboards would need to scan millions of rows in analytics_events
- **After:** Daily metrics pre-aggregated for instant dashboard loads, query helpers ready for Phase 21

## Next Steps

Phase 21 can now:
- Build admin analytics dashboard UI
- Display daily metrics charts (sessions, users, revenue over time)
- Show summary cards (total sessions, conversion rate, average revenue per user)
- Display top products, top searches, real-time activity feed
- Trigger on-demand aggregation via dashboard button
- Set up Vercel Cron for daily automatic aggregation

## Future Work

- Set up Vercel Cron to call `/api/analytics/aggregate` daily at 1 AM UTC
- Implement session duration calculation (avg_session_duration)
- Implement bounce rate calculation (single-page sessions)
- Optimize getTopEvents() with database functions if needed
- Add more KPIs (conversion funnel stages, cart abandonment rate, etc.)

## Notes

- Aggregation is idempotent (safe to re-run)
- Metrics are up to 1 day old (acceptable for admin dashboards)
- Real-time events still available for activity feed
- All functions throw errors on failures (admin-only, safe to surface)
- Ready for Phase 21 admin dashboard integration
