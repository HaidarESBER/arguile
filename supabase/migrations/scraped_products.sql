-- =============================================================================
-- Scraped Products table for Product Sourcing Pipeline
-- =============================================================================
-- Part of Phase 12: Product Sourcing Pipeline
-- This table stores raw scraped product data before it enters the curation workflow.
-- Scraped products feed into product_drafts via createDraftFromScrapedProduct().
-- =============================================================================

CREATE TABLE scraped_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source tracking
  source_url TEXT NOT NULL UNIQUE, -- Deduplication key: prevents re-scraping same URL
  source_name TEXT NOT NULL, -- e.g., 'aliexpress', 'generic', 'wholesaler'
  external_id TEXT, -- Source-specific product ID (e.g., AliExpress item ID)

  -- Raw extracted data
  raw_name TEXT NOT NULL,
  raw_description TEXT,
  raw_price_text TEXT, -- Price as string with currency symbols
  raw_images TEXT[] DEFAULT '{}',
  raw_category TEXT,
  raw_metadata JSONB DEFAULT '{}', -- Extra source-specific data

  -- Scraping metadata
  scrape_status TEXT NOT NULL DEFAULT 'success' CHECK (scrape_status IN ('success', 'partial', 'failed')),
  error_message TEXT, -- If scrape failed or was partial

  -- Curation pipeline linkage
  sent_to_curation BOOLEAN NOT NULL DEFAULT false,
  draft_id UUID, -- References product_drafts(id) if sent to curation. No FK constraint for flexibility.

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE UNIQUE INDEX idx_scraped_products_source_url ON scraped_products(source_url);
CREATE INDEX idx_scraped_products_source_name ON scraped_products(source_name);
CREATE INDEX idx_scraped_products_sent_to_curation ON scraped_products(sent_to_curation);
CREATE INDEX idx_scraped_products_scrape_status ON scraped_products(scrape_status);

-- RLS: admin only (matches product_drafts pattern)
ALTER TABLE scraped_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scraped products" ON scraped_products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Updated_at trigger (reuses update_updated_at() function from schema.sql)
CREATE TRIGGER scraped_products_updated_at
  BEFORE UPDATE ON scraped_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
