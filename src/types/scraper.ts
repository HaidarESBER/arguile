/**
 * Product scraping type definitions for the sourcing pipeline
 */

export type ScrapeStatus = 'success' | 'partial' | 'failed';
export type ImageUploadStatus = 'pending' | 'uploading' | 'uploaded' | 'failed';
export type TranslationStatus = 'pending' | 'translating' | 'translated' | 'failed';

/**
 * ScrapedProduct: Raw product data extracted from external sources
 */
export interface ScrapedProduct {
  id: string;

  // Source tracking
  sourceUrl: string;
  sourceName: string;
  externalId: string | null;

  // Raw extracted data
  rawName: string;
  rawDescription: string | null;
  rawPriceText: string | null;
  rawImages: string[];
  rawCategory: string | null;
  rawMetadata: Record<string, unknown>;

  // Scraping metadata
  scrapeStatus: ScrapeStatus;
  errorMessage: string | null;

  // Image management
  imageUploadStatus: ImageUploadStatus;
  uploadedImageUrls: string[];
  reviewCount: number;

  // Curation pipeline linkage
  sentToCuration: boolean;
  draftId: string | null;

  createdAt: string;
  updatedAt: string;
}

/**
 * ScrapeResult: Output from a source adapter's extract() method
 */
export interface ScrapeResult {
  name: string;
  description?: string;
  priceText?: string;
  images?: string[];
  category?: string;
  metadata?: Record<string, unknown>;
  externalId?: string;
}

/**
 * ScrapedReview: Customer review scraped from external sources
 */
export interface ScrapedReview {
  id: string;
  scrapedProductId: string;

  // Review content
  reviewText: string;
  rating: number; // 1-5

  // Author metadata
  authorName: string | null;
  authorCountry: string | null;
  reviewDate: string | null;

  // Review images (customer photos)
  reviewImages: string[];
  uploadedReviewImages: string[];

  // Translation
  originalLanguage: string | null;
  translatedText: string | null;
  curatedText: string | null; // Manually edited review text by admin
  translationStatus: TranslationStatus;
  translationError: string | null;

  createdAt: string;
  updatedAt: string;
}

/**
 * ReviewScrapeResult: Output from a source adapter's extractReviews() method
 */
export interface ReviewScrapeResult {
  text: string;
  rating: number;
  authorName?: string;
  authorCountry?: string;
  reviewDate?: string;
  images?: string[];
  originalLanguage?: string;
}

/**
 * SourceAdapter: Interface for site-specific scraping adapters
 */
export interface SourceAdapter {
  name: string;
  canHandle(url: string): boolean;
  extract(html: string, url: string): Promise<ScrapeResult>;
  supportsReviewScraping?: boolean;
  extractReviews?(html: string, url: string): Promise<ReviewScrapeResult[]>;
}
