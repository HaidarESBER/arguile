import { Metadata } from "next";
import { ProduitsClientEnhanced } from "./ProduitsClientEnhanced";
import { getAllProducts, toProductListItem } from "@/lib/products";
import { getBatchProductRatingStats } from "@/lib/reviews";
import {
  SITE_URL,
  generateBreadcrumbSchema,
  generateItemListSchema,
  getDefaultOgImage,
  safeJsonLd,
} from "@/lib/seo";
import { categoryPath, getCategorySeo } from "@/lib/categories";
import { ProductCategory, getCategoryLabel } from "@/types/product";
import { getLocale } from "@/lib/i18n/server";
import { localizeProducts } from "@/lib/product-i18n";

/**
 * Shared renderer for the category landing pages (/produits/chichas,
 * /produits/charbons, …). Each category folder exports a thin page that
 * delegates here, so the categories stay real, individually indexable URLs
 * (category-keyword rankings + Google sitelinks) without duplicating logic.
 */

const STRINGS = {
  fr: {
    home: "Accueil",
    products: "Produits",
    ogLocale: "fr_FR",
  },
  en: {
    home: "Home",
    products: "Products",
    ogLocale: "en_US",
  },
} as const;

export async function buildCategoryMetadata(
  category: ProductCategory
): Promise<Metadata> {
  const locale = await getLocale();
  const t = STRINGS[locale];
  const seo = getCategorySeo(category, locale);
  return {
    title: seo.title,
    description: seo.description,
    // ?page= variants canonicalize to the bare category URL
    alternates: { canonical: categoryPath(category) },
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "website",
      locale: t.ogLocale,
      images: [getDefaultOgImage(locale)],
    },
  };
}

interface CategoryPageProps {
  category: ProductCategory;
  searchParams: Promise<{ page?: string }>;
}

export async function CategoryPage({ category, searchParams }: CategoryPageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);
  const locale = await getLocale();
  const t = STRINGS[locale];

  const allProducts = await getAllProducts();
  const products = localizeProducts(allProducts.map(toProductListItem), locale);

  const productIds = products.map((p) => p.id);
  const ratingsMap = await getBatchProductRatingStats(productIds);

  const categoryProducts = products.filter((p) => p.category === category);
  const itemListSchema = generateItemListSchema(
    categoryProducts.map((p) => ({
      name: p.name,
      url: `${SITE_URL}/produits/${p.slug}`,
      image: p.images[0],
      price: p.price,
    }))
  );
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: t.home, url: "/" },
    { name: t.products, url: "/produits" },
    { name: getCategoryLabel(category, locale), url: categoryPath(category) },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListSchema) }}
      />
      <ProduitsClientEnhanced
        products={products}
        activeCategory={category}
        ratingsMap={ratingsMap}
        initialPage={currentPage}
        intro={getCategorySeo(category, locale).intro}
      />
    </>
  );
}
