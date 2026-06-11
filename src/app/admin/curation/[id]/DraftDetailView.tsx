"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ProductDraft,
  getEffectiveName,
  getEffectiveDescription,
  getEffectiveShortDescription,
  getEffectiveCategory,
  getEffectivePrice,
  getEffectiveImages,
} from "@/types/curation";
import { categoryLabels, ProductCategory, formatPrice } from "@/types/product";
import { ScrapedReview } from "@/types/scraper";
import {
  saveCuratedFields,
  approveDraft,
  rejectDraft,
  setInReview,
  retranslate,
  removeDraft,
  publishDraftAction,
  unpublishDraftAction,
} from "../actions";
import { uploadReviewImagesAction, syncPublishedReviewImagesAction } from "./actions";

interface DraftDetailViewProps {
  draft: ProductDraft;
  reviews: ScrapedReview[];
}

const categories: ProductCategory[] = [
  "chicha",
  "bol",
  "tuyau",
  "charbon",
  "accessoire",
];

export function DraftDetailView({ draft, reviews }: DraftDetailViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Review editing state
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editedReviewText, setEditedReviewText] = useState<string>("");

  // Handle review edit
  const handleEditReview = (reviewId: string, currentText: string) => {
    setEditingReviewId(reviewId);
    setEditedReviewText(currentText);
  };

  const handleSaveReview = async (reviewId: string) => {
    startTransition(async () => {
      const { updateScrapedReview } = await import("@/lib/scraper/review-data");
      await updateScrapedReview(reviewId, {
        curatedText: editedReviewText.trim() || null,
      });
      setEditingReviewId(null);
      router.refresh();
    });
  };

  const handleCancelEditReview = () => {
    setEditingReviewId(null);
    setEditedReviewText("");
  };

  // Curated form state — pre-filled with effective values
  const [curatedName, setCuratedName] = useState(
    draft.curatedName || getEffectiveName(draft)
  );
  const [curatedDescription, setCuratedDescription] = useState(
    draft.curatedDescription || getEffectiveDescription(draft)
  );
  const [curatedShortDescription, setCuratedShortDescription] = useState(
    draft.curatedShortDescription || getEffectiveShortDescription(draft)
  );
  const [curatedCategory, setCuratedCategory] = useState(
    draft.curatedCategory || getEffectiveCategory(draft) || "chicha"
  );
  const [curatedPriceEur, setCuratedPriceEur] = useState(
    (() => {
      const effectivePrice = getEffectivePrice(draft);
      return effectivePrice ? (effectivePrice / 100).toFixed(2) : "";
    })()
  );
  const [curatedCompareAtPriceEur, setCuratedCompareAtPriceEur] = useState(
    draft.curatedCompareAtPrice
      ? (draft.curatedCompareAtPrice / 100).toFixed(2)
      : ""
  );
  const [curatedImagesStr, setCuratedImagesStr] = useState(
    getEffectiveImages(draft).join(", ")
  );

  function handleSave() {
    setSaveMessage(null);
    startTransition(async () => {
      const priceCents = curatedPriceEur
        ? Math.round(parseFloat(curatedPriceEur) * 100)
        : null;
      const compareAtPriceCents = curatedCompareAtPriceEur
        ? Math.round(parseFloat(curatedCompareAtPriceEur) * 100)
        : null;
      const images = curatedImagesStr
        ? curatedImagesStr
            .split(",")
            .map((url) => url.trim())
            .filter((url) => url.length > 0)
        : [];

      await saveCuratedFields(draft.id, {
        curatedName: curatedName || null,
        curatedDescription: curatedDescription || null,
        curatedShortDescription: curatedShortDescription || null,
        curatedCategory: curatedCategory || null,
        curatedPrice: priceCents,
        curatedCompareAtPrice: compareAtPriceCents,
        curatedImages: images,
      });
      setSaveMessage("Modifications enregistrees");
      router.refresh();
    });
  }

  function handleApprove() {
    startTransition(async () => {
      await approveDraft(draft.id);
      router.refresh();
    });
  }

  function handleReject() {
    if (!rejectionReason.trim()) return;
    startTransition(async () => {
      await rejectDraft(draft.id, rejectionReason);
      setShowRejectModal(false);
      setRejectionReason("");
      router.refresh();
    });
  }

  function handlePublish() {
    startTransition(async () => {
      await publishDraftAction(draft.id);
      router.refresh();
    });
  }

  function handleUnpublish() {
    if (!confirm("Dépublier ce produit ? Il sera retiré du site et le brouillon repassera en statut 'approuvé'.")) {
      return;
    }
    startTransition(async () => {
      await unpublishDraftAction(draft.id);
      router.refresh();
    });
  }

  function handleSetInReview() {
    startTransition(async () => {
      await setInReview(draft.id);
      router.refresh();
    });
  }

  function handleRetranslate() {
    startTransition(async () => {
      await retranslate(draft.id);
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await removeDraft(draft.id);
      router.push("/admin/curation");
    });
  }

  const STATUS_LABELS: Record<string, string> = {
    pending_translation: "A traduire",
    translating: "En traduction",
    translated: "Traduit",
    in_review: "En revue",
    approved: "Approuve",
    rejected: "Rejete",
    published: "Publie",
  };

  const STATUS_COLORS: Record<string, string> = {
    pending_translation: "bg-primary/10 text-primary/70",
    translating: "bg-blue-100 text-blue-700 animate-pulse",
    translated: "bg-blue-100 text-blue-700",
    in_review: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    published: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/curation"
          className="text-primary/70 hover:text-primary transition-colors"
        >
          &larr; Retour
        </Link>
        <span
          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
            STATUS_COLORS[draft.status] || ""
          }`}
        >
          {STATUS_LABELS[draft.status] || draft.status}
        </span>
      </div>

      <h2 className="text-2xl font-heading font-semibold text-primary">
        {getEffectiveName(draft)}
      </h2>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column — Curated (editable) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-secondary rounded-lg border border-primary/10 p-6">
            <h3 className="text-lg font-heading font-semibold text-primary mb-4">
              Version curatee
            </h3>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  value={curatedName}
                  onChange={(e) => setCuratedName(e.target.value)}
                  className="w-full px-4 py-2 border border-primary/30 rounded-md bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={curatedDescription}
                  onChange={(e) => setCuratedDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-primary/30 rounded-md bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-y"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Description courte
                </label>
                <input
                  type="text"
                  value={curatedShortDescription}
                  onChange={(e) => setCuratedShortDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-primary/30 rounded-md bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Categorie
                </label>
                <select
                  value={curatedCategory}
                  onChange={(e) => setCuratedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-primary/30 rounded-md bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryLabels[cat]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">
                    Prix (EUR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={curatedPriceEur}
                    onChange={(e) => setCuratedPriceEur(e.target.value)}
                    className="w-full px-4 py-2 border border-primary/30 rounded-md bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="49.99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">
                    Prix barre (EUR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={curatedCompareAtPriceEur}
                    onChange={(e) =>
                      setCuratedCompareAtPriceEur(e.target.value)
                    }
                    className="w-full px-4 py-2 border border-primary/30 rounded-md bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="59.99 (optionnel)"
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Images (URLs separees par des virgules)
                </label>
                <input
                  type="text"
                  value={curatedImagesStr}
                  onChange={(e) => setCuratedImagesStr(e.target.value)}
                  className="w-full px-4 py-2 border border-primary/30 rounded-md bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="https://exemple.com/image1.jpg, https://exemple.com/image2.jpg"
                />
              </div>

              {/* Save button */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="px-4 py-2 bg-primary text-background rounded-md hover:bg-accent hover:text-primary transition-colors disabled:opacity-50"
                >
                  {isPending ? "Enregistrement..." : "Enregistrer"}
                </button>
                {saveMessage && (
                  <span className="text-sm text-green-700">{saveMessage}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column — Source data (read-only) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Raw product data */}
          <div className="bg-secondary rounded-lg border border-primary/10 p-6">
            <h3 className="text-lg font-heading font-semibold text-primary mb-4">
              Donnees sources
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium text-primary/60">Nom brut</dt>
                <dd className="text-primary">{draft.rawName}</dd>
              </div>
              <div>
                <dt className="font-medium text-primary/60">Description brute</dt>
                <dd className="text-primary">
                  {draft.rawDescription || <span className="text-primary/40">-</span>}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-primary/60">Prix source</dt>
                <dd className="text-primary">
                  {draft.rawPriceText || <span className="text-primary/40">-</span>}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-primary/60">Source</dt>
                <dd className="text-primary">
                  {draft.rawSourceName || <span className="text-primary/40">-</span>}
                </dd>
              </div>
              {draft.rawSourceUrl && (
                <div>
                  <dt className="font-medium text-primary/60">URL source</dt>
                  <dd>
                    <a
                      href={draft.rawSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline break-all"
                    >
                      {draft.rawSourceUrl}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* AI Translation */}
          <div className="bg-secondary rounded-lg border border-primary/10 p-6">
            <h3 className="text-lg font-heading font-semibold text-primary mb-4">
              Traduction IA
            </h3>
            {draft.aiName ? (
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-primary/60">Nom IA</dt>
                  <dd className="text-primary">{draft.aiName}</dd>
                </div>
                <div>
                  <dt className="font-medium text-primary/60">Description IA</dt>
                  <dd className="text-primary">{draft.aiDescription}</dd>
                </div>
                <div>
                  <dt className="font-medium text-primary/60">Description courte IA</dt>
                  <dd className="text-primary">{draft.aiShortDescription}</dd>
                </div>
                <div>
                  <dt className="font-medium text-primary/60">Categorie IA</dt>
                  <dd className="text-primary">{draft.aiCategory}</dd>
                </div>
                <div>
                  <dt className="font-medium text-primary/60">Prix suggere IA</dt>
                  <dd className="text-primary">
                    {draft.aiSuggestedPrice
                      ? formatPrice(draft.aiSuggestedPrice)
                      : "-"}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-primary/40">Pas encore traduit</p>
            )}
          </div>

          {/* Scraped Reviews */}
          <div className="bg-secondary rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-semibold text-primary">
                Avis scrapes ({reviews.length})
              </h3>
              <div className="flex gap-2">
                {draft.scrapedProductId && reviews.some(r => r.reviewImages.length > 0) && (
                  <button
                    onClick={() => {
                      startTransition(async () => {
                        const result = await uploadReviewImagesAction(draft.id, draft.scrapedProductId!);
                        if (result.success) {
                          alert(result.message);
                        } else {
                          alert(`Error: ${result.error}`);
                        }
                      });
                    }}
                    disabled={isPending}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    📤 Upload Review Images
                  </button>
                )}
                {draft.status === "published" && draft.publishedProductId && draft.scrapedProductId && reviews.some(r => r.uploadedReviewImages.length > 0) && (
                  <button
                    onClick={() => {
                      startTransition(async () => {
                        const result = await syncPublishedReviewImagesAction(draft.id);
                        if (result.success) {
                          alert(result.message);
                        } else {
                          alert(`Error: ${result.error}`);
                        }
                      });
                    }}
                    disabled={isPending}
                    className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    🔄 Sync to Product
                  </button>
                )}
              </div>
            </div>
            {reviews.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-background rounded-lg p-4 border border-primary/10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      {review.translationStatus === "translated" ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          Traduit
                        </span>
                      ) : review.translationStatus === "pending" ? (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                          En attente
                        </span>
                      ) : review.translationStatus === "failed" ? (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          Echec
                        </span>
                      ) : null}
                      {review.curatedText && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded ml-2">
                          ✏️ Curated
                        </span>
                      )}
                    </div>

                    {/* Review text - editable */}
                    {editingReviewId === review.id ? (
                      <div className="mb-2">
                        <textarea
                          value={editedReviewText}
                          onChange={(e) => setEditedReviewText(e.target.value)}
                          className="w-full px-3 py-2 border border-primary/30 rounded-md text-sm"
                          rows={4}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleSaveReview(review.id)}
                            disabled={isPending}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                          >
                            ✓ Save
                          </button>
                          <button
                            onClick={handleCancelEditReview}
                            disabled={isPending}
                            className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition-colors disabled:opacity-50"
                          >
                            ✕ Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-2">
                        <p className="text-sm text-primary/90">
                          {review.curatedText || review.translatedText || review.reviewText}
                        </p>
                        <button
                          onClick={() => handleEditReview(review.id, review.curatedText || review.translatedText || review.reviewText)}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    )}

                    {/* Debug panel */}
                    <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <div className="font-bold text-yellow-800 mb-1">🔍 Debug Info:</div>
                      <div>Raw images: {review.reviewImages?.length || 0}</div>
                      <div>Uploaded images: {review.uploadedReviewImages?.length || 0}</div>
                      {review.reviewImages && review.reviewImages.length > 0 && (
                        <div className="mt-1">
                          <div className="font-semibold">Raw URL:</div>
                          <div className="truncate text-blue-600">{review.reviewImages[0]}</div>
                        </div>
                      )}
                      {review.uploadedReviewImages && review.uploadedReviewImages.length > 0 && (
                        <div className="mt-1">
                          <div className="font-semibold">Uploaded URL:</div>
                          <div className="truncate text-green-600">{review.uploadedReviewImages[0]}</div>
                        </div>
                      )}
                    </div>
                    {review.authorName && (
                      <p className="text-xs text-primary/60">
                        Par {review.authorName}
                        {review.authorCountry && ` (${review.authorCountry})`}
                      </p>
                    )}
                    {(() => {
                      const images = review.uploadedReviewImages && review.uploadedReviewImages.length > 0
                        ? review.uploadedReviewImages
                        : review.reviewImages || [];

                      return images.length > 0 && (
                        <div className="flex gap-3 mt-3 flex-wrap">
                          <div className="w-full text-xs text-primary/60 mb-1">
                            📷 {images.length} photo{images.length > 1 ? 's' : ''}
                          </div>
                          {images.map((img, idx) => (
                            <a
                              key={idx}
                              href={img}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={img}
                                alt={`Review photo ${idx + 1}`}
                                className="w-24 h-24 object-cover rounded-lg border-2 border-primary/20 hover:border-accent transition-all cursor-pointer shadow-sm hover:shadow-md"
                                onLoad={() => {
                                  console.log('✅ Image loaded successfully:', img);
                                }}
                                onError={(e) => {
                                  const imgEl = e.target as HTMLImageElement;
                                  console.error('❌ Image failed to load:', img);
                                  console.error('Error event:', e);
                                  imgEl.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"%3E%3Crect width="96" height="96" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%239ca3af"%3E❌ Failed%3C/text%3E%3C/svg%3E';
                                  imgEl.title = `Image failed to load: ${img}`;
                                }}
                              />
                            </a>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-primary/40">Aucun avis scrape</p>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-secondary rounded-lg border border-primary/10 p-6">
            <h3 className="text-lg font-heading font-semibold text-primary mb-4">
              Metadonnees
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium text-primary/60">Modele IA</dt>
                <dd className="text-primary">
                  {draft.aiModel || <span className="text-primary/40">-</span>}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-primary/60">Version prompt</dt>
                <dd className="text-primary">
                  {draft.aiPromptVersion || <span className="text-primary/40">-</span>}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-primary/60">Traduit le</dt>
                <dd className="text-primary">
                  {draft.translatedAt
                    ? new Date(draft.translatedAt).toLocaleString("fr-FR")
                    : "-"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-primary/60">Cree le</dt>
                <dd className="text-primary">
                  {new Date(draft.createdAt).toLocaleString("fr-FR")}
                </dd>
              </div>
              {draft.translationError && (
                <div>
                  <dt className="font-medium text-red-600">Erreur de traduction</dt>
                  <dd className="text-red-600 text-xs">{draft.translationError}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-secondary rounded-lg border border-primary/10 p-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Translated / In Review actions */}
          {(draft.status === "translated" || draft.status === "in_review") && (
            <>
              <button
                onClick={handleApprove}
                disabled={isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Approuver
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Rejeter
              </button>
              {draft.status === "translated" && (
                <button
                  onClick={handleSetInReview}
                  disabled={isPending}
                  className="px-4 py-2 border border-primary/30 text-primary rounded-md hover:bg-primary/10 transition-colors disabled:opacity-50"
                >
                  Mettre en revue
                </button>
              )}
            </>
          )}

          {/* Approved actions */}
          {draft.status === "approved" && (
            <>
              <button
                onClick={handlePublish}
                disabled={isPending}
                className="px-4 py-2 bg-primary text-background rounded-md hover:bg-accent hover:text-primary transition-colors disabled:opacity-50"
              >
                {isPending ? "Publication..." : "Publier"}
              </button>
              <button
                onClick={handleSetInReview}
                disabled={isPending}
                className="px-4 py-2 border border-primary/30 text-primary rounded-md hover:bg-primary/10 transition-colors disabled:opacity-50"
              >
                Retirer approbation
              </button>
            </>
          )}

          {/* Rejected actions */}
          {draft.status === "rejected" && (
            <>
              {draft.rejectionReason && (
                <div className="w-full mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                  <strong>Raison du rejet :</strong> {draft.rejectionReason}
                </div>
              )}
              <button
                onClick={handleSetInReview}
                disabled={isPending}
                className="px-4 py-2 border border-primary/30 text-primary rounded-md hover:bg-primary/10 transition-colors disabled:opacity-50"
              >
                Remettre en revue
              </button>
            </>
          )}

          {/* Published info */}
          {draft.status === "published" && (
            <>
              <span className="inline-flex items-center px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-medium rounded">
                Publie le{" "}
                {draft.publishedAt
                  ? new Date(draft.publishedAt).toLocaleDateString("fr-FR")
                  : ""}
              </span>
              {draft.publishedProductId && (
                <Link
                  href={`/admin/produits/${draft.publishedProductId}`}
                  className="px-4 py-2 border border-primary/30 text-primary rounded-md hover:bg-primary/10 transition-colors"
                >
                  Voir le produit publie
                </Link>
              )}
              <button
                onClick={handleUnpublish}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isPending ? "Depublication..." : "Depublier"}
              </button>
            </>
          )}

          {/* Always available (except published) */}
          {draft.status !== "published" && (
            <>
              <div className="flex-1" />
              <button
                onClick={handleRetranslate}
                disabled={isPending}
                className="px-4 py-2 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                Retraduire
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isPending}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Supprimer
              </button>
            </>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4 space-y-4">
            <h3 className="text-lg font-heading font-semibold text-primary">
              Rejeter le brouillon
            </h3>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Raison du rejet..."
              className="w-full px-4 py-2 border border-primary/30 rounded-md bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-y"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                }}
                className="px-4 py-2 border border-primary/30 text-primary rounded-md hover:bg-primary/10 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={isPending || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4 space-y-4">
            <h3 className="text-lg font-heading font-semibold text-primary">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-primary/70">
              Etes-vous sur de vouloir supprimer ce brouillon ? Cette action est
              irreversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-primary/30 text-primary rounded-md hover:bg-primary/10 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Supprimer definitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
