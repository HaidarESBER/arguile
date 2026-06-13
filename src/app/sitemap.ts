import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';
import { SITE_URL } from '@/lib/seo';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAllProductSlugs } from '@/lib/products';
import { categorySlugs } from '@/lib/categories';

/**
 * Fetch product slugs with their real last-modified dates.
 * Prefers the DB (slug + updated_at); falls back to getAllProductSlugs()
 * (which itself serves dev fixtures when Supabase is absent) so the sitemap
 * is never silently empty of products.
 */
async function getProductEntries(): Promise<
  Array<{ slug: string; updatedAt?: Date }>
> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('products')
      .select('slug, updated_at');

    if (!error && data && data.length > 0) {
      return (data as Array<{ slug: string; updated_at: string | null }>).map(
        (row) => ({
          slug: row.slug,
          updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
        })
      );
    }
  } catch {
    // fall through to the slug-only source
  }

  // Fallback: slugs only (no dates), works with fixtures / static builds
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // Homepage
  const homepage: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // Products listing
  const productsListing: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/produits`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Category landing pages (/produits/chichas, /produits/charbons, …)
  const categoryPages: MetadataRoute.Sitemap = Object.values(categorySlugs).map(
    (slug) => ({
      url: `${baseUrl}/produits/${slug}`,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  );

  // Product detail pages (real updated_at dates from the database)
  const productEntries = await getProductEntries();
  const productPages: MetadataRoute.Sitemap = productEntries.map((entry) => ({
    url: `${baseUrl}/produits/${entry.slug}`,
    ...(entry.updatedAt ? { lastModified: entry.updatedAt } : {}),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Blog listing page (dated by the most recent post)
  const posts = getAllPosts();
  const latestPostDate = posts.length > 0 ? new Date(posts[0].date) : undefined;
  const blogListing: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog`,
      ...(latestPostDate ? { lastModified: latestPostDate } : {}),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  // Blog posts (real frontmatter dates)
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Legal pages
  const legalPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/cgv`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/mentions-legales`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  return [
    ...homepage,
    ...productsListing,
    ...categoryPages,
    ...productPages,
    ...blogListing,
    ...blogPages,
    ...staticPages,
    ...legalPages,
  ];
}
