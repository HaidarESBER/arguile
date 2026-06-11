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
} from "@/lib/seo";
import { ProductCategory } from "@/types/product";
import { ProductDetailClient } from "./ProductDetailClient";
import { ProductViewTracker } from "@/components/product/ProductViewTracker";

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
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Produit non trouvé | Nuage",
    };
  }

  const productUrl = `https://nuage.fr/produits/${product.slug}`;

  // Ensure absolute URL for images
  const productImage = product.images[0];
  const absoluteImageUrl = productImage?.startsWith('http')
    ? productImage
    : `https://nuage.fr${productImage}`;

  const ogTags = generateOpenGraphTags({
    title: product.name,
    description: product.shortDescription,
    image: productImage,
    url: productUrl,
    type: "product",
    price: product.price,
    currency: "EUR",
    imageWidth: 1200,
    imageHeight: 630
  });

  const twitterTags = generateTwitterCardTags({
    title: product.name,
    description: product.shortDescription,
    image: productImage
  });

  return {
    title: `${product.name} | Nuage`,
    description: product.shortDescription,
    alternates: {
      canonical: productUrl
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
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Compute recommendations server-side so we only serialize a handful of
  // products to the client instead of the entire catalog.
  const allProducts = await getAllProducts();

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  const complementaryCategories = getComplementaryCategories(product.category);
  const complementaryProducts = allProducts
    .filter(
      (p) => p.id !== product.id && complementaryCategories.includes(p.category)
    )
    .sort(
      (a, b) =>
        complementaryCategories.indexOf(a.category) -
        complementaryCategories.indexOf(b.category)
    )
    .slice(0, 4);

  // Fetch reviews data from database
  const reviews = await getProductReviews(product.id);
  const stats = await getProductRatingStats(product.id);

  // Generate structured data
  const productSchema = generateProductSchema(product, stats || undefined);

  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Accueil", url: "/" },
    { name: "Produits", url: "/produits" },
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
