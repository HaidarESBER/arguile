import { Product } from "@/types/product";
import type { Locale } from "@/lib/i18n/config";

/**
 * Canonical site URL.
 * Driven by NEXT_PUBLIC_SITE_URL so staging/preview deployments can override it.
 * Falls back to the production domain.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://chichanuage.com";

/**
 * Default Open Graph image, as a Next.js metadata `images` entry.
 *
 * Next does NOT merge the parent layout's openGraph.images when a page sets
 * its own `openGraph` object — so any page that overrides openGraph must spread
 * this in, or it ships with no social preview image.
 */
const OG_IMAGE_ALT: Record<Locale, string> = {
  fr: "Nuage — L'art de la détente",
  en: "Nuage — The art of relaxation",
};

export const DEFAULT_OG_IMAGE = {
  url: "/logo.png",
  width: 1200,
  height: 630,
  alt: OG_IMAGE_ALT.fr,
};

/** Locale-aware variant of DEFAULT_OG_IMAGE (alt text localized). */
export function getDefaultOgImage(locale: Locale = "fr") {
  return { ...DEFAULT_OG_IMAGE, alt: OG_IMAGE_ALT[locale] };
}

/**
 * SEO utilities for generating structured data (JSON-LD) and meta tags
 *
 * Implements Schema.org structured data for:
 * - Product pages (Product schema with offers and ratings)
 * - Organization (business info)
 * - Breadcrumbs (navigation hierarchy)
 *
 * Also provides Open Graph and Twitter Card meta tag generation
 */

/** Schema.org Product JSON-LD shape generated for product pages */
export type ProductSchema = {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  image: string[];
  sku: string;
  brand: {
    "@type": string;
    name: string;
  };
  offers: {
    "@type": string;
    price: string;
    priceCurrency: string;
    availability: string;
    url: string;
    priceValidUntil: string;
  };
  aggregateRating?: {
    "@type": string;
    ratingValue: string;
    reviewCount: number;
  };
};

/**
 * Generate Product schema (Schema.org Product)
 * For product detail pages
 */
export function generateProductSchema(product: Product, ratingStats?: {
  averageRating: number;
  totalReviews: number;
}) {
  const schema: ProductSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.shortDescription || product.description,
    "image": product.images,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "Nuage"
    },
    "offers": {
      "@type": "Offer",
      "price": (product.price / 100).toFixed(2),
      "priceCurrency": "EUR",
      "availability": product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "url": `${SITE_URL}/produits/${product.slug}`,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
    }
  };

  // Add aggregate rating if available
  if (ratingStats && ratingStats.totalReviews > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": ratingStats.averageRating.toFixed(1),
      "reviewCount": ratingStats.totalReviews
    };
  }

  return schema;
}

/**
 * Generate Organization schema (for root layout)
 * Business information and branding
 */
const ORGANIZATION_DESCRIPTION: Record<Locale, string> = {
  fr: "L'art de la détente - Boutique en ligne d'accessoires chicha haut de gamme",
  en: "The art of relaxation - Online store for high-end hookah accessories",
};

export function generateOrganizationSchema(locale: Locale = "fr") {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Nuage",
    "description": ORGANIZATION_DESCRIPTION[locale],
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "areaServed": "FR",
      "availableLanguage": "French"
    },
    "sameAs": [
      // Placeholder for future social media links
      // "https://facebook.com/nuage",
      // "https://instagram.com/nuage"
    ]
  };
}

/**
 * Generate Breadcrumb schema
 * For product pages to show navigation hierarchy
 */
export function generateBreadcrumbSchema(items: Array<{
  name: string;
  url: string;
}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${SITE_URL}${item.url}`
    }))
  };
}

/** Open Graph meta tags generated for social sharing */
export type OpenGraphTags = {
  "og:title": string;
  "og:description": string;
  "og:url": string;
  "og:type": string;
  "og:locale": string;
  "og:image"?: string;
  "og:image:alt"?: string;
  "og:image:width"?: number;
  "og:image:height"?: number;
  "og:image:type"?: string;
  "og:price:amount"?: string;
  "og:price:currency"?: string;
};

/**
 * Generate Open Graph meta tags for social sharing
 */
export function generateOpenGraphTags(config: {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: "website" | "product";
  price?: number;
  currency?: string;
  imageWidth?: number;
  imageHeight?: number;
  /** Visitor locale; drives og:locale (defaults to French). */
  locale?: Locale;
}) {
  const tags: OpenGraphTags = {
    "og:title": config.title,
    "og:description": config.description,
    "og:url": config.url,
    "og:type": config.type || "website",
    "og:locale": config.locale === "en" ? "en_US" : "fr_FR",
  };

  if (config.image) {
    // Ensure absolute URL
    const imageUrl = config.image.startsWith('http')
      ? config.image
      : `${SITE_URL}${config.image}`;

    tags["og:image"] = imageUrl;
    tags["og:image:alt"] = config.title;

    // Add image dimensions if provided (recommended 1200x630 for optimal display)
    if (config.imageWidth) {
      tags["og:image:width"] = config.imageWidth;
    }
    if (config.imageHeight) {
      tags["og:image:height"] = config.imageHeight;
    }

    // Add image type if we can infer it
    if (imageUrl.endsWith('.jpg') || imageUrl.endsWith('.jpeg')) {
      tags["og:image:type"] = "image/jpeg";
    } else if (imageUrl.endsWith('.png')) {
      tags["og:image:type"] = "image/png";
    } else if (imageUrl.endsWith('.webp')) {
      tags["og:image:type"] = "image/webp";
    }
  }

  if (config.type === "product" && config.price !== undefined) {
    tags["og:price:amount"] = (config.price / 100).toFixed(2);
    tags["og:price:currency"] = config.currency || "EUR";
  }

  return tags;
}

/** Twitter Card meta tags */
export type TwitterCardTags = {
  "twitter:card": string;
  "twitter:title": string;
  "twitter:description": string;
  "twitter:image"?: string;
};

/**
 * Generate Twitter Card meta tags
 */
export function generateTwitterCardTags(config: {
  title: string;
  description: string;
  image?: string;
}) {
  const tags: TwitterCardTags = {
    "twitter:card": "summary_large_image",
    "twitter:title": config.title,
    "twitter:description": config.description,
  };

  if (config.image) {
    tags["twitter:image"] = config.image;
  }

  return tags;
}

/**
 * Generate Article schema (Schema.org Article) for blog posts
 * Returns a JSON-LD object with XSS-safe serialization
 */
export function generateArticleSchema(config: {
  title: string;
  description: string;
  date: string;
  author?: string;
  image?: string;
  slug: string;
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": config.title,
    "description": config.description,
    "author": {
      "@type": "Organization",
      "name": config.author || "Nuage",
    },
    "datePublished": config.date,
    "publisher": {
      "@type": "Organization",
      "name": "Nuage",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`,
      },
    },
    "url": `${SITE_URL}/blog/${config.slug}`,
  };

  if (config.image) {
    schema["image"] = config.image;
  }

  return schema;
}

/**
 * Safely serialize a JSON-LD schema object to a string.
 * Replaces < with unicode escape to prevent XSS via script injection.
 */
export function safeJsonLd(schema: Record<string, unknown>): string {
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}

/**
 * Generate WebSite schema with SearchAction for Google sitelinks search box
 * Placed on homepage to enable search box in Google search results
 */
const WEBSITE_DESCRIPTION: Record<Locale, string> = {
  fr: "Boutique en ligne d'accessoires chicha haut de gamme",
  en: "Online store for high-end hookah accessories",
};

export function generateWebSiteSchema(locale: Locale = "fr") {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Nuage",
    "url": SITE_URL,
    "description": WEBSITE_DESCRIPTION[locale],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/produits?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Generate ItemList schema for product collections
 * Used by homepage featured products and category pages
 * Limits to first 10 items to keep JSON-LD payload reasonable
 */
export function generateItemListSchema(products: Array<{
  name: string;
  url: string;
  image?: string;
  price: number;
}>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "numberOfItems": products.length,
    "itemListElement": products.slice(0, 10).map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": product.url,
      "name": product.name,
      "image": product.image,
    }))
  };
}

/**
 * Helper to inject JSON-LD script tag
 * Usage in Next.js metadata API:
 *   <script type="application/ld+json">{JSON.stringify(schema)}</script>
 */
export function jsonLdScriptProps(schema: Record<string, unknown>) {
  return {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(schema) }
  };
}
