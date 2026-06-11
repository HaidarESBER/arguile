"use client";

import { motion } from "framer-motion";
import { useWishlist } from "@/contexts/WishlistContext";

interface WishlistButtonProps {
  productId: string;
  productName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
}

/**
 * WishlistButton component with animated heart icon
 *
 * Features:
 * - Heart fills with blush color when in wishlist
 * - Spring animation on add (1 → 1.3 → 1 scale)
 * - Pulse animation on remove
 * - Three sizes: sm (24px), md (32px), lg (40px)
 */
export function WishlistButton({
  productId,
  productName,
  size = "md",
  className = "",
  showLabel = false,
}: WishlistButtonProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const inWishlist = isInWishlist(productId);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWishlist) {
      removeFromWishlist(productId, productName);
    } else {
      addToWishlist(productId, productName);
    }
  };

  const sizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <motion.button
      onClick={handleToggle}
      className={`inline-flex items-center gap-2 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={inWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <motion.div
        animate={{
          scale: inWishlist ? [1, 1.3, 1] : 1,
        }}
        transition={{
          duration: 0.4,
          ease: "easeInOut",
          times: [0, 0.5, 1],
        }}
        className={sizes[size]}
      >
        <svg
          viewBox="0 0 24 24"
          fill={inWishlist ? "#D4A5A5" : "none"}
          stroke={inWishlist ? "#D4A5A5" : "currentColor"}
          strokeWidth={inWishlist ? 0 : 2}
          className="w-full h-full transition-colors duration-200"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      </motion.div>
      {showLabel && (
        <span className="text-sm font-medium">
          {inWishlist ? "Dans les favoris" : "Ajouter aux favoris"}
        </span>
      )}
    </motion.button>
  );
}
