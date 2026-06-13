import { Metadata } from "next";
import ComparaisonClient from "./ComparaisonClient";
import { getAllProducts } from "@/lib/products";
import { getBatchProductRatingStats } from "@/lib/reviews";
import { getLocale } from "@/lib/i18n/server";

const STRINGS = {
  fr: {
    title: "Comparaison de produits",
    description:
      "Comparez jusqu'à 3 produits Nuage côte à côte : prix, notes, disponibilité et caractéristiques.",
  },
  en: {
    title: "Product comparison",
    description:
      "Compare up to 3 Nuage products side by side: price, ratings, availability and features.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = STRINGS[locale];

  return {
    title: t.title,
    description: t.description,
    robots: { index: false, follow: false },
  };
}

export default async function ComparaisonPage() {
  // Load real products from the database (not the seed catalogue)
  const products = await getAllProducts();

  // Real review statistics in a single batch query
  const productIds = products.map((p) => p.id);
  const ratingsMap = await getBatchProductRatingStats(productIds);

  return <ComparaisonClient products={products} ratingsMap={ratingsMap} />;
}
