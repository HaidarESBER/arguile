# Phase 14: Blog & Content Marketing - Research

**Researched:** 2026-02-12
**Domain:** MDX blog system with Next.js 15 App Router, SEO structured data
**Confidence:** HIGH

<research_summary>
## Summary

Researched the ecosystem for building a blog/content marketing system in Next.js 15 App Router. The standard approach uses `@next/mdx` (official Vercel package) with file-based MDX content, `gray-matter` for frontmatter parsing, and `@tailwindcss/typography` for prose styling.

Key finding: Contentlayer is abandoned (last update March 2024, PRs closed without merge). Velite is the modern alternative but adds unnecessary complexity for a simple blog. `next-mdx-remote` has RSC compatibility issues with Next.js 15.2+. The safest, most stable approach is `@next/mdx` with dynamic imports and `gray-matter` for metadata extraction.

**Primary recommendation:** Use `@next/mdx` + `gray-matter` + `@tailwindcss/typography` stack. Store content in `/content/blog/` directory, use dynamic imports with `generateStaticParams` for SSG, and add JSON-LD Article schema for SEO.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @next/mdx | latest | MDX compilation for Next.js | Official Vercel package, stable, maintained |
| @mdx-js/loader | latest | Webpack loader for MDX | Required by @next/mdx |
| @mdx-js/react | latest | React MDX provider | Required by @next/mdx |
| @types/mdx | latest | TypeScript types for MDX | Type safety for MDX imports |
| gray-matter | ^4.0 | YAML frontmatter parsing | De facto standard, works with any file content |
| reading-time | ^1.5 | Reading time estimation | Simple, accurate word-count based estimation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tailwindcss/typography | ^0.5 | Prose styling for rendered markdown | Always — provides beautiful default typography |
| remark-gfm | ^4.0 | GitHub Flavored Markdown (tables, strikethrough) | Always — standard markdown extensions |
| rehype-slug | ^6.0 | Add IDs to headings | For anchor links and TOC |
| rehype-autolink-headings | ^7.0 | Add anchor links to headings | For shareable heading links |
| rehype-pretty-code | ^0.13 | Syntax highlighting with Shiki | If blog has code snippets |
| schema-dts | ^1.1 | TypeScript types for JSON-LD | Type-safe structured data |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @next/mdx | Velite | Velite adds build step complexity, more features than needed for simple blog |
| @next/mdx | next-mdx-remote | RSC compatibility issues with Next.js 15.2+, reported broken |
| @next/mdx | Contentlayer | ABANDONED — last updated March 2024, PRs closed without merge |
| gray-matter | MDX exports | MDX exports work but require `export const metadata = {}` in every file instead of YAML frontmatter |
| rehype-pretty-code | rehype-highlight | rehype-pretty-code uses Shiki (better themes), rehype-highlight uses highlight.js (lighter) |

**Installation:**
```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react @types/mdx gray-matter reading-time remark-gfm rehype-slug rehype-autolink-headings schema-dts
npm install -D @tailwindcss/typography
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
content/
└── blog/                    # MDX blog posts
    ├── guide-chicha.mdx     # Each post is an MDX file
    ├── entretien-hookah.mdx
    └── culture-chicha.mdx
src/
├── app/
│   └── blog/
│       ├── page.tsx         # Blog index (list all posts)
│       ├── [slug]/
│       │   └── page.tsx     # Individual blog post (dynamic import)
│       └── layout.tsx       # Shared blog layout with prose styling
├── lib/
│   └── blog.ts              # Blog utilities (list posts, get metadata)
└── types/
    └── blog.ts              # Blog post type definitions
mdx-components.tsx           # Global MDX component overrides (required)
```

### Pattern 1: Dynamic MDX Imports with generateStaticParams
**What:** Load MDX content at build time using dynamic imports, pre-render all blog routes
**When to use:** Always — this is the recommended Next.js 15 pattern
**Example:**
```typescript
// Source: Next.js official MDX docs (2026-02-11)
// app/blog/[slug]/page.tsx
export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const { default: Post, metadata } = await import(`@/content/blog/${slug}.mdx`);

  return (
    <article>
      <h1>{metadata.title}</h1>
      <Post />
    </article>
  );
}

export function generateStaticParams() {
  // List all blog post slugs for SSG
  return [
    { slug: 'guide-chicha' },
    { slug: 'entretien-hookah' },
  ];
}

export const dynamicParams = false;
```

### Pattern 2: Frontmatter with gray-matter + MDX exports
**What:** Use gray-matter to parse YAML frontmatter from MDX files server-side for the blog index, and MDX exports for individual post metadata
**When to use:** For blog listing page that needs to read all post metadata without importing every MDX file
**Example:**
```typescript
// lib/blog.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  image?: string;
  readingTime: string;
}

export function getAllPosts(): BlogPostMeta[] {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'));

  return files.map(filename => {
    const slug = filename.replace('.mdx', '');
    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8');
    const { data, content } = matter(raw);
    const stats = readingTime(content);

    return {
      slug,
      title: data.title,
      description: data.description,
      date: data.date,
      author: data.author || 'Nuage',
      category: data.category || 'guide',
      image: data.image,
      readingTime: stats.text,
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
```

### Pattern 3: JSON-LD Article Schema for Blog SEO
**What:** Add structured data to blog posts for rich search results
**When to use:** Every blog post page
**Example:**
```typescript
// Source: Next.js official JSON-LD docs (2026-02-11)
// In blog post page component:
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: metadata.title,
  description: metadata.description,
  author: {
    '@type': 'Organization',
    name: 'Nuage',
  },
  datePublished: metadata.date,
  image: metadata.image,
};

return (
  <article>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
      }}
    />
    <Post />
  </article>
);
```

### Pattern 4: Tailwind Typography for Blog Content
**What:** Use prose classes for beautiful typography in rendered MDX
**When to use:** Blog layout wrapper
**Example:**
```typescript
// Source: Next.js MDX docs + Tailwind Typography
// app/blog/layout.tsx
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose prose-lg prose-headings:font-heading prose-headings:text-primary prose-a:text-accent max-w-3xl mx-auto px-4 py-8">
      {children}
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Using Contentlayer:** Abandoned project, will break with future Next.js updates
- **Using next-mdx-remote with RSC:** Known compatibility issues with Next.js 15.2+
- **Storing blog content in database:** Overkill for a marketing blog — file-based MDX is simpler, version-controlled, and generates static pages
- **Custom markdown-to-HTML pipeline:** @next/mdx handles this correctly, don't rebuild it
- **Loading MDX content client-side:** Always render MDX server-side for SEO and performance
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown typography | Custom CSS for every element | @tailwindcss/typography | Handles 40+ HTML elements with proper spacing, sizes, colors |
| Frontmatter parsing | Manual YAML extraction regex | gray-matter | Handles edge cases, encoding, delimiters correctly |
| Reading time | Custom word count logic | reading-time | Accounts for code blocks, images, CJK characters |
| Syntax highlighting | Custom tokenizer | rehype-pretty-code (Shiki) | Proper language detection, theme support, line highlighting |
| Heading anchor links | Manual ID generation | rehype-slug + rehype-autolink-headings | Handles duplicate headings, special characters, unicode |
| JSON-LD types | Manual schema objects | schema-dts | Type-safe, autocomplete, catches schema errors at build time |
| Blog post listing | Manual file reading + parsing | gray-matter + fs.readdirSync | gray-matter extracts frontmatter cleanly from any file |

**Key insight:** A blog looks simple but typography, frontmatter, syntax highlighting, and SEO structured data each have dozens of edge cases. The existing libraries handle all of them.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Contentlayer or next-mdx-remote Dependency
**What goes wrong:** Build breaks after Next.js update, no fix available
**Why it happens:** Contentlayer abandoned (March 2024), next-mdx-remote has RSC issues with Next.js 15.2+
**How to avoid:** Use @next/mdx (official, maintained by Vercel)
**Warning signs:** Deprecation warnings, GitHub issues with no responses

### Pitfall 2: MDX Remote Code Execution
**What goes wrong:** Malicious content in MDX files executes arbitrary JavaScript
**Why it happens:** MDX compiles to JavaScript and runs server-side
**How to avoid:** Only use trusted MDX content (local files, not user-submitted). Never load MDX from untrusted sources.
**Warning signs:** User-editable MDX, remote MDX from APIs

### Pitfall 3: Missing mdx-components.tsx
**What goes wrong:** MDX files fail to render, cryptic build errors
**Why it happens:** @next/mdx requires mdx-components.tsx at project root (App Router requirement)
**How to avoid:** Create mdx-components.tsx immediately when setting up @next/mdx
**Warning signs:** "Cannot find mdx-components" errors

### Pitfall 4: JSON-LD Duplicate Rendering
**What goes wrong:** Structured data renders twice (SSR + hydration), confusing Google's validator
**Why it happens:** Script tag in server component renders on server, then hydrates on client
**How to avoid:** Render JSON-LD only in server components (not client components). Use `dangerouslySetInnerHTML` with XSS sanitization (replace `<` with `\u003c`).
**Warning signs:** Google Rich Results Test showing duplicate structured data

### Pitfall 5: @next/mdx Frontmatter Confusion
**What goes wrong:** YAML frontmatter renders as text instead of being parsed
**Why it happens:** @next/mdx doesn't natively support YAML frontmatter — it needs remark-frontmatter plugin or gray-matter extraction
**How to avoid:** Either use `export const metadata = {}` in MDX files, or use gray-matter to strip frontmatter before compilation (for index page), and remark-frontmatter plugin to suppress rendering
**Warning signs:** `---` and YAML content visible in rendered blog post
</common_pitfalls>

<code_examples>
## Code Examples

### MDX Blog Post with Exported Metadata
```mdx
// Source: Next.js official MDX docs
// content/blog/guide-chicha.mdx

export const metadata = {
  title: "Guide Complet de la Chicha",
  description: "Tout ce que vous devez savoir pour une experience chicha parfaite.",
  date: "2026-02-15",
  author: "Nuage",
  category: "guide",
  image: "/images/blog/guide-chicha.jpg",
}

# Guide Complet de la Chicha

Bienvenue dans notre guide complet...
```

### Next.js Config for MDX with Plugins
```typescript
// Source: Next.js MDX docs (2026-02-11)
// next.config.ts
import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // ... existing config
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
  },
});

export default withMDX(nextConfig);
```

### Blog Index Page with Metadata Listing
```typescript
// Source: Community pattern verified with Next.js docs
// app/blog/page.tsx
import { getAllPosts } from '@/lib/blog';
import Link from 'next/link';

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div>
      <h1>Le Blog Nuage</h1>
      {posts.map(post => (
        <article key={post.slug}>
          <Link href={`/blog/${post.slug}`}>
            <h2>{post.title}</h2>
          </Link>
          <p>{post.description}</p>
          <span>{post.readingTime} · {post.date}</span>
        </article>
      ))}
    </div>
  );
}
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Contentlayer | Velite or @next/mdx | 2024 (Contentlayer abandoned) | Must use alternatives |
| next-mdx-remote serialize/render | @next/mdx dynamic imports | 2024-2025 (RSC issues) | Simpler, no serialization step |
| next-seo package for JSON-LD | Native `<script>` tag in server components | Next.js 13+ | No external dependency needed |
| Custom MDX pipeline | @next/mdx with remark/rehype plugins | Stable since Next.js 13 | Official, maintained |
| Pages Router blog | App Router with generateStaticParams | Next.js 13+ | Better SSG, metadata API |

**New tools/patterns to consider:**
- **Experimental Rust MDX compiler:** `mdxRs: true` in next.config — faster compilation but not production-ready
- **Turbopack MDX support:** Specify plugins as strings instead of imports for Turbopack compatibility
- **schema-dts:** Type-safe JSON-LD — catches schema errors at build time

**Deprecated/outdated:**
- **Contentlayer:** Abandoned, no longer maintained
- **next-mdx-remote with RSC:** Known breaking issues with Next.js 15.2+
- **next-seo:** Not needed for App Router — use native metadata API + manual JSON-LD
</sota_updates>

<open_questions>
## Open Questions

1. **Tailwind CSS v4 Typography Plugin**
   - What we know: Project uses Tailwind CSS. @tailwindcss/typography v0.5 works with Tailwind v3.
   - What's unclear: If project uses Tailwind v4, typography plugin integration may differ
   - Recommendation: Check current Tailwind version during planning, adjust plugin setup accordingly

2. **Blog Image Optimization**
   - What we know: Next.js Image component handles optimization. MDX can use custom img components.
   - What's unclear: Whether blog post images should be in /public or use external URLs
   - Recommendation: Use /public/images/blog/ for editorial images, configure mdx-components.tsx to replace img with Next.js Image component
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- [Next.js MDX Guide](https://nextjs.org/docs/app/guides/mdx) — Official docs, last updated 2026-02-11
- [Next.js JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld) — Official docs, last updated 2026-02-11

### Secondary (MEDIUM confidence)
- [Contentlayer Abandonment Analysis](https://www.wisp.blog/blog/contentlayer-has-been-abandoned-what-are-the-alternatives) — Verified against Contentlayer GitHub activity
- [Velite as Contentlayer Alternative](https://www.mikevpeeren.nl/blog/refactoring-contentlayer-to-velite) — Verified against Velite GitHub
- [next-mdx-remote RSC Issues](https://github.com/hashicorp/next-mdx-remote/issues/488) — GitHub issue, confirmed with Next.js 15.2.x

### Tertiary (LOW confidence - needs validation)
- None — all findings verified with official or primary sources
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: @next/mdx with Next.js 15 App Router
- Ecosystem: gray-matter, reading-time, @tailwindcss/typography, remark/rehype plugins
- Patterns: Dynamic MDX imports, generateStaticParams SSG, JSON-LD Article schema
- Pitfalls: Contentlayer abandonment, next-mdx-remote RSC issues, frontmatter handling

**Confidence breakdown:**
- Standard stack: HIGH — verified with Next.js official docs (2026-02-11)
- Architecture: HIGH — from official Next.js MDX guide examples
- Pitfalls: HIGH — verified via GitHub issues and official deprecation notices
- Code examples: HIGH — from official Next.js documentation

**Research date:** 2026-02-12
**Valid until:** 2026-03-12 (30 days — Next.js MDX ecosystem stable)
</metadata>

---

*Phase: 14-blog-content-marketing*
*Research completed: 2026-02-12*
*Ready for planning: yes*
