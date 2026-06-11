"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { ScrapedProduct, ScrapeStatus } from "@/types/scraper";

// =============================================================================
// Column Mapping: snake_case DB <-> camelCase TypeScript
// =============================================================================

/**
 * Convert a database row (snake_case) to ScrapedProduct (camelCase)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toScrapedProduct(row: any): ScrapedProduct {
  return {
    id: row.id,
    sourceUrl: row.source_url,
    sourceName: row.source_name,
    externalId: row.external_id,
    rawName: row.raw_name,
    rawDescription: row.raw_description,
    rawPriceText: row.raw_price_text,
    rawImages: row.raw_images || [],
    rawCategory: row.raw_category,
    rawMetadata: row.raw_metadata || {},
    scrapeStatus: row.scrape_status,
    errorMessage: row.error_message,
    imageUploadStatus: row.image_upload_status || 'pending',
    uploadedImageUrls: row.uploaded_image_urls || [],
    reviewCount: row.review_count || 0,
    sentToCuration: row.sent_to_curation,
    draftId: row.draft_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Convert ScrapedProduct fields (camelCase) to database columns (snake_case)
 * Only includes fields that are present in the partial data.
 */
function toScrapedProductRow(data: Partial<ScrapedProduct>): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  if (data.sourceUrl !== undefined) row.source_url = data.sourceUrl;
  if (data.sourceName !== undefined) row.source_name = data.sourceName;
  if (data.externalId !== undefined) row.external_id = data.externalId;
  if (data.rawName !== undefined) row.raw_name = data.rawName;
  if (data.rawDescription !== undefined) row.raw_description = data.rawDescription;
  if (data.rawPriceText !== undefined) row.raw_price_text = data.rawPriceText;
  if (data.rawImages !== undefined) row.raw_images = data.rawImages;
  if (data.rawCategory !== undefined) row.raw_category = data.rawCategory;
  if (data.rawMetadata !== undefined) row.raw_metadata = data.rawMetadata;
  if (data.scrapeStatus !== undefined) row.scrape_status = data.scrapeStatus;
  if (data.errorMessage !== undefined) row.error_message = data.errorMessage;
  if (data.imageUploadStatus !== undefined) row.image_upload_status = data.imageUploadStatus;
  if (data.uploadedImageUrls !== undefined) row.uploaded_image_urls = data.uploadedImageUrls;
  if (data.reviewCount !== undefined) row.review_count = data.reviewCount;
  if (data.sentToCuration !== undefined) row.sent_to_curation = data.sentToCuration;
  if (data.draftId !== undefined) row.draft_id = data.draftId;

  return row;
}

// =============================================================================
// CRUD Operations
// =============================================================================

/**
 * Create a new scraped product
 */
export async function createScrapedProduct(
  data: Partial<ScrapedProduct>
): Promise<ScrapedProduct> {
  const supabase = createAdminClient();
  const row = toScrapedProductRow(data);

  const { data: inserted, error } = await supabase
    .from("scraped_products")
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(`Failed to create scraped product: ${error.message}`);
  return toScrapedProduct(inserted);
}

/**
 * Get a scraped product by source URL (for dedup check)
 */
export async function getScrapedProductByUrl(
  url: string
): Promise<ScrapedProduct | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("scraped_products")
    .select("*")
    .eq("source_url", url)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw new Error(`Failed to get scraped product by URL: ${error.message}`);
  }
  return data ? toScrapedProduct(data) : null;
}

/**
 * Get all scraped products ordered by created_at desc
 */
export async function getAllScrapedProducts(): Promise<ScrapedProduct[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("scraped_products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error('Failed to get scraped products:', error.message);
    return []; // Return empty array if table doesn't exist yet
  }
  return (data || []).map(toScrapedProduct);
}

/**
 * Get scraped products filtered by source name
 */
export async function getScrapedProductsBySource(
  sourceName: string
): Promise<ScrapedProduct[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("scraped_products")
    .select("*")
    .eq("source_name", sourceName)
    .order("created_at", { ascending: false });

  if (error) {
    console.error('Failed to get scraped products by source:', error.message);
    return []; // Return empty array if table doesn't exist yet
  }
  return (data || []).map(toScrapedProduct);
}

/**
 * Get unsent products (successful scrapes not yet sent to curation)
 */
export async function getUnsentProducts(): Promise<ScrapedProduct[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("scraped_products")
    .select("*")
    .eq("sent_to_curation", false)
    .eq("scrape_status", "success")
    .order("created_at", { ascending: false });

  if (error) {
    console.error('Failed to get unsent products:', error.message);
    return []; // Return empty array if table doesn't exist yet
  }
  return (data || []).map(toScrapedProduct);
}

/**
 * Update scraped product fields
 */
export async function updateScrapedProduct(
  id: string,
  data: Partial<ScrapedProduct>
): Promise<ScrapedProduct> {
  const supabase = createAdminClient();
  const row = toScrapedProductRow(data);

  const { data: updated, error } = await supabase
    .from("scraped_products")
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update scraped product: ${error.message}`);
  return toScrapedProduct(updated);
}

/**
 * Mark a scraped product as sent to curation
 */
export async function markSentToCuration(
  id: string,
  draftId: string
): Promise<ScrapedProduct> {
  const supabase = createAdminClient();

  const { data: updated, error } = await supabase
    .from("scraped_products")
    .update({
      sent_to_curation: true,
      draft_id: draftId,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to mark product as sent to curation: ${error.message}`);
  return toScrapedProduct(updated);
}

/**
 * Delete a scraped product and its associated reviews
 */
export async function deleteScrapedProduct(id: string): Promise<void> {
  const supabase = createAdminClient();

  // Delete reviews first (if table exists)
  try {
    await supabase
      .from("scraped_reviews")
      .delete()
      .eq("scraped_product_id", id);
  } catch (error) {
    // Table might not exist yet, that's okay
    console.log('Could not delete reviews (table may not exist):', error);
  }

  // Delete the product
  const { error } = await supabase
    .from("scraped_products")
    .delete()
    .eq("id", id);

  if (error) throw new Error(`Failed to delete scraped product: ${error.message}`);
}

/**
 * Get scraper statistics for admin dashboard
 */
export async function getScraperStats(): Promise<{
  total: number;
  success: number;
  failed: number;
  sent: number;
  unsent: number;
}> {
  const supabase = createAdminClient();

  const statuses: ScrapeStatus[] = ['success', 'partial', 'failed'];
  const stats = {
    total: 0,
    success: 0,
    failed: 0,
    sent: 0,
    unsent: 0,
  };

  // Get total count
  const { count: totalCount, error: totalError } = await supabase
    .from("scraped_products")
    .select("*", { count: "exact", head: true });

  if (totalError) {
    console.error('Failed to get scraper stats:', totalError.message);
    return stats; // Return zero stats if table doesn't exist yet
  }
  stats.total = totalCount || 0;

  // Get counts by status
  for (const status of statuses) {
    const { count, error } = await supabase
      .from("scraped_products")
      .select("*", { count: "exact", head: true })
      .eq("scrape_status", status);

    if (error) {
      console.error(`Failed to get stats for ${status}:`, error.message);
      continue; // Skip this status if error
    }

    if (status === 'success') {
      stats.success = count || 0;
    } else if (status === 'failed') {
      stats.failed = count || 0;
    }
  }

  // Get sent/unsent counts
  const { count: sentCount, error: sentError } = await supabase
    .from("scraped_products")
    .select("*", { count: "exact", head: true })
    .eq("sent_to_curation", true);

  if (sentError) {
    console.error('Failed to get sent count:', sentError.message);
    return stats; // Return stats so far if error
  }
  stats.sent = sentCount || 0;

  const { count: unsentCount, error: unsentError } = await supabase
    .from("scraped_products")
    .select("*", { count: "exact", head: true })
    .eq("sent_to_curation", false)
    .eq("scrape_status", "success");

  if (unsentError) throw new Error(`Failed to get unsent count: ${unsentError.message}`);
  stats.unsent = unsentCount || 0;

  return stats;
}
