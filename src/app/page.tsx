import type { Metadata } from "next";
import { getAllProducts } from "@/lib/products";
import { getBatchProductRatingStats } from "@/lib/reviews";
import { generateWebSiteSchema, safeJsonLd } from "@/lib/seo";
import { Product } from "@/types/product";
import { HomeClient } from "./HomeClient";

const BEST_SELLERS_COUNT = 10;

/** Products with at least one real (non-placeholder) photo. */
function withRealImages(allProducts: Product[]): Product[] {
  return allProducts.filter((product) =>
    product.images?.some(
      (img) =>
        img &&
        img.trim() !== "" &&
        !img.toLowerCase().includes("placeholder") &&
        !img.toLowerCase().includes("via.placeholder") &&
        !img.toLowerCase().includes("placehold.co")
    )
  );
}

export const metadata: Metadata = {
  title: "Nuage | L'art de la détente - Chicha Premium en France",
  description:
    "Boutique en ligne de chichas et accessoires haut de gamme. Chichas, bols, tuyaux, charbon et accessoires de qualité supérieure. Livraison en France.",
  alternates: {
    // Relative: resolved against metadataBase (env-driven SITE_URL) so
    // staging/preview deploys don't emit the production canonical.
    canonical: "/",
  },
};

/**
 * Homepage: video hero → best sellers → categories → founders' pick → story.
 * One strong product row instead of five identical category carousels;
 * social proof comes from real Supabase review stats.
 */
export default async function Home() {
  const allProducts = await getAllProducts();
  const candidates = withRealImages(allProducts);

  // One batch query for every candidate's rating stats
  const ratingsMap = await getBatchProductRatingStats(candidates.map((p) => p.id));

  // Popularity score: review volume weighted by rating (0 when unreviewed)
  const score = (p: Product) => {
    const stats = ratingsMap[p.id];
    return stats ? stats.averageRating * stats.totalReviews : 0;
  };

  // Best sellers: featured first, then most/best reviewed
  const ranked = [...candidates].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return score(b) - score(a);
  });

  // Founders' pick: best-rated product with a meaningful review count,
  // falling back to the top-ranked product. Excluded from the best-sellers
  // row so the homepage never shows the same product twice.
  const editorialPick =
    [...candidates]
      .filter((p) => (ratingsMap[p.id]?.totalReviews ?? 0) >= 3)
      .sort(
        (a, b) =>
          (ratingsMap[b.id]?.averageRating ?? 0) -
          (ratingsMap[a.id]?.averageRating ?? 0)
      )[0] ??
    ranked[0] ??
    null;

  const bestSellers = ranked
    .filter((p) => p.id !== editorialPick?.id)
    .slice(0, BEST_SELLERS_COUNT);

  // Site-wide proof line: weighted average across all reviewed products.
  // Only shown from 5 reviews up — a "5/5 (2 avis)" reads as fake.
  const allStats = Object.values(ratingsMap);
  const totalReviews = allStats.reduce((sum, s) => sum + s.totalReviews, 0);
  const aggregateRating =
    totalReviews >= 5
      ? {
          average:
            Math.round(
              (allStats.reduce(
                (sum, s) => sum + s.averageRating * s.totalReviews,
                0
              ) /
                totalReviews) *
                10
            ) / 10,
          count: totalReviews,
        }
      : null;

  const webSiteSchema = generateWebSiteSchema();

  return (
    <>
      {/* WebSite Structured Data with SearchAction for Google sitelinks search box */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(webSiteSchema) }}
      />
      <HomeClient
        bestSellers={bestSellers}
        editorialPick={editorialPick}
        ratingsMap={ratingsMap}
        aggregateRating={aggregateRating}
      />
    </>
  );
}
