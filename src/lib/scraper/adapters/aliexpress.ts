import { SourceAdapter, ScrapeResult, ReviewScrapeResult } from '@/types/scraper';
import { chromium } from 'playwright';

/**
 * AliExpress adapter: extracts product data using Playwright
 * AliExpress uses heavy JavaScript rendering, so we MUST use a headless browser
 */
export const aliexpressAdapter: SourceAdapter = {
  name: 'aliexpress',
  supportsReviewScraping: true,

  canHandle(url: string): boolean {
    return url.includes('aliexpress.com') || url.includes('aliexpress.us');
  },

  async extract(_html: string, url: string): Promise<ScrapeResult> {
    console.log('[AliExpress] Launching browser to scrape product...');

    // Convert special URLs (bundle deals, search results) to standard product page
    let productUrl = url;

    // Extract product ID from various URL formats
    let productId = null;

    // Format 1: Standard item URL (item/12345.html)
    const standardMatch = url.match(/\/item\/(\d+)\.html/);
    if (standardMatch) {
      productId = standardMatch[1];
    }

    // Format 2: Bundle deals or search with productIds parameter
    const productIdsMatch = url.match(/productIds[=%](\d+)/i);
    if (productIdsMatch) {
      productId = productIdsMatch[1];
    }

    // Format 3: x_object_id parameter
    const objectIdMatch = url.match(/x_object_id[:%](\d+)/i);
    if (objectIdMatch) {
      productId = objectIdMatch[1];
    }

    // If we found a product ID but not in standard format, convert to standard URL
    if (productId && !standardMatch) {
      productUrl = `https://www.aliexpress.com/item/${productId}.html`;
      console.log(`[AliExpress] Converted URL to standard format: ${productUrl}`);
    }

    if (!productId) {
      throw new Error('Could not extract product ID from URL. Please use a direct product page URL.');
    }

    const browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'fr-FR',
    });

    const page = await context.newPage();

    try {
      // Navigate with longer timeout and better wait strategy
      await page.goto(productUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      // Wait for page to be ready
      await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
        console.log('[AliExpress] Network idle timeout, continuing anyway...');
      });

      // Log page info
      const pageTitle = await page.title();
      const currentUrl = page.url();
      console.log(`[AliExpress] Page loaded: "${pageTitle}"`);
      console.log(`[AliExpress] Current URL: ${currentUrl}`);

      // Take screenshot for debugging
      try {
        await page.screenshot({ path: 'debug-screenshot.png', fullPage: false });
        console.log('[AliExpress] Screenshot saved to debug-screenshot.png');
      } catch (e) {
        console.log('[AliExpress] Could not save screenshot:', e);
      }

      // Wait for main image to load - try multiple selectors
      const imageSelectors = [
        'img[class*="magnifier"]',
        'img[class*="ImageView"]',
        '[class*="image-view"] img',
        '[class*="slider"] img',
        '.gallery img',
        '.product-image img'
      ];

      let imageFound = false;
      for (const selector of imageSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          console.log(`[AliExpress] Found images with selector: ${selector}`);
          imageFound = true;
          break;
        } catch {
          continue;
        }
      }

      if (!imageFound) {
        console.log('[AliExpress] No image selectors found, will try extraction anyway...');
      }

      // Hover over image area to trigger lazy loading
      try {
        const imageArea = await page.$('[class*="image-view"], [class*="ImageView"], [class*="magnifier"]');
        if (imageArea) {
          await imageArea.hover();
          await page.waitForTimeout(1000);
        }
      } catch {
        console.log('[AliExpress] Could not hover image area');
      }

      // Scroll to load lazy images
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2);
      });
      await page.waitForTimeout(2000);

      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(3000);

      // Try to interact with thumbnail slider to load all images
      try {
        const thumbnails = await page.$$('[class*="thumb"], [class*="thumbnail"]');
        console.log(`[AliExpress] Found ${thumbnails.length} thumbnails, hovering to load...`);
        for (let i = 0; i < Math.min(thumbnails.length, 15); i++) {
          try {
            await thumbnails[i].hover();
            await page.waitForTimeout(200);
          } catch {
            // Continue on hover failure
          }
        }
      } catch {
        console.log('[AliExpress] Could not hover thumbnails');
      }

      await page.waitForTimeout(1000);

      console.log('[AliExpress] Page loaded and scrolled, extracting data...');

      // Debug: Log how many img tags exist
      const imgCount = await page.evaluate(() => document.querySelectorAll('img').length);
      console.log(`[AliExpress] Total <img> tags on page: ${imgCount}`);

      // Debug: Log a sample of image sources
      const sampleImages = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.slice(0, 10).map(img => ({
          src: (img as HTMLImageElement).src?.substring(0, 100),
          class: img.className,
          width: (img as HTMLImageElement).width,
          height: (img as HTMLImageElement).height,
        }));
      });
      console.log('[AliExpress] Sample images on page:', JSON.stringify(sampleImages, null, 2));

      // Extract all data using page.evaluate
      const data = await page.evaluate(() => {
        // Ali-Grabber's URL cleaning function (removes resize parameters)
        const cleanImageUrl = (url: string): string => {
          if (!url || typeof url !== "string") return "";
          // Remove AliExpress resize parameters: image.jpg_220x220.jpg → image.jpg
          return url.replace(/(\.(jpg|jpeg|png|gif|webp))(_.*|\..*)/gi, "$1");
        };

        // Get best image URL from srcset (highest resolution)
        const getBestImageUrl = (img: HTMLImageElement): string => {
          // Try srcset first (contains multiple resolutions)
          if (img.srcset) {
            const sources = img.srcset.split(",");
            // Last entry is usually highest resolution
            const bestSrc = sources[sources.length - 1].trim().split(" ")[0];
            return bestSrc;
          }
          // Check data-src (lazy loading) then fall back to src
          return img.dataset.src || img.src || "";
        };

        // Extract product ID from URL
        const idMatch = window.location.href.match(/\/item\/(\d+)\.html/);
        const externalId = idMatch ? idMatch[1] : null;

        // Extract title
        const h1Element = document.querySelector('h1');
        const title = h1Element?.textContent?.trim() || document.title.split('-')[0]?.trim() || 'AliExpress Product';

        // Extract description - try multiple strategies
        let description = '';

        // Strategy 1: Product description section
        const descSelectors = [
          'div[class*="product-description"]',
          'div[class*="description--origin"]',
          'div[class*="detail-desc"]',
          '[class*="product-info"]',
          '[class*="ProductDescription"]',
        ];

        for (const selector of descSelectors) {
          const elem = document.querySelector(selector);
          if (elem) {
            const text = elem.textContent?.trim() || '';
            if (text.length > 50) {
              description = text.substring(0, 2000);
              console.log(`[Extractor] Found description with: ${selector} (${description.length} chars)`);
              break;
            }
          }
        }

        // Strategy 2: Get text from product specs/features
        if (!description || description.length < 50) {
          const specsElem = document.querySelector('[class*="specification"], [class*="product-prop"]');
          if (specsElem) {
            description = specsElem.textContent?.trim().substring(0, 2000) || '';
            console.log(`[Extractor] Found description from specs (${description.length} chars)`);
          }
        }

        // Fallback: meta description
        if (!description || description.length < 50) {
          description = document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
          console.log(`[Extractor] Using meta description (${description.length} chars)`);
        }

        // Extract price
        let priceText = '';
        const priceElem = document.querySelector('[class*="price"]');
        if (priceElem) {
          const text = priceElem.textContent?.trim() || '';
          const priceMatch = text.match(/([$€£¥₽]\s*[\d,]+(?:\.\d{2})?)/);
          if (priceMatch) priceText = priceMatch[1];
        }

        // === ALI-GRABBER PROVEN IMAGE EXTRACTION STRATEGY ===
        const images: string[] = [];
        const seenUrls = new Set<string>();

        console.log('[Extractor] Starting ali-grabber image extraction...');

        // Helper to add unique images
        const addImage = (url: string) => {
          if (url && !url.startsWith('data:image') && !seenUrls.has(url)) {
            const cleaned = cleanImageUrl(url);
            if (cleaned && cleaned.length > 20) {
              images.push(cleaned);
              seenUrls.add(cleaned);
              console.log(`[Extractor] Added image: ${cleaned.substring(0, 80)}...`);
            }
          }
        };

        // STRATEGY 1: Main Product Slider/Gallery Images (Ali-Grabber's selector)
        console.log('[Extractor] Looking for main slider images...');
        const sliderImages = document.querySelectorAll('div[class*="slider--img"] img');
        console.log(`[Extractor] Found ${sliderImages.length} slider images`);

        sliderImages.forEach((img) => {
          const imgEl = img as HTMLImageElement;
          const bestUrl = getBestImageUrl(imgEl);
          addImage(bestUrl);
        });

        // STRATEGY 2: Product Description Images (Ali-Grabber's selector)
        console.log('[Extractor] Looking for description images...');
        const descriptionContainer = document.querySelector(
          'div[class*="description--origin-part"], div[class*="detail-desc-decorate-richtext"]'
        );

        if (descriptionContainer) {
          console.log('[Extractor] Found description container');
          const descriptionImages = descriptionContainer.querySelectorAll('img');
          console.log(`[Extractor] Found ${descriptionImages.length} description images`);

          descriptionImages.forEach((img) => {
            const imgEl = img as HTMLImageElement;
            const imageUrl = getBestImageUrl(imgEl);
            addImage(imageUrl);
          });
        }

        // STRATEGY 3: Fallback - try other gallery selectors
        if (images.length === 0) {
          console.log('[Extractor] No images found, trying fallback selectors...');
          const fallbackSelectors = [
            'div[class*="image-view"] img',
            'div[class*="ImageView"] img',
            'div[class*="gallery"] img',
            '[class*="product-image"] img',
            '[class*="product-img"] img',
            '.ae-image-view img',
            '.images-view-item img',
          ];

          for (const selector of fallbackSelectors) {
            const imgs = document.querySelectorAll(selector);
            if (imgs.length > 0) {
              console.log(`[Extractor] Fallback found ${imgs.length} images with: ${selector}`);
              imgs.forEach((img) => {
                const imgEl = img as HTMLImageElement;
                const url = getBestImageUrl(imgEl);
                addImage(url);
              });
              if (images.length > 0) break;
            }
          }
        }

        // STRATEGY 4: Last resort - grab all large images on the page
        if (images.length === 0) {
          console.log('[Extractor] Still no images, grabbing all large images...');
          const allImages = document.querySelectorAll('img');
          allImages.forEach((img) => {
            const imgEl = img as HTMLImageElement;
            // Only grab images that are reasonably sized (likely product images)
            if (imgEl.width >= 200 && imgEl.height >= 200) {
              const url = getBestImageUrl(imgEl);
              if (url.includes('aliexpress') || url.includes('alicdn')) {
                addImage(url);
              }
            }
          });
          console.log(`[Extractor] Grabbed ${images.length} large images`);
        }

        console.log(`[Extractor] Final image count: ${images.length}`);

        // Extract category from breadcrumbs
        let category = null;
        const breadcrumbLinks = document.querySelectorAll('[class*="breadcrumb"] a');
        if (breadcrumbLinks.length > 1) {
          category = breadcrumbLinks[breadcrumbLinks.length - 2]?.textContent?.trim() || null;
        }

        console.log(`[Extractor] === EXTRACTION COMPLETE ===`);
        console.log(`[Extractor] Title: ${title.substring(0, 50)}...`);
        console.log(`[Extractor] Images: ${images.length}`);
        console.log(`[Extractor] Price: ${priceText}`);
        console.log(`[Extractor] Description length: ${description.length}`);
        console.log(`[Extractor] Category: ${category}`);

        return {
          externalId,
          title,
          description,
          priceText,
          images,
          category,
        };
      });

      console.log(`[AliExpress] Successfully extracted: ${data.title.substring(0, 50)}..., ${data.images.length} images`);

      return {
        name: data.title,
        description: data.description || undefined,
        priceText: data.priceText || undefined,
        images: data.images,
        category: data.category || undefined,
        externalId: data.externalId || undefined,
        metadata: {
          extractionMethod: 'playwright',
          imagesFound: data.images.length,
        },
      };
    } catch (error) {
      console.error('[AliExpress] Scraping error:', error);
      throw error;
    } finally {
      await browser.close();
      console.log('[AliExpress] Browser closed');
    }
  },

  /**
   * Extract reviews from AliExpress using DIRECT API (sudheer-ranga method)
   */
  async extractReviews(_html: string, url: string): Promise<ReviewScrapeResult[]> {
    console.log('[AliExpress] === FETCHING REVIEWS VIA API ===');

    // Extract product ID
    let productId = null;
    const standardMatch = url.match(/\/item\/(\d+)\.html/);
    const productIdsMatch = url.match(/productIds[=%](\d+)/i);
    const objectIdMatch = url.match(/x_object_id[:%](\d+)/i);

    if (standardMatch) productId = standardMatch[1];
    else if (productIdsMatch) productId = productIdsMatch[1];
    else if (objectIdMatch) productId = objectIdMatch[1];

    if (!productId) {
      console.log('[AliExpress] Could not extract product ID for reviews');
      return [];
    }

    console.log(`[AliExpress] Fetching reviews for product: ${productId}`);

    const reviews: ReviewScrapeResult[] = [];
    const maxPages = 5; // Fetch up to 5 pages (100 reviews)
    const pageSize = 20;

    try {
      for (let page = 1; page <= maxPages; page++) {
        // Use AliExpress public feedback API
        const reviewUrl = `https://feedback.aliexpress.com/pc/searchEvaluation.do?productId=${productId}&page=${page}&pageSize=${pageSize}&filter=all`;

        console.log(`[AliExpress] Fetching page ${page}...`);

        const response = await fetch(reviewUrl);

        if (!response.ok) {
          console.log(`[AliExpress] Failed to fetch page ${page}: ${response.status}`);
          break;
        }

        const data = await response.json();
        const reviewList = data?.data?.evaViewList || [];

        if (reviewList.length === 0) {
          console.log(`[AliExpress] No more reviews on page ${page}`);
          break;
        }

        console.log(`[AliExpress] Found ${reviewList.length} reviews on page ${page}`);

        for (const review of reviewList) {
          // Convert from 100-point scale to 5-star scale
          const rating = review.buyerEval ? Math.round(review.buyerEval / 20) : 5;

          // Replace "AliExpress Shopper" with "Nuage Customer" to remove source attribution
          let authorName = review.buyerName || null;
          if (authorName === 'AliExpress Shopper') {
            authorName = 'Client Nuage';
          }

          reviews.push({
            text: review.buyerFeedback || '',
            rating: Math.min(Math.max(rating, 1), 5),
            authorName: authorName,
            authorCountry: review.buyerCountry || null,
            reviewDate: review.evalDate || null,
            images: (review.images || []).map((img: string) => {
              // Clean image URLs
              let cleaned = img.replace(/(\.(jpg|jpeg|png|gif|webp))(_.*|\..*)/gi, "$1");
              if (cleaned.startsWith('//')) cleaned = 'https:' + cleaned;
              return cleaned;
            }),
            originalLanguage: detectLanguage(review.buyerFeedback || '') ?? undefined,
          });
        }

        // Stop if we have enough reviews
        if (reviews.length >= 100) break;
      }

      console.log(`[AliExpress] ✓ Total reviews fetched: ${reviews.length}`);
    } catch (error) {
      console.error('[AliExpress] Error fetching reviews:', error);
    }

    return reviews;
  },
};

function detectLanguage(text: string): string | null {
  if (/[\u4e00-\u9fa5]/.test(text)) return 'zh';
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja';
  if (/[\uac00-\ud7af]/.test(text)) return 'ko';
  if (/[\u0400-\u04ff]/.test(text)) return 'ru';
  if (/[\u0600-\u06ff]/.test(text)) return 'ar';
  return 'en';
}
