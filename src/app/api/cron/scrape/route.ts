import { NextRequest, NextResponse } from "next/server";
import { scrapeUrls } from "@/lib/scraper/engine";
import { createDraftFromScrapedProduct } from "@/lib/pipeline";
import { markSentToCuration } from "@/lib/scraper/data";
import { requireCronAuth } from "@/lib/security";

export async function GET(request: NextRequest) {
  // Fail closed: missing CRON_SECRET -> 500, bad bearer -> 401
  const authError = requireCronAuth(request);
  if (authError) return authError;

  try {
    // Load predefined URL list from environment variable
    const scrapeUrlsEnv = process.env.SCRAPE_URLS;
    if (!scrapeUrlsEnv) {
      return NextResponse.json({
        success: true,
        message: "No URLs configured (SCRAPE_URLS is empty)",
        scraped: 0,
        sentToCuration: 0,
        errors: 0,
      });
    }

    // Parse comma-separated URLs
    const urls = scrapeUrlsEnv
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urls.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No valid URLs in SCRAPE_URLS",
        scraped: 0,
        sentToCuration: 0,
        errors: 0,
      });
    }

    // Scrape all URLs
    const { results, errors } = await scrapeUrls(urls);

    // Send successful scrapes to curation (if not already sent)
    let sentToCuration = 0;
    const errorDetails: string[] = [];

    for (const product of results) {
      if (
        product.scrapeStatus === "success" &&
        !product.sentToCuration
      ) {
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
          sentToCuration++;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          errorDetails.push(
            `Failed to send product ${product.id} to curation: ${message}`
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      scraped: results.length,
      sentToCuration,
      errors: errors.length,
      errorDetails: [...errors.map((e) => e.error), ...errorDetails],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Cron /api/cron/scrape] Error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
