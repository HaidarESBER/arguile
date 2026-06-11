import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/compte/',
          '/panier',
          '/commande',
          '/suivi/',
          '/desabonnement',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
