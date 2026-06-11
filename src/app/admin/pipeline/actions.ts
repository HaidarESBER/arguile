"use server";

import { requireAdmin } from "@/lib/session";

import { revalidatePath } from "next/cache";

const PIPELINE_PATH = "/admin/pipeline";

// Re-export sourcing actions
import {
  scrapeUrlAction,
  deleteScrapedProductAction,
  retryScrapingAction,
  sendToCurationAction,
  rescrapeReviewsAction,
} from "@/app/admin/sourcing/actions";

// Re-export curation actions
import {
  triggerBatchTranslation,
  saveCuratedFields,
  approveDraft,
  rejectDraft,
  setInReview,
  retranslate,
  removeDraft,
  publishDraftAction,
  unpublishDraftAction,
} from "@/app/admin/curation/actions";

// Re-export curation detail actions
import {
  uploadReviewImagesAction,
  syncPublishedReviewImagesAction,
} from "@/app/admin/curation/[id]/actions";

/**
 * Scrape a new product from URL
 */
export async function pipelineScrape(url: string) {
  await requireAdmin();
  const result = await scrapeUrlAction(url);
  revalidatePath(PIPELINE_PATH);
  return result;
}

/**
 * Delete a scraped product
 */
export async function pipelineDeleteScraped(productId: string) {
  await requireAdmin();
  const result = await deleteScrapedProductAction(productId);
  revalidatePath(PIPELINE_PATH);
  return result;
}

/**
 * Retry scraping a product
 */
export async function pipelineRetryScrape(productId: string, sourceUrl: string) {
  await requireAdmin();
  const result = await retryScrapingAction(productId, sourceUrl);
  revalidatePath(PIPELINE_PATH);
  return result;
}

/**
 * Re-scrape reviews for a product
 */
export async function pipelineRescrapeReviews(productId: string, sourceUrl: string) {
  await requireAdmin();
  const result = await rescrapeReviewsAction(productId, sourceUrl);
  revalidatePath(PIPELINE_PATH);
  return result;
}

/**
 * Send scraped product to curation pipeline
 */
export async function pipelineSendToCuration(scrapedProductId: string) {
  await requireAdmin();
  const result = await sendToCurationAction(scrapedProductId);
  revalidatePath(PIPELINE_PATH);
  return result;
}

/**
 * Trigger batch AI translation
 */
export async function pipelineBatchTranslate() {
  await requireAdmin();
  const result = await triggerBatchTranslation();
  revalidatePath(PIPELINE_PATH);
  return result;
}

/**
 * Retranslate a single draft
 */
export async function pipelineRetranslate(draftId: string) {
  await requireAdmin();
  await retranslate(draftId);
  revalidatePath(PIPELINE_PATH);
}

/**
 * Save curated fields on a draft
 */
export async function pipelineSaveCurated(
  draftId: string,
  fields: {
    curatedName: string | null;
    curatedDescription: string | null;
    curatedShortDescription: string | null;
    curatedCategory: string | null;
    curatedPrice: number | null;
    curatedCompareAtPrice: number | null;
    curatedImages: string[];
  }
) {
  await requireAdmin();
  await saveCuratedFields(draftId, fields);
  revalidatePath(PIPELINE_PATH);
}

/**
 * Approve a draft
 */
export async function pipelineApprove(draftId: string) {
  await requireAdmin();
  await approveDraft(draftId);
  revalidatePath(PIPELINE_PATH);
}

/**
 * Reject a draft
 */
export async function pipelineReject(draftId: string, reason: string) {
  await requireAdmin();
  await rejectDraft(draftId, reason);
  revalidatePath(PIPELINE_PATH);
}

/**
 * Set draft back to in_review
 */
export async function pipelineSetInReview(draftId: string) {
  await requireAdmin();
  await setInReview(draftId);
  revalidatePath(PIPELINE_PATH);
}

/**
 * Delete a draft
 */
export async function pipelineRemoveDraft(draftId: string) {
  await requireAdmin();
  await removeDraft(draftId);
  revalidatePath(PIPELINE_PATH);
}

/**
 * Publish a draft as a real product
 */
export async function pipelinePublish(draftId: string) {
  await requireAdmin();
  const product = await publishDraftAction(draftId);
  revalidatePath(PIPELINE_PATH);
  return product;
}

/**
 * Unpublish a published draft
 */
export async function pipelineUnpublish(draftId: string) {
  await requireAdmin();
  await unpublishDraftAction(draftId);
  revalidatePath(PIPELINE_PATH);
}

/**
 * Upload review images for a draft
 */
export async function pipelineUploadReviewImages(draftId: string, scrapedProductId: string) {
  await requireAdmin();
  const result = await uploadReviewImagesAction(draftId, scrapedProductId);
  revalidatePath(PIPELINE_PATH);
  return result;
}

/**
 * Sync review images to published product
 */
export async function pipelineSyncReviewImages(draftId: string) {
  await requireAdmin();
  const result = await syncPublishedReviewImagesAction(draftId);
  revalidatePath(PIPELINE_PATH);
  return result;
}

/**
 * Update a review's curated text
 */
export async function pipelineUpdateReview(reviewId: string, curatedText: string | null) {
  await requireAdmin();
  const { updateScrapedReview } = await import("@/lib/scraper/review-data");
  await updateScrapedReview(reviewId, { curatedText });
  revalidatePath(PIPELINE_PATH);
}
