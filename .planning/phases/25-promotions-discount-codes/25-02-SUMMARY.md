---
phase: 25-promotions-discount-codes
plan: 02
subsystem: api, ui, checkout
tags: [discount-codes, checkout, stripe, promotions, exit-intent]

# Dependency graph
requires:
  - phase: 25-promotions-discount-codes
    plan: 01
    provides: promotions table, validatePromotion, calculateDiscount, incrementPromotionUses
  - phase: 10-stripe-checkout
    provides: Stripe checkout session creation, order creation flow
provides:
  - Discount code validation API at /api/promotions/validate
  - DiscountCodeInput checkout component with auto-apply from sessionStorage
  - Discount line in OrderSummary with recalculated total
  - Server-side discount re-validation in checkout API
  - Stripe coupon creation for receipt display
  - ExitIntentModal BIENVENUE10 auto-apply at checkout
affects: [order-records, stripe-receipts, email-marketing-conversion]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server-side discount re-validation in checkout API (never trust client)"
    - "Stripe coupon creation for proper receipt display"
    - "sessionStorage bridge between ExitIntentModal and checkout DiscountCodeInput"

key-files:
  created:
    - src/app/api/promotions/validate/route.ts
    - src/components/checkout/DiscountCodeInput.tsx
  modified:
    - src/components/checkout/CheckoutForm.tsx
    - src/components/checkout/OrderSummary.tsx
    - src/types/checkout.ts
    - src/app/api/checkout/route.ts
    - src/types/order.ts
    - src/lib/orders.ts
    - src/components/marketing/ExitIntentModal.tsx

key-decisions:
  - "Server-side re-validation of discount codes at checkout (never trust client discount amount)"
  - "Stripe.Checkout.SessionCreateParams type for proper TypeScript compatibility"
  - "sessionStorage pendingDiscountCode for ExitIntentModal-to-checkout auto-apply flow"
  - "Fire-and-forget incrementPromotionUses after Stripe session creation"
  - "Graceful coupon creation fallback (if Stripe coupon fails, order total is still correct)"

patterns-established:
  - "sessionStorage bridge pattern for cross-page state (modal -> checkout)"
  - "Stripe coupon-on-the-fly for discount display on receipts"

issues-created: []

# Metrics
duration: 8min
completed: 2026-02-13
---

# Phase 25 Plan 02: Discount Code Checkout Integration Summary

**End-to-end discount code flow from input to Stripe payment with ExitIntentModal auto-apply**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-13
- **Completed:** 2026-02-13
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Discount code validation API at /api/promotions/validate with French error messages
- DiscountCodeInput component with auto-uppercase, success/error states, re-validation on subtotal change
- OrderSummary displays discount line (green "Remise" row) with recalculated total
- CheckoutForm integrates DiscountCodeInput between shipping calculator and payment methods
- Checkout API re-validates discount server-side, calculates verified discount, creates Stripe coupon
- Order records store discount_code and discount_amount in database
- ExitIntentModal's BIENVENUE10 stores in sessionStorage, auto-applies at checkout
- Stripe receipt shows discount via on-the-fly coupon creation

## Task Commits

Each task was committed atomically:

1. **Task 1: Create discount validation API and checkout UI components** - `ceae81f` (feat)
2. **Task 2: Apply discount in checkout API and wire ExitIntentModal** - `25e3b79` (feat)

## Files Created/Modified
- `src/app/api/promotions/validate/route.ts` - POST endpoint validating discount code against subtotal
- `src/components/checkout/DiscountCodeInput.tsx` - Client component with input, auto-apply from sessionStorage, success badge, error display
- `src/components/checkout/CheckoutForm.tsx` - Added discount state, DiscountCodeInput section, passes discount to OrderSummary and onSubmit
- `src/components/checkout/OrderSummary.tsx` - Added optional discount prop, green discount line, defensive total calculation
- `src/types/checkout.ts` - Added discountCode and discountAmount to CheckoutFormData
- `src/app/api/checkout/route.ts` - Server-side discount re-validation, Stripe coupon creation, discount in order and metadata
- `src/types/order.ts` - Added discountCode and discountAmount to Order and CreateOrderData interfaces
- `src/lib/orders.ts` - Added discount fields to toOrder mapping and createOrder insert
- `src/components/marketing/ExitIntentModal.tsx` - Stores BIENVENUE10 in sessionStorage on copy and email submit

## Decisions Made
- Server-side re-validation of discount codes at checkout time (NEVER trust client-side discount amounts), consistent with existing DB-verified pricing pattern
- Stripe.Checkout.SessionCreateParams type instead of Parameters<> utility type for proper TypeScript compatibility with Stripe SDK overloads
- sessionStorage pendingDiscountCode key bridges ExitIntentModal and DiscountCodeInput across page navigation
- Fire-and-forget pattern for incrementPromotionUses after Stripe session creation (non-blocking)
- Graceful fallback if Stripe coupon creation fails (order total is already correct from server calculation)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- TypeScript error with `Parameters<typeof stripe.checkout.sessions.create>[0]` due to Stripe SDK method overloads; resolved by using `Stripe.Checkout.SessionCreateParams` directly

## Next Phase Readiness
- Complete discount code flow operational from input to payment to order record
- BIENVENUE10 works as a real functional discount code with auto-apply from ExitIntentModal
- Ready for Phase 26 (Social Media Integration) or Phase 27 (Email Marketing)

---
*Phase: 25-promotions-discount-codes*
*Completed: 2026-02-13*
