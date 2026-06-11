# Plan 12-02 Summary: Admin Scraper UI & Cron Pipeline

**Phase:** 12-product-sourcing-pipeline
**Plan:** 02
**Status:** Complete
**Date:** 2026-02-12

## Objective

Build the admin scraper UI for triggering scrapes and viewing results, and wire the pipeline bridge so scraped products flow into the Phase 13 curation system.

## Tasks Completed

### Task 1: Create admin scraper page with URL input and results table
**Commit:** 335f13e

**Files:**
- `src/app/admin/scraper/page.tsx` - Server component fetching stats and products
- `src/app/admin/scraper/ScraperDashboard.tsx` - Client dashboard UI
- `src/app/admin/scraper/actions.ts` - Server actions for scraping and curation handoff
- `src/app/admin/layout.tsx` - Added Sourcing sidebar link

**Implementation:**
- Server actions module with "use server":
  - `scrapeUrlAction(formData)`: scrapes single URL, revalidates /admin/scraper
  - `scrapeMultipleAction(formData)`: parses newline-separated URLs, scrapes sequentially
  - `sendToCurationAction(scrapedProductId)`: calls createDraftFromScrapedProduct() and markSentToCuration()
  - `sendAllToCurationAction()`: bulk sends all unsent products to curation pipeline
- Server page fetches scraperStats and getAllScrapedProducts from data layer
- Client dashboard component following CurationDashboard.tsx pattern:
  - Stats cards: Total, Success, Failed, Sent, Unsent
  - URL input section: single URL input + "Scraper" button, textarea for multiple URLs + "Scraper tout" button
  - Results table columns: Image (first thumbnail), Name, Source, Price, Status, Sent, Actions
  - Actions column: "Envoyer en curation" button (if not sent), "Source" link to external URL
  - Bulk action bar: "Envoyer tout en curation" button sends all unsent products
  - Filter tabs: All, Success, Failed, Sent, Unsent with counts
  - Loading states with useTransition and isPending for all form actions
  - Success/error message display
- Admin layout sidebar: added "Sourcing" link with Search icon from lucide-react, positioned between Curation and other links
- All UI text in French following existing admin pattern

### Task 2: Add scheduled scrape cron endpoint and URL list configuration
**Commit:** cf81180

**Files:**
- `src/app/api/cron/scrape/route.ts` - Cron endpoint for automated scraping
- `vercel.json` - Added scrape cron schedule
- `.env.example` - Documented SCRAPE_URLS variable

**Implementation:**
- Cron endpoint GET handler following /api/cron/curate pattern:
  - CRON_SECRET verification via authorization header (production) or open (dev)
  - Loads SCRAPE_URLS from environment (comma-separated format)
  - Returns early with success message if SCRAPE_URLS is empty or has no valid URLs
  - Calls scrapeUrls() with URL list from environment
  - For each successful scrape not yet sent to curation: calls createDraftFromScrapedProduct() and markSentToCuration()
  - Returns JSON summary: { success, scraped, sentToCuration, errors, errorDetails }
  - Error handling with console.error and 500 status
- vercel.json updated with second cron entry:
  - /api/cron/scrape: "0 */12 * * *" (every 12 hours)
  - /api/cron/curate: "0 */6 * * *" (unchanged, every 6 hours)
- .env.example: added SCRAPE_URLS section with comment explaining comma-separated format and example

## Verification

- [x] npm run build succeeds
- [x] /admin/scraper route exists in build output
- [x] /api/cron/scrape endpoint builds
- [x] Admin sidebar shows Sourcing link
- [x] vercel.json has both cron entries (curate + scrape)

## Technical Decisions

**Revalidation pattern:** All server actions use revalidatePath("/admin/scraper") to refresh data after mutations (following curation actions pattern).

**Single vs bulk scraping:** Single URL action for immediate feedback, bulk action for batch scraping with sequential processing and rate limiting (1s delay in engine).

**Pipeline bridge:** sendToCurationAction and sendAllToCurationAction use createDraftFromScrapedProduct() from pipeline.ts to create product_drafts, then markSentToCuration() to link scraped_product to draft via draft_id.

**Cron interval:** 12-hour interval for scraping (less frequent than translation cron) since product URLs don't change often.

**Environment config:** SCRAPE_URLS in .env.example as comma-separated list for flexible URL management. Cron returns early if empty (no error).

**Filter logic:** Client-side filtering by scrape_status (success/failed) and sent_to_curation (sent/unsent) for fast UI without server round-trips.

**Image display:** Shows first image from rawImages array, falls back to N/A placeholder if no images.

## Integration Points

**Full pipeline flow:**
1. URL → scrapeUrl() → scraped_products table
2. Admin triggers sendToCurationAction() or bulk sendAllToCurationAction()
3. createDraftFromScrapedProduct() → product_drafts table
4. markSentToCuration() links scraped_product.draft_id to product_draft.id
5. AI translation cron (Phase 13) translates product_drafts
6. Admin reviews in /admin/curation and publishes

**Cron automation:**
- Scrape cron (/api/cron/scrape every 12h) auto-scrapes URLs from SCRAPE_URLS
- Auto-sends successful scrapes to curation (skips already-sent products)
- Translation cron (/api/cron/curate every 6h) translates pending drafts
- Admin reviews and publishes via curation UI

## Files Modified

- src/app/admin/scraper/page.tsx
- src/app/admin/scraper/ScraperDashboard.tsx
- src/app/admin/scraper/actions.ts
- src/app/admin/layout.tsx
- src/app/api/cron/scrape/route.ts
- vercel.json
- .env.example

## Output

Admin scraper UI complete with manual and automated scraping capabilities. Full pipeline operational: URL → scrape → scraped_products → draft creation → AI translation → curation review → publish.
