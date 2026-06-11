"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { ProductDraft, DraftStatus } from "@/types/curation";

// =============================================================================
// Column Mapping: snake_case DB <-> camelCase TypeScript
// =============================================================================

/**
 * Convert a database row (snake_case) to ProductDraft (camelCase)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDraft(row: any): ProductDraft {
  return {
    id: row.id,
    scrapedProductId: row.scraped_product_id,
    rawName: row.raw_name,
    rawDescription: row.raw_description,
    rawPriceText: row.raw_price_text,
    rawImages: row.raw_images || [],
    rawSourceUrl: row.raw_source_url,
    rawSourceName: row.raw_source_name,
    uploadedImages: row.uploaded_images || [],
    aiName: row.ai_name,
    aiDescription: row.ai_description,
    aiShortDescription: row.ai_short_description,
    aiCategory: row.ai_category,
    aiSuggestedPrice: row.ai_suggested_price,
    curatedName: row.curated_name,
    curatedDescription: row.curated_description,
    curatedShortDescription: row.curated_short_description,
    curatedCategory: row.curated_category,
    curatedPrice: row.curated_price,
    curatedCompareAtPrice: row.curated_compare_at_price,
    curatedImages: row.curated_images || [],
    status: row.status,
    aiModel: row.ai_model,
    aiPromptVersion: row.ai_prompt_version,
    translationError: row.translation_error,
    translatedAt: row.translated_at,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    rejectionReason: row.rejection_reason,
    publishedProductId: row.published_product_id,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Convert ProductDraft fields (camelCase) to database columns (snake_case)
 * Only includes fields that are present in the partial data.
 */
function toDraftRow(data: Partial<ProductDraft>): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  if (data.scrapedProductId !== undefined) row.scraped_product_id = data.scrapedProductId;
  if (data.rawName !== undefined) row.raw_name = data.rawName;
  if (data.rawDescription !== undefined) row.raw_description = data.rawDescription;
  if (data.rawPriceText !== undefined) row.raw_price_text = data.rawPriceText;
  if (data.rawImages !== undefined) row.raw_images = data.rawImages;
  if (data.rawSourceUrl !== undefined) row.raw_source_url = data.rawSourceUrl;
  if (data.rawSourceName !== undefined) row.raw_source_name = data.rawSourceName;
  if (data.uploadedImages !== undefined) row.uploaded_images = data.uploadedImages;
  if (data.aiName !== undefined) row.ai_name = data.aiName;
  if (data.aiDescription !== undefined) row.ai_description = data.aiDescription;
  if (data.aiShortDescription !== undefined) row.ai_short_description = data.aiShortDescription;
  if (data.aiCategory !== undefined) row.ai_category = data.aiCategory;
  if (data.aiSuggestedPrice !== undefined) row.ai_suggested_price = data.aiSuggestedPrice;
  if (data.curatedName !== undefined) row.curated_name = data.curatedName;
  if (data.curatedDescription !== undefined) row.curated_description = data.curatedDescription;
  if (data.curatedShortDescription !== undefined) row.curated_short_description = data.curatedShortDescription;
  if (data.curatedCategory !== undefined) row.curated_category = data.curatedCategory;
  if (data.curatedPrice !== undefined) row.curated_price = data.curatedPrice;
  if (data.curatedCompareAtPrice !== undefined) row.curated_compare_at_price = data.curatedCompareAtPrice;
  if (data.curatedImages !== undefined) row.curated_images = data.curatedImages;
  if (data.status !== undefined) row.status = data.status;
  if (data.aiModel !== undefined) row.ai_model = data.aiModel;
  if (data.aiPromptVersion !== undefined) row.ai_prompt_version = data.aiPromptVersion;
  if (data.translationError !== undefined) row.translation_error = data.translationError;
  if (data.translatedAt !== undefined) row.translated_at = data.translatedAt;
  if (data.reviewedBy !== undefined) row.reviewed_by = data.reviewedBy;
  if (data.reviewedAt !== undefined) row.reviewed_at = data.reviewedAt;
  if (data.rejectionReason !== undefined) row.rejection_reason = data.rejectionReason;
  if (data.publishedProductId !== undefined) row.published_product_id = data.publishedProductId;
  if (data.publishedAt !== undefined) row.published_at = data.publishedAt;

  return row;
}

// =============================================================================
// CRUD Operations
// =============================================================================

/**
 * Get drafts filtered by status, ordered by created_at desc
 */
export async function getDraftsByStatus(
  status: DraftStatus | DraftStatus[]
): Promise<ProductDraft[]> {
  const supabase = createAdminClient();
  const statuses = Array.isArray(status) ? status : [status];

  const { data, error } = await supabase
    .from("product_drafts")
    .select("*")
    .in("status", statuses)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to get drafts by status: ${error.message}`);
  return (data || []).map(toDraft);
}

/**
 * Get a single draft by ID
 */
export async function getDraftById(id: string): Promise<ProductDraft | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("product_drafts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw new Error(`Failed to get draft: ${error.message}`);
  }
  return data ? toDraft(data) : null;
}

/**
 * Get all drafts ordered by created_at desc
 */
export async function getAllDrafts(): Promise<ProductDraft[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("product_drafts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error('Failed to get drafts:', error.message);
    return []; // Return empty array if table doesn't exist yet
  }
  return (data || []).map(toDraft);
}

/**
 * Create a new product draft
 */
export async function createDraft(
  data: Partial<ProductDraft>
): Promise<ProductDraft> {
  const supabase = createAdminClient();
  const row = toDraftRow(data);

  const { data: inserted, error } = await supabase
    .from("product_drafts")
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(`Failed to create draft: ${error.message}`);
  return toDraft(inserted);
}

/**
 * Update draft fields
 */
export async function updateDraft(
  id: string,
  data: Partial<ProductDraft>
): Promise<ProductDraft> {
  const supabase = createAdminClient();
  const row = toDraftRow(data);

  const { data: updated, error } = await supabase
    .from("product_drafts")
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update draft: ${error.message}`);
  return toDraft(updated);
}

/**
 * Update draft status with audit fields
 */
export async function updateDraftStatus(
  id: string,
  status: DraftStatus,
  extra?: { rejectionReason?: string; reviewedBy?: string }
): Promise<ProductDraft> {
  const supabase = createAdminClient();

  const updates: Record<string, unknown> = { status };

  // Set audit timestamps based on status transition
  if (status === "translated") {
    updates.translated_at = new Date().toISOString();
  }

  if (status === "approved" || status === "rejected") {
    updates.reviewed_at = new Date().toISOString();
    if (extra?.reviewedBy) {
      updates.reviewed_by = extra.reviewedBy;
    }
  }

  if (status === "rejected" && extra?.rejectionReason) {
    updates.rejection_reason = extra.rejectionReason;
  }

  if (status === "published") {
    updates.published_at = new Date().toISOString();
  }

  const { data: updated, error } = await supabase
    .from("product_drafts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update draft status: ${error.message}`);
  return toDraft(updated);
}

/**
 * Get count of drafts by status
 */
export async function getDraftStats(): Promise<Record<DraftStatus, number>> {
  const supabase = createAdminClient();

  const statuses: DraftStatus[] = [
    "pending_translation",
    "translating",
    "translated",
    "in_review",
    "approved",
    "rejected",
    "published",
  ];

  const stats: Record<string, number> = {};

  for (const status of statuses) {
    const { count, error } = await supabase
      .from("product_drafts")
      .select("*", { count: "exact", head: true })
      .eq("status", status);

    if (error) throw new Error(`Failed to get draft stats: ${error.message}`);
    stats[status] = count || 0;
  }

  return stats as Record<DraftStatus, number>;
}

/**
 * Hard delete a draft
 */
export async function deleteDraft(id: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("product_drafts")
    .delete()
    .eq("id", id);

  if (error) throw new Error(`Failed to delete draft: ${error.message}`);
}
