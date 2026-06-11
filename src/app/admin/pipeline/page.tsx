import { getAllDrafts } from '@/lib/curation';
import { getAllScrapedProducts } from '@/lib/scraper/data';
import { getAllScrapedReviews } from '@/lib/scraper/review-data';
import { UnifiedPipeline } from './UnifiedPipeline';

export const dynamic = 'force-dynamic';

export default async function PipelinePage() {
  const [scrapedProducts, allDrafts, allReviews] = await Promise.all([
    getAllScrapedProducts(),
    getAllDrafts(),
    getAllScrapedReviews(),
  ]);

  // Group reviews by scraped product ID
  const reviewsByProduct: Record<string, typeof allReviews> = {};
  for (const review of allReviews) {
    if (!reviewsByProduct[review.scrapedProductId]) {
      reviewsByProduct[review.scrapedProductId] = [];
    }
    reviewsByProduct[review.scrapedProductId].push(review);
  }

  // Build unified product list: scraped products without drafts
  const scrapedOnly = scrapedProducts.filter(
    (p) => !allDrafts.some((d) => d.scrapedProductId === p.id)
  );

  // Build stats
  const stats = {
    total: scrapedOnly.length + allDrafts.length,
    scraped: scrapedOnly.length,
    translating: allDrafts.filter(
      (d) => d.status === 'translating' || d.status === 'pending_translation'
    ).length,
    ready: allDrafts.filter(
      (d) =>
        ['translated', 'approved', 'in_review', 'rejected'].includes(d.status) &&
        !d.publishedProductId
    ).length,
    published: allDrafts.filter(
      (d) => d.status === 'published' && d.publishedProductId
    ).length,
  };

  return (
    <UnifiedPipeline
      scrapedProducts={scrapedOnly}
      drafts={allDrafts}
      reviewsByProduct={reviewsByProduct}
      stats={stats}
    />
  );
}
