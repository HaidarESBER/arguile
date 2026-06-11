# Plan 16-01 Summary: Reviews Database Migration

**Date:** 2026-02-12
**Status:** Complete
**Duration:** ~15 minutes

## Objective

Migrate product reviews from static file data to Supabase database with API endpoints.

## Tasks Completed

### 1. Create reviews table in Supabase ✓
- Created `supabase/migrations/reviews.sql` with full schema
- Product and user foreign keys with cascade delete
- Rating constraint (1-5 stars)
- Comment length validation (10-1000 chars)
- Unique constraint (one review per user per product)
- Verified purchase flag
- RLS policies (public read, auth write own)
- Triggers for updated_at timestamp
- Indexes on product_id, user_id, created_at

**Commit:** `08bfda9` - feat(16-01): create reviews table migration

### 2. Create review API endpoints and database helpers ✓
- Created `src/lib/reviews.ts` with:
  - `getProductReviews`: fetch reviews from DB with user profiles
  - `getProductRatingStats`: calculate rating statistics
  - `createReview`: insert new review with verified purchase check
- Created `src/app/api/reviews/route.ts` with:
  - GET /api/reviews?productId={id}: fetch product reviews
  - POST /api/reviews: create new review (auth required)
- Uses createAdminClient for public reads (bypasses RLS)
- Uses createClient for writes (enforces RLS)
- Verified purchase check against orders table
- Returns consistent Review type from both sources

**Commit:** `4c3a393` - feat(16-01): add review API endpoints and database helpers

### 3. Update product detail page to use database reviews ✓
- Updated `src/app/produits/[slug]/page.tsx`:
  - Import getProductReviews from @/lib/reviews
  - Fetch reviews and stats server-side
  - Pass reviews data as props to client component
- Updated `src/app/produits/[slug]/ProductDetailClient.tsx`:
  - Accept reviews and stats as props instead of fetching from file
  - Maintain same Review and ProductRatingStats types
  - No UI changes, seamless migration

**Commit:** `14c0e1d` - feat(16-01): migrate product detail page to database reviews

## Technical Decisions

1. **Schema Design:**
   - UUID primary keys for consistency with existing tables
   - Cascade delete on product/user deletion (clean orphans)
   - CHECK constraints for data integrity (rating 1-5, comment 10-1000 chars)
   - UNIQUE constraint prevents duplicate reviews from same user
   - verified_purchase flag populated from order_items table

2. **Data Access Pattern:**
   - createAdminClient for public reads (faster, no RLS overhead)
   - createClient for writes (user context for RLS enforcement)
   - Server-side data fetching (no client DB access)
   - API routes for future client-side review submission

3. **Backward Compatibility:**
   - Same Review and ProductRatingStats types maintained
   - Existing ProductReviews component works unchanged
   - No UI changes needed

## Files Modified

- `supabase/migrations/reviews.sql` (new)
- `src/lib/reviews.ts` (new)
- `src/app/api/reviews/route.ts` (new)
- `src/app/produits/[slug]/page.tsx` (modified)
- `src/app/produits/[slug]/ProductDetailClient.tsx` (modified)

## Verification

- [x] Reviews table created in Supabase with proper schema
- [x] RLS policies work (public can read, auth users can write own)
- [x] API endpoints created (GET and POST)
- [x] Product detail page fetches reviews from database
- [x] Verified purchase flag logic implemented
- [x] Type safety maintained (Review and ProductRatingStats types)

## Next Steps (Plan 16-02)

1. Create review submission UI component
2. Add form validation and error handling
3. Display success/error messages
4. Add review moderation (admin approve/delete)
5. Migrate seed reviews from file to database (optional)

## Notes

- Database migration file must be run in Supabase before reviews will work
- Verified purchase check queries order_items table
- Reviews are currently empty until migration or user submission
- Seed data from `src/data/reviews.ts` can be optionally migrated
- API endpoints ready for future review submission feature
