/**
 * Blog post type definitions for the Nuage blog system
 */

import type { Locale } from '@/lib/i18n/config';

export type BlogCategory = 'guide' | 'culture' | 'conseils';

export const categoryLabels: Record<BlogCategory, Record<Locale, string>> = {
  guide: { fr: 'Guides', en: 'Guides' },
  culture: { fr: 'Culture', en: 'Culture' },
  conseils: { fr: 'Conseils', en: 'Tips' },
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
