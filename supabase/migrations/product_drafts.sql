-- =============================================================================
-- Product Drafts table for AI Curation Pipeline
-- =============================================================================
-- Part of Phase 13: AI Curation & Automation
-- This table stores scraped products through the curation workflow:
-- pending_translation -> translating -> translated -> in_review -> approved/rejected -> published
-- =============================================================================

CREATE TABLE product_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scraped_product_id UUID, -- References scraped_products(id) from Phase 12. No FK constraint yet since table may not exist.

  -- Raw data snapshot (copied from scraped product for self-containment)
  raw_name TEXT NOT NULL,
  raw_description TEXT,
  raw_price_text TEXT,
  raw_images TEXT[] DEFAULT '{}',
  raw_source_url TEXT,
  raw_source_name TEXT, -- e.g., 'aliexpress', 'wholesaler'

  -- AI-generated fields
  ai_name TEXT,
  ai_description TEXT,
  ai_short_description TEXT,
  ai_category TEXT CHECK (ai_category IS NULL OR ai_category IN ('chicha', 'bol', 'tuyau', 'charbon', 'accessoire')),
  ai_suggested_price INTEGER, -- in cents EUR

  -- Admin-curated fields (override AI when set)
  curated_name TEXT,
  curated_description TEXT,
  curated_short_description TEXT,
  curated_category TEXT CHECK (curated_category IS NULL OR curated_category IN ('chicha', 'bol', 'tuyau', 'charbon', 'accessoire')),
  curated_price INTEGER, -- in cents EUR
  curated_compare_at_price INTEGER,
  curated_images TEXT[] DEFAULT '{}',

  -- Pipeline status
  status TEXT NOT NULL DEFAULT 'pending_translation' CHECK (status IN (
    'pending_translation', 'translating', 'translated',
    'in_review', 'approved', 'rejected', 'published'
  )),

  -- AI metadata
  ai_model TEXT,
  ai_prompt_version TEXT DEFAULT 'v1',
  translation_error TEXT,

  -- Audit trail
  translated_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  published_product_id UUID REFERENCES products(id),
  published_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for pipeline queries
CREATE INDEX idx_product_drafts_status ON product_drafts(status);
CREATE INDEX idx_product_drafts_scraped_id ON product_drafts(scraped_product_id);

-- RLS: admin only
ALTER TABLE product_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage product drafts" ON product_drafts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Updated_at trigger (reuses update_updated_at() function from schema.sql)
CREATE TRIGGER product_drafts_updated_at
  BEFORE UPDATE ON product_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
