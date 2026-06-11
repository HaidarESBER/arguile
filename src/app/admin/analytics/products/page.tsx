/**
 * Product Analytics Page
 * Admin dashboard for product performance and search insights
 */

import { redirect } from "next/navigation";
import { getTopEvents, getTopWishlistedProducts, getProductViewsWithUniqueVisitors, TopEvent } from "@/lib/analytics-server";
import TopProducts from "@/components/admin/TopProducts";
import SearchAnalytics from "@/components/admin/SearchAnalytics";
import Link from "next/link";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Analyse des Produits - Admin Nuage",
  description: "Performance des produits et insights de recherche",
};

export default async function ProductAnalyticsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }
  // Fetch top events with error handling
  let viewedProducts: TopEvent[] = [];
  let cartProducts: TopEvent[] = [];
  let wishlistedProducts: TopEvent[] = [];
  let topSearches: TopEvent[] = [];

  try {
    viewedProducts = await getProductViewsWithUniqueVisitors(10);
  } catch (error) {
    console.error("Failed to fetch viewed products:", error);
  }

  try {
    cartProducts = await getTopEvents("add_to_cart", 10);
  } catch (error) {
    console.error("Failed to fetch cart products:", error);
  }

  try {
    wishlistedProducts = await getTopWishlistedProducts(10);
  } catch (error) {
    console.error("Failed to fetch wishlisted products:", error);
  }

  try {
    topSearches = await getTopEvents("search", 20);
  } catch (error) {
    console.error("Failed to fetch top searches:", error);
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin"
          className="text-sm md:text-base text-accent hover:underline transition-colors"
        >
          ← Retour au tableau de bord
        </Link>
        <h2 className="mt-4 text-xl md:text-2xl font-heading font-semibold text-primary">
          Analyse des Produits
        </h2>
        <p className="mt-2 text-sm md:text-base text-primary/70">
          Performance des produits et insights de recherche
        </p>
      </div>

      {/* Top Products */}
      <section className="bg-white rounded-lg border border-primary/10 p-4 md:p-6">
        <TopProducts
          viewedProducts={viewedProducts}
          cartProducts={cartProducts}
        />
      </section>

      {/* Wishlist Analytics */}
      <section className="bg-white rounded-lg border border-primary/10 p-4 md:p-6">
        <h3 className="text-base md:text-lg font-heading font-semibold text-primary mb-3 md:mb-4">
          Produits Favoris
        </h3>
        <p className="text-xs md:text-sm text-primary/70 mb-4 md:mb-6">
          Produits les plus ajoutés aux favoris
        </p>
        {wishlistedProducts.length === 0 ? (
          <p className="text-primary/60 text-center py-8">
            Aucun produit favori pour le moment
          </p>
        ) : (
          <div className="space-y-3">
            {wishlistedProducts.map((product, index) => (
              <div
                key={product.key}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl font-heading font-semibold text-primary/40 w-6">
                    {index + 1}
                  </span>
                  <span className="text-primary font-medium">
                    {product.label || product.key}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💗</span>
                  <span className="text-lg font-semibold text-accent">
                    {product.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Search Analytics */}
      <section className="bg-white rounded-lg border border-primary/10 p-4 md:p-6">
        <SearchAnalytics topSearches={topSearches} />
      </section>
    </div>
  );
}
