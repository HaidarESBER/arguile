-- =============================================================================
-- Daily Metrics Table
-- =============================================================================
-- Pre-aggregated daily analytics metrics for fast admin dashboard queries
-- Avoids expensive real-time queries on analytics_events table (millions of rows)
-- Updated daily via aggregate_daily_metrics() function (cron or manual)
-- =============================================================================

-- Create daily_metrics table
CREATE TABLE daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_events INTEGER NOT NULL DEFAULT 0,
  unique_sessions INTEGER NOT NULL DEFAULT 0,
  unique_users INTEGER NOT NULL DEFAULT 0,
  page_views INTEGER NOT NULL DEFAULT 0,
  product_views INTEGER NOT NULL DEFAULT 0,
  add_to_cart_count INTEGER NOT NULL DEFAULT 0,
  purchases INTEGER NOT NULL DEFAULT 0,
  total_revenue INTEGER NOT NULL DEFAULT 0,
  search_queries INTEGER NOT NULL DEFAULT 0,
  avg_session_duration INTEGER NOT NULL DEFAULT 0,
  bounce_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique index on date (one row per day)
CREATE UNIQUE INDEX idx_daily_metrics_date ON daily_metrics(date);

-- Index for date range queries
CREATE INDEX idx_daily_metrics_date_desc ON daily_metrics(date DESC);

-- RLS policies: No public access, admin-only reads
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

-- Admins can view all daily metrics
CREATE POLICY "Admins can view all daily metrics" ON daily_metrics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- No public insert/update/delete (aggregation function will use service role)

-- =============================================================================
-- Aggregation Function
-- =============================================================================
-- Idempotent function to compute daily metrics for a specific date
-- Deletes existing row (if exists) and inserts fresh aggregated stats
-- Safe for cron retries and manual backfill
-- =============================================================================

CREATE OR REPLACE FUNCTION aggregate_daily_metrics(target_date DATE)
RETURNS void AS $$
DECLARE
  start_time TIMESTAMPTZ;
  end_time TIMESTAMPTZ;
BEGIN
  -- Calculate date range (full day in UTC)
  start_time := target_date::TIMESTAMPTZ;
  end_time := (target_date + INTERVAL '1 day')::TIMESTAMPTZ;

  -- Delete existing row for this date (idempotent)
  DELETE FROM daily_metrics WHERE date = target_date;

  -- Insert fresh aggregated metrics
  INSERT INTO daily_metrics (
    date,
    total_events,
    unique_sessions,
    unique_users,
    page_views,
    product_views,
    add_to_cart_count,
    purchases,
    total_revenue,
    search_queries,
    avg_session_duration,
    bounce_rate
  )
  SELECT
    target_date,
    COUNT(*) AS total_events,
    COUNT(DISTINCT session_id) AS unique_sessions,
    COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) AS unique_users,
    COUNT(*) FILTER (WHERE event_type = 'page_view') AS page_views,
    COUNT(*) FILTER (WHERE event_type = 'product_view') AS product_views,
    COUNT(*) FILTER (WHERE event_type = 'add_to_cart') AS add_to_cart_count,
    COUNT(*) FILTER (WHERE event_type = 'purchase') AS purchases,
    COALESCE(SUM((event_data->>'amount')::INTEGER) FILTER (WHERE event_type = 'purchase'), 0) AS total_revenue,
    COUNT(*) FILTER (WHERE event_type = 'search') AS search_queries,
    0 AS avg_session_duration, -- Placeholder for future calculation
    0 AS bounce_rate -- Placeholder for future calculation
  FROM analytics_events
  WHERE created_at >= start_time AND created_at < end_time;

  -- Handle case where no events exist for this date (insert zero row)
  IF NOT FOUND THEN
    INSERT INTO daily_metrics (
      date, total_events, unique_sessions, unique_users, page_views,
      product_views, add_to_cart_count, purchases, total_revenue, search_queries,
      avg_session_duration, bounce_rate
    ) VALUES (
      target_date, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT aggregate_daily_metrics('2026-02-12'::DATE);
-- SELECT aggregate_daily_metrics(CURRENT_DATE - INTERVAL '1 day'); -- Yesterday
