import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { BlogPostMeta, BlogCategory } from '@/types/blog';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

/**
 * Get all blog posts sorted by date (newest first).
 * Returns empty array if content directory doesn't exist yet.
 */
export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'));

  return files
    .map((filename) => {
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
        category: (data.category || 'guide') as BlogCategory,
        image: data.image,
        readingTime: `${Math.ceil(stats.minutes)} min de lecture`,
      };
    })
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

/**
 * Get all post slugs (for generateStaticParams).
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
export function getPostBySlug(slug: string): BlogPostMeta | null {
  if (!fs.existsSync(BLOG_DIR)) {
    return null;
  }

  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
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
    readingTime: `${Math.ceil(stats.minutes)} min de lecture`,
  };
}
