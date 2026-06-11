# Chicha E-Commerce

## What This Is

**Nuage** — A premium e-commerce store for hookah and chicha accessories, targeting the French market. Features a modern minimalist aesthetic with the "Nuage" brand identity, complete shopping flow, and admin panel for order management. Currently using file-based storage, ready for production deployment with database and payment integration.

## Core Value

The brand looks so premium and legitimate that visitors trust it instantly — visual identity drives conversion.

## Requirements

### Validated

- Modern minimalist visual identity — v1.0
- Product catalog for hookah accessories — v1.0
- Curated product selection with quality presentation — v1.0
- Shopping cart and checkout flow — v1.0
- Order management and fulfillment tracking — v1.0
- Mobile-responsive design — v1.0
- French language content — v1.0
- Brand identity (Nuage, L'art de la detente) — v1.0

### Active

- [ ] Payment processing (Stripe France)
- [ ] Real supplier/dropshipping integration
- [ ] Email notifications for orders
- [ ] Legal pages (Mentions legales, CGV, Contact)
- [ ] Admin authentication

### Out of Scope

- Multi-language support — v1 is French only, expansion later
- Loyalty/rewards program — adds complexity, not needed for first sale
- Tobacco products — regulatory complexity, focus on accessories
- Blog/content marketing — can add post-launch
- Multi-vendor marketplace — single brand store model

## Context

**Market:** France has a significant chicha culture. The hookah accessories market in Europe is growing, with Germany being the largest market. Starting in France provides a strong home base before expansion.

**Competition:** Many existing hookah shops look outdated or overly busy. The opportunity is to stand out with a clean, premium presentation that feels more like a lifestyle brand than a smoke shop.

**Dropshipping:** This model requires solid supplier relationships and careful product curation since you don't control inventory directly. Product research and selection will be critical to maintaining the premium feel.

**Visual direction:** Modern minimalist — think high-end lifestyle brand, not traditional smoke shop aesthetic. Clean typography, restrained color palette, quality product photography, editorial presentation.

## Constraints

- **Business model**: Dropshipping — no inventory management, dependent on supplier reliability
- **Regulatory**: No tobacco products — accessories only to avoid regulatory complexity
- **Market**: France-first launch — content and payments must work for French customers

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single brand store (not marketplace) | Unified brand experience, simpler to build and manage | Good |
| Modern minimalist aesthetic | Differentiates from busy/outdated competitors, builds trust | Good |
| France-first launch | Home market, manageable scope, strong chicha culture | Good |
| No tobacco products | Regulatory simplicity, focus on accessories | Good |
| Brand name: Nuage | French for "cloud", elegant, evokes smoke abstractly | Good |
| Prices in cents | Avoids floating-point precision issues | Good |
| File-based JSON storage | Simple MVP, no database needed | Revisit for production |
| Server Actions for CRUD | Next.js 15 pattern, clean API | Good |
| Free shipping for MVP | Simplify launch, can add shipping calc later | Good |
| Static generation for products | Better performance and SEO | Good |

## Current State

**Version:** v1.0 MVP (shipped 2026-02-09)
**Tech stack:** Next.js 15, TypeScript, Tailwind CSS
**LOC:** 4,540 lines TypeScript
**Storage:** File-based JSON (products.ts, orders.json)

**What's working:**
- Complete shopping flow (browse -> cart -> checkout -> confirmation)
- Admin panel with product and order management
- Mobile-responsive design with hamburger menu
- SEO-optimized with meta tags and Open Graph

**Known limitations:**
- No payment processing (orders created as "pending")
- No admin authentication
- File-based storage (not production-ready)
- Placeholder legal pages

---
*Last updated: 2026-02-09 after v1.0 milestone*
