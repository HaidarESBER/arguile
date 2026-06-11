"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { motion } from "framer-motion";
import { Product, formatPrice } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { StarRatingDisplay } from "@/components/product/StarRating";
import { StockIndicator } from "@/components/product/StockIndicator";
import { QuickViewModal } from "./QuickViewModal";
import { isTrending } from "@/lib/social-proof";
import { TrendingBadge } from "./TrendingBadge";

interface ProductCardProps {
  product: Product;
  /** Use priority loading for above-the-fold images */
  priority?: boolean;
  /** Product rating statistics from database */
  ratingStats?: { averageRating: number; totalReviews: number } | null;
  /** Disable entrance animation (useful for horizontal scrolling) */
  disableAnimation?: boolean;
}

/**
 * ProductCard component displays a single product in the catalog
 *
 * Features:
 * - 16:9 aspect ratio image with hover scale effect
 * - Product name in heading font
 * - Price display with sale price support
 * - "Ajouter au panier" button with cart integration
 * - Image links to product detail page
 *
 * @example
 * <ProductCard product={product} priority={true} />
 */
export const ProductCard = memo(function ProductCard({ product, priority = false, ratingStats, disableAnimation = false }: ProductCardProps) {
  const { addItem } = useCart();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.inStock) {
      addItem(product);
      setJustAdded(true);
      setShowAddedToast(true);
      setTimeout(() => {
        setJustAdded(false);
        setShowAddedToast(false);
      }, 2000);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const cardClassName = "group glass-card glass-card-hover rounded-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 flex flex-col h-full";

  const cardContent = (
    <ProductCardContent
      product={product}
      priority={priority}
      ratingStats={ratingStats}
      justAdded={justAdded}
      showAddedToast={showAddedToast}
      isQuickViewOpen={isQuickViewOpen}
      onAddToCart={handleAddToCart}
      onQuickView={handleQuickView}
      onCloseQuickView={() => setIsQuickViewOpen(false)}
    />
  );

  return disableAnimation ? (
    <div className={cardClassName}>{cardContent}</div>
  ) : (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cardClassName}
    >
      {cardContent}
    </motion.div>
  );
});

interface ProductCardContentProps {
  product: Product;
  priority: boolean;
  ratingStats?: { averageRating: number; totalReviews: number } | null;
  justAdded: boolean;
  showAddedToast: boolean;
  isQuickViewOpen: boolean;
  onAddToCart: (e: React.MouseEvent) => void;
  onQuickView: (e: React.MouseEvent) => void;
  onCloseQuickView: () => void;
}

/** Card body hoisted to module scope so it is not re-created as a new component type on every render */
function ProductCardContent({
  product,
  priority,
  ratingStats,
  justAdded,
  showAddedToast,
  isQuickViewOpen,
  onAddToCart,
  onQuickView,
  onCloseQuickView,
}: ProductCardContentProps) {
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <>
      {/* Image container - Premium display */}
      <Link href={`/produits/${product.slug}`} className="block relative">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-background-secondary to-background p-1.5">
          {/* Trending badge */}
          {isTrending(product) && <TrendingBadge />}

          <motion.div
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative w-full h-full"
          >
            <OptimizedImage
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              objectFit="contain"
              priority={priority}
            />
          </motion.div>

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Favorites hidden (guest-only shop): the card's add-to-cart
              button below is the single product action */}

          {/* Desktop Quick View - Center overlay on hover */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="hidden md:flex absolute inset-0 m-auto w-fit h-fit px-2 py-1 glass-card backdrop-blur-md text-white rounded-full text-[9px] font-medium shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 items-center gap-1 z-10 hover:border-primary/30"
            onClick={onQuickView}
          >
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Aperçu rapide
          </motion.button>

          {/* Out of stock overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-medium text-xs uppercase tracking-wider">
                Rupture de stock
              </span>
            </div>
          )}

          {/* Sale badge - elegant design */}
          {hasDiscount && product.inStock && (
            <div className="absolute top-2 left-2 bg-primary text-background text-xs font-bold px-1.5 py-0.5 rounded-full">
              -{Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)}%
            </div>
          )}
        </div>
      </Link>

      {/* Reviews section - Below image */}
      {ratingStats && (
        <div className="px-2.5 pt-2 pb-1.5 border-b border-white/10">
          <div className="flex items-center justify-start">
            <StarRatingDisplay
              rating={ratingStats.averageRating}
              totalReviews={ratingStats.totalReviews}
              size="xs"
            />
          </div>
        </div>
      )}

      {/* Content - Premium Layout */}
      <div className="p-2.5 flex-1 flex flex-col">
        {/* Product name */}
        <Link href={`/produits/${product.slug}`}>
          <h3 className="font-heading text-sm text-white line-clamp-2 mb-1.5 hover:text-primary transition-colors duration-300 min-h-[2.5rem] leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Price - Prominent display */}
        <div className="flex items-baseline gap-1.5 mb-1.5 pb-1.5 border-b border-white/10">
          <span className="text-base font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-text-muted line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>

        {/* Stock indicator */}
        <div className="mb-1">
          <StockIndicator
            inStock={product.inStock}
            stockLevel={product.stockLevel}
            size="sm"
            showDot={true}
          />
        </div>

        {/* CTA Button - Single, prominent */}
        <motion.button
          onClick={onAddToCart}
          disabled={!product.inStock}
          whileHover={{ scale: product.inStock ? 1.02 : 1 }}
          whileTap={{ scale: product.inStock ? 0.95 : 1 }}
          animate={justAdded ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
          className={`w-full inline-flex items-center justify-center gap-1 px-3 min-h-11 text-xs font-semibold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-auto ${
            justAdded
              ? "bg-green-500 text-background"
              : "bg-primary text-background hover:bg-primary-light"
          }`}
        >
          {justAdded ? (
            <>
              <span className="material-icons text-xs">check</span>
              <span>Ajouté</span>
            </>
          ) : (
            product.inStock ? "Ajouter au panier" : "Rupture de stock"
          )}
        </motion.button>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={onCloseQuickView}
      />

      {/* Toast notification for added to cart - Desktop only */}
      {showAddedToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="hidden md:flex fixed bottom-4 right-4 glass-card backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-lg z-50 max-w-sm items-center gap-2"
        >
          <span className="material-icons text-primary text-lg">check_circle</span>
          <span>Produit ajouté au panier</span>
        </motion.div>
      )}
    </>
  );
}
