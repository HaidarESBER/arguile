-- =============================================================================
-- Analytics Events Table
-- =============================================================================
-- Server-side event tracking for admin dashboards and business intelligence
-- Stores all analytics events with anonymous session tracking
-- Privacy-compliant: anonymous session IDs, 90-day retention, GDPR-ready
-- =============================================================================

-- Create analytics_events table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_data JSONB,
  session_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  url TEXT,
  referrer TEXT,
  user_agent TEXT
);

-- Time-series indexes for common queries
CREATE INDEX idx_analytics_events_type_time ON analytics_events(event_type, created_at DESC);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id, created_at DESC);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- GIN index for JSONB event_data queries
CREATE INDEX idx_analytics_events_data ON analytics_events USING gin (event_data);

-- RLS policies: No public access, admin-only reads, service role for writes
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Admins can view all analytics events
CREATE POLICY "Admins can view all analytics events" ON analytics_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- No public insert/update/delete (API will use service role to insert events)

-- Auto-cleanup function: Delete events older than 90 days
CREATE OR REPLACE FUNCTION cleanup_old_analytics_events()
RETURNS trigger AS $$
BEGIN
  DELETE FROM analytics_events WHERE created_at < now() - INTERVAL '90 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run cleanup after each insert
CREATE TRIGGER trigger_cleanup_analytics_events
  AFTER INSERT ON analytics_events
  EXECUTE FUNCTION cleanup_old_analytics_events();
