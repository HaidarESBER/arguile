"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { ScrapedReview, TranslationStatus } from "@/types/scraper";

// =============================================================================
// Column Mapping: snake_case DB <-> camelCase TypeScript
// =============================================================================

/**
 * Convert a database row (snake_case) to ScrapedReview (camelCase)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toScrapedReview(row: any): ScrapedReview {
  return {
    id: row.id,
    scrapedProductId: row.scraped_product_id,
    reviewText: row.review_text,
    rating: row.rating,
    authorName: row.author_name,
    authorCountry: row.author_country,
    reviewDate: row.review_date,
    reviewImages: row.review_images || [],
    uploadedReviewImages: row.uploaded_review_images || [],
    originalLanguage: row.original_language,
    translatedText: row.translated_text,
    curatedText: row.curated_text,
    translationStatus: row.translation_status,
    translationError: row.translation_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Convert ScrapedReview fields (camelCase) to database columns (snake_case)
 * Only includes fields that are present in the partial data.
 */
function toScrapedReviewRow(data: Partial<ScrapedReview>): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  if (data.scrapedProductId !== undefined) row.scraped_product_id = data.scrapedProductId;
  if (data.reviewText !== undefined) row.review_text = data.reviewText;
  if (data.rating !== undefined) row.rating = data.rating;
  if (data.authorName !== undefined) row.author_name = data.authorName;
  if (data.authorCountry !== undefined) row.author_country = data.authorCountry;
  if (data.reviewDate !== undefined) row.review_date = data.reviewDate;
  if (data.reviewImages !== undefined) row.review_images = data.reviewImages;
  if (data.uploadedReviewImages !== undefined) row.uploaded_review_images = data.uploadedReviewImages;
  if (data.originalLanguage !== undefined) row.original_language = data.originalLanguage;
  if (data.translatedText !== undefined) row.translated_text = data.translatedText;
  if (data.curatedText !== undefined) row.curated_text = data.curatedText;
  if (data.translationStatus !== undefined) row.translation_status = data.translationStatus;
  if (data.translationError !== undefined) row.translation_error = data.translationError;

  return row;
}

// =============================================================================
// CRUD Operations
// =============================================================================

/**
 * Create a new scraped review
 */
export async function createScrapedReview(
  data: Partial<ScrapedReview>
): Promise<ScrapedReview> {
  const supabase = createAdminClient();
  const row = toScrapedReviewRow(data);

  const { data: inserted, error } = await supabase
    .from("scraped_reviews")
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(`Failed to create scraped review: ${error.message}`);
  return toScrapedReview(inserted);
}

/**
 * Get all reviews for a specific scraped product
 */
export async function getReviewsByScrapedProduct(
  scrapedProductId: string
): Promise<ScrapedReview[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("scraped_reviews")
    .select("*")
    .eq("scraped_product_id", scrapedProductId)
    .order("rating", { ascending: false }); // Higher ratings first

  if (error) {
    console.error('Failed to get reviews by scraped product:', error.message);
    return [];
  }
  return (data || []).map(toScrapedReview);
}

/**
 * Get reviews pending translation (for batch translation)
 */
export async function getPendingTranslationReviews(
  limit: number = 10
): Promise<ScrapedReview[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("scraped_reviews")
    .select("*")
    .eq("translation_status", "pending")
    .order("created_at", { ascending: true }) // Oldest first
    .limit(limit);

  if (error) {
    console.error('Failed to get pending translation reviews:', error.message);
    return [];
  }
  return (data || []).map(toScrapedReview);
}

/**
 * Update review translation
 */
export async function updateReviewTranslation(
  id: string,
  translatedText: string,
  status: TranslationStatus = 'translated'
): Promise<ScrapedReview> {
  const supabase = createAdminClient();

  const { data: updated, error } = await supabase
    .from("scraped_reviews")
    .update({
      translated_text: translatedText,
      translation_status: status,
      translation_error: null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update review translation: ${error.message}`);
  return toScrapedReview(updated);
}

/**
 * Update scraped review with partial data
 */
export async function updateScrapedReview(
  id: string,
  data: Partial<ScrapedReview>
): Promise<ScrapedReview> {
  const supabase = createAdminClient();
  const row = toScrapedReviewRow(data);

  const { data: updated, error } = await supabase
    .from("scraped_reviews")
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update scraped review: ${error.message}`);
  return toScrapedReview(updated);
}

/**
 * Mark review translation as failed
 */
export async function markReviewTranslationFailed(
  id: string,
  errorMessage: string
): Promise<ScrapedReview> {
  const supabase = createAdminClient();

  const { data: updated, error } = await supabase
    .from("scraped_reviews")
    .update({
      translation_status: "failed",
      translation_error: errorMessage,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to mark review translation as failed: ${error.message}`);
  return toScrapedReview(updated);
}

/**
 * Get all scraped reviews with optional filters
 */
export async function getAllScrapedReviews(filters?: {
  rating?: number;
  translationStatus?: TranslationStatus;
  scrapedProductId?: string;
}): Promise<ScrapedReview[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("scraped_reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.rating) {
    query = query.eq("rating", filters.rating);
  }
  if (filters?.translationStatus) {
    query = query.eq("translation_status", filters.translationStatus);
  }
  if (filters?.scrapedProductId) {
    query = query.eq("scraped_product_id", filters.scrapedProductId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to get all scraped reviews:', error.message);
    return [];
  }
  return (data || []).map(toScrapedReview);
}

/**
 * Get review statistics for admin dashboard
 */
export async function getReviewStats(): Promise<{
  total: number;
  pending: number;
  translating: number;
  translated: number;
  failed: number;
  byRating: Record<number, number>;
}> {
  const supabase = createAdminClient();

  const stats = {
    total: 0,
    pending: 0,
    translating: 0,
    translated: 0,
    failed: 0,
    byRating: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  // Get total count
  const { count: totalCount, error: totalError } = await supabase
    .from("scraped_reviews")
    .select("*", { count: "exact", head: true });

  if (totalError) {
    console.error('Failed to get review stats:', totalError.message);
    return stats;
  }
  stats.total = totalCount || 0;

  // Get counts by translation status
  const statuses: TranslationStatus[] = ['pending', 'translating', 'translated', 'failed'];
  for (const status of statuses) {
    const { count, error } = await supabase
      .from("scraped_reviews")
      .select("*", { count: "exact", head: true })
      .eq("translation_status", status);

    if (error) {
      console.error(`Failed to get stats for ${status}:`, error.message);
      continue;
    }

    stats[status] = count || 0;
  }

  // Get counts by rating
  for (let rating = 1; rating <= 5; rating++) {
    const { count, error } = await supabase
      .from("scraped_reviews")
      .select("*", { count: "exact", head: true })
      .eq("rating", rating);

    if (error) {
      console.error(`Failed to get stats for rating ${rating}:`, error.message);
      continue;
    }

    stats.byRating[rating as keyof typeof stats.byRating] = count || 0;
  }

  return stats;
}
