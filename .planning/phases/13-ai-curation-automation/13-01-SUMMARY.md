---
phase: 13-ai-curation-automation
plan: 01
subsystem: ai
tags: [anthropic, claude, ai-translation, supabase, product-curation, french-copy]

# Dependency graph
requires:
  - phase: 09-supabase-migration-auth
    provides: Supabase client, profiles table, products table, RLS patterns
provides:
  - product_drafts table with curation pipeline status workflow
  - ProductDraft TypeScript type with effective-value helpers
  - Full CRUD data access layer for product drafts
  - AI translation service using Claude Sonnet for French product copy
  - Batch translation with rate limit awareness
affects: [13-02-admin-review-queue, future-scraping-pipeline]

# Tech tracking
tech-stack:
  added: ["@anthropic-ai/sdk ^0.74.0"]
  patterns: ["AI translation pipeline with status workflow", "snake_case/camelCase column mapping", "Supabase admin client for server-side operations"]

key-files:
  created:
    - supabase/migrations/product_drafts.sql
    - src/types/curation.ts
    - src/lib/curation.ts
    - src/lib/supabase/admin.ts
    - src/lib/ai/prompts.ts
    - src/lib/ai/translate-product.ts
  modified:
    - package.json
    - .env.local

key-decisions:
  - "claude-sonnet-4-5-20250929 for translation (quality/cost balance for French copy)"
  - "No FK constraint on scraped_product_id (Phase 12 table may not exist yet)"
  - "Created Supabase admin client (createAdminClient) for server-side operations bypassing RLS"

patterns-established:
  - "Curation pipeline: pending_translation -> translating -> translated -> in_review -> approved/rejected -> published"
  - "Effective-value pattern: curated override > AI > raw for all display fields"
  - "toDraft/toDraftRow helpers for snake_case DB to camelCase TypeScript mapping"

issues-created: []

# Metrics
duration: 12min
completed: 2026-02-11
---

# Phase 13 Plan 01: AI Translation Engine & Curation Schema Summary

**Anthropic Claude-powered French product translation service with product_drafts table, full CRUD data access, and brand-consistent Nuage copy generation**

## Performance

- **Duration:** 12 min
- **Started:** 2026-02-11T19:24:00Z
- **Completed:** 2026-02-11T19:36:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- product_drafts table with 7-stage curation pipeline, RLS (admin-only), and indexes
- ProductDraft TypeScript type with 6 effective-value helper functions (name, description, shortDescription, category, price, images)
- Full server-side CRUD data access layer using Supabase admin client
- Brand-consistent French AI translation service using Claude Sonnet with JSON output parsing and validation
- Batch translation with sequential processing and rate limit awareness (1s delay between calls)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create curation database schema, types, and data access layer** - `291d0b6` (feat)
2. **Task 2: Build AI translation service with Anthropic Claude API** - `8d9f1af` (feat) + `27a9d6b` (chore: dependency)

## Files Created/Modified

- `supabase/migrations/product_drafts.sql` - Product drafts table schema with status workflow, RLS, indexes, and trigger
- `src/types/curation.ts` - DraftStatus type, ProductDraft interface, and 6 effective-value helper functions
- `src/lib/curation.ts` - Server-side CRUD operations (getDraftsByStatus, getDraftById, getAllDrafts, createDraft, updateDraft, updateDraftStatus, getDraftStats, deleteDraft)
- `src/lib/supabase/admin.ts` - Supabase admin client using service role key (bypasses RLS)
- `src/lib/ai/prompts.ts` - System prompt with Nuage brand voice, translation prompt builder, TranslationResult type
- `src/lib/ai/translate-product.ts` - translateProduct, translateAndSaveDraft, batchTranslate functions
- `package.json` - Added @anthropic-ai/sdk dependency
- `.env.local` - Added ANTHROPIC_API_KEY placeholder

## Decisions Made

- Used claude-sonnet-4-5-20250929 for translation instead of opus (excellent French writing quality at lower cost)
- No foreign key constraint on scraped_product_id since scraped_products table from Phase 12 may not exist yet
- Created dedicated Supabase admin client (createAdminClient) since curation operations require bypassing RLS
- System prompt written entirely in French to ensure consistent French output quality

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created Supabase admin client**
- **Found during:** Task 1 (data access layer implementation)
- **Issue:** Plan references createAdminClient() but no admin client file existed in the project
- **Fix:** Created src/lib/supabase/admin.ts with service role key authentication
- **Files modified:** src/lib/supabase/admin.ts
- **Verification:** TypeScript compiles, imports resolve correctly
- **Committed in:** 291d0b6 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for data access layer to function. No scope creep.

## Issues Encountered

Pre-existing build errors in src/lib/email.ts and src/lib/users.ts (from prior phases) prevented full `npm run build` verification. TypeScript compiler confirmed no errors in the new files specifically.

## Next Phase Readiness

- AI translation engine and data layer complete, ready for admin review queue (13-02)
- ANTHROPIC_API_KEY needs to be set in .env.local before live translation can work
- product_drafts migration needs to be run on Supabase instance

---
*Phase: 13-ai-curation-automation*
*Completed: 2026-02-11*
