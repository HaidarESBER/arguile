"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { StarRating } from "./StarRating";
import { ReviewForm } from "./ReviewForm";
import {
  Review,
  ProductRatingStats,
  formatRelativeDate,
} from "@/data/reviews";

interface ProductReviewsProps {
  reviews: Review[];
  stats: ProductRatingStats | null;
}

const REVIEWS_PER_PAGE = 3; // Show fewer on main page
const MODAL_REVIEWS_PER_PAGE = 10;

type SortOption = 'recent' | 'relevant' | 'highest' | 'lowest';

/**
 * ProductReviews component displays customer reviews with ratings
 *
 * Features:
 * - Average rating with star display (4.3/5.0 from 127 reviews)
 * - Rating breakdown bars (5★: 65%, 4★: 20%, etc.)
 * - Preview of reviews with modal for full list
 * - Sorting options (recent, relevant, highest, lowest)
 * - "Voir plus d'avis" opens modal
 * - "Écrire un avis" button (placeholder for future feature)
 * - Stagger animation for review entrance
 */
export function ProductReviews({ reviews, stats }: ProductReviewsProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [modalDisplayCount, setModalDisplayCount] = useState(MODAL_REVIEWS_PER_PAGE);
  const router = useRouter();

  // Sort reviews based on selected option
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'relevant':
        // Relevance: verified + has photos + high rating + recent
        const scoreA = (a.verifiedPurchase ? 2 : 0) + (a.photos?.length ? 1 : 0) + a.rating * 0.2;
        const scoreB = (b.verifiedPurchase ? 2 : 0) + (b.photos?.length ? 1 : 0) + b.rating * 0.2;
        return scoreB - scoreA;
      default:
        return 0;
    }
  });

  if (!stats || reviews.length === 0) {
    return (
      <div>
        <p className="text-muted mb-4">Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-primary text-background rounded-[--radius-button] hover:bg-accent hover:text-primary transition-colors"
        >
          Écrire un avis
        </button>

        {/* Review form */}
        <AnimatePresence>
          {showForm && stats && (
            <div className="mt-6">
              <ReviewForm
                productId={stats.productId}
                onSuccess={() => {
                  setShowForm(false);
                  router.refresh(); // Re-fetch reviews from server
                }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const previewReviews = sortedReviews.slice(0, REVIEWS_PER_PAGE);
  const modalReviews = sortedReviews.slice(0, modalDisplayCount);
  const hasMoreInModal = modalDisplayCount < sortedReviews.length;

  const loadMoreInModal = () => {
    setModalDisplayCount((prev) => prev + MODAL_REVIEWS_PER_PAGE);
  };

  return (
    <div>

      {/* Rating summary */}
      <div className="grid md:grid-cols-2 gap-8 mb-8 p-6 bg-background-secondary rounded-[--radius-card]">
        {/* Average rating */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="text-5xl font-bold text-primary mb-2">
            {stats.averageRating.toFixed(1)}
          </div>
          <StarRating rating={stats.averageRating} size="lg" />
          <p className="text-sm text-muted mt-2">
            Basé sur {stats.totalReviews} avis
          </p>
        </div>

        {/* Rating breakdown */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.ratingBreakdown[star as keyof typeof stats.ratingBreakdown];
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm text-primary w-8">{star}★</span>
                <div className="flex-1 h-2 bg-mist rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full bg-accent"
                  />
                </div>
                <span className="text-sm text-muted w-12 text-right">
                  {Math.round(percentage)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write review button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-primary text-background rounded-[--radius-button] hover:bg-accent hover:text-primary transition-colors"
        >
          Écrire un avis
        </button>
      </div>

      {/* Review form */}
      <AnimatePresence>
        {showForm && (
          <ReviewForm
            productId={stats.productId}
            onSuccess={() => {
              setShowForm(false);
              router.refresh(); // Re-fetch reviews from server
            }}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Reviews list - Preview only */}
      <div className="space-y-6">
        {previewReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.4,
              delay: index * 0.1, // Stagger effect
              ease: "easeOut",
            }}
            className="border-b border-background-secondary pb-6 last:border-b-0"
          >
            {/* Review header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-medium text-primary">
                    {review.authorName}
                  </span>
                  {review.verifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-xs text-success">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Achat vérifié
                    </span>
                  )}
                </div>
                <StarRating rating={review.rating} size="sm" />
              </div>
              <span className="text-sm text-muted">
                {formatRelativeDate(review.date)}
              </span>
            </div>

            {/* Review text */}
            <p className="text-text leading-relaxed">{review.comment}</p>

            {/* Review photos */}
            {review.photos && review.photos.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {review.photos.map((photo, photoIdx) => (
                  <button
                    key={photoIdx}
                    onClick={() => setSelectedImage(photo)}
                    className="block"
                  >
                    <img
                      src={photo}
                      alt={`Photo client ${photoIdx + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border border-background-secondary hover:border-accent transition-all cursor-pointer shadow-sm hover:shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* View all reviews button */}
      {reviews.length > REVIEWS_PER_PAGE && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAllReviews(true)}
            className="px-6 py-3 border border-primary text-primary rounded-[--radius-button] hover:bg-primary hover:text-background transition-colors"
          >
            Voir tous les avis ({reviews.length})
          </button>
        </div>
      )}

      {/* All Reviews Modal */}
      <AnimatePresence>
        {showAllReviews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-primary/90 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={() => setShowAllReviews(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-4xl bg-background rounded-xl shadow-2xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-background border-b border-border/30 rounded-t-xl p-6 z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-2xl text-primary font-light">
                    Tous les avis ({reviews.length})
                  </h3>
                  <button
                    onClick={() => setShowAllReviews(false)}
                    className="w-10 h-10 flex items-center justify-center text-muted hover:text-primary transition-colors rounded-full hover:bg-background-secondary"
                    aria-label="Fermer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Sorting Options */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSortBy('relevant')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      sortBy === 'relevant'
                        ? 'bg-primary text-background'
                        : 'bg-background-secondary text-muted hover:bg-background-secondary/70'
                    }`}
                  >
                    Plus pertinents
                  </button>
                  <button
                    onClick={() => setSortBy('recent')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      sortBy === 'recent'
                        ? 'bg-primary text-background'
                        : 'bg-background-secondary text-muted hover:bg-background-secondary/70'
                    }`}
                  >
                    Plus récents
                  </button>
                  <button
                    onClick={() => setSortBy('highest')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      sortBy === 'highest'
                        ? 'bg-primary text-background'
                        : 'bg-background-secondary text-muted hover:bg-background-secondary/70'
                    }`}
                  >
                    Meilleures notes
                  </button>
                  <button
                    onClick={() => setSortBy('lowest')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      sortBy === 'lowest'
                        ? 'bg-primary text-background'
                        : 'bg-background-secondary text-muted hover:bg-background-secondary/70'
                    }`}
                  >
                    Notes les plus basses
                  </button>
                </div>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-6">
                  {modalReviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-background-secondary pb-6 last:border-b-0"
                    >
                      {/* Review header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-primary">
                              {review.authorName}
                            </span>
                            {review.verifiedPurchase && (
                              <span className="inline-flex items-center gap-1 text-xs text-success">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  className="w-4 h-4"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Achat vérifié
                              </span>
                            )}
                          </div>
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                        <span className="text-sm text-muted">
                          {formatRelativeDate(review.date)}
                        </span>
                      </div>

                      {/* Review text */}
                      <p className="text-text leading-relaxed mb-3">{review.comment}</p>

                      {/* Review photos */}
                      {review.photos && review.photos.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {review.photos.map((photo, photoIdx) => (
                            <button
                              key={photoIdx}
                              onClick={() => setSelectedImage(photo)}
                              className="block"
                            >
                              <img
                                src={photo}
                                alt={`Photo client ${photoIdx + 1}`}
                                className="w-20 h-20 object-cover rounded-lg border border-background-secondary hover:border-accent transition-all cursor-pointer shadow-sm hover:shadow-md"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Load more in modal */}
                {hasMoreInModal && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={loadMoreInModal}
                      className="px-6 py-3 border border-primary text-primary rounded-[--radius-button] hover:bg-primary hover:text-background transition-colors"
                    >
                      Voir plus
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Modal - Higher z-index to show above reviews modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-primary/90 backdrop-blur-sm p-4"
            onClick={() => setSelectedImage(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-background hover:text-accent transition-colors z-10 bg-background/10 rounded-full hover:bg-background/20"
              aria-label="Fermer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Image */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Photo client"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
