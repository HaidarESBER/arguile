"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

interface Review {
  id: string;
  product_id: string;
  user_id: string | null;
  user_name: string | null;
  rating: number;
  comment: string;
  verified_purchase: boolean;
  review_photos: string[] | null;
  created_at: string;
  status: string;
  products: {
    name: string;
    images: string[];
  };
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

interface ReviewModerationClientProps {
  pendingReviews: Review[];
  allReviews: Review[];
}

export function ReviewModerationClient({
  pendingReviews: initialPending,
  allReviews: initialAll,
}: ReviewModerationClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async (reviewId: string) => {
    if (!confirm("Approuver cet avis ?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to approve review');

      router.refresh();
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Erreur lors de l approbation de l avis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (reviewId: string) => {
    if (!confirm("Rejeter cet avis ?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/reject`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to reject review');

      router.refresh();
    } catch (error) {
      console.error('Error rejecting review:', error);
      alert('Erreur lors du rejet de l avis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Supprimer définitivement cet avis ? Cette action est irréversible.")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete review');

      router.refresh();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Erreur lors de la suppression de l avis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVerified = async (reviewId: string, currentStatus: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/toggle-verified`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to toggle verified status');

      router.refresh();
    } catch (error) {
      console.error('Error toggling verified status:', error);
      alert('Erreur lors de la modification du statut vérifié');
    } finally {
      setIsLoading(false);
    }
  };

  const reviews = activeTab === 'pending' ? initialPending : initialAll;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'pending'
              ? 'text-primary'
              : 'text-muted hover:text-primary'
          }`}
        >
          En attente ({initialPending.length})
          {activeTab === 'pending' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'all'
              ? 'text-primary'
              : 'text-muted hover:text-primary'
          }`}
        >
          Tous les avis ({initialAll.length})
          {activeTab === 'all' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-background-secondary rounded-xl">
          <p className="text-muted">
            {activeTab === 'pending'
              ? 'Aucun avis en attente de modération'
              : 'Aucun avis'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const authorName = review.user_name
              ? review.user_name
              : review.profiles
              ? `${review.profiles.first_name} ${review.profiles.last_name}`
              : 'Anonyme';

            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-background border border-border rounded-xl p-6"
              >
                <div className="flex gap-6">
                  {/* Product image */}
                  <div className="flex-shrink-0">
                    <Image
                      src={review.products.images[0]}
                      alt={review.products.name}
                      width={100}
                      height={100}
                      className="rounded-lg object-cover"
                    />
                  </div>

                  {/* Review content */}
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-primary mb-1">
                          {review.products.name}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted">
                          <span>{authorName}</span>
                          {review.verified_purchase && (
                            <span className="text-success">✓ Achat vérifié</span>
                          )}
                          <span>{new Date(review.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>

                      {/* Status badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          review.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : review.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {review.status === 'approved'
                          ? 'Approuvé'
                          : review.status === 'rejected'
                          ? 'Rejeté'
                          : 'En attente'}
                      </span>
                    </div>

                    {/* Rating */}
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={star <= review.rating ? 'text-amber-400' : 'text-gray-300'}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    {/* Comment */}
                    <p className="text-text mb-3">{review.comment}</p>

                    {/* Photos */}
                    {review.review_photos && review.review_photos.length > 0 && (
                      <div className="flex gap-2 mb-4">
                        {review.review_photos.map((photo, idx) => (
                          <a
                            key={idx}
                            href={photo}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={photo}
                              alt={`Photo ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border border-border hover:border-accent transition-colors"
                            />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      {review.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(review.id)}
                            disabled={isLoading}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            ✓ Approuver
                          </button>
                          <button
                            onClick={() => handleReject(review.id)}
                            disabled={isLoading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            ✕ Rejeter
                          </button>
                        </>
                      )}
                      {review.status === 'rejected' && (
                        <button
                          onClick={() => handleApprove(review.id)}
                          disabled={isLoading}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          ✓ Approuver quand même
                        </button>
                      )}
                      {review.status === 'approved' && (
                        <button
                          onClick={() => handleReject(review.id)}
                          disabled={isLoading}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                        >
                          Retirer de la publication
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleVerified(review.id, review.verified_purchase)}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                          review.verified_purchase
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {review.verified_purchase ? '✓ Achat vérifié' : 'Marquer vérifié'}
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={isLoading}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        🗑 Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
