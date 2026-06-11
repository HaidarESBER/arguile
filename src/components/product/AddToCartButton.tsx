"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { QuantitySelector } from "./BuyBox/QuantitySelector";

interface AddToCartButtonProps {
  product: Product;
}

/**
 * Client component for adding products to cart from detail page
 *
 * Features:
 * - Quantity selection with stock validation (default 1)
 * - Add to cart functionality with celebratory animation
 * - Disabled state for out of stock
 * - Spring animation with checkmark on success
 * - Accessibility-friendly success feedback
 */
export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    if (product.inStock) {
      addItem(product, quantity);
      setIsAdded(true);
      // Reset feedback after brief delay
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quantity selector with stock validation */}
      {product.inStock && (
        <QuantitySelector
          quantity={quantity}
          onChange={setQuantity}
          stockLevel={product.stockLevel}
          disabled={!product.inStock}
        />
      )}

      {/* Add to cart button with enhanced success feedback */}
      <motion.div
        animate={
          isAdded
            ? { scale: [1, 1.02, 1] }
            : { scale: 1 }
        }
        transition={{
          duration: 0.4,
          ease: [0.21, 0.47, 0.32, 0.98], // Nuage easing
        }}
      >
        <Button
          variant="primary"
          size="lg"
          disabled={!product.inStock}
          onClick={handleAddToCart}
          className={`w-full transition-all duration-300 relative overflow-hidden ${
            isAdded
              ? "!bg-green-600 !text-white hover:!bg-green-700"
              : "hover:shadow-lg"
          }`}
          aria-live="polite"
          aria-label={isAdded ? "Produit ajouté au panier" : "Ajouter au panier"}
        >
          <span className="flex items-center justify-center gap-2 relative z-10">
            <AnimatePresence mode="wait">
              {isAdded ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Ajouté !
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  Ajouter au panier
                </motion.span>
              )}
            </AnimatePresence>
          </span>

          {/* Success ripple effect */}
          <AnimatePresence>
            {isAdded && (
              <motion.div
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 bg-green-400 rounded-[--radius-button]"
              />
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Out of stock message */}
      {!product.inStock && (
        <p className="text-muted text-sm">
          Ce produit est actuellement indisponible.
        </p>
      )}
    </div>
  );
}
