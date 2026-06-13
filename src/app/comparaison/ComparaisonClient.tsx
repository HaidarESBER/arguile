"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui";
import { useComparison } from "@/contexts/ComparisonContext";
import { useCart } from "@/contexts/CartContext";
import { Product, formatPrice, categoryLabels } from "@/types/product";
import { StarRatingDisplay } from "@/components/product/StarRating";
import { useLocale } from "@/contexts/LocaleContext";

interface ComparaisonClientProps {
  products: Product[];
  ratingsMap: Record<string, { averageRating: number; totalReviews: number }>;
}

const STRINGS = {
  fr: {
    title: "Comparaison de produits",
    comparingCount: (count: number) =>
      `Comparaison de ${count} produit${count > 1 ? "s" : ""} (max 3)`,
    noProducts: "Aucun produit à comparer",
    clearAll: "Tout effacer",
    features: "Caractéristiques",
    price: "Prix",
    rating: "Note",
    noReviews: "Pas d'avis",
    availability: "Disponibilité",
    inStock: "En stock",
    outOfStock: "Rupture de stock",
    category: "Catégorie",
    description: "Description",
    actions: "Actions",
    addToCart: "Ajouter au panier",
    remove: "Retirer",
    emptyHint:
      'Parcourez notre catalogue et cliquez sur "Comparer" pour ajouter des produits à la comparaison (max 3)',
    discoverProducts: "Découvrir les produits",
  },
  en: {
    title: "Product comparison",
    comparingCount: (count: number) =>
      `Comparing ${count} product${count > 1 ? "s" : ""} (max 3)`,
    noProducts: "No products to compare",
    clearAll: "Clear all",
    features: "Features",
    price: "Price",
    rating: "Rating",
    noReviews: "No reviews",
    availability: "Availability",
    inStock: "In stock",
    outOfStock: "Out of stock",
    category: "Category",
    description: "Description",
    actions: "Actions",
    addToCart: "Add to cart",
    remove: "Remove",
    emptyHint:
      'Browse our catalog and click "Compare" to add products to the comparison (max 3)',
    discoverProducts: "Discover products",
  },
} as const;

export default function ComparaisonClient({
  products,
  ratingsMap,
}: ComparaisonClientProps) {
  const { comparisonItems, removeFromComparison, clearComparison } = useComparison();
  const { addItem } = useCart();
  const { locale } = useLocale();
  const t = STRINGS[locale];

  // Get full product data for comparison items
  const comparisonProducts = products.filter((product) =>
    comparisonItems.includes(product.id)
  );

  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      addItem(product);
    }
  };

  // Find lowest price for highlighting
  const lowestPrice = comparisonProducts.length > 0
    ? Math.min(...comparisonProducts.map((p) => p.price))
    : 0;

  return (
    <main className="py-12 lg:py-16">
      <Container size="lg">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl text-primary mb-2">
              {t.title}
            </h1>
            <p className="text-muted">
              {comparisonProducts.length > 0
                ? t.comparingCount(comparisonProducts.length)
                : t.noProducts}
            </p>
          </div>
          {comparisonProducts.length > 0 && (
            <button
              onClick={clearComparison}
              className="text-sm text-muted hover:text-primary transition-colors"
            >
              {t.clearAll}
            </button>
          )}
        </div>

        {/* Comparison content */}
        {comparisonProducts.length > 0 ? (
          /* Desktop: Side-by-side table */
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-background z-10">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted border-b border-background-secondary w-48">
                    {t.features}
                  </th>
                  {comparisonProducts.map((product) => (
                    <th key={product.id} className="p-4 border-b border-background-secondary">
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative w-48 h-48 rounded-[--radius-card] overflow-hidden">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="200px"
                            className="object-cover"
                          />
                        </div>
                        <Link
                          href={`/produits/${product.slug}`}
                          className="text-primary hover:text-accent transition-colors font-medium text-center"
                        >
                          {product.name}
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price row */}
                <tr className="bg-background-secondary">
                  <td className="p-4 text-sm font-medium text-primary">{t.price}</td>
                  {comparisonProducts.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <span
                        className={`text-lg font-medium ${
                          product.price === lowestPrice
                            ? "text-success"
                            : "text-primary"
                        }`}
                      >
                        {formatPrice(product.price)}
                      </span>
                      {product.compareAtPrice && (
                        <div className="text-sm text-muted line-through">
                          {formatPrice(product.compareAtPrice)}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Rating row */}
                <tr>
                  <td className="p-4 text-sm font-medium text-primary">{t.rating}</td>
                  {comparisonProducts.map((product) => {
                    const stats = ratingsMap[product.id];
                    return (
                      <td key={product.id} className="p-4">
                        {stats ? (
                          <div className="flex justify-center">
                            <StarRatingDisplay
                              rating={stats.averageRating}
                              totalReviews={stats.totalReviews}
                              size="sm"
                            />
                          </div>
                        ) : (
                          <div className="text-center text-muted text-sm">
                            {t.noReviews}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Stock row */}
                <tr className="bg-background-secondary">
                  <td className="p-4 text-sm font-medium text-primary">{t.availability}</td>
                  {comparisonProducts.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {product.inStock ? (
                        <span className="text-success text-sm">{t.inStock}</span>
                      ) : (
                        <span className="text-error text-sm">{t.outOfStock}</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Category row */}
                <tr>
                  <td className="p-4 text-sm font-medium text-primary">{t.category}</td>
                  {comparisonProducts.map((product) => (
                    <td key={product.id} className="p-4 text-center text-sm text-muted">
                      {categoryLabels[product.category]}
                    </td>
                  ))}
                </tr>

                {/* Description row */}
                <tr className="bg-background-secondary">
                  <td className="p-4 text-sm font-medium text-primary">{t.description}</td>
                  {comparisonProducts.map((product) => (
                    <td key={product.id} className="p-4 text-sm text-muted text-center">
                      {product.shortDescription}
                    </td>
                  ))}
                </tr>

                {/* Actions row */}
                <tr>
                  <td className="p-4 text-sm font-medium text-primary">{t.actions}</td>
                  {comparisonProducts.map((product) => (
                    <td key={product.id} className="p-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleAddToCart(product.id)}
                          disabled={!product.inStock}
                          className="px-4 py-2 bg-primary text-background rounded-[--radius-button] hover:bg-accent hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          {t.addToCart}
                        </button>
                        <button
                          onClick={() => removeFromComparison(product.id)}
                          className="px-4 py-2 text-muted hover:text-primary transition-colors text-sm"
                        >
                          {t.remove}
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            {/* Comparison icon */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mb-6"
            >
              <svg
                className="w-24 h-24 text-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                />
              </svg>
            </motion.div>

            {/* Empty message */}
            <h2 className="text-2xl text-primary mb-3">
              {t.noProducts}
            </h2>
            <p className="text-muted mb-8 max-w-md">
              {t.emptyHint}
            </p>

            {/* CTA button */}
            <Link
              href="/produits"
              className="inline-flex items-center px-6 py-3 bg-primary text-background rounded-[--radius-button] hover:bg-accent hover:text-primary transition-colors font-medium"
            >
              {t.discoverProducts}
            </Link>
          </motion.div>
        )}

        {/* Mobile: Stacked cards */}
        {comparisonProducts.length > 0 && (
          <div className="md:hidden space-y-6">
            {comparisonProducts.map((product, index) => {
              const stats = ratingsMap[product.id];
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-background-card rounded-[--radius-card] overflow-hidden shadow-sm"
                >
                  {/* Product image */}
                  <div className="relative aspect-square">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>

                  {/* Product details */}
                  <div className="p-4 space-y-3">
                    <Link
                      href={`/produits/${product.slug}`}
                      className="text-lg font-medium text-primary hover:text-accent transition-colors block"
                    >
                      {product.name}
                    </Link>

                    <div className="flex items-baseline gap-2">
                      <span
                        className={`text-xl font-medium ${
                          product.price === lowestPrice ? "text-success" : "text-primary"
                        }`}
                      >
                        {formatPrice(product.price)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-sm text-muted line-through">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>

                    {stats && (
                      <StarRatingDisplay
                        rating={stats.averageRating}
                        totalReviews={stats.totalReviews}
                        size="sm"
                      />
                    )}

                    <div className="text-sm text-muted">
                      {product.inStock ? (
                        <span className="text-success">{t.inStock}</span>
                      ) : (
                        <span className="text-error">{t.outOfStock}</span>
                      )}
                    </div>

                    <p className="text-sm text-muted">{product.shortDescription}</p>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        disabled={!product.inStock}
                        className="flex-1 px-4 py-2 bg-primary text-background rounded-[--radius-button] hover:bg-accent hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {t.addToCart}
                      </button>
                      <button
                        onClick={() => removeFromComparison(product.id)}
                        className="px-4 py-2 text-muted hover:text-primary transition-colors text-sm"
                      >
                        {t.remove}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Container>
    </main>
  );
}
