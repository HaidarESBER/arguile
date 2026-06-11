-- Browse history for tracking product views
CREATE TABLE browse_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_browse_user_time ON browse_history(user_id, viewed_at DESC);
CREATE INDEX idx_browse_product ON browse_history(product_id);

-- RLS policies: users can only see their own browse history
ALTER TABLE browse_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own browse history" ON browse_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can add to own browse history" ON browse_history
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view all browse history (for analytics)
CREATE POLICY "Admins can view all browse history" ON browse_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Auto-cleanup function: Delete views older than 90 days
CREATE OR REPLACE FUNCTION cleanup_old_browse_history()
RETURNS trigger AS $$
BEGIN
  DELETE FROM browse_history WHERE viewed_at < now() - INTERVAL '90 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run cleanup after each insert
CREATE TRIGGER trigger_cleanup_browse_history
  AFTER INSERT ON browse_history
  EXECUTE FUNCTION cleanup_old_browse_history();
