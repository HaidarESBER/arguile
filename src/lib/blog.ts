import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { BlogPostMeta, BlogCategory } from '@/types/blog';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';

// French posts live at the root of content/blog; translations live in a
// subdirectory per locale (content/blog/en/<same-slug>.mdx). The French set
// is canonical: slugs/URLs are shared across languages and a missing
// translation falls back to the French original.
const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

const READING_TIME_LABEL: Record<Locale, (minutes: number) => string> = {
  fr: (minutes) => `${minutes} min de lecture`,
  en: (minutes) => `${minutes} min read`,
};

function localeDir(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? BLOG_DIR : path.join(BLOG_DIR, locale);
}

/**
 * Resolve the file to read for a slug: the translation if it exists,
 * otherwise the French original.
 */
function resolvePostFile(
  slug: string,
  locale: Locale
): { filePath: string; locale: Locale } | null {
  const translated = path.join(localeDir(locale), `${slug}.mdx`);
  if (fs.existsSync(translated)) {
    return { filePath: translated, locale };
  }

  const original = path.join(BLOG_DIR, `${slug}.mdx`);
  if (fs.existsSync(original)) {
    return { filePath: original, locale: DEFAULT_LOCALE };
  }

  return null;
}

/**
 * True if a dedicated translation file exists for this slug+locale
 * (used by the blog post page to pick which MDX module to import).
 */
export function hasTranslatedPost(slug: string, locale: Locale): boolean {
  if (locale === DEFAULT_LOCALE) return false;
  return fs.existsSync(path.join(localeDir(locale), `${slug}.mdx`));
}

function readPost(slug: string, locale: Locale): BlogPostMeta | null {
  const resolved = resolvePostFile(slug, locale);
  if (!resolved) return null;

  const raw = fs.readFileSync(resolved.filePath, 'utf-8');
  const { data, content } = matter(raw);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title,
    description: data.description,
    date: data.date,
    author: data.author || 'Nuage',
    category: (data.category || 'guide') as BlogCategory,
    image: data.image,
    readingTime: READING_TIME_LABEL[locale](Math.ceil(stats.minutes)),
  };
}

/**
 * Get all blog posts sorted by date (newest first).
 * Returns empty array if content directory doesn't exist yet.
 */
export function getAllPosts(locale: Locale = DEFAULT_LOCALE): BlogPostMeta[] {
  return getPostSlugs()
    .map((slug) => readPost(slug, locale))
    .filter((post): post is BlogPostMeta => post !== null)
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

/**
 * Get all post slugs (for generateStaticParams).
 * Slugs come from the canonical French files and are shared by every locale.
 */
export function getPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace('.mdx', ''));
}

/**
 * Get metadata for a single post by slug.
 */
export function getPostBySlug(
  slug: string,
  locale: Locale = DEFAULT_LOCALE
): BlogPostMeta | null {
  if (!fs.existsSync(BLOG_DIR)) {
    return null;
  }

  return readPost(slug, locale);
}
