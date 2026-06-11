"use server";

import { requireAdmin } from "@/lib/session";

import { revalidatePath } from "next/cache";
import { scrapeUrl, scrapeUrls } from "@/lib/scraper/engine";
import { getUnsentProducts, markSentToCuration } from "@/lib/scraper/data";
import { createDraftFromScrapedProduct } from "@/lib/pipeline";

/**
 * Scrape a single URL from form input
 */
export async function scrapeUrlAction(formData: FormData) {
  await requireAdmin();
  const url = formData.get("url") as string;
  if (!url) {
    throw new Error("URL is required");
  }

  try {
    const result = await scrapeUrl(url);
    revalidatePath("/admin/scraper");
    return { success: true, result };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

/**
 * Scrape multiple URLs from textarea (newline-separated)
 */
export async function scrapeMultipleAction(formData: FormData) {
  await requireAdmin();
  const urlsText = formData.get("urls") as string;
  if (!urlsText) {
    throw new Error("URLs are required");
  }

  const urls = urlsText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (urls.length === 0) {
    throw new Error("No valid URLs provided");
  }

  try {
    const { results, errors } = await scrapeUrls(urls);
    revalidatePath("/admin/scraper");
    return {
      success: true,
      scraped: results.length,
      errors: errors.length,
      errorDetails: errors,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

/**
 * Send a single scraped product to the curation pipeline
 */
export async function sendToCurationAction(scrapedProductId: string) {
  await requireAdmin();
  try {
    // Get the scraped product data
    const { getAllScrapedProducts } = await import("@/lib/scraper/data");
    const allProducts = await getAllScrapedProducts();
    const scrapedProduct = allProducts.find((p) => p.id === scrapedProductId);

    if (!scrapedProduct) {
      throw new Error("Scraped product not found");
    }

    // Create draft from scraped product
    const draft = await createDraftFromScrapedProduct({
      name: scrapedProduct.rawName,
      description: scrapedProduct.rawDescription || undefined,
      priceText: scrapedProduct.rawPriceText || undefined,
      images: scrapedProduct.rawImages,
      sourceUrl: scrapedProduct.sourceUrl,
      sourceName: scrapedProduct.sourceName,
      scrapedProductId: scrapedProduct.id,
    });

    // Mark as sent to curation
    await markSentToCuration(scrapedProductId, draft.id);

    revalidatePath("/admin/scraper");
    return { success: true, draftId: draft.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

/**
 * Send all unsent products to the curation pipeline (bulk action)
 */
export async function sendAllToCurationAction() {
  await requireAdmin();
  try {
    const unsentProducts = await getUnsentProducts();
    let sentCount = 0;

    for (const product of unsentProducts) {
      try {
        const draft = await createDraftFromScrapedProduct({
          name: product.rawName,
          description: product.rawDescription || undefined,
          priceText: product.rawPriceText || undefined,
          images: product.rawImages,
          sourceUrl: product.sourceUrl,
          sourceName: product.sourceName,
          scrapedProductId: product.id,
        });

        await markSentToCuration(product.id, draft.id);
        sentCount++;
      } catch (error) {
        console.error(
          `Failed to send product ${product.id} to curation:`,
          error
        );
      }
    }

    revalidatePath("/admin/scraper");
    return { success: true, sent: sentCount };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}
