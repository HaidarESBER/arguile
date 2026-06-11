# Test Suite Documentation

## Overview

The project uses [Vitest](https://vitest.dev/) v4.0.18 as its test framework. The suite contains **182 tests** across **13 test files**, covering all business logic, data utilities, type helpers, and database operations.

```
npm test          # Run all tests once
npm run test:watch  # Run tests in watch mode
```

---

## Configuration

**File:** `vitest.config.ts`

- **Path alias:** `@` resolves to `./src` (mirrors `tsconfig.json`)
- **Globals:** enabled (`describe`, `it`, `expect` available without imports)
- **Plugin:** `stripDirectives` — removes `"use server"` / `"use client"` directives so server-only modules can be imported in tests

---

## Test Structure

```
__tests__/
  data/
    countries.test.ts        # Country data lookups
    reviews.test.ts          # Product reviews & ratings
  lib/
    orders.test.ts           # Order CRUD (Supabase mocked)
    products.test.ts         # Product CRUD (Supabase mocked)
    products-slugify.test.ts # Slug generation
    seo.test.ts              # SEO schema & meta tags
    shipping.test.ts         # Shipping cost calculations
    users.test.ts            # User lookups (Supabase mocked)
    users-validate.test.ts   # Password validation
  types/
    cart.test.ts             # Cart calculations
    checkout.test.ts         # Form validation (email, phone, postal codes)
    order.test.ts            # Order number generation & line totals
    product.test.ts          # Price formatting
```

---

## Test Files Detail

### `__tests__/data/countries.test.ts` — 10 tests

**Source:** `src/data/countries.ts`
**Mocking:** None

| Describe | Test | What it verifies |
|----------|------|-----------------|
| `getCountryByCode` | returns France for code FR | Lookup by ISO code |
| | returns Germany for code DE | Another lookup |
| | returns Ireland for code IE | Non-Schengen country |
| | returns Switzerland for code CH | Non-EU country |
| | returns undefined for unknown code | Unknown code handling |
| | is case-sensitive | Lowercase codes rejected |
| `EUROPEAN_COUNTRIES` | contains France | Array completeness |
| | has all required fields on every country | Data shape validation |
| | is sorted alphabetically by name | Sorted for UI display |
| | contains all 4 regions | Region coverage (france, eu-schengen, eu-non-schengen, non-eu) |

---

### `__tests__/data/reviews.test.ts` — 18 tests

**Source:** `src/data/reviews.ts`
**Mocking:** `vi.useFakeTimers()` for date-relative tests

| Describe | Test | What it verifies |
|----------|------|-----------------|
| `getProductReviews` | returns reviews for product 1 | Filtering by product ID |
| | returns reviews sorted by date (newest first) | Sort order |
| | returns empty array for unknown product | Edge case |
| | returns correct count for product 2 | Cross-product filtering |
| `getProductRatingStats` | returns null for unknown product | Missing product handling |
| | returns correct stats for product 1 | Average rating & total reviews |
| | has ratingBreakdown that sums to totalReviews | Data integrity check |
| | has correct breakdown for product 1 | Per-star counts |
| | returns correct stats for product 2 | Cross-product stats |
| `formatRelativeDate` | returns "Aujourd'hui" for today | Same-day formatting |
| | returns "Hier" for yesterday | 1-day-ago formatting |
| | returns "Il y a X jours" for 2-6 days | Days formatting |
| | returns "Il y a 1 semaine" for 7 days | Singular week |
| | returns "Il y a X semaines" for 2+ weeks | Plural weeks |
| | returns "Il y a 1 mois" for ~30 days | Singular month |
| | returns "Il y a X mois" for several months | Plural months |
| | returns "Il y a 1 an" for ~365 days | Singular year |
| | returns "Il y a X ans" for multiple years | Plural years |

---

### `__tests__/lib/orders.test.ts` — 14 tests

**Source:** `src/lib/orders.ts`
**Mocking:** Supabase admin client + email service

```typescript
vi.mock("@/lib/supabase/admin")   // Database operations
vi.mock("@/lib/email")            // Email notifications
```

| Describe | Test | What it verifies |
|----------|------|-----------------|
| `createOrder` | creates an order with generated id and order number | Full create flow: number generation + insert + items |
| `getOrderByNumber` | returns order when found | Lookup by order number (e.g. NU-2026-0001) |
| | returns null when not found | Missing order handling |
| `getOrderById` | returns order when found | Lookup by UUID |
| | returns null when not found | Missing order handling |
| `getAllOrders` | returns all orders sorted newest first | Sort order (descending `created_at`) |
| `getOrdersByEmail` | returns orders matching email (case-insensitive) | `ilike` query on `user_email` |
| | returns empty array when no orders match | No results handling |
| `updateOrderStatus` | updates order status | Status transition |
| | sets shippedAt timestamp when shipping | Timestamp auto-set on ship |
| | sets deliveredAt timestamp when delivered | Timestamp auto-set on delivery |
| | throws when order not found | Error propagation |
| `getOrderStats` | returns correct counts by status | Aggregation (pending, processing, shipped, delivered) |
| | returns zeros for empty list | Empty dataset handling |

---

### `__tests__/lib/products.test.ts` — 11 tests

**Source:** `src/lib/products.ts`
**Mocking:** Supabase admin client

```typescript
vi.mock("@/lib/supabase/admin")   // Database operations
```

| Describe | Test | What it verifies |
|----------|------|-----------------|
| `getAllProducts` | returns all products mapped to Product type | snake_case → camelCase mapping |
| | returns empty array on error | Error fallback |
| `getProductById` | returns product when found | Single lookup by ID |
| | returns null on error | Error fallback |
| `getProductBySlug` | returns product when found | Slug-based lookup |
| | returns null when not found | Missing product handling |
| `getAllProductSlugs` | returns all slugs | Static generation helper |
| `deleteProduct` | deletes product without error | Successful delete |
| | throws when delete fails | Error propagation |
| `getProductStats` | returns correct statistics | Counts: total, featured, out-of-stock |
| | returns zeros on error | Error fallback |

---

### `__tests__/lib/products-slugify.test.ts` — 12 tests

**Source:** `src/lib/slugify.ts`
**Mocking:** None

| Describe | Test | What it verifies |
|----------|------|-----------------|
| `slugify` | converts to lowercase | Basic casing |
| | replaces spaces with hyphens | Space handling |
| | removes diacritics | NFD normalization (e.g. e + accent → e) |
| | removes special characters | Non-alphanumeric stripping |
| | collapses multiple hyphens into one | Hyphen deduplication |
| | collapses multiple spaces into one hyphen | Multi-space handling |
| | handles accented characters (French) | Full French accent set |
| | handles mixed diacritics and special chars | Combined edge case |
| | handles empty string | Empty input |
| | handles string with only special characters | All-special input |
| | preserves numbers | Numeric characters kept |
| | handles already-slug-like input | Idempotent behavior |

---

### `__tests__/lib/seo.test.ts` — 22 tests

**Source:** `src/lib/seo.ts`
**Mocking:** None

| Describe | Test | What it verifies |
|----------|------|-----------------|
| `generateProductSchema` | generates valid Product schema with required fields | `@context`, `@type`, `name`, `sku` |
| | uses shortDescription when available | Description source priority |
| | formats price as decimal string | Cents → "49.99" format |
| | sets InStock availability | Schema.org InStock URL |
| | sets OutOfStock availability | Schema.org OutOfStock URL |
| | includes brand as Nuage | Brand object |
| | does not include aggregateRating without ratingStats | Optional field omission |
| | includes aggregateRating when ratingStats provided | Rating value + review count |
| | does not include aggregateRating when totalReviews is 0 | Zero-reviews edge case |
| `generateOrganizationSchema` | generates valid Organization schema | `@context`, `@type`, name, url |
| | includes contact point | Contact type = "Customer Service" |
| `generateBreadcrumbSchema` | generates BreadcrumbList schema | `@type`, item count |
| | positions items starting at 1 | 1-based position numbering |
| | prepends base URL to item urls | Full URL construction |
| `generateOpenGraphTags` | generates basic OG tags | title, description, locale (fr_FR) |
| | defaults type to website | Default og:type |
| | includes image when provided | og:image + og:image:alt |
| | includes price for product type | og:price:amount + og:price:currency |
| `generateTwitterCardTags` | generates summary_large_image card | Card type |
| | includes image when provided | twitter:image |
| | does not include image key when not provided | Optional field omission |
| `jsonLdScriptProps` | returns script tag props with JSON-LD type | `type="application/ld+json"` |

---

### `__tests__/lib/shipping.test.ts` — 19 tests

**Source:** `src/lib/shipping.ts`
**Mocking:** None

| Describe | Test | What it verifies |
|----------|------|-----------------|
| `calculateShippingCost` | returns correct standard rate for france | 590 cents |
| | returns correct express rate for france | 990 cents |
| | returns correct standard rate for eu-schengen | 890 cents |
| | returns correct express rate for eu-schengen | 1490 cents |
| | returns correct standard rate for eu-non-schengen | 1290 cents |
| | returns correct express rate for eu-non-schengen | 1990 cents |
| | returns correct standard rate for non-eu | 1990 cents |
| | returns correct express rate for non-eu | 2990 cents |
| | defaults to standard when no method specified | Default method fallback |
| `formatShippingPrice` | formats cents to euros with two decimals | 590 → "5.90" |
| | formats zero correctly | 0 → "0.00" |
| | formats large amounts | 12345 → "123.45" |
| `shouldShowCustomsWarning` | returns true for non-eu above threshold | Over 150 EUR |
| | returns false for non-eu at exactly threshold | Boundary: exactly 15000 |
| | returns false for non-eu below threshold | Under threshold |
| | returns false for france even above threshold | EU exempt |
| | returns false for eu-schengen even above threshold | EU exempt |
| | returns false for eu-non-schengen even above threshold | EU exempt |
| `getCustomsWarningMessage` | returns a non-empty French warning message | Message content |

---

### `__tests__/lib/users.test.ts` — 6 tests

**Source:** `src/lib/users.ts`
**Mocking:** Supabase server client

```typescript
vi.mock("@/lib/supabase/server")  // Auth-aware client
```

| Describe | Test | What it verifies |
|----------|------|-----------------|
| `getUserById` | returns session for existing user | Profile → UserSession mapping |
| | returns null for non-existent user | Missing user handling |
| | returns isAdmin flag from profile | Admin flag propagation |
| `getUserByEmail` | returns session for existing email | Email-based lookup |
| | returns null for non-existent email | Missing email handling |
| | queries with lowercased and trimmed email | Input normalization |

---

### `__tests__/lib/users-validate.test.ts` — 12 tests

**Source:** `src/lib/password-validation.ts`
**Mocking:** None

| Describe | Test | What it verifies |
|----------|------|-----------------|
| `validatePassword` | accepts a valid strong password | All rules satisfied |
| | rejects password shorter than 12 characters | Min length = 12 |
| | rejects password with exactly 11 characters | Boundary check |
| | accepts password with exactly 12 characters | Boundary check |
| | rejects password without uppercase | Uppercase required |
| | rejects password without lowercase | Lowercase required |
| | rejects password without digit | Digit required |
| | rejects password without special character | Special char required |
| | rejects common password "password123!" | Common password list |
| | rejects common password case-insensitively | Case-insensitive check |
| | rejects "azerty123!" | French keyboard pattern |
| | rejects "admin123!" with sufficient padding | Admin-like passwords |

---

### `__tests__/types/cart.test.ts` — 9 tests

**Source:** `src/types/cart.ts`
**Mocking:** None

| Describe | Test | What it verifies |
|----------|------|-----------------|
| `calculateSubtotal` | sums price * quantity for all items | Multi-item calculation |
| | returns 0 for empty cart | Empty array handling |
| | handles single item | Single item edge case |
| `calculateTotalItems` | sums all quantities | Quantity aggregation |
| | returns 0 for empty cart | Empty array handling |
| | handles single item with quantity 1 | Single item edge case |
| `formatCartTotal` | formats cents to EUR with French locale | Locale-aware formatting |
| | formats zero | Zero value |
| | formats small amount | Sub-euro amount |

---

### `__tests__/types/checkout.test.ts` — 33 tests

**Source:** `src/types/checkout.ts`
**Mocking:** None

| Describe | Test | What it verifies |
|----------|------|-----------------|
| `isValidEmail` | accepts valid email | Standard format |
| | accepts email with subdomain | user@sub.domain.com |
| | rejects email without @ | Missing @ |
| | rejects email without domain | user@ |
| | rejects email without local part | @domain.com |
| | rejects email with spaces | Whitespace rejection |
| | rejects empty string | Empty input |
| `isValidFrenchPostalCode` | accepts valid French postal code | 5 digits (75001) |
| | rejects French postal code with letters | Non-numeric |
| | rejects French postal code with wrong length | Wrong length |
| | accepts valid German postal code | 5 digits |
| | accepts valid Dutch postal code | 4 digits + 2 letters |
| | accepts Dutch postal code without space | Flexible formatting |
| | accepts valid Polish postal code | XX-XXX format |
| | rejects Polish postal code without hyphen | Strict format |
| | accepts valid Portuguese postal code | XXXX-XXX format |
| | accepts valid Irish Eircode | ANN ANNN format |
| | accepts Irish Eircode without space | Flexible formatting |
| | accepts valid Latvian postal code | LV-XXXX format |
| | accepts Latvian postal code case-insensitive | lv-XXXX accepted |
| | accepts valid Lithuanian postal code | LT-XXXXX format |
| | accepts valid Maltese postal code | AAA XXXX format |
| | accepts Maltese postal code without space | Flexible formatting |
| | returns false for unknown country | Unsupported country |
| | trims whitespace from postal code | Input normalization |
| `isValidPhone` | accepts French mobile number | 06/07 format |
| | accepts international format with +33 | International prefix |
| | accepts number with spaces | Flexible formatting |
| | accepts number with dashes | Flexible formatting |
| | accepts number with parentheses | Flexible formatting |
| | rejects too short number | Min length check |
| | rejects empty string | Empty input |
| | rejects letters | Non-numeric rejection |

---

### `__tests__/types/order.test.ts` — 11 tests

**Source:** `src/types/order.ts`
**Mocking:** None

| Describe | Test | What it verifies |
|----------|------|-----------------|
| `generateOrderNumber` | generates first order number for empty list | NU-YYYY-0001 |
| | increments from existing order numbers | Sequential numbering |
| | finds highest number even if unordered | Max detection |
| | ignores order numbers from other years | Year scoping |
| | pads number to 4 digits | Zero padding |
| | handles numbers beyond 4 digits | Overflow handling |
| `generateOrderId` | generates a UUID v4 format string | UUID regex match |
| | generates unique IDs | No collisions |
| `calculateLineTotal` | multiplies price by quantity | Basic multiplication |
| | returns price for quantity of 1 | Identity case |
| | returns 0 for quantity of 0 | Zero quantity |

---

### `__tests__/types/product.test.ts` — 5 tests

**Source:** `src/types/product.ts`
**Mocking:** None

| Describe | Test | What it verifies |
|----------|------|-----------------|
| `formatPrice` | formats cents to EUR with French locale | 4999 → "49,99 EUR" style |
| | formats zero cents | 0 → "0,00 EUR" style |
| | formats whole euros (no cents remainder) | 5000 → "50,00 EUR" style |
| | formats small amounts | 99 → "0,99 EUR" style |
| | formats large amounts | 99999 → "999,99 EUR" style |

---

## Mocking Patterns

### Supabase Query Chain Mocking

Database tests mock the Supabase client at the module level and set up chainable query mocks per test:

```typescript
// Declare mock with vi.hoisted to avoid TDZ issues with vi.mock hoisting
const { mockFrom } = vi.hoisted(() => {
  return { mockFrom: vi.fn() };
});

// Mock the Supabase module
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));
```

Each test then configures the chain for its specific query pattern:

```typescript
// For: supabase.from("table").select("*").eq("id", id).single()
const chain = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: mockRow, error: null }),
};
mockFrom.mockReturnValue(chain);
```

For functions that make multiple Supabase calls (e.g. `createOrder`), use `mockReturnValueOnce` to set up sequential responses:

```typescript
mockFrom
  .mockReturnValueOnce(firstQueryChain)
  .mockReturnValueOnce(secondQueryChain)
  .mockReturnValueOnce(thirdQueryChain);
```

### Fake Timers

Date-sensitive tests use Vitest's fake timer API:

```typescript
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-02-10T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});
```

---

## Coverage by Category

| Category | Files | Tests | Coverage Area |
|----------|-------|-------|---------------|
| **Data utilities** | 2 | 28 | Countries, reviews, ratings |
| **Business logic (mocked)** | 3 | 31 | Orders, products, users (Supabase) |
| **Pure lib functions** | 4 | 65 | Slugify, SEO, shipping, password validation |
| **Type helpers** | 4 | 58 | Cart, checkout, order, product formatting |
| **Total** | **13** | **182** | |
