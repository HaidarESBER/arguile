---
phase: 25-promotions-discount-codes
plan: 01
subsystem: database, api, ui
tags: [supabase, promotions, discount-codes, rls, server-actions, admin]

# Dependency graph
requires:
  - phase: 09-supabase-migration-auth
    provides: createAdminClient, profiles table for RLS, database patterns
  - phase: 10-stripe-checkout
    provides: orders table with discount_code/discount_amount columns
provides:
  - Promotions Supabase table with RLS policies
  - Promotion TypeScript types with calculateDiscount and formatDiscount helpers
  - Server-side CRUD library (getPromotions, createPromotion, updatePromotion, deletePromotion, validatePromotion, incrementPromotionUses)
  - Admin promotions management page at /admin/promotions
  - Server actions for promotion CRUD operations
affects: [checkout-integration, cart-discount-application, email-marketing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Promotions CRUD with snake_case DB mapping (same as orders.ts)"
    - "Inline form pattern for admin create/edit (same page, no modal)"
    - "Server actions with revalidatePath for admin mutations"

key-files:
  created:
    - supabase/migration-promotions.sql
    - src/types/promotion.ts
    - src/lib/promotions.ts
    - src/app/admin/promotions/page.tsx
    - src/app/admin/promotions/actions.ts
    - src/app/admin/promotions/PromotionsClient.tsx
  modified:
    - src/app/admin/layout.tsx

key-decisions:
  - "Cents-based storage for fixed_amount discounts (consistent with existing pricing)"
  - "French error messages in validatePromotion for direct user display"
  - "Client component for inline forms with server actions for mutations"
  - "Fallback increment pattern (rpc then read-update) for incrementPromotionUses"

patterns-established:
  - "Promotion validation pattern: code lookup -> active check -> date range -> usage limits -> minimum order"
  - "Admin inline form pattern: same component for create and edit, toggled by state"

issues-created: []

# Metrics
duration: 8min
completed: 2026-02-13
---

# Phase 25 Plan 01: Promotions Backend & Admin Management Summary

**Supabase promotions table with BIENVENUE10 seed, TypeScript CRUD library with validation, and admin management UI with inline create/edit forms**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-13
- **Completed:** 2026-02-13
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Promotions table with RLS (public read active codes, admin full access) and BIENVENUE10 seed
- Full TypeScript types with calculateDiscount (capped at subtotal) and formatDiscount helpers
- Server-side CRUD library with validatePromotion checking active status, dates, usage limits, minimum order
- Admin page at /admin/promotions with table, inline create/edit forms, toggle, and delete
- Admin sidebar updated with Promotions link (Tag icon)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create promotions table, TypeScript types, and CRUD library** - `7819ccd` (feat)
2. **Task 2: Create admin promotions management page** - `b60fe63` (feat)

## Files Created/Modified
- `supabase/migration-promotions.sql` - Promotions table DDL with RLS and BIENVENUE10 seed
- `src/types/promotion.ts` - Promotion, CreatePromotionData, DiscountType types + calculateDiscount/formatDiscount helpers
- `src/lib/promotions.ts` - Server-side CRUD library with validation (getPromotions, createPromotion, updatePromotion, deletePromotion, validatePromotion, incrementPromotionUses)
- `src/app/admin/promotions/actions.ts` - Server actions: createPromotionAction, updatePromotionAction, togglePromotionAction, deletePromotionAction
- `src/app/admin/promotions/page.tsx` - Server component fetching promotions with admin auth check
- `src/app/admin/promotions/PromotionsClient.tsx` - Client component with table, inline create/edit forms, toggle, delete
- `src/app/admin/layout.tsx` - Added Promotions link with Tag icon to admin sidebar

## Decisions Made
- Cents-based storage for fixed_amount discounts (1000 = 10.00 EUR), consistent with existing pricing patterns across the codebase
- French error messages in validatePromotion for direct display to users without translation layer
- Client component pattern for admin page (inline forms need state), with server actions for all mutations
- Fallback increment pattern in incrementPromotionUses: attempts RPC first, falls back to read-then-update if RPC not available

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## Next Phase Readiness
- Promotions backend ready for checkout integration (Plan 25-02)
- calculateDiscount and validatePromotion functions ready for cart/checkout flow
- incrementPromotionUses ready to be called after successful order
- Admin can manage all promotion codes from /admin/promotions

---
*Phase: 25-promotions-discount-codes*
*Completed: 2026-02-13*
