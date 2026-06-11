# Plan 12-01 Summary: Scraping Infrastructure

**Phase:** 12-product-sourcing-pipeline
**Plan:** 01
**Status:** Complete
**Date:** 2026-02-12

## Objective

Create the scraping infrastructure: database table for raw scraped products, TypeScript types with CRUD data access, and a Cheerio-based scraping engine with source-specific adapters.

## Tasks Completed

### Task 1: Create scraped_products table, ScrapedProduct type, and CRUD data access
**Commit:** b0144d4

**Files:**
- `supabase/migrations/scraped_products.sql` - Database table with RLS, indexes, and triggers
- `src/types/scraper.ts` - TypeScript types (ScrapedProduct, ScrapeResult, SourceAdapter)
- `src/lib/scraper/data.ts` - CRUD operations following curation.ts pattern

**Implementation:**
- Database table `scraped_products` with columns for source tracking (source_url, source_name, external_id), raw extracted data (raw_name, raw_description, raw_price_text, raw_images, raw_category, raw_metadata), scraping metadata (scrape_status, error_message), and curation pipeline linkage (sent_to_curation, draft_id)
- Unique index on source_url for deduplication
- Indexes on source_name, sent_to_curation, scrape_status for efficient queries
- RLS policy: admin-only access matching product_drafts pattern
- Updated_at trigger using existing update_updated_at() function
- TypeScript types: ScrapedProduct (camelCase interface), ScrapeStatus ('success' | 'partial' | 'failed'), ScrapeResult (adapter output), SourceAdapter (interface for adapters)
- CRUD functions: createScrapedProduct, getScrapedProductByUrl (dedup), getAllScrapedProducts, getScrapedProductsBySource, getUnsentProducts, updateScrapedProduct, markSentToCuration, getScraperStats
- Column mapping helpers: toScrapedProduct (snake_case -> camelCase), toScrapedProductRow (camelCase -> snake_case)

### Task 2: Build scraping engine with Cheerio and source adapters
**Commit:** f50be73

**Files:**
- `package.json` / `package-lock.json` - Added cheerio@^1.2.0 dependency
- `src/lib/scraper/engine.ts` - Scraping engine with dedup, fetching, adapter orchestration
- `src/lib/scraper/adapters/generic.ts` - Generic fallback adapter for any URL
- `src/lib/scraper/adapters/aliexpress.ts` - AliExpress-specific adapter

**Implementation:**
- Installed cheerio for lightweight HTML parsing (no browser needed)
- Generic adapter extracts: name (og:title -> title -> h1), description (og:description -> meta description -> paragraph), price (JSON-LD Product schema, common class patterns, currency symbols), images (og:image -> product containers, filtered by size/type), category (breadcrumbs, JSON-LD)
- AliExpress adapter extracts: external_id from URL pattern (/item/{id}.html), name from og:title (removes AliExpress suffix), description from meta tags, price from og:price or window.runParams, images from gallery elements, category from breadcrumbs
- Scraping engine: adapter registry with priority order (aliexpress -> generic), scrapeUrl() with dedup check, HTML fetching (User-Agent, 10s timeout), adapter selection (first matching canHandle), extraction, database save with error handling, scrapeUrls() for batch scraping with 1s rate limiting
- Error handling: saves failed scrapes with scrape_status='failed' and error_message for debugging

## Verification

- [x] npm run build succeeds
- [x] No TypeScript errors in src/lib/scraper/ or src/types/scraper.ts
- [x] scraped_products.sql is valid SQL
- [x] cheerio is in package.json dependencies

## Technical Decisions

**Cheerio over headless browser:** Selected cheerio for lightweight HTML parsing. Sufficient for Open Graph tags and static HTML extraction. AliExpress adapter notes limitation for dynamic content (future enhancement: headless browser).

**Adapter pattern:** SourceAdapter interface allows site-specific extraction logic. Priority-based registry (specific adapters before generic fallback) enables extensibility for future sources.

**Deduplication by URL:** source_url UNIQUE constraint prevents re-scraping same product. getScrapedProductByUrl() checks before scraping.

**Rate limiting:** 1 second delay between scrapeUrls() batch requests to respect server resources.

**Error resilience:** Failed scrapes saved to database with error_message for admin visibility and debugging.

**Regex fix:** Changed regex from `/s` flag to `[\s\S]` character class for ES2017 compatibility (Next.js TypeScript config target).

## Integration Points

**Feeds Phase 13 curation pipeline:**
- getUnsentProducts() returns scraped products ready for curation
- markSentToCuration() links scraped_product to product_draft via draft_id
- createDraftFromScrapedProduct() (defined in Phase 13) consumes this data

**Admin dashboard:**
- getScraperStats() provides counts for admin visibility
- getScrapedProductsBySource() filters by source name

## Files Modified

- supabase/migrations/scraped_products.sql
- src/types/scraper.ts
- src/lib/scraper/data.ts
- src/lib/scraper/engine.ts
- src/lib/scraper/adapters/generic.ts
- src/lib/scraper/adapters/aliexpress.ts
- package.json
- package-lock.json

## Output

Scraping infrastructure ready for Phase 13 curation pipeline. Provides data layer and extraction engine for product sourcing.
