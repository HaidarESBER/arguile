import { Metadata } from "next";
import { ProduitsClientEnhanced } from "./ProduitsClientEnhanced";
import { getAllProducts, toProductListItem } from "@/lib/products";
import { getBatchProductRatingStats } from "@/lib/reviews";
import {
  ProductCategory,
} from "@/types/product";

interface ProduitsPageProps {
  searchParams: Promise<{ categorie?: string; q?: string; page?: string }>;
}

const categoryMeta: Record<string, { title: string; description: string }> = {
  chicha: {
    title: "Chichas Premium",
    description:
      "Découvrez notre sélection de chichas haut de gamme. Designs élégants et matériaux de qualité pour une expérience unique.",
  },
  bol: {
    title: "Bols à Chicha",
    description:
      "Bols en céramique, verre et silicone pour chicha. Qualité artisanale pour une chauffe optimale du tabac.",
  },
  tuyau: {
    title: "Tuyaux de Chicha",
    description:
      "Tuyaux en silicone et cuir pour chicha. Matériaux premium pour un tirage parfait et une expérience confortable.",
  },
  charbon: {
    title: "Charbon pour Chicha",
    description:
      "Charbon naturel et auto-allumant pour chicha. Combustion longue et régulière pour des sessions prolongées.",
  },
  accessoire: {
    title: "Accessoires Chicha",
    description:
      "Accessoires essentiels pour chicha : pinces, embouts, filtres, brosses et plus. Tout pour entretenir votre chicha.",
  },
};

export async function generateMetadata({
  searchParams,
}: ProduitsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const category = params.categorie;

  const meta =
    category && categoryMeta[category] ? categoryMeta[category] : null;
  const title = meta ? meta.title : "Produits";
  const description =
    meta?.description ||
    "Découvrez notre collection de chichas premium, bols, tuyaux, charbon et accessoires. Qualité supérieure pour une expérience unique.";

  return {
    title,
    description,
    // Parameterized variants (?categorie=, ?q=, ?page=) canonicalize to the
    // main catalog page to avoid duplicate-content indexing.
    alternates: { canonical: "/produits" },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "fr_FR",
    },
  };
}

export default async function ProduitsPage({ searchParams }: ProduitsPageProps) {
  const params = await searchParams;
  const categoryParam = params.categorie as ProductCategory | undefined;
  const searchQuery = params.q || '';
  const currentPage = parseInt(params.page || '1', 10);

  // Validate category parameter
  const validCategories: ProductCategory[] = [
    "chicha",
    "bol",
    "tuyau",
    "charbon",
    "accessoire",
  ];
  const isValidCategory =
    categoryParam && validCategories.includes(categoryParam);
  const activeCategory = isValidCategory ? categoryParam : null;

  // Load products from database and trim to the fields the grid needs
  // (no full descriptions, single image) before crossing the RSC boundary
  const allProducts = await getAllProducts();
  const products = allProducts.map(toProductListItem);

  // Fetch ratings for all products in a single batch query (optimized)
  const productIds = products.map(p => p.id);
  const ratingsMap = await getBatchProductRatingStats(productIds);

  return (
    <ProduitsClientEnhanced
      products={products}
      activeCategory={activeCategory}
      searchQuery={searchQuery}
      ratingsMap={ratingsMap}
      initialPage={currentPage}
    />
  );
}
