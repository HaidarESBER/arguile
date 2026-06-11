"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { calculateTotalItems } from "@/types/cart";

/**
 * FloatingCartButton — always-visible cart access in the bottom-right corner.
 *
 * Features:
 * - Visible at every viewport size (no JS width detection: the old
 *   `innerWidth < 768` gate made the button flicker on resize and vanish
 *   entirely at tablet widths)
 * - Badge with cart item count
 * - Pulse animation when item added
 * - Shake animation when cart is empty and tapped
 * - Hidden only on the cart and checkout pages
 * - Lifted above the sticky buy bar on product detail pages
 */
export function FloatingCartButton() {
  const router = useRouter();
  const pathname = usePathname();
  const { items } = useCart();
  const [previousCount, setPreviousCount] = useState(0);
  const [shouldPulse, setShouldPulse] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  const totalItems = calculateTotalItems(items);

  // Hidden only where it is pointless: the cart and checkout pages.
  // On product detail pages it stays visible but lifted above the sticky
  // buy bar (Ajouter/Acheter) that owns the bottom edge there.
  const hiddenPages = ["/panier", "/commande"];
  const isProductDetailPage = pathname.startsWith("/produits/") && pathname !== "/produits";
  const shouldHide = hiddenPages.some((page) => pathname.startsWith(page));

  // Pulse animation when item count increases
  useEffect(() => {
    if (totalItems > previousCount && previousCount !== 0) {
      // Triggers a timed animation when the cart count (external context) changes; not derivable during render
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldPulse(true);
      setTimeout(() => setShouldPulse(false), 600);
    }
    setPreviousCount(totalItems);
  }, [totalItems, previousCount]);

  const handleClick = () => {
    if (totalItems === 0) {
      // Shake animation if cart is empty
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
    } else {
      router.push("/panier");
    }
  };

  // Don't render on hidden pages (cart/checkout)
  if (shouldHide) return null;

  // No entrance animation: a mount animation that fails to run would leave
  // the button invisible (same failure mode the chat launcher had).
  // Framer only drives the post-mount pulse/shake feedback.
  return (
    <motion.button
      initial={false}
      animate={{
        scale: shouldPulse ? [1, 1.2, 1] : 1,
        rotate: shouldShake ? [0, -10, 10, -10, 10, 0] : 0,
      }}
      // Tween only: keyframe arrays ([1, 1.2, 1]) are not supported by
      // spring transitions and crash framer-motion at runtime.
      transition={{ type: "tween", duration: shouldShake ? 0.4 : 0.5, ease: "easeInOut" }}
      onClick={handleClick}
      style={{
        bottom: isProductDetailPage
          ? 'calc(5.5rem + env(safe-area-inset-bottom, 0px))'
          : 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
      }}
      className="fixed right-4 w-14 h-14 flex items-center justify-center bg-primary text-background rounded-full shadow-lg shadow-black/40 hover:bg-primary-light transition-colors z-[80]"
      aria-label={`Panier${totalItems > 0 ? ` (${totalItems} articles)` : ""}`}
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
            <motion.span
              key={totalItems}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 20,
              }}
              className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center bg-error text-background text-xs font-medium rounded-full px-1.5"
            >
              {totalItems > 99 ? "99+" : totalItems}
            </motion.span>
          )}
    </motion.button>
  );
}
