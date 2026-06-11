"use server";

import { requireAdmin } from "@/lib/session";

import { revalidatePath } from "next/cache";
import { batchTranslate } from "@/lib/ai/translate-product";
import {
  updateDraft,
  updateDraftStatus,
  deleteDraft,
  getDraftById,
} from "@/lib/curation";
import { publishDraft } from "@/lib/pipeline";
import { DraftStatus } from "@/types/curation";

/**
 * Trigger batch translation of pending drafts
 */
export async function triggerBatchTranslation() {
  await requireAdmin();
  const result = await batchTranslate(10);
  revalidatePath("/admin/curation");
  return result;
}

/**
 * Save curated fields on a draft
 */
export async function saveCuratedFields(
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
  await updateDraft(draftId, fields);
  revalidatePath("/admin/curation");
  revalidatePath(`/admin/curation/${draftId}`);
}

/**
 * Approve a draft
 */
export async function approveDraft(draftId: string) {
  await requireAdmin();
  await updateDraftStatus(draftId, "approved");
  revalidatePath("/admin/curation");
  revalidatePath(`/admin/curation/${draftId}`);
}

/**
 * Reject a draft with reason
 */
export async function rejectDraft(draftId: string, rejectionReason: string) {
  await requireAdmin();
  await updateDraftStatus(draftId, "rejected", {
    rejectionReason,
  });
  revalidatePath("/admin/curation");
  revalidatePath(`/admin/curation/${draftId}`);
}

/**
 * Set draft status back to in_review
 */
export async function setInReview(draftId: string) {
  await requireAdmin();
  await updateDraftStatus(draftId, "in_review");
  revalidatePath("/admin/curation");
  revalidatePath(`/admin/curation/${draftId}`);
}

/**
 * Translate a draft immediately (reviews + product)
 */
export async function retranslate(draftId: string) {
  await requireAdmin();
  // Reset AI fields first
  await updateDraft(draftId, {
    aiName: null,
    aiDescription: null,
    aiShortDescription: null,
    aiCategory: null,
    aiSuggestedPrice: null,
    aiModel: null,
    aiPromptVersion: null,
    translatedAt: null,
    translationError: null,
    status: "pending_translation" as DraftStatus,
  });

  // Immediately trigger translation (reviews + product)
  const { translateAndSaveDraft } = await import("@/lib/ai/translate-product");
  await translateAndSaveDraft(draftId);

  revalidatePath("/admin/curation");
  revalidatePath(`/admin/curation/${draftId}`);
}

/**
 * Delete a draft permanently
 */
export async function removeDraft(draftId: string) {
  await requireAdmin();
  await deleteDraft(draftId);
  revalidatePath("/admin/curation");
}

/**
 * Publish an approved draft as a real product
 */
export async function publishDraftAction(draftId: string) {
  await requireAdmin();
  const product = await publishDraft(draftId);
  revalidatePath("/admin/curation");
  revalidatePath(`/admin/curation/${draftId}`);
  revalidatePath("/admin/produits");
  return product;
}

/**
 * Unpublish a published draft (delete product, reset draft to approved)
 */
export async function unpublishDraftAction(draftId: string) {
  await requireAdmin();
  const draft = await getDraftById(draftId);
  if (!draft) {
    throw new Error(`Draft not found: ${draftId}`);
  }

  if (draft.status !== "published" || !draft.publishedProductId) {
    throw new Error("Draft is not published");
  }

  const productIdToDelete = draft.publishedProductId;

  // Get product slug before deleting (for cache invalidation)
  const { getProductById } = await import("@/lib/products");
  const product = await getProductById(productIdToDelete);

  // FIRST: Reset draft to clear the foreign key reference
  await updateDraft(draftId, {
    status: "approved",
    publishedProductId: null,
    publishedAt: null,
  });

  // THEN: Delete the published product (now that foreign key is cleared)
  const { deleteProduct } = await import("@/lib/products");
  await deleteProduct(productIdToDelete);

  // Revalidate all relevant paths
  revalidatePath("/admin/curation");
  revalidatePath(`/admin/curation/${draftId}`);
  revalidatePath("/admin/produits");
  revalidatePath("/produits"); // Product listing page
  if (product?.slug) {
    revalidatePath(`/produits/${product.slug}`); // Specific product page
  }
}

/**
 * Get a single draft (for client refresh)
 */
export async function fetchDraft(draftId: string) {
  await requireAdmin();
  return getDraftById(draftId);
}
