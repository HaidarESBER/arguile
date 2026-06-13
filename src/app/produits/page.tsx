import { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { ProduitsClientEnhanced } from "./ProduitsClientEnhanced";
import { getAllProducts, toProductListItem } from "@/lib/products";
import { getBatchProductRatingStats } from "@/lib/reviews";
import { getDefaultOgImage } from "@/lib/seo";
import { categoryPath, categorySlugs } from "@/lib/categories";
import { ProductCategory } from "@/types/product";
import { getLocale } from "@/lib/i18n/server";
import { localizeProducts } from "@/lib/product-i18n";

interface ProduitsPageProps {
  searchParams: Promise<{ categorie?: string; q?: string; page?: string }>;
}

const STRINGS = {
  fr: {
    title: "Produits",
    description:
      "Découvrez notre collection de chichas premium, bols, tuyaux, charbon et accessoires. Qualité supérieure pour une expérience unique.",
    ogLocale: "fr_FR",
  },
  en: {
    title: "Products",
    description:
      "Discover our collection of premium hookahs, bowls, hoses, charcoal and accessories. Superior quality for a unique experience.",
    ogLocale: "en_US",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = STRINGS[locale];
  return {
    title: t.title,
    description: t.description,
    // Parameterized variants (?q=, ?page=) canonicalize to the main catalog
    // page to avoid duplicate-content indexing. Categories live on their own
    // canonical URLs (/produits/chichas, …).
    alternates: { canonical: "/produits" },
    openGraph: {
      title: t.title,
      description: t.description,
      type: "website",
      locale: t.ogLocale,
      images: [getDefaultOgImage(locale)],
    },
  };
}

export default async function ProduitsPage({ searchParams }: ProduitsPageProps) {
  const params = await searchParams;
  const searchQuery = params.q || '';
  const currentPage = parseInt(params.page || '1', 10);
  const locale = await getLocale();

  // Legacy category filter URLs (?categorie=chicha) moved to dedicated
  // pages (/produits/chichas) — 308 so search engines transfer indexing.
  const categoryParam = params.categorie as ProductCategory | undefined;
  if (categoryParam && categoryParam in categorySlugs) {
    permanentRedirect(categoryPath(categoryParam));
  }

  // Load products from database and trim to the fields the grid needs
  // (no full descriptions, single image) before crossing the RSC boundary
  const allProducts = await getAllProducts();
  const products = localizeProducts(allProducts.map(toProductListItem), locale);

  // Fetch ratings for all products in a single batch query (optimized)
  const productIds = products.map(p => p.id);
  const ratingsMap = await getBatchProductRatingStats(productIds);

  return (
    <ProduitsClientEnhanced
      products={products}
      activeCategory={null}
      searchQuery={searchQuery}
      ratingsMap={ratingsMap}
      initialPage={currentPage}
    />
  );
}
