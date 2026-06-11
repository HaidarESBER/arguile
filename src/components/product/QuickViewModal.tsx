"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Product, formatPrice } from "@/types/product";
import { useCart } from "@/contexts/CartContext";

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * QuickViewModal component for product preview without full navigation
 *
 * Features:
 * - Product image gallery (thumbnails + main image)
 * - Product name, price, description (truncated to 3 lines)
 * - "Ajouter au panier" button with quantity selector
 * - "Voir les détails" link to full product page
 * - Close button (X icon) + ESC key + click backdrop
 * - Body scroll lock when modal open
 * - Modal slides up from center with scale animation
 * - Backdrop: charcoal with 40% opacity
 * - Max width: 800px
 * - Responsive: Full screen on mobile (<768px)
 * - Uses React Portal for document.body level rendering
 */
export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const modalRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Focus trap (same pattern as BottomSheet) + initial focus
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    modal.addEventListener("keydown", handleTab as EventListener);
    firstFocusable?.focus();

    return () => {
      modal.removeEventListener("keydown", handleTab as EventListener);
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  const handleAddToCart = () => {
    if (product.inStock) {
      for (let i = 0; i < quantity; i++) {
        addItem(product);
      }
    }
  };

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-primary/40 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="quickview-title"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-background-card rounded-[--radius-card] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto pointer-events-auto relative md:max-h-[85vh]"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                aria-label="Fermer l'aperçu rapide"
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-background/80 hover:bg-background transition-colors"
              >
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Content */}
              <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
                {/* Left: Images */}
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-square bg-background-secondary rounded-[--radius-card] overflow-hidden">
                    <Image
                      src={product.images[selectedImage]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                      priority
                    />
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-primary/60 flex items-center justify-center">
                        <span className="text-background font-medium text-sm uppercase tracking-wide">
                          Rupture de stock
                        </span>
                      </div>
                    )}
                    {hasDiscount && product.inStock && (
                      <div className="absolute top-3 left-3 bg-error text-background text-xs font-medium px-2 py-1 rounded">
                        Promo
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {product.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`relative w-20 h-20 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                            selectedImage === index
                              ? "border-accent"
                              : "border-transparent hover:border-primary/30"
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Info */}
                <div className="flex flex-col">
                  {/* Product Name */}
                  <h2
                    id="quickview-title"
                    className="font-heading text-2xl md:text-3xl text-primary mb-3"
                  >
                    {product.name}
                  </h2>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-medium text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-lg text-muted line-through">
                        {formatPrice(product.compareAtPrice!)}
                      </span>
                    )}
                  </div>

                  {/* Description (truncated to 3 lines) */}
                  <p className="text-muted text-sm mb-6 line-clamp-3">
                    {product.description}
                  </p>

                  {/* Quantity Selector */}
                  <div className="mb-6">
                    <label className="block text-sm text-primary mb-2">Quantité</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={!product.inStock}
                        className="w-10 h-10 flex items-center justify-center rounded-[--radius-button] border border-primary/20 text-primary hover:bg-background-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-12 text-center text-primary font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={!product.inStock}
                        className="w-10 h-10 flex items-center justify-center rounded-[--radius-button] border border-primary/20 text-primary hover:bg-background-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 mt-auto">
                    <button
                      onClick={handleAddToCart}
                      disabled={!product.inStock}
                      className="w-full inline-flex items-center justify-center px-6 py-3 text-sm font-medium bg-primary text-background rounded-[--radius-button] hover:bg-accent hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Ajouter au panier
                    </button>
                    <Link
                      href={`/produits/${product.slug}`}
                      onClick={onClose}
                      className="w-full inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-primary border border-primary rounded-[--radius-button] hover:bg-primary hover:text-background transition-colors"
                    >
                      Voir les détails
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
