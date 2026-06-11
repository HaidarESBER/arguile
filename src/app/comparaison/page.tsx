import { Metadata } from "next";
import ComparaisonClient from "./ComparaisonClient";
import { getAllProducts } from "@/lib/products";
import { getBatchProductRatingStats } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "Comparaison de produits",
  description:
    "Comparez jusqu'à 3 produits Nuage côte à côte : prix, notes, disponibilité et caractéristiques.",
  robots: { index: false, follow: false },
};

export default async function ComparaisonPage() {
  // Load real products from the database (not the seed catalogue)
  const products = await getAllProducts();

  // Real review statistics in a single batch query
  const productIds = products.map((p) => p.id);
  const ratingsMap = await getBatchProductRatingStats(productIds);

  return <ComparaisonClient products={products} ratingsMap={ratingsMap} />;
}
