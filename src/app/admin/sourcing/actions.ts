"use server";

import { requireAdmin } from "@/lib/session";

import { revalidatePath } from "next/cache";
import { scrapeUrl, getAdapterForUrl } from "@/lib/scraper/engine";
import { createDraftFromScrapedProduct } from "@/lib/pipeline";
import { updateScrapedProduct } from "@/lib/scraper/data";
import { createScrapedReview, getReviewsByScrapedProduct } from "@/lib/scraper/review-data";

/**
 * Scrape a single URL
 */
export async function scrapeUrlAction(url: string) {
  await requireAdmin();
  try {
    const scraped = await scrapeUrl(url);
    revalidatePath("/admin/sourcing");

    return {
      success: true,
      productId: scraped.id,
    };
  } catch (error) {
    console.error("Scrape error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a scraped product and its reviews
 */
export async function deleteScrapedProductAction(productId: string) {
  await requireAdmin();
  try {
    const { deleteScrapedProduct } = await import("@/lib/scraper/data");
    await deleteScrapedProduct(productId);

    revalidatePath("/admin/sourcing");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete product error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Retry scraping an existing product (useful for missing images/reviews)
 */
export async function retryScrapingAction(productId: string, sourceUrl: string) {
  await requireAdmin();
  try {
    // Re-scrape the URL
    const scraped = await scrapeUrl(sourceUrl);

    revalidatePath("/admin/sourcing");

    return {
      success: true,
      productId: scraped.id,
    };
  } catch (error) {
    console.error("Retry scrape error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send scraped product to curation pipeline
 * This triggers image upload and creates a draft
 */
export async function sendToCurationAction(productId: string) {
  await requireAdmin();
  try {
    // Get the scraped product
    const products = await import("@/lib/scraper/data").then(m => m.getAllScrapedProducts());
    const product = products.find(p => p.id === productId);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.sentToCuration) {
      return {
        success: false,
        error: "Product already sent to curation",
      };
    }

    // Create draft (this will upload images automatically)
    const draft = await createDraftFromScrapedProduct({
      name: product.rawName,
      description: product.rawDescription || undefined,
      priceText: product.rawPriceText || undefined,
      images: product.rawImages,
      sourceUrl: product.sourceUrl,
      sourceName: product.sourceName,
      scrapedProductId: product.id,
    });

    // Mark as sent
    await updateScrapedProduct(product.id, {
      sentToCuration: true,
      draftId: draft.id,
    });

    revalidatePath("/admin/sourcing");
    revalidatePath("/admin/curation");

    return {
      success: true,
      draftId: draft.id,
    };
  } catch (error) {
    console.error("Send to curation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Re-scrape reviews for an existing product to get new reviews
 */
export async function rescrapeReviewsAction(productId: string, sourceUrl: string) {
  await requireAdmin();
  try {
    // Get existing reviews to avoid duplicates
    const existingReviews = await getReviewsByScrapedProduct(productId);
    const existingReviewTexts = new Set(
      existingReviews.map(r => r.reviewText.trim().toLowerCase())
    );

    // Get the adapter for this URL
    const adapter = await getAdapterForUrl(sourceUrl);
    if (!adapter) {
      throw new Error("No adapter found for this URL");
    }

    // Fetch the page
    const response = await fetch(sourceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Extract reviews using the adapter
    if (!adapter.extractReviews) {
      throw new Error("This adapter does not support review scraping");
    }

    const reviewResults = await adapter.extractReviews(html, sourceUrl);

    // Smart sampling (5-25 reviews, mixed ratings)
    const { smartSampleReviews } = await import("@/lib/scraper/review-sampler");
    const sampledReviews = smartSampleReviews(reviewResults);

    // Filter out reviews that already exist (based on text)
    const newReviews = sampledReviews.filter(
      review => !existingReviewTexts.has(review.text.trim().toLowerCase())
    );

    // Save new reviews
    let savedCount = 0;
    for (const review of newReviews) {
      try {
        await createScrapedReview({
          scrapedProductId: productId,
          reviewText: review.text,
          rating: review.rating,
          authorName: review.authorName || null,
          authorCountry: review.authorCountry || null,
          reviewDate: review.reviewDate || null,
          reviewImages: review.images || [],
          uploadedReviewImages: [],
          originalLanguage: review.originalLanguage || null,
          translatedText: null,
          translationStatus: "pending",
          translationError: null,
        });
        savedCount++;
      } catch (error) {
        console.error("Failed to save review:", error);
      }
    }

    // Update the product's review count
    const totalReviews = existingReviews.length + savedCount;
    await updateScrapedProduct(productId, {
      reviewCount: totalReviews,
    });

    revalidatePath("/admin/sourcing");
    revalidatePath("/admin/pipeline");

    return {
      success: true,
      newReviews: savedCount,
      totalReviews,
      message: `Added ${savedCount} new reviews (${totalReviews} total)`,
    };
  } catch (error) {
    console.error("Re-scrape reviews error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
