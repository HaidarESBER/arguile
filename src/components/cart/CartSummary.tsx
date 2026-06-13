"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui";
import { useCart } from "@/contexts/CartContext";
import { calculateSubtotal, calculateTotalItems, formatCartTotal } from "@/types/cart";
import { useLocale } from "@/contexts/LocaleContext";

const STRINGS = {
  fr: {
    emptyTitle: "Votre panier est vide",
    emptySubtitle: "Découvrez nos produits et trouvez votre bonheur",
    viewProducts: "Voir nos produits",
    orderSummary: "Resume de la commande",
    itemsLine: (n: number) => `Articles (${n})`,
    shipping: "Livraison",
    calculatedAtCheckout: "Calcule a la commande",
    subtotal: "Sous-total",
    checkout: "Passer la commande",
    continueShopping: "Continuer mes achats",
  },
  en: {
    emptyTitle: "Your cart is empty",
    emptySubtitle: "Discover our products and find what you love",
    viewProducts: "View our products",
    orderSummary: "Order summary",
    itemsLine: (n: number) => `Items (${n})`,
    shipping: "Shipping",
    calculatedAtCheckout: "Calculated at checkout",
    subtotal: "Subtotal",
    checkout: "Place order",
    continueShopping: "Continue shopping",
  },
} as const;

/**
 * CartSummary component displays cart totals and action buttons
 *
 * Features:
 * - Subtotal display
 * - "Continuer mes achats" link
 * - "Passer la commande" button
 * - Empty state with CTA
 * - Smooth transitions between empty and filled states
 */
export function CartSummary() {
  const { items } = useCart();
  const { locale } = useLocale();
  const t = STRINGS[locale];
  const totalItems = calculateTotalItems(items);
  const subtotal = calculateSubtotal(items);

  return (
    <AnimatePresence mode="wait">
      {items.length === 0 ? (
        <motion.div
          key="empty"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="text-center py-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto text-text-muted"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </motion.div>
          <h2 className="font-heading text-xl text-white mb-2">
            {t.emptyTitle}
          </h2>
          <p className="text-text-muted mb-6">
            {t.emptySubtitle}
          </p>
          <Link href="/produits">
            <Button variant="primary" size="md">
              {t.viewProducts}
            </Button>
          </Link>
        </motion.div>
      ) : (
        <motion.div
          key="summary"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="glass-card rounded-xl p-6 sticky top-24"
        >
          <h2 className="font-heading text-xl text-white mb-6">
            {t.orderSummary}
          </h2>

          {/* Summary details */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-text-muted">
              <span>{t.itemsLine(totalItems)}</span>
              <span>{formatCartTotal(subtotal)}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>{t.shipping}</span>
              <span>{t.calculatedAtCheckout}</span>
            </div>
            <hr className="border-white/10" />
            <div className="flex justify-between font-medium text-white text-lg">
              <span>{t.subtotal}</span>
              <span>{formatCartTotal(subtotal)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/commande" className="block">
              <Button variant="primary" size="md" className="w-full">
                {t.checkout}
              </Button>
            </Link>
            <Link
              href="/produits"
              className="block text-center text-white hover:text-primary transition-colors text-sm"
            >
              {t.continueShopping}
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
