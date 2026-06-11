---
phase: 14-blog-content-marketing
plan: 01
subsystem: blog
tags: [mdx, next-mdx, gray-matter, reading-time, tailwind-typography, remark-gfm, rehype-slug, schema-dts, json-ld]

# Dependency graph
requires:
  - phase: 08-character-delight
    provides: SEO structured data foundation (seo.ts)
provides:
  - MDX compilation pipeline for blog content
  - Blog post type definitions (BlogPostMeta, BlogCategory)
  - Blog utility functions (getAllPosts, getPostSlugs, getPostBySlug)
  - Article JSON-LD schema generator
  - Tailwind Typography prose styling
affects: [14-02, blog-pages, content-creation]

# Tech tracking
tech-stack:
  added: [@next/mdx, @mdx-js/loader, @mdx-js/react, @types/mdx, gray-matter, reading-time, remark-gfm, rehype-slug, schema-dts, @tailwindcss/typography]
  patterns: [string-based MDX plugins for Turbopack, file-based blog content in content/blog/, frontmatter parsing with gray-matter]

key-files:
  created: [mdx-components.tsx, src/types/blog.ts, src/lib/blog.ts]
  modified: [next.config.ts, src/app/globals.css, src/lib/seo.ts, package.json]

key-decisions:
  - "String-based remark/rehype plugin names for Turbopack compatibility in Next.js 16"
  - "safeJsonLd helper with XSS prevention for Article schema output"

patterns-established:
  - "MDX plugins as string references: remarkPlugins: ['remark-gfm'] instead of direct imports"
  - "Blog content directory: content/blog/ with .mdx files"
  - "Graceful fallback: blog utilities return empty arrays when content dir missing"

issues-created: []

# Metrics
duration: 7min
completed: 2026-02-12
---

# Phase 14 Plan 01: MDX Infrastructure & Blog Utilities Summary

**MDX compilation pipeline with Turbopack-compatible remark/rehype plugins, blog post type system, frontmatter-based listing utilities, and Article JSON-LD schema generator**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-12
- **Completed:** 2026-02-12
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- MDX compilation pipeline configured with @next/mdx, remark-gfm (GFM tables/strikethrough), and rehype-slug (heading IDs)
- mdx-components.tsx at project root with Next.js Image optimization and Link routing for MDX content
- Tailwind Typography plugin loaded via @plugin directive (Tailwind v4 pattern)
- BlogPostMeta interface and BlogCategory type with French category labels
- Blog utility library with getAllPosts (sorted by date), getPostSlugs, getPostBySlug
- Article JSON-LD schema generator with XSS-safe serialization added to seo.ts

## Task Commits

Each task was committed atomically:

1. **Task 1: Install MDX packages and configure Next.js + Tailwind** - `6460afa` (chore)
2. **Task 2: Create blog types, utility library, and Article schema** - `147610a` (feat)

## Files Created/Modified
- `mdx-components.tsx` - Root MDX component overrides (Image optimization, internal Link routing)
- `next.config.ts` - MDX wrapper with createMDX, pageExtensions, string-based plugins
- `src/app/globals.css` - Added @tailwindcss/typography plugin
- `src/types/blog.ts` - BlogPostMeta interface, BlogCategory type, categoryLabels
- `src/lib/blog.ts` - getAllPosts, getPostSlugs, getPostBySlug utilities with gray-matter
- `src/lib/seo.ts` - Added generateArticleSchema and safeJsonLd helper
- `package.json` - 10 new dependencies (9 production, 1 dev)

## Decisions Made
- Used string-based plugin names (`'remark-gfm'` instead of imported `remarkGfm`) for Turbopack compatibility in Next.js 16 -- direct function imports cause "serializable options" error with Turbopack's Rust-based loader
- Added separate `safeJsonLd` helper alongside existing `jsonLdScriptProps` for explicit XSS prevention on Article schema (replaces `<` with `\u003c`)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] String-based MDX plugin names for Turbopack**
- **Found during:** Task 1 (MDX configuration)
- **Issue:** Next.js 16 defaults to Turbopack which requires serializable loader options. Direct remark/rehype plugin imports (functions) caused build error: "loader does not have serializable options"
- **Fix:** Changed from `import remarkGfm` + `remarkPlugins: [remarkGfm]` to `remarkPlugins: ['remark-gfm']` (string reference)
- **Files modified:** next.config.ts
- **Verification:** `npm run build` passes successfully
- **Committed in:** 6460afa (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary adaptation for Next.js 16 Turbopack compatibility. No scope creep.

## Issues Encountered
None

## Next Phase Readiness
- MDX pipeline fully configured and build-verified
- Blog utility functions ready for use in blog page components
- Article JSON-LD schema ready for blog post pages
- Ready for 14-02-PLAN.md (blog pages and content creation)

---
*Phase: 14-blog-content-marketing*
*Completed: 2026-02-12*
