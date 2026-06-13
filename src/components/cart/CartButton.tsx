"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { calculateTotalItems } from "@/types/cart";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/contexts/LocaleContext";

const STRINGS = {
  fr: {
    cartLabel: (n: number) => `Panier${n > 0 ? ` (${n} articles)` : ""}`,
    emptyTitle: "Votre panier est vide",
    emptySubtitle: "Ajoutez des produits pour continuer",
  },
  en: {
    cartLabel: (n: number) => `Cart${n > 0 ? ` (${n} item${n > 1 ? "s" : ""})` : ""}`,
    emptyTitle: "Your cart is empty",
    emptySubtitle: "Add products to continue",
  },
} as const;

/**
 * CartButton component for header navigation
 *
 * Features:
 * - Cart icon with item count badge
 * - Links to /panier
 * - Badge only shows when items > 0
 * - Shows "empty cart" toast on mobile when cart is empty
 */
// The isHomepage prop is kept in the type because callers pass it, but it is currently unused.
export function CartButton({}: { isHomepage?: boolean }) {
  const { items } = useCart();
  const { locale } = useLocale();
  const t = STRINGS[locale];
  const totalItems = calculateTotalItems(items);
  const [showEmptyToast, setShowEmptyToast] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // Only show toast on mobile (screen width < 768px) when cart is empty;
    // otherwise let the Link navigate normally.
    if (totalItems === 0 && window.innerWidth < 768) {
      e.preventDefault();
      setShowEmptyToast(true);
      setTimeout(() => setShowEmptyToast(false), 2500);
    }
  };

  return (
    <>
      <Link
        href="/panier"
        onClick={handleClick}
        className="relative inline-flex items-center justify-center p-2 text-white/90 hover:text-primary transition-colors"
        aria-label={t.cartLabel(totalItems)}
      >
        {/* Cart icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>

        {/* Item count badge */}
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center bg-primary text-background text-xs font-semibold rounded-full px-1.5">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </Link>

      {/* Empty Cart Toast - Mobile Only */}
      <AnimatePresence>
        {showEmptyToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] md:hidden"
          >
            <div className="bg-background-card border border-white/10 rounded-xl shadow-2xl px-6 py-4 flex items-center gap-3 backdrop-blur-md">
              <span className="material-icons text-amber-400 text-2xl">shopping_cart</span>
              <div>
                <p className="text-white font-semibold text-sm">{t.emptyTitle}</p>
                <p className="text-text-muted text-xs">{t.emptySubtitle}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
