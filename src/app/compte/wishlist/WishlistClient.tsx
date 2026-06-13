"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui";
import { ProductCard } from "@/components/product/ProductCard";
import { RecommendationsSection } from "@/components/product/RecommendationsSection";
import { Product } from "@/types/product";
import { useWishlist } from "@/contexts/WishlistContext";
import { useLocale } from "@/contexts/LocaleContext";

const STRINGS = {
  fr: {
    loadError: "Impossible de charger vos produits favoris",
    loading: "Chargement...",
    retry: "Réessayer",
    title: "Ma Liste de Souhaits",
    countSubtitle: (count: number) =>
      `${count} ${count === 1 ? "produit" : "produits"} dans votre liste`,
    emptySubtitle: "Votre liste de souhaits est vide",
    emptyTitle: "Votre liste est vide",
    emptyHint: "Parcourez notre catalogue et ajoutez vos produits favoris",
    discoverProducts: "Découvrir nos produits",
    recoTitle: "Basé sur vos favoris",
    recoSubtitle: "Produits similaires que vous pourriez aimer",
  },
  en: {
    loadError: "Unable to load your favorite products",
    loading: "Loading...",
    retry: "Try again",
    title: "My Wishlist",
    countSubtitle: (count: number) =>
      `${count} ${count === 1 ? "product" : "products"} in your list`,
    emptySubtitle: "Your wishlist is empty",
    emptyTitle: "Your list is empty",
    emptyHint: "Browse our catalog and add your favorite products",
    discoverProducts: "Discover our products",
    recoTitle: "Based on your favorites",
    recoSubtitle: "Similar products you might like",
  },
} as const;

export default function WishlistPage() {
  const router = useRouter();
  const { wishlistItems: wishlistIds } = useWishlist();
  const { locale } = useLocale();
  const t = STRINGS[locale];
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch product details for wishlist items
  useEffect(() => {
    async function fetchProducts() {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Fetch all products and filter by wishlist IDs
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');

        const allProducts: Product[] = await response.json();
        const wishlistProducts = allProducts.filter(p => wishlistIds.includes(p.id));
        setProducts(wishlistProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching wishlist products:', err);
        setError(t.loadError);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [wishlistIds, t]);

  if (isLoading) {
    return (
      <Container size="lg" className="py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent-blush border-t-transparent"></div>
          <p className="mt-4 text-muted">{t.loading}</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" className="py-16">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <button
            onClick={() => router.refresh()}
            className="mt-4 px-6 py-2 bg-accent-blush text-white rounded-full hover:bg-accent-blush/90 transition-colors"
          >
            {t.retry}
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <h1 className="font-heading text-4xl md:text-5xl text-primary mb-4">
          {t.title}
        </h1>
        <p className="text-muted text-lg">
          {products.length > 0
            ? t.countSubtitle(products.length)
            : t.emptySubtitle}
        </p>
      </motion.div>

      {/* Empty State */}
      {products.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16"
        >
          <svg
            className="mx-auto h-24 w-24 text-muted/50 mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          <h2 className="font-heading text-2xl text-primary mb-4">
            {t.emptyTitle}
          </h2>
          <p className="text-muted mb-8">
            {t.emptyHint}
          </p>
          <button
            onClick={() => router.push("/produits")}
            className="px-8 py-3 bg-accent-blush text-white rounded-full hover:bg-accent-blush/90 transition-all hover:scale-105 font-medium"
          >
            {t.discoverProducts}
          </button>
        </motion.div>
      )}

      {/* Products Grid */}
      {products.length > 0 && (
        <>
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Recommendations based on wishlist */}
          <RecommendationsSection
            title={t.recoTitle}
            subtitle={t.recoSubtitle}
            limit={6}
          />
        </>
      )}
    </Container>
  );
}
