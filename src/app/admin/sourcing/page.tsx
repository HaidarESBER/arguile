import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/session';
import { getAllScrapedProducts } from "@/lib/scraper/data";
import { getAllScrapedReviews } from "@/lib/scraper/review-data";
import { UnifiedSourcingDashboard } from "./UnifiedSourcingDashboard";

export const dynamic = "force-dynamic";

/**
 * Unified Sourcing Dashboard
 * Combines scraping, reviews, image management, and curation in one place
 */
export default async function UnifiedSourcingPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  const [scrapedProducts, allReviews] = await Promise.all([
    getAllScrapedProducts(),
    getAllScrapedReviews(),
  ]);

  // Group reviews by product
  const reviewsByProduct = new Map<string, typeof allReviews>();
  for (const review of allReviews) {
    if (!reviewsByProduct.has(review.scrapedProductId)) {
      reviewsByProduct.set(review.scrapedProductId, []);
    }
    reviewsByProduct.get(review.scrapedProductId)!.push(review);
  }

  return (
    <UnifiedSourcingDashboard
      scrapedProducts={scrapedProducts}
      reviewsByProduct={reviewsByProduct}
    />
  );
}
