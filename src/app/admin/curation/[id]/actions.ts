"use server";

import { requireAdmin } from "@/lib/session";

import { revalidatePath } from "next/cache";
import { getReviewsByScrapedProduct, updateScrapedReview } from "@/lib/scraper/review-data";
import { processAndUploadImages } from "@/lib/scraper/image-processor";
import { getDraftById } from "@/lib/curation";
import { createClient } from "@/lib/supabase/server";

/**
 * Upload review images for a draft's scraped product
 */
export async function uploadReviewImagesAction(draftId: string, scrapedProductId: string) {
  await requireAdmin();
  try {
    const reviews = await getReviewsByScrapedProduct(scrapedProductId);
    const reviewsWithImages = reviews.filter((r) => r.reviewImages.length > 0);

    if (reviewsWithImages.length === 0) {
      return {
        success: true,
        message: "No review images to upload",
        uploaded: 0,
      };
    }

    console.log(`Uploading review images for ${reviewsWithImages.length} reviews...`);

    let uploadedCount = 0;

    // Process review images for each review
    for (const review of reviewsWithImages) {
      try {
        const folder = `reviews/${scrapedProductId}/${review.id}`;
        const result = await processAndUploadImages(review.reviewImages, folder, 2);

        if (result.successful.length > 0) {
          const uploadedUrls = result.successful.map((r) => r.url);

          // Update the review with uploaded image URLs
          await updateScrapedReview(review.id, {
            uploadedReviewImages: uploadedUrls,
          });

          uploadedCount++;

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

    revalidatePath(`/admin/curation/${draftId}`);

    return {
      success: true,
      message: `Uploaded images for ${uploadedCount}/${reviewsWithImages.length} reviews`,
      uploaded: uploadedCount,
    };
  } catch (error) {
    console.error("Failed to upload review images:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update review images on already-published product
 * Replaces broken AliExpress URLs with uploaded Supabase URLs
 */
export async function syncPublishedReviewImagesAction(draftId: string) {
  await requireAdmin();
  try {
    // Get the draft
    const draft = await getDraftById(draftId);
    if (!draft) {
      return {
        success: false,
        error: "Draft not found",
      };
    }

    if (!draft.publishedProductId) {
      return {
        success: false,
        error: "Draft is not published",
      };
    }

    if (!draft.scrapedProductId) {
      return {
        success: false,
        error: "Draft has no scraped product",
      };
    }

    // Get scraped reviews with uploaded images
    const scrapedReviews = await getReviewsByScrapedProduct(draft.scrapedProductId);
    const reviewsWithUploadedImages = scrapedReviews.filter(
      (r) => r.uploadedReviewImages.length > 0
    );

    if (reviewsWithUploadedImages.length === 0) {
      return {
        success: true,
        message: "No uploaded review images to sync",
        updated: 0,
      };
    }

    // Update published product reviews with uploaded image URLs
    const supabase = await createClient();
    let updatedCount = 0;

    for (const scrapedReview of reviewsWithUploadedImages) {
      try {
        // Find the corresponding review in the reviews table
        // Match by product_id, rating, and author name for better matching
        const userName = scrapedReview.authorName || "Client Nuage";

        const { data: existingReviews, error: fetchError } = await supabase
          .from("reviews")
          .select("id, review_photos, user_name, comment")
          .eq("product_id", draft.publishedProductId)
          .eq("rating", scrapedReview.rating)
          .eq("user_name", userName)
          .limit(1);

        if (fetchError) {
          console.error("Failed to fetch review:", fetchError);
          continue;
        }

        if (!existingReviews || existingReviews.length === 0) {
          console.log(`No matching review found for scraped review ${scrapedReview.id} (rating: ${scrapedReview.rating}, user: ${userName})`);
          continue;
        }

        const existingReview = existingReviews[0];
        console.log(`Found matching review ${existingReview.id} for scraped review ${scrapedReview.id}`);

        // Update BOTH review text AND photos with latest data
        // Priority: curated > translated > original
        const reviewText = scrapedReview.curatedText || scrapedReview.translatedText || scrapedReview.reviewText || "⭐";

        const { error: updateError } = await supabase
          .from("reviews")
          .update({
            comment: reviewText,
            review_photos: scrapedReview.uploadedReviewImages,
          })
          .eq("id", existingReview.id);

        if (updateError) {
          console.error("Failed to update review:", updateError);
          continue;
        }

        updatedCount++;
        console.log(`Updated review ${existingReview.id} with ${scrapedReview.uploadedReviewImages.length} images`);
      } catch (reviewError) {
        console.error(`Failed to sync review:`, reviewError);
        // Continue with other reviews
      }
    }

    revalidatePath(`/admin/curation/${draftId}`);
    revalidatePath(`/produits/${draft.publishedProductId}`);

    return {
      success: true,
      message: `Synced images for ${updatedCount}/${reviewsWithUploadedImages.length} reviews`,
      updated: updatedCount,
    };
  } catch (error) {
    console.error("Failed to sync published review images:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
