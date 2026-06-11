import * as cheerio from 'cheerio';
import { SourceAdapter, ScrapeResult } from '@/types/scraper';

/**
 * Generic adapter: fallback for any URL using common HTML patterns
 * Extracts data from Open Graph tags, structured data, and semantic HTML
 */
export const genericAdapter: SourceAdapter = {
  name: 'generic',

  // SourceAdapter passes the URL, but the generic fallback ignores it
  canHandle(): boolean {
    // Generic adapter handles any URL (fallback)
    return true;
  },

  async extract(html: string, url: string): Promise<ScrapeResult> {
    const $ = cheerio.load(html);
    const result: ScrapeResult = {
      name: '',
    };

    // Extract name: og:title -> title tag -> first h1
    result.name =
      $('meta[property="og:title"]').attr('content') ||
      $('title').text() ||
      $('h1').first().text() ||
      'Untitled Product';

    result.name = result.name.trim();

    // Extract description: og:description -> meta description -> first paragraph in main/article
    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      $('main p, article p').first().text() ||
      '';

    if (description) {
      result.description = description.trim();
    }

    // Extract price: look for common patterns
    const priceText = extractPrice($);
    if (priceText) {
      result.priceText = priceText;
    }

    // Extract images: og:image -> product image containers
    const images = extractImages($);
    if (images.length > 0) {
      result.images = images;
    }

    // Extract category: breadcrumbs or JSON-LD
    const category = extractCategory($);
    if (category) {
      result.category = category;
    }

    // Store metadata
    result.metadata = {
      sourceUrl: url,
      extractionMethod: 'generic',
    };

    return result;
  },
};

/**
 * Extract price from common HTML patterns
 */
function extractPrice($: cheerio.CheerioAPI): string | null {
  // Try JSON-LD structured data first
  const jsonLd = $('script[type="application/ld+json"]').toArray();
  for (const script of jsonLd) {
    try {
      const data = JSON.parse($(script).html() || '{}');
      if (data['@type'] === 'Product' && data.offers?.price) {
        const currency = data.offers.priceCurrency || '';
        return `${data.offers.price} ${currency}`.trim();
      }
    } catch {
      // Ignore invalid JSON
    }
  }

  // Try common price class/id patterns
  const priceSelectors = [
    '[class*="price"]:not([class*="compare"]):not([class*="old"])',
    '[id*="price"]',
    '.product-price',
    '#product-price',
    '[itemprop="price"]',
    '.sale-price',
  ];

  for (const selector of priceSelectors) {
    const priceEl = $(selector).first();
    if (priceEl.length > 0) {
      const text = priceEl.text().trim();
      // Check if text contains currency symbols or patterns
      if (/[€$£¥₹]|\d+[.,]\d{2}|EUR|USD|GBP/.test(text)) {
        return text;
      }
    }
  }

  // Try meta tags
  const priceMetaContent =
    $('meta[property="og:price:amount"]').attr('content') ||
    $('meta[property="product:price:amount"]').attr('content');

  if (priceMetaContent) {
    const currency =
      $('meta[property="og:price:currency"]').attr('content') ||
      $('meta[property="product:price:currency"]').attr('content') ||
      '';
    return `${priceMetaContent} ${currency}`.trim();
  }

  return null;
}

/**
 * Extract images from common patterns
 */
function extractImages($: cheerio.CheerioAPI): string[] {
  const images: string[] = [];

  // Try og:image first
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (ogImage && isValidImageUrl(ogImage)) {
    images.push(ogImage);
  }

  // Try product image containers
  const imgElements = $(
    'main img, article img, [class*="product"] img, [class*="gallery"] img, [id*="product"] img'
  ).toArray();

  for (const img of imgElements) {
    const src = $(img).attr('src') || $(img).attr('data-src');
    if (src && isValidImageUrl(src) && !images.includes(src)) {
      // Filter out small images (likely icons/logos)
      const width = $(img).attr('width');
      const height = $(img).attr('height');

      // Skip if explicitly small (< 200px)
      if (width && parseInt(width) < 200) continue;
      if (height && parseInt(height) < 200) continue;

      // Skip common icon/logo patterns
      const alt = $(img).attr('alt') || '';
      const srcLower = src.toLowerCase();
      if (
        srcLower.includes('logo') ||
        srcLower.includes('icon') ||
        alt.toLowerCase().includes('logo')
      ) {
        continue;
      }

      images.push(src);

      // Limit to 10 images
      if (images.length >= 10) break;
    }
  }

  return images;
}

/**
 * Extract category from breadcrumbs or structured data
 */
function extractCategory($: cheerio.CheerioAPI): string | null {
  // Try JSON-LD breadcrumbs
  const jsonLd = $('script[type="application/ld+json"]').toArray();
  for (const script of jsonLd) {
    try {
      const data = JSON.parse($(script).html() || '{}');
      if (data['@type'] === 'BreadcrumbList' && data.itemListElement) {
        // Get the last breadcrumb before the product
        const items = data.itemListElement;
        if (items.length > 1) {
          return items[items.length - 2]?.name || null;
        }
      }
      if (data['@type'] === 'Product' && data.category) {
        return data.category;
      }
    } catch {
      // Ignore invalid JSON
    }
  }

  // Try breadcrumb HTML patterns
  const breadcrumbs = $(
    '[class*="breadcrumb"] a, [id*="breadcrumb"] a, nav[aria-label*="breadcrumb"] a'
  ).toArray();

  if (breadcrumbs.length > 1) {
    // Get second-to-last breadcrumb (last is usually the current product)
    const categoryLink = breadcrumbs[breadcrumbs.length - 2];
    const category = $(categoryLink).text().trim();
    if (category) return category;
  }

  return null;
}

/**
 * Validate image URL
 */
function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  // Must be http(s) URL or absolute path
  if (!url.startsWith('http') && !url.startsWith('/')) return false;
  // Must have image extension or be from known CDN
  const imagePattern = /\.(jpg|jpeg|png|gif|webp|avif)($|\?)/i;
  const cdnPattern = /(cloudinary|imgix|shopify|cdn)/i;
  return imagePattern.test(url) || cdnPattern.test(url);
}
