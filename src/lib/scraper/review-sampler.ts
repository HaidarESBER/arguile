/**
 * Smart review sampling for authenticity
 *
 * Implements user's authenticity strategy:
 * - 5-25 reviews per product (random)
 * - Weighted rating distribution: 50% 5-star, 40% 4-star, 10% 3-star
 * - Mixed photo presence: ~60% with photos, 40% without
 * - Average rating: 4.2-4.8 per product
 * - Shuffle to avoid patterns
 */

import { ReviewScrapeResult } from '@/types/scraper';

/**
 * Sampling configuration for authentic-looking reviews
 */
interface SamplingConfig {
  minReviews: number;
  maxReviews: number;
  ratingWeights: { rating: number; weight: number }[];
  photoPresenceRate: number; // 0-1, percentage with photos
  targetAvgRating: { min: number; max: number };
}

const DEFAULT_CONFIG: SamplingConfig = {
  minReviews: 5,
  maxReviews: 25,
  ratingWeights: [
    { rating: 5, weight: 0.5 }, // 50% 5-star
    { rating: 4, weight: 0.4 }, // 40% 4-star
    { rating: 3, weight: 0.1 }, // 10% 3-star
  ],
  photoPresenceRate: 0.6, // 60% with photos
  targetAvgRating: { min: 4.2, max: 4.8 },
};

/**
 * Smart sample reviews from a list of scraped reviews
 *
 * @param reviews - All scraped reviews for a product
 * @param config - Sampling configuration (uses defaults if not provided)
 * @returns Sampled reviews that appear authentic
 */
export function smartSampleReviews(
  reviews: ReviewScrapeResult[],
  config: Partial<SamplingConfig> = {}
): ReviewScrapeResult[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  if (reviews.length === 0) {
    return [];
  }

  // 1. Determine target count (random between min and max)
  const targetCount = Math.floor(
    Math.random() * (cfg.maxReviews - cfg.minReviews + 1) + cfg.minReviews
  );

  // If we have fewer reviews than target, return all
  if (reviews.length <= targetCount) {
    return shuffleArray(reviews);
  }

  // 2. Separate reviews by rating
  const reviewsByRating: Map<number, ReviewScrapeResult[]> = new Map();
  for (const review of reviews) {
    if (!reviewsByRating.has(review.rating)) {
      reviewsByRating.set(review.rating, []);
    }
    reviewsByRating.get(review.rating)!.push(review);
  }

  // 3. Calculate how many of each rating we need based on weights
  const selectedReviews: ReviewScrapeResult[] = [];
  let remainingCount = targetCount;

  for (const { rating, weight } of cfg.ratingWeights) {
    const ratingReviews = reviewsByRating.get(rating) || [];
    if (ratingReviews.length === 0) continue;

    // Calculate target count for this rating
    const targetForRating = Math.round(targetCount * weight);
    const actualCount = Math.min(targetForRating, ratingReviews.length, remainingCount);

    // Sample from this rating's reviews
    const sampled = sampleArray(ratingReviews, actualCount);
    selectedReviews.push(...sampled);
    remainingCount -= actualCount;

    if (remainingCount <= 0) break;
  }

  // 4. If we still need more reviews (weights didn't fill target), sample randomly
  if (remainingCount > 0) {
    const unselectedReviews = reviews.filter((r) => !selectedReviews.includes(r));
    const additional = sampleArray(unselectedReviews, remainingCount);
    selectedReviews.push(...additional);
  }

  // 5. Apply photo presence strategy
  // Separate reviews with and without photos
  const withPhotos = selectedReviews.filter((r) => r.images && r.images.length > 0);
  const withoutPhotos = selectedReviews.filter((r) => !r.images || r.images.length === 0);

  // Calculate target counts
  const targetWithPhotos = Math.round(selectedReviews.length * cfg.photoPresenceRate);
  const targetWithoutPhotos = selectedReviews.length - targetWithPhotos;

  // Sample to match target distribution
  const finalReviews: ReviewScrapeResult[] = [];
  finalReviews.push(...sampleArray(withPhotos, Math.min(targetWithPhotos, withPhotos.length)));
  finalReviews.push(
    ...sampleArray(withoutPhotos, Math.min(targetWithoutPhotos, withoutPhotos.length))
  );

  // If we don't have enough reviews with target distribution, fill with remaining
  if (finalReviews.length < targetCount) {
    const remaining = selectedReviews.filter((r) => !finalReviews.includes(r));
    finalReviews.push(...sampleArray(remaining, targetCount - finalReviews.length));
  }

  // 6. Verify average rating is in target range
  const avgRating = calculateAverageRating(finalReviews);
  if (avgRating < cfg.targetAvgRating.min || avgRating > cfg.targetAvgRating.max) {
    console.warn(
      `Average rating ${avgRating.toFixed(2)} outside target range [${cfg.targetAvgRating.min}, ${cfg.targetAvgRating.max}]`
    );
    // Could adjust selection here if needed, but for now just log warning
  }

  // 7. Shuffle to avoid patterns
  return shuffleArray(finalReviews);
}

/**
 * Calculate average rating from reviews
 */
function calculateAverageRating(reviews: ReviewScrapeResult[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / reviews.length;
}

/**
 * Randomly sample N items from an array
 */
function sampleArray<T>(array: T[], count: number): T[] {
  if (count >= array.length) {
    return [...array];
  }

  const shuffled = shuffleArray([...array]);
  return shuffled.slice(0, count);
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get statistics about sampled reviews (for debugging/logging)
 */
export function getReviewSampleStats(reviews: ReviewScrapeResult[]): {
  total: number;
  avgRating: number;
  ratingDistribution: Record<number, number>;
  withPhotos: number;
  withoutPhotos: number;
  photoPresenceRate: number;
} {
  const stats = {
    total: reviews.length,
    avgRating: calculateAverageRating(reviews),
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    withPhotos: 0,
    withoutPhotos: 0,
    photoPresenceRate: 0,
  };

  for (const review of reviews) {
    // Count by rating
    if (review.rating >= 1 && review.rating <= 5) {
      stats.ratingDistribution[review.rating as keyof typeof stats.ratingDistribution]++;
    }

    // Count photo presence
    if (review.images && review.images.length > 0) {
      stats.withPhotos++;
    } else {
      stats.withoutPhotos++;
    }
  }

  stats.photoPresenceRate = stats.total > 0 ? stats.withPhotos / stats.total : 0;

  return stats;
}
