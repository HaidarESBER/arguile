---
phase: 24-seo-organic-growth
plan: 02
subsystem: seo
tags: [schema.org, json-ld, structured-data, search-action, website-schema, itemlist]

# Dependency graph
requires:
  - phase: 08-character-delight
    provides: SEO structured data foundation (Organization, Product, Breadcrumb schemas, safeJsonLd helper)
  - phase: 14-blog-content-marketing
    provides: Article schema and safeJsonLd pattern
  - phase: 24-01
    provides: Technical SEO foundation (sitemap, robots.txt, meta tags)
provides:
  - WebSite schema with SearchAction for Google sitelinks search box
  - ItemList schema generator for product collection pages
  - Enhanced homepage metadata with SEO keywords and canonical URL
affects: [25-promotions-discount-codes, 26-social-media-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [WebSite schema on homepage, SearchAction for sitelinks search box, ItemList for collections]

key-files:
  created: []
  modified: [src/lib/seo.ts, src/app/page.tsx]

key-decisions:
  - "WebSite schema placed on homepage page component (not layout) to keep it homepage-specific"
  - "ItemList schema limits to 10 items to keep JSON-LD payload reasonable"
  - "SearchAction targets /produits?q= which already works with existing search"
  - "Used safeJsonLd for XSS-safe JSON-LD serialization"

patterns-established:
  - "Page-specific schema in page component, site-wide schema in layout"

issues-created: []

# Metrics
duration: 5min
completed: 2026-02-13
---

# Phase 24 Plan 02: Enhanced Structured Data & Homepage SEO Summary

**WebSite schema with SearchAction for Google sitelinks search box, ItemList schema generator for collections, and enhanced homepage metadata with SEO keywords and canonical URL**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-13
- **Completed:** 2026-02-13
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added generateWebSiteSchema() with SearchAction enabling Google sitelinks search box in search results
- Added generateItemListSchema() for product collections (homepage featured products, category pages)
- Enhanced homepage metadata with richer title including "Chicha Premium en France" keywords
- Added canonical URL and improved description mentioning key product categories

## Task Commits

Each task was committed atomically:

1. **Task 1: Add WebSite and ItemList schema generators to seo.ts** - `6ecce2d` (feat)
2. **Task 2: Inject WebSite schema on homepage and enhance metadata** - `b931fae` (feat)

## Files Created/Modified
- `src/lib/seo.ts` - Added generateWebSiteSchema() and generateItemListSchema() functions
- `src/app/page.tsx` - Added WebSite schema JSON-LD injection and enhanced metadata export

## Decisions Made
- WebSite schema placed on homepage page component (not layout.tsx) to keep Organization and WebSite schemas separate and page-specific
- ItemList schema limits output to first 10 items to keep JSON-LD payload size reasonable
- SearchAction targets existing /produits?q= search parameter that already works
- Used safeJsonLd helper for XSS-safe serialization consistent with blog Article schema pattern

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## Next Phase Readiness
- Phase 24 complete (2/2 plans) - all SEO & Organic Growth work done
- WebSite schema ready for Google to discover sitelinks search box
- ItemList schema available for future category page integration
- Ready for Phase 25: Promotions & Discount Codes

---
*Phase: 24-seo-organic-growth*
*Completed: 2026-02-13*
