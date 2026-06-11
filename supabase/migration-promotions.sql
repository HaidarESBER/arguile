-- =============================================================================
-- Promotions / Discount Codes Table
-- =============================================================================
-- Run this in Supabase SQL Editor to create the promotions table.
-- =============================================================================

-- Promotions table
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value INTEGER NOT NULL,
  minimum_order INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Public read for code validation (active codes only)
CREATE POLICY "Active promotions are viewable by everyone" ON promotions
  FOR SELECT USING (is_active = true);

-- Admin full access
CREATE POLICY "Admins have full access to promotions" ON promotions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at (reuses existing update_updated_at function)
CREATE TRIGGER promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- SEED DATA
-- =============================================================================

INSERT INTO promotions (code, description, discount_type, discount_value, minimum_order, max_uses, starts_at, expires_at, is_active)
VALUES (
  'BIENVENUE10',
  '10% de reduction pour le premier achat',
  'percentage',
  10,
  0,
  NULL,
  now(),
  NULL,
  true
);
