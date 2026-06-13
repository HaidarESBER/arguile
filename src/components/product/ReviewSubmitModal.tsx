"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/contexts/LocaleContext";

const STRINGS = {
  fr: {
    selectRating: "Veuillez sélectionner une note",
    commentTooShort: "Votre avis doit contenir au moins 10 caractères",
    submitFailed: "Échec de la soumission de l'avis",
    genericError: "Une erreur s'est produite. Veuillez réessayer.",
    thanks: "Merci !",
    submittedNote: "Votre avis a été soumis et sera publié après vérification.",
    leaveReview: "Laisser un avis",
    rating: "Note",
    name: "Nom",
    namePlaceholder: "Votre nom",
    email: "Email",
    emailPlaceholder: "votre@email.com",
    yourReview: "Votre avis",
    commentPlaceholder: "Partagez votre expérience avec ce produit...",
    photosLabel: "Photos (optionnel, max 3)",
    previewAlt: (n: number) => `Preview ${n}`,
    submitting: "Envoi en cours...",
    submit: "Soumettre l'avis",
    verificationNote: "Votre avis sera vérifié avant publication",
  },
  en: {
    selectRating: "Please select a rating",
    commentTooShort: "Your review must be at least 10 characters long",
    submitFailed: "Failed to submit the review",
    genericError: "An error occurred. Please try again.",
    thanks: "Thank you!",
    submittedNote: "Your review has been submitted and will be published after verification.",
    leaveReview: "Leave a review",
    rating: "Rating",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "your@email.com",
    yourReview: "Your review",
    commentPlaceholder: "Share your experience with this product...",
    photosLabel: "Photos (optional, max 3)",
    previewAlt: (n: number) => `Preview ${n}`,
    submitting: "Submitting...",
    submit: "Submit review",
    verificationNote: "Your review will be verified before publication",
  },
} as const;

interface ReviewSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

export function ReviewSubmitModal({
  isOpen,
  onClose,
  productId,
  productName,
}: ReviewSubmitModalProps) {
  const { locale } = useLocale();
  const t = STRINGS[locale];
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).slice(0, 3 - images.length);
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError(t.selectRating);
      return;
    }

    if (comment.trim().length < 10) {
      setError(t.commentTooShort);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Upload images first if any
      let imageUrls: string[] = [];
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((image) => {
          formData.append("images", image);
        });

        const uploadResponse = await fetch("/api/reviews/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrls = uploadData.urls;
        }
      }

      // Submit review
      const response = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim(),
          name: name.trim(),
          email: email.trim(),
          images: imageUrls,
        }),
      });

      if (!response.ok) {
        throw new Error(t.submitFailed);
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
        // Reset form
        setRating(0);
        setComment("");
        setName("");
        setEmail("");
        setImages([]);
        setSubmitSuccess(false);
      }, 2000);
    } catch {
      setError(t.genericError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-background-card rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {submitSuccess ? (
              <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4"
                >
                  <span className="material-icons text-white text-4xl">check</span>
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">{t.thanks}</h3>
                <p className="text-text-muted text-center">
                  {t.submittedNote}
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">{t.leaveReview}</h2>
                    <p className="text-sm text-text-muted mt-1">{productName}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white"
                  >
                    <span className="material-icons">close</span>
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                  {/* Rating */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-white mb-3">
                      {t.rating} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="text-3xl transition-all hover:scale-110"
                        >
                          <span
                            className={`material-icons ${
                              star <= (hoverRating || rating)
                                ? "text-primary"
                                : "text-gray-600"
                            }`}
                          >
                            {star <= (hoverRating || rating) ? "star" : "star_border"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      {t.name} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-background-secondary border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                      placeholder={t.namePlaceholder}
                    />
                  </div>

                  {/* Email */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      {t.email} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-background-secondary border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                      placeholder={t.emailPlaceholder}
                    />
                  </div>

                  {/* Comment */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      {t.yourReview} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                      rows={4}
                      className="w-full bg-background-secondary border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none resize-none"
                      placeholder={t.commentPlaceholder}
                    />
                  </div>

                  {/* Images */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-white mb-2">
                      {t.photosLabel}
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {images.map((image, index) => (
                        <div key={index} className="relative w-20 h-20">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={t.previewAlt(index + 1)}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {images.length < 3 && (
                        <label className="w-20 h-20 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                          <span className="material-icons text-white/50">add_photo_alternate</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? t.submitting : t.submit}
                  </button>

                  <p className="text-xs text-text-muted text-center mt-3">
                    {t.verificationNote}
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
