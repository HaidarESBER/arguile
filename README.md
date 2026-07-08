# chicha-ecommerce (Nuage)

A French-language e-commerce platform for selling hookahs / chichas, built with Next.js (App Router). It pairs a storefront with an automated product-sourcing pipeline, MDX-based content, in-browser search, Stripe checkout, and transactional email.

> This repository is a variant of the Nuage / chicha-ecommerce codebase.

## Tech Stack

- **Framework:** Next.js (App Router) + React + TypeScript
- **Styling:** Tailwind CSS (+ `@tailwindcss/typography`), Framer Motion, canvas-confetti
- **Content:** MDX (`@next/mdx`, `@mdx-js/react`), `gray-matter`, `remark`/`rehype` plugins, `reading-time`
- **Backend / Data:** Supabase (`@supabase/supabase-js`, `@supabase/ssr`), `bcryptjs` for hashing
- **Payments:** Stripe
- **Search:** FlexSearch
- **Email:** Nodemailer + React Email (`@react-email/components`)
- **Sourcing / AI:** Cheerio scraping, `@huggingface/inference`, Playwright (dev), Sharp for image processing
- **PWA:** Serwist (`@serwist/next`)
- **SEO:** `schema-dts` structured data
- **Testing:** Vitest
- **Deployment:** Vercel (`vercel.json`)

## Project Structure

```
src/            Application code (Next.js App Router)
content/        MDX content
data/           Data files
sd-processor/   Product sourcing / image-processing pipeline
scripts/        Utility scripts
supabase/       Supabase config & migrations
public/         Static assets
docs/           Documentation
__tests__/      Vitest tests
```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local   # then fill in the values

# 3. Run the dev server
npm run dev                  # http://localhost:3000
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest test suite |
| `npm run test:watch` | Run tests in watch mode |

## Environment Variables

See `.env.example` for the full list. Expect keys for Supabase, Stripe, and the email/SMTP provider. Copy it to `.env.local` and never commit real secrets.

## Notes

This is a personal project. No license file is currently included.
