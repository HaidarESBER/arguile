"use client";

import { motion } from "framer-motion";

interface StockIndicatorProps {
  inStock: boolean;
  stockLevel?: number;
  size?: "sm" | "md";
  showDot?: boolean;
}

/**
 * StockIndicator component displays inventory urgency
 *
 * Stock levels:
 * - 0: "Rupture de stock" (red, no purchase)
 * - 1-5: "Plus que X en stock !" (red/orange, urgent)
 * - 6-10: "Stock limité" (orange, moderate urgency)
 * - 11+: "En stock" (green, no urgency display)
 *
 * Features:
 * - Color coded: red (#DC2626), orange (#F97316), green (#16A34A)
 * - Pulse animation for urgent stock (1-5 items)
 * - Position: Near price on product detail, subtle on card
 */
export function StockIndicator({
  inStock,
  stockLevel,
  size = "md",
  showDot = true,
}: StockIndicatorProps) {
  // If no stockLevel provided, fallback to simple inStock display
  if (stockLevel === undefined) {
    return (
      <div className="flex items-center gap-2">
        {showDot && (
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              inStock ? "bg-success" : "bg-error"
            }`}
          />
        )}
        <span
          className={`${size === "sm" ? "text-xs" : "text-sm"} font-medium ${
            inStock ? "text-success" : "text-error"
          }`}
        >
          {inStock ? "En stock" : "Rupture de stock"}
        </span>
      </div>
    );
  }

  // Out of stock
  if (stockLevel === 0 || !inStock) {
    return (
      <div className="flex items-center gap-2">
        {showDot && <span className="w-2.5 h-2.5 rounded-full bg-error" />}
        <span
          className={`${size === "sm" ? "text-xs" : "text-sm"} font-medium text-error`}
        >
          Rupture de stock
        </span>
      </div>
    );
  }

  // Urgent stock (1-5 items) - with pulse
  if (stockLevel <= 5) {
    return (
      <div className="flex items-center gap-2">
        {showDot && (
          <motion.span
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-2.5 h-2.5 rounded-full bg-error"
          />
        )}
        <motion.span
          animate={{
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`${size === "sm" ? "text-xs" : "text-sm"} font-medium text-error`}
        >
          Plus que {stockLevel} en stock !
        </motion.span>
      </div>
    );
  }

  // Limited stock (6-10 items)
  if (stockLevel <= 10) {
    return (
      <div className="flex items-center gap-2">
        {showDot && (
          <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
        )}
        <span
          className={`${size === "sm" ? "text-xs" : "text-sm"} font-medium text-[#F97316]`}
        >
          Stock limité
        </span>
      </div>
    );
  }

  // Good stock (11+ items)
  return (
    <div className="flex items-center gap-2">
      {showDot && <span className="w-2.5 h-2.5 rounded-full bg-success" />}
      <span
        className={`${size === "sm" ? "text-xs" : "text-sm"} font-medium text-success`}
      >
        En stock
      </span>
    </div>
  );
}
