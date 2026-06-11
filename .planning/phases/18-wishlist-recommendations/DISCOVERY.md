# Discovery: Wishlist & Recommendations

**Phase:** 18-wishlist-recommendations
**Discovery Level:** 1 (Quick Verification)
**Date:** 2026-02-12

## Research Question

What's the simplest, most effective approach for product recommendations in a small e-commerce store without requiring ML infrastructure?

## Approaches Evaluated

### Option 1: AI-Powered (Claude/OpenAI API)
**Approach:** Send user profile + browse history to AI, generate personalized recommendations

**Pros:**
- Highly personalized, natural language understanding
- Can consider complex patterns

**Cons:**
- Expensive at scale ($0.01-0.10 per user per request)
- Latency (2-5 seconds per API call)
- Overkill for small catalog (<100 products)

**Verdict:** ❌ Not suitable for MVP

### Option 2: Third-party ML Service (Recombee, Algolia Recommend)
**Approach:** Cloud-based recommendation engine

**Pros:**
- Production-ready algorithms
- Good accuracy

**Cons:**
- Monthly cost ($50-200/mo)
- Vendor lock-in
- Setup complexity

**Verdict:** ❌ Unnecessary for MVP

### Option 3: Content-Based Filtering (SQL)
**Approach:** Recommend products similar to what user has viewed/wishlisted

**Algorithm:**
1. Track user's browse history (product views)
2. Analyze patterns: category preferences, price range affinity
3. Recommend products in preferred categories, similar price range
4. Boost products wishlisted by similar users

**Pros:**
- ✅ Zero external costs (pure SQL)
- ✅ Fast (<100ms queries)
- ✅ Privacy-friendly (no third-party data sharing)
- ✅ Transparent logic
- ✅ Works with small datasets

**Cons:**
- Less sophisticated than ML
- Requires some browse history to work

**Verdict:** ✅ **SELECTED** - Perfect for MVP, can upgrade later

## Recommendation Algorithm Design

### Data Sources

1. **Wishlist** - Explicit product interest
2. **Browse History** - Implicit interest (product page views)
3. **Purchase History** - Strongest signal (from orders table)
4. **Category Affinity** - Most viewed/wishlisted categories
5. **Price Range** - User's typical price range

### Scoring Formula

```sql
recommendation_score =
  (category_match * 3) +        -- Strong signal: same category as interest
  (price_similarity * 2) +      -- Medium signal: similar price range
  (popularity * 1) +            -- Weak signal: trending items
  (wishlist_overlap * 4)        -- Very strong: wishlisted by similar users
```

### Privacy Considerations

- Browse history stored only for authenticated users
- Auto-cleanup: Delete views older than 90 days
- User can disable tracking in preferences (new toggle: `preferences.track_browsing`)
- Clear "How recommendations work" explanation in UI

## Database Schema

### wishlist table
```sql
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
CREATE INDEX idx_wishlist_user ON wishlist(user_id);
CREATE INDEX idx_wishlist_product ON wishlist(product_id);
```

### browse_history table
```sql
CREATE TABLE browse_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_browse_user_time ON browse_history(user_id, viewed_at DESC);

-- Auto-cleanup trigger: Delete views older than 90 days
CREATE OR REPLACE FUNCTION cleanup_old_browse_history()
RETURNS trigger AS $$
BEGIN
  DELETE FROM browse_history WHERE viewed_at < now() - INTERVAL '90 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_browse_history
  AFTER INSERT ON browse_history
  EXECUTE FUNCTION cleanup_old_browse_history();
```

## Implementation Strategy

### Phase 1: Wishlist (Core Feature)
- Wishlist table + RLS policies
- API: GET/POST/DELETE /api/wishlist
- UI: Wishlist page at /compte/wishlist
- Heart button on product cards/pages
- Wishlist count in header icon

### Phase 2: Browse Tracking
- browse_history table with auto-cleanup
- Client-side tracking on product page view
- Privacy preference toggle

### Phase 3: Recommendations
- SQL-based recommendation engine
- GET /api/recommendations endpoint
- UI sections:
  - Homepage: "Recommandé pour vous" (6 products)
  - Product page: "Vous aimerez aussi" (4 products)
  - Wishlist page: "Basé sur vos favoris" (6 products)

## Success Criteria

- ✅ Users can save products to wishlist
- ✅ Wishlist syncs across devices
- ✅ Browse history tracked (with privacy consent)
- ✅ Recommendations feel relevant (>50% category match)
- ✅ Zero external API costs
- ✅ Query performance <100ms

## Next Steps

Break into 3 plans:
1. **Wishlist Feature** (database, API, UI) - Wave 1
2. **Browse Tracking** (database, tracking integration) - Wave 1
3. **Recommendations** (algorithm, API, UI) - Wave 2 (depends on 1+2)

---
**Discovery completed:** 2026-02-12
**Decision:** Use SQL-based content filtering with browse history tracking
