/**
 * Blog post type definitions for the Nuage blog system
 */

export type BlogCategory = 'guide' | 'culture' | 'conseils';

export const categoryLabels: Record<BlogCategory, string> = {
  guide: 'Guides',
  culture: 'Culture',
  conseils: 'Conseils',
};

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: BlogCategory;
  image?: string;
  readingTime: string;
}
