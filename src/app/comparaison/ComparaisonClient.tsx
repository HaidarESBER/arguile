"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui";
import { useComparison } from "@/contexts/ComparisonContext";
import { useCart } from "@/contexts/CartContext";
import { Product, formatPrice, categoryLabels } from "@/types/product";
import { StarRatingDisplay } from "@/components/product/StarRating";

interface ComparaisonClientProps {
  products: Product[];
  ratingsMap: Record<string, { averageRating: number; totalReviews: number }>;
}

export default function ComparaisonClient({
  products,
  ratingsMap,
}: ComparaisonClientProps) {
  const { comparisonItems, removeFromComparison, clearComparison } = useComparison();
  const { addItem } = useCart();

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
              Comparaison de produits
            </h1>
            <p className="text-muted">
              {comparisonProducts.length > 0
                ? `Comparaison de ${comparisonProducts.length} produit${comparisonProducts.length > 1 ? "s" : ""} (max 3)`
                : "Aucun produit à comparer"}
            </p>
          </div>
          {comparisonProducts.length > 0 && (
            <button
              onClick={clearComparison}
              className="text-sm text-muted hover:text-primary transition-colors"
            >
              Tout effacer
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
                    Caractéristiques
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
                  <td className="p-4 text-sm font-medium text-primary">Prix</td>
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
                  <td className="p-4 text-sm font-medium text-primary">Note</td>
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
                            Pas d&apos;avis
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Stock row */}
                <tr className="bg-background-secondary">
                  <td className="p-4 text-sm font-medium text-primary">Disponibilité</td>
                  {comparisonProducts.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {product.inStock ? (
                        <span className="text-success text-sm">En stock</span>
                      ) : (
                        <span className="text-error text-sm">Rupture de stock</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Category row */}
                <tr>
                  <td className="p-4 text-sm font-medium text-primary">Catégorie</td>
                  {comparisonProducts.map((product) => (
                    <td key={product.id} className="p-4 text-center text-sm text-muted">
                      {categoryLabels[product.category]}
                    </td>
                  ))}
                </tr>

                {/* Description row */}
                <tr className="bg-background-secondary">
                  <td className="p-4 text-sm font-medium text-primary">Description</td>
                  {comparisonProducts.map((product) => (
                    <td key={product.id} className="p-4 text-sm text-muted text-center">
                      {product.shortDescription}
                    </td>
                  ))}
                </tr>

                {/* Actions row */}
                <tr>
                  <td className="p-4 text-sm font-medium text-primary">Actions</td>
                  {comparisonProducts.map((product) => (
                    <td key={product.id} className="p-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleAddToCart(product.id)}
                          disabled={!product.inStock}
                          className="px-4 py-2 bg-primary text-background rounded-[--radius-button] hover:bg-accent hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          Ajouter au panier
                        </button>
                        <button
                          onClick={() => removeFromComparison(product.id)}
                          className="px-4 py-2 text-muted hover:text-primary transition-colors text-sm"
                        >
                          Retirer
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
              Aucun produit à comparer
            </h2>
            <p className="text-muted mb-8 max-w-md">
              Parcourez notre catalogue et cliquez sur &quot;Comparer&quot; pour ajouter des produits à la comparaison (max 3)
            </p>

            {/* CTA button */}
            <Link
              href="/produits"
              className="inline-flex items-center px-6 py-3 bg-primary text-background rounded-[--radius-button] hover:bg-accent hover:text-primary transition-colors font-medium"
            >
              Découvrir les produits
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
                        <span className="text-success">En stock</span>
                      ) : (
                        <span className="text-error">Rupture de stock</span>
                      )}
                    </div>

                    <p className="text-sm text-muted">{product.shortDescription}</p>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        disabled={!product.inStock}
                        className="flex-1 px-4 py-2 bg-primary text-background rounded-[--radius-button] hover:bg-accent hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        Ajouter au panier
                      </button>
                      <button
                        onClick={() => removeFromComparison(product.id)}
                        className="px-4 py-2 text-muted hover:text-primary transition-colors text-sm"
                      >
                        Retirer
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
