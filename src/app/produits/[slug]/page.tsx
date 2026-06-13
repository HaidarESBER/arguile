import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getAllProducts,
  getAllProductSlugs,
} from "@/lib/products";
import { getProductReviews, getProductRatingStats } from "@/lib/reviews";
import {
  generateProductSchema,
  generateBreadcrumbSchema,
  generateOpenGraphTags,
  generateTwitterCardTags,
  safeJsonLd,
  SITE_URL,
} from "@/lib/seo";
import { ProductCategory } from "@/types/product";
import { ProductDetailClient } from "./ProductDetailClient";
import { ProductViewTracker } from "@/components/product/ProductViewTracker";
import { getLocale } from "@/lib/i18n/server";
import { localizeProduct, localizeProducts } from "@/lib/product-i18n";

const STRINGS = {
  fr: {
    notFound: "Produit non trouvé",
    home: "Accueil",
    products: "Produits",
  },
  en: {
    notFound: "Product not found",
    home: "Home",
    products: "Products",
  },
} as const;

// Re-render product pages at most every 5 minutes (matches the products
// data cache); admin mutations revalidate the paths/tag immediately.
export const revalidate = 300;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/** Categories that pair well with the given category, in priority order */
function getComplementaryCategories(category: ProductCategory): ProductCategory[] {
  const pairings: Record<ProductCategory, ProductCategory[]> = {
    chicha: ["bol", "tuyau", "charbon", "accessoire"],
    bol: ["chicha", "charbon", "accessoire"],
    tuyau: ["chicha", "bol", "charbon", "accessoire"],
    charbon: ["chicha", "bol", "accessoire"],
    accessoire: ["chicha", "bol", "charbon"],
  };
  return pairings[category] || [];
}

/**
 * Generate static params for all product pages
 */
export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * Generate metadata per product
 */
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const t = STRINGS[locale];
  const rawProduct = await getProductBySlug(slug);

  if (!rawProduct) {
    // template in layout.tsx adds "| Nuage"
    return {
      title: t.notFound,
    };
  }

  const product = localizeProduct(rawProduct, locale);
  const productPath = `/produits/${product.slug}`;
  const productUrl = `${SITE_URL}${productPath}`;

  // Ensure absolute URL for images
  const productImage = product.images[0];
  const absoluteImageUrl = productImage?.startsWith('http')
    ? productImage
    : `${SITE_URL}${productImage}`;

  const ogTags = generateOpenGraphTags({
    title: product.name,
    description: product.shortDescription,
    image: productImage,
    url: productUrl,
    type: "product",
    price: product.price,
    currency: "EUR",
    imageWidth: 1200,
    imageHeight: 630,
    locale
  });

  const twitterTags = generateTwitterCardTags({
    title: product.name,
    description: product.shortDescription,
    image: productImage
  });

  return {
    // template in layout.tsx adds "| Nuage"
    title: product.name,
    description: product.shortDescription,
    alternates: {
      // relative — resolved against metadataBase (env-driven SITE_URL)
      canonical: productPath
    },
    openGraph: {
      title: ogTags["og:title"],
      description: ogTags["og:description"],
      url: ogTags["og:url"],
      type: "website",
      locale: ogTags["og:locale"],
      images: productImage ? [{
        url: absoluteImageUrl,
        alt: product.name,
        width: 1200,
        height: 630,
      }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: twitterTags["twitter:title"],
      description: twitterTags["twitter:description"],
      images: productImage ? [absoluteImageUrl] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = STRINGS[locale];
  const rawProduct = await getProductBySlug(slug);

  if (!rawProduct) {
    notFound();
  }

  const product = localizeProduct(rawProduct, locale);

  // Compute recommendations server-side so we only serialize a handful of
  // products to the client instead of the entire catalog.
  const allProducts = await getAllProducts();

  const relatedProducts = localizeProducts(
    allProducts
      .filter((p) => p.id !== product.id && p.category === product.category)
      .slice(0, 4),
    locale
  );

  const complementaryCategories = getComplementaryCategories(product.category);
  const complementaryProducts = localizeProducts(
    allProducts
      .filter(
        (p) => p.id !== product.id && complementaryCategories.includes(p.category)
      )
      .sort(
        (a, b) =>
          complementaryCategories.indexOf(a.category) -
          complementaryCategories.indexOf(b.category)
      )
      .slice(0, 4),
    locale
  );

  // Fetch reviews data from database
  const reviews = await getProductReviews(product.id);
  const stats = await getProductRatingStats(product.id);

  // Generate structured data
  const productSchema = generateProductSchema(product, stats || undefined);

  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: t.home, url: "/" },
    { name: t.products, url: "/produits" },
    { name: product.name, url: `/produits/${product.slug}` }
  ]);

  return (
    <>
      {/* JSON-LD Structured Data (safeJsonLd escapes "<" — product data
          contains scraped third-party strings) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />

      {/* Track product view for browse history */}
      <ProductViewTracker productId={product.id} productName={product.name} />

      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
        complementaryProducts={complementaryProducts}
        reviews={reviews}
        stats={stats}
      />
    </>
  );
}
