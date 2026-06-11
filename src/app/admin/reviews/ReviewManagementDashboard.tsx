"use client";

import { useState } from "react";
import { ScrapedReview, TranslationStatus } from "@/types/scraper";
import { ScrapedProduct } from "@/types/scraper";

interface ReviewManagementDashboardProps {
  reviews: ScrapedReview[];
  stats: {
    total: number;
    pending: number;
    translating: number;
    translated: number;
    failed: number;
    byRating: Record<number, number>;
  };
  productMap: Map<string, ScrapedProduct>;
}

type FilterRating = "all" | "5" | "4" | "3" | "2" | "1";
type FilterTranslation = "all" | TranslationStatus;

const RATING_FILTERS: { value: FilterRating; label: string }[] = [
  { value: "all", label: "Toutes notes" },
  { value: "5", label: "5 etoiles" },
  { value: "4", label: "4 etoiles" },
  { value: "3", label: "3 etoiles" },
  { value: "2", label: "2 etoiles" },
  { value: "1", label: "1 etoile" },
];

const TRANSLATION_FILTERS: { value: FilterTranslation; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "pending", label: "En attente" },
  { value: "translating", label: "En cours" },
  { value: "translated", label: "Traduits" },
  { value: "failed", label: "Echecs" },
];

const TRANSLATION_STATUS_COLORS: Record<TranslationStatus, string> = {
  pending: "bg-gray-100 text-gray-700",
  translating: "bg-blue-100 text-blue-700",
  translated: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const TRANSLATION_STATUS_LABELS: Record<TranslationStatus, string> = {
  pending: "En attente",
  translating: "En cours",
  translated: "Traduit",
  failed: "Echec",
};

export function ReviewManagementDashboard({
  reviews,
  stats,
  productMap,
}: ReviewManagementDashboardProps) {
  const [ratingFilter, setRatingFilter] = useState<FilterRating>("all");
  const [translationFilter, setTranslationFilter] =
    useState<FilterTranslation>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    // Rating filter
    if (ratingFilter !== "all" && review.rating !== parseInt(ratingFilter)) {
      return false;
    }

    // Translation filter
    if (
      translationFilter !== "all" &&
      review.translationStatus !== translationFilter
    ) {
      return false;
    }

    // Search query (in review text or translated text)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesOriginal = review.reviewText.toLowerCase().includes(query);
      const matchesTranslated =
        review.translatedText?.toLowerCase().includes(query);
      if (!matchesOriginal && !matchesTranslated) {
        return false;
      }
    }

    return true;
  });

  // Calculate average rating for filtered reviews
  const avgRating =
    filteredReviews.length > 0
      ? (
          filteredReviews.reduce((sum, r) => sum + r.rating, 0) /
          filteredReviews.length
        ).toFixed(2)
      : "0";

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-secondary rounded-lg border border-primary/10 p-4">
          <p className="text-xs text-primary/60 uppercase tracking-wide">
            Total
          </p>
          <p className="text-2xl font-heading font-semibold text-primary mt-1">
            {stats.total}
          </p>
        </div>
        <div className="bg-secondary rounded-lg border border-primary/10 p-4">
          <p className="text-xs text-primary/60 uppercase tracking-wide">
            Traduits
          </p>
          <p className="text-2xl font-heading font-semibold text-green-600 mt-1">
            {stats.translated}
          </p>
        </div>
        <div className="bg-secondary rounded-lg border border-primary/10 p-4">
          <p className="text-xs text-primary/60 uppercase tracking-wide">
            En attente
          </p>
          <p className="text-2xl font-heading font-semibold text-gray-600 mt-1">
            {stats.pending}
          </p>
        </div>
        <div className="bg-secondary rounded-lg border border-primary/10 p-4">
          <p className="text-xs text-primary/60 uppercase tracking-wide">
            Echecs
          </p>
          <p className="text-2xl font-heading font-semibold text-red-600 mt-1">
            {stats.failed}
          </p>
        </div>
        <div className="bg-secondary rounded-lg border border-primary/10 p-4">
          <p className="text-xs text-primary/60 uppercase tracking-wide">
            Note moyenne
          </p>
          <p className="text-2xl font-heading font-semibold text-primary mt-1">
            {(
              Object.entries(stats.byRating).reduce(
                (sum, [rating, count]) => sum + parseInt(rating) * count,
                0
              ) / stats.total
            ).toFixed(2)}{" "}
            ★
          </p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-secondary rounded-lg border border-primary/10 p-6">
        <h3 className="text-lg font-heading font-semibold text-primary mb-4">
          Distribution des notes
        </h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.byRating[rating] || 0;
            const percentage =
              stats.total > 0 ? (count / stats.total) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm font-medium text-primary/70 w-16">
                  {rating} etoiles
                </span>
                <div className="flex-1 bg-primary/10 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-primary/60 w-16 text-right">
                  {count} ({percentage.toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-secondary rounded-lg border border-primary/10 p-6 space-y-4">
        <h3 className="text-lg font-heading font-semibold text-primary">
          Filtres
        </h3>

        {/* Search */}
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans les avis..."
            className="w-full px-3 py-2 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Rating Filter */}
        <div>
          <p className="text-sm font-medium text-primary/70 mb-2">
            Filtrer par note:
          </p>
          <div className="flex flex-wrap gap-2">
            {RATING_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setRatingFilter(filter.value)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  ratingFilter === filter.value
                    ? "bg-primary text-background"
                    : "text-primary/70 hover:bg-primary/10"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Translation Status Filter */}
        <div>
          <p className="text-sm font-medium text-primary/70 mb-2">
            Filtrer par traduction:
          </p>
          <div className="flex flex-wrap gap-2">
            {TRANSLATION_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setTranslationFilter(filter.value)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  translationFilter === filter.value
                    ? "bg-primary text-background"
                    : "text-primary/70 hover:bg-primary/10"
                }`}
              >
                {filter.label}
                {filter.value !== "all" && (
                  <span className="ml-1 text-xs opacity-70">
                    ({stats[filter.value] || 0})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-primary/10">
          <p className="text-sm text-primary/60">
            {filteredReviews.length} avis affiches (note moyenne: {avgRating} ★)
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => {
          const product = productMap.get(review.scrapedProductId);
          return (
            <div
              key={review.id}
              className="bg-secondary rounded-lg border border-primary/10 p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  {/* Product info */}
                  {product && (
                    <p className="text-sm text-primary/60 mb-2">
                      Produit: <span className="font-medium">{product.rawName}</span>
                    </p>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-lg ${
                            star <= review.rating
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-primary/60">
                      ({review.rating}/5)
                    </span>
                  </div>

                  {/* Author info */}
                  <p className="text-xs text-primary/50">
                    {review.authorName && (
                      <span>{review.authorName}</span>
                    )}
                    {review.authorCountry && (
                      <span> • {review.authorCountry}</span>
                    )}
                    {review.reviewDate && (
                      <span> • {review.reviewDate}</span>
                    )}
                  </p>
                </div>

                {/* Translation status */}
                <span
                  className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                    TRANSLATION_STATUS_COLORS[review.translationStatus]
                  }`}
                >
                  {TRANSLATION_STATUS_LABELS[review.translationStatus]}
                </span>
              </div>

              {/* Review content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original text */}
                <div>
                  <p className="text-sm font-medium text-primary/70 mb-2">
                    Texte original
                    {review.originalLanguage && (
                      <span className="ml-2 text-xs text-primary/50">
                        ({review.originalLanguage})
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-primary/80 bg-primary/5 rounded p-3">
                    {review.reviewText}
                  </p>
                </div>

                {/* Translated text */}
                <div>
                  <p className="text-sm font-medium text-primary/70 mb-2">
                    Traduction francaise
                  </p>
                  {review.translatedText ? (
                    <p className="text-sm text-primary/80 bg-green-50 rounded p-3">
                      {review.translatedText}
                    </p>
                  ) : review.translationError ? (
                    <p className="text-sm text-red-600 bg-red-50 rounded p-3">
                      Erreur: {review.translationError}
                    </p>
                  ) : (
                    <p className="text-sm text-primary/40 italic bg-primary/5 rounded p-3">
                      Traduction en attente...
                    </p>
                  )}
                </div>
              </div>

              {/* Review images */}
              {review.reviewImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-primary/70 mb-2">
                    Photos client ({review.reviewImages.length})
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {review.reviewImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Review photo ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded border border-primary/20"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredReviews.length === 0 && (
        <div className="bg-secondary rounded-lg border border-primary/10 p-8 text-center text-primary/60">
          Aucun avis ne correspond aux filtres selectionnes.
        </div>
      )}
    </div>
  );
}
