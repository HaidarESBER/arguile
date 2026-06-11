/**
 * Curation pipeline type definitions for AI-powered product translation
 */

export type DraftStatus =
  | 'pending_translation'
  | 'translating'
  | 'translated'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'published';

export interface ProductDraft {
  id: string;
  scrapedProductId: string | null;

  // Raw data
  rawName: string;
  rawDescription: string | null;
  rawPriceText: string | null;
  rawImages: string[];
  rawSourceUrl: string | null;
  rawSourceName: string | null;
  uploadedImages: string[]; // Processed & uploaded to Supabase Storage

  // AI-generated
  aiName: string | null;
  aiDescription: string | null;
  aiShortDescription: string | null;
  aiCategory: string | null;
  aiSuggestedPrice: number | null;

  // Admin-curated (overrides AI)
  curatedName: string | null;
  curatedDescription: string | null;
  curatedShortDescription: string | null;
  curatedCategory: string | null;
  curatedPrice: number | null;
  curatedCompareAtPrice: number | null;
  curatedImages: string[];

  // Status
  status: DraftStatus;

  // AI metadata
  aiModel: string | null;
  aiPromptVersion: string | null;
  translationError: string | null;

  // Audit
  translatedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  publishedProductId: string | null;
  publishedAt: string | null;

  createdAt: string;
  updatedAt: string;
}

// Helper: get the "effective" value (curated override > AI > raw)
export function getEffectiveName(draft: ProductDraft): string {
  return draft.curatedName || draft.aiName || draft.rawName;
}

export function getEffectiveDescription(draft: ProductDraft): string {
  return draft.curatedDescription || draft.aiDescription || draft.rawDescription || '';
}

export function getEffectiveShortDescription(draft: ProductDraft): string {
  return draft.curatedShortDescription || draft.aiShortDescription || '';
}

export function getEffectiveCategory(draft: ProductDraft): string | null {
  return draft.curatedCategory || draft.aiCategory;
}

export function getEffectivePrice(draft: ProductDraft): number | null {
  return draft.curatedPrice ?? draft.aiSuggestedPrice;
}

export function getEffectiveImages(draft: ProductDraft): string[] {
  // Priority: curated > uploaded (processed) > raw (external URLs)
  if (draft.curatedImages.length > 0) return draft.curatedImages;
  if (draft.uploadedImages.length > 0) return draft.uploadedImages;
  return draft.rawImages;
}
