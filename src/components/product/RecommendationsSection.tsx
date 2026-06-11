"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/product/ProductCard";
import { Product } from "@/types/product";

interface RecommendationsSectionProps {
  title: string;
  subtitle?: string;
  productId?: string;
  limit?: number;
  className?: string;
}

/**
 * RecommendationsSection component
 *
 * Fetches and displays personalized product recommendations
 *
 * Features:
 * - Client-side fetch from /api/recommendations
 * - Loading skeleton while fetching
 * - Graceful handling (returns null if no recommendations)
 * - Stagger animation for product grid
 * - Nuage design system styling
 */
export function RecommendationsSection({
  title,
  subtitle,
  productId,
  limit = 6,
  className = "",
}: RecommendationsSectionProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecommendations = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (productId) params.append('productId', productId);
      params.append('limit', limit.toString());

      const response = await fetch(`/api/recommendations?${params.toString()}`);
      const data = await response.json();

      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  }, [productId, limit]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Don't render if no recommendations
  if (!isLoading && recommendations.length === 0) {
    return null;
  }

  return (
    <section className={`mt-16 sm:mt-24 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl sm:text-4xl text-primary mb-3">
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted text-lg">
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Products Grid */}
        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="bg-background-card rounded-xl overflow-hidden border border-border/50 animate-pulse"
              >
                <div className="aspect-square bg-muted/20" />
                <div className="p-5">
                  <div className="h-6 bg-muted/20 rounded mb-3" />
                  <div className="h-4 bg-muted/20 rounded w-3/4 mb-4" />
                  <div className="h-10 bg-muted/20 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Product grid with stagger animation
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {recommendations.map((product) => (
              <motion.div
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
