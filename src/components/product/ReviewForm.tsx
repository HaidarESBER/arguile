"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/contexts/LocaleContext";

const STRINGS = {
  fr: {
    selectRating: "Veuillez sélectionner une note",
    commentTooShort: "Le commentaire doit contenir au moins 10 caractères",
    commentTooLong: "Le commentaire ne peut pas dépasser 1000 caractères",
    genericError: "Une erreur est survenue. Veuillez réessayer.",
    notAnImage: (name: string) => `${name} n'est pas une image`,
    tooLarge: (name: string) => `${name} est trop grand même après compression`,
    compressionError: (name: string) => `Erreur lors de la compression de ${name}`,
    writeReview: "Écrire un avis",
    yourRating: "Votre note *",
    starAria: (star: number) => `${star} étoile${star > 1 ? "s" : ""}`,
    yourReview: "Votre avis *",
    commentPlaceholder: "Partagez votre expérience avec ce produit...",
    charCount: (count: number) => `${count}/1000 caractères`,
    photosLabel: "Photos (optionnel, max 3 photos, 2MB chacune)",
    previewAlt: (n: number) => `Preview ${n}`,
    remove: "Supprimer",
    addPhotos: "📷 Ajouter des photos",
    acceptedFormats:
      "Formats acceptés: JPG, PNG, WebP. Taille max: 2MB par photo (compressée automatiquement).",
    submitting: "Envoi en cours...",
    submit: "Publier mon avis",
    cancel: "Annuler",
    requiredNote: "* Champs obligatoires. Votre avis sera publié après vérification.",
  },
  en: {
    selectRating: "Please select a rating",
    commentTooShort: "The comment must be at least 10 characters long",
    commentTooLong: "The comment cannot exceed 1000 characters",
    genericError: "An error occurred. Please try again.",
    notAnImage: (name: string) => `${name} is not an image`,
    tooLarge: (name: string) => `${name} is too large even after compression`,
    compressionError: (name: string) => `Error while compressing ${name}`,
    writeReview: "Write a review",
    yourRating: "Your rating *",
    starAria: (star: number) => `${star} star${star > 1 ? "s" : ""}`,
    yourReview: "Your review *",
    commentPlaceholder: "Share your experience with this product...",
    charCount: (count: number) => `${count}/1000 characters`,
    photosLabel: "Photos (optional, max 3 photos, 2MB each)",
    previewAlt: (n: number) => `Preview ${n}`,
    remove: "Remove",
    addPhotos: "📷 Add photos",
    acceptedFormats:
      "Accepted formats: JPG, PNG, WebP. Max size: 2MB per photo (compressed automatically).",
    submitting: "Submitting...",
    submit: "Publish my review",
    cancel: "Cancel",
    requiredNote: "* Required fields. Your review will be published after verification.",
  },
} as const;

interface ReviewFormProps {
  productId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReviewForm({ productId, onSuccess, onCancel }: ReviewFormProps) {
  const { locale } = useLocale();
  const t = STRINGS[locale];
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (rating === 0) {
      setError(t.selectRating);
      return;
    }

    if (comment.trim().length < 10) {
      setError(t.commentTooShort);
      return;
    }

    if (comment.trim().length > 1000) {
      setError(t.commentTooLong);
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload photos first if any
      let photoUrls: string[] = [];
      if (photos.length > 0) {
        const formData = new FormData();
        photos.forEach((photo) => {
          formData.append('photos', photo);
        });

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload photos');
        }

        const uploadData = await uploadResponse.json();
        photoUrls = uploadData.urls;
      }

      // Submit review with photo URLs
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim(),
          photos: photoUrls,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      // Success
      onSuccess();
    } catch (err) {
      setError((err instanceof Error && err.message) || t.genericError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas not supported'));
            return;
          }

          // Resize to max 1200px width/height while maintaining aspect ratio
          const maxDimension = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with compression (quality 0.8)
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Compression failed'));
                return;
              }
              // Create new File from blob
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            0.8 // 80% quality
          );
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const errors: string[] = [];

    // Validate and compress files
    const compressedFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        errors.push(t.notAnImage(file.name));
        continue;
      }

      try {
        // Compress image
        const compressed = await compressImage(file);

        // Check compressed size (should be under 2MB now)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (compressed.size > maxSize) {
          errors.push(t.tooLarge(file.name));
        } else {
          compressedFiles.push(compressed);
        }
      } catch {
        errors.push(t.compressionError(file.name));
      }
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      if (compressedFiles.length === 0) return;
    }

    // Limit to 3 photos max
    const newPhotos = [...photos, ...compressedFiles].slice(0, 3);
    setPhotos(newPhotos);

    // Create previews
    const newPreviews: string[] = [];
    newPhotos.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === newPhotos.length) {
          setPhotoPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });

    if (errors.length === 0) setError('');
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit}
      className="bg-background-secondary p-6 rounded-[--radius-card] mb-6"
    >
      <h3 className="text-xl font-bold text-primary mb-4">{t.writeReview}</h3>

      {/* Rating selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-primary mb-2">
          {t.yourRating}
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-3xl transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent rounded"
              aria-label={t.starAria(star)}
            >
              <span className={star <= displayRating ? "text-accent" : "text-mist"}>
                ★
              </span>
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted self-center">
              {rating}/5
            </span>
          )}
        </div>
      </div>

      {/* Comment textarea */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-primary mb-2">
          {t.yourReview}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t.commentPlaceholder}
          rows={6}
          maxLength={1000}
          className="w-full px-4 py-3 bg-background border border-mist rounded-[--radius-input] text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />
        <div className="text-xs text-muted mt-1 text-right">
          {t.charCount(comment.length)}
        </div>
      </div>

      {/* Photo upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-primary mb-2">
          {t.photosLabel}
        </label>

        {/* Photo previews */}
        {photoPreviews.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {photoPreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={t.previewAlt(index + 1)}
                  className="w-20 h-20 object-cover rounded-lg border border-mist"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  aria-label={t.remove}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* File input */}
        {photos.length < 3 && (
          <label className="inline-block px-4 py-2 bg-background border border-mist text-primary rounded-[--radius-button] hover:bg-mist transition-colors cursor-pointer">
            <span>{t.addPhotos}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </label>
        )}
        <p className="text-xs text-muted mt-2">
          {t.acceptedFormats}
        </p>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-primary text-background rounded-[--radius-button] hover:bg-accent hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t.submitting : t.submit}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-3 bg-background border border-mist text-primary rounded-[--radius-button] hover:bg-mist transition-colors disabled:opacity-50"
        >
          {t.cancel}
        </button>
      </div>

      <p className="text-xs text-muted mt-4">
        {t.requiredNote}
      </p>
    </motion.form>
  );
}
