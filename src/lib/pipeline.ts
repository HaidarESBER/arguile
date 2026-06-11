"use server";

import { createProduct } from "@/lib/products";
import { getDraftById, updateDraft, createDraft } from "@/lib/curation";
import { batchTranslate } from "@/lib/ai/translate-product";
import {
  getEffectiveName,
  getEffectiveDescription,
  getEffectiveShortDescription,
  getEffectiveCategory,
  getEffectivePrice,
  getEffectiveImages,
  ProductDraft,
} from "@/types/curation";
import { ProductCategory } from "@/types/product";
import { processAndUploadImages } from "@/lib/scraper/image-processor";
import { updateScrapedProduct } from "@/lib/scraper/data";
import { getReviewsByScrapedProduct } from "@/lib/scraper/review-data";

/**
 * Publish an approved draft to the products table.
 * Creates a real product from the effective values (curated > AI > raw).
 */
export async function publishDraft(draftId: string) {
  const draft = await getDraftById(draftId);
  if (!draft) {
    throw new Error(`Draft not found: ${draftId}`);
  }
  if (draft.status !== "approved") {
    throw new Error(`Draft must be approved to publish. Current status: ${draft.status}`);
  }

  const category = getEffectiveCategory(draft);
  if (!category) {
    throw new Error("Cannot publish: no category set (neither curated nor AI-generated)");
  }

  const price = getEffectivePrice(draft);
  if (!price) {
    throw new Error("Cannot publish: no price set (neither curated nor AI-suggested)");
  }

  const product = await createProduct({
    name: getEffectiveName(draft),
    description: getEffectiveDescription(draft),
    shortDescription: getEffectiveShortDescription(draft),
    category: category as ProductCategory,
    price,
    compareAtPrice: draft.curatedCompareAtPrice ?? undefined,
    images: getEffectiveImages(draft),
    inStock: true,
    featured: false,
  });

  // Copy translated reviews from scraped_reviews to product reviews
  if (draft.scrapedProductId) {
    try {
      const scrapedReviews = await getReviewsByScrapedProduct(draft.scrapedProductId);

      // Filter for translated reviews (including rating-only reviews)
      // EXCLUDE reviews about delivery/shipping (not product quality)
      const deliveryKeywords = [
        'livraison', 'delivery', 'shipping', 'доставка', 'entrega', 'משלוח',
        'colis', 'package', 'посылка', 'paquete', 'חבילה',
        'délai', 'delay', 'ожидание', 'espera',
        'rapide', 'fast', 'быстро', 'lent', 'slow', 'долго'
      ];

      const translatedReviews = scrapedReviews.filter((r) => {
        if (r.translationStatus !== "translated") return false;

        // Check if review talks about delivery (in original or translated text)
        const textToCheck = (r.translatedText || r.reviewText || '').toLowerCase();
        const mentionsDelivery = deliveryKeywords.some(keyword =>
          textToCheck.includes(keyword.toLowerCase())
        );

        // Skip delivery-focused reviews
        return !mentionsDelivery;
      });

      // Import createScrapedReview function
      const { createScrapedReview } = await import("@/lib/reviews");

      let successCount = 0;
      for (const review of translatedReviews) {
        try {
          // Use translated text if available, otherwise original, or default for rating-only reviews
          let comment = review.translatedText || review.reviewText;
          if (!comment || comment.trim().length === 0) {
            comment = "⭐"; // Rating-only review (just emoji)
          }

          // Prefer uploaded review images over raw URLs (uploaded = optimized + no CORS issues)
          const reviewPhotos = review.uploadedReviewImages.length > 0
            ? review.uploadedReviewImages
            : review.reviewImages || [];

          await createScrapedReview({
            productId: product.id,
            userName: review.authorName || "Client Nuage",
            rating: review.rating,
            comment: comment,
            verifiedPurchase: true, // Mark as verified since they're from the source
            reviewPhotos: reviewPhotos, // Use uploaded images if available
          });
          successCount++;
        } catch (reviewError) {
          console.error(`Failed to save review:`, reviewError);
          // Continue with other reviews even if one fails
        }
      }

      console.log(`Published ${successCount}/${translatedReviews.length} reviews for product ${product.id}`);
    } catch (error) {
      console.error("Failed to copy reviews during publish:", error);
      // Don't fail the publish if reviews fail - just log the error
    }
  }

  await updateDraft(draftId, {
    status: "published",
    publishedProductId: product.id,
    publishedAt: new Date().toISOString(),
  });

  return product;
}

/**
 * Full pipeline cycle: translate pending drafts.
 * Called by Vercel Cron or manually from admin UI.
 */
export async function processPipeline(): Promise<{
  translated: number;
  errors: number;
  errorDetails: string[];
}> {
  const result = await batchTranslate(5);
  console.log(
    `[Pipeline] ${result.translated} translated, ${result.errors} errors`
  );
  return result;
}

/**
 * Create a new product draft from scraped product data.
 * Bridge between Phase 12 scraper output and Phase 13 curation pipeline.
 * Uploads images to Supabase Storage during curation.
 */
export async function createDraftFromScrapedProduct(scrapedData: {
  name: string;
  description?: string;
  priceText?: string;
  images?: string[];
  sourceUrl?: string;
  sourceName?: string;
  scrapedProductId?: string;
}): Promise<ProductDraft> {
  // Upload product images to Supabase Storage
  let uploadedImageUrls: string[] = [];
  if (scrapedData.images && scrapedData.images.length > 0 && scrapedData.scrapedProductId) {
    try {
      console.log(`Uploading ${scrapedData.images.length} product images...`);

      const folder = `products/${scrapedData.scrapedProductId}`;
      const result = await processAndUploadImages(scrapedData.images, folder, 2);

      uploadedImageUrls = result.successful.map((r) => r.url);

      // Update scraped_products with upload status
      await updateScrapedProduct(scrapedData.scrapedProductId, {
        imageUploadStatus: result.successful.length > 0 ? 'uploaded' : 'failed',
        uploadedImageUrls,
      });

      console.log(
        `Uploaded ${result.successful.length}/${scrapedData.images.length} images successfully`
      );

      if (result.errors.length > 0) {
        console.error('Image upload errors:', result.errors);
      }
    } catch (error) {
      console.error('Failed to upload product images:', error);
      // Continue with draft creation even if image upload fails
    }
  }

  // Upload review images separately (customer photos from reviews)
  if (scrapedData.scrapedProductId) {
    try {
      const reviews = await getReviewsByScrapedProduct(scrapedData.scrapedProductId);
      const reviewsWithImages = reviews.filter((r) => r.reviewImages.length > 0);

      if (reviewsWithImages.length > 0) {
        console.log(`Uploading review images for ${reviewsWithImages.length} reviews...`);

        // Process review images for each review
        for (const review of reviewsWithImages) {
          try {
            const folder = `reviews/${scrapedData.scrapedProductId}/${review.id}`;
            const result = await processAndUploadImages(review.reviewImages, folder, 2);

            if (result.successful.length > 0) {
              const uploadedUrls = result.successful.map((r) => r.url);

              // Update the review with uploaded image URLs
              const { updateScrapedReview } = await import('@/lib/scraper/review-data');
              await updateScrapedReview(review.id, {
                uploadedReviewImages: uploadedUrls,
              });

              console.log(
                `Uploaded ${result.successful.length}/${review.reviewImages.length} images for review ${review.id}`
              );
            }

            if (result.errors.length > 0) {
              console.error(`Review ${review.id} image upload errors:`, result.errors);
            }
          } catch (reviewImageError) {
            console.error(`Failed to upload images for review ${review.id}:`, reviewImageError);
            // Continue with other reviews even if one fails
          }
        }
      }
    } catch (error) {
      console.error('Failed to process review images:', error);
    }
  }

  return createDraft({
    rawName: scrapedData.name,
    rawDescription: scrapedData.description || null,
    rawPriceText: scrapedData.priceText || null,
    rawImages: scrapedData.images || [],
    uploadedImages: uploadedImageUrls,
    rawSourceUrl: scrapedData.sourceUrl || null,
    rawSourceName: scrapedData.sourceName || null,
    scrapedProductId: scrapedData.scrapedProductId || null,
    status: "pending_translation",
  });
}
