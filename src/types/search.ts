/**
 * Search and filtering type definitions
 */

import type { Product, ProductCategory } from './product';

/**
 * Search parameters from URL query string
 */
export interface SearchParams {
  /** Search query string */
  q?: string;
  /** Filter by category */
  category?: string;
  /** Minimum price in cents */
  minPrice?: number;
  /** Maximum price in cents */
  maxPrice?: number;
  /** Sort option */
  sort?: string;
  /** Current page number (1-indexed) */
  page?: number;
}

/**
 * Facet counts for filter UI
 */
export interface FacetCounts {
  /** Count of products per category */
  categories: Record<ProductCategory, number>;
  /** Count of products per price range */
  priceRanges: Array<{
    label: string;
    min: number;
    max: number;
    count: number;
  }>;
}

/**
 * Search result with products and metadata
 */
export interface SearchResult {
  /** Filtered and paginated products */
  products: Product[];
  /** Total number of matching products (before pagination) */
  total: number;
  /** Original search query */
  query: string;
  /** Facet counts for filter UI */
  facets: FacetCounts;
}

/**
 * Sort options for product listing
 */
export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'name';
