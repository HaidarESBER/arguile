"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/contexts/LocaleContext";

const STRINGS = {
  fr: {
    quantityLabel: "Quantité:",
    decreaseAria: "Diminuer la quantité",
    quantityAria: "Quantité",
    increaseAria: "Augmenter la quantité",
    maxAvailable: (n: number) => `Maximum ${n} disponible${n > 1 ? "s" : ""}`,
    onlyLeft: (n: number) => `Plus que ${n} en stock`,
  },
  en: {
    quantityLabel: "Quantity:",
    decreaseAria: "Decrease quantity",
    quantityAria: "Quantity",
    increaseAria: "Increase quantity",
    maxAvailable: (n: number) => `Maximum ${n} available`,
    onlyLeft: (n: number) => `Only ${n} left in stock`,
  },
} as const;

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  maxQuantity?: number;
  stockLevel?: number;
  disabled?: boolean;
}

/**
 * Quantity selector with stock validation
 * Prevents users from selecting more than available stock
 * Shows warning when approaching stock limit
 */
export function QuantitySelector({
  quantity,
  onChange,
  maxQuantity,
  stockLevel,
  disabled = false,
}: QuantitySelectorProps) {
  const { locale } = useLocale();
  const t = STRINGS[locale];
  const [showMaxWarning, setShowMaxWarning] = useState(false);

  // Calculate actual max quantity based on stock
  const actualMax = maxQuantity ?? stockLevel ?? 99;
  const isAtMax = quantity >= actualMax;
  const isNearMax = stockLevel && quantity >= stockLevel - 2 && quantity < stockLevel;

  const handleDecrease = () => {
    if (quantity > 1) {
      onChange(quantity - 1);
      setShowMaxWarning(false);
    }
  };

  const handleIncrease = () => {
    if (quantity < actualMax) {
      onChange(quantity + 1);
    } else {
      // Show warning briefly when trying to exceed max
      setShowMaxWarning(true);
      setTimeout(() => setShowMaxWarning(false), 2000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      if (value <= actualMax) {
        onChange(value);
        setShowMaxWarning(false);
      } else {
        onChange(actualMax);
        setShowMaxWarning(true);
        setTimeout(() => setShowMaxWarning(false), 2000);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted">{t.quantityLabel}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDecrease}
            disabled={quantity <= 1 || disabled}
            className="w-10 h-10 flex items-center justify-center border border-primary rounded-[--radius-button] text-primary hover:bg-primary hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t.decreaseAria}
          >
            <span className="text-lg leading-none">-</span>
          </button>

          <input
            type="number"
            value={quantity}
            onChange={handleInputChange}
            disabled={disabled}
            min={1}
            max={actualMax}
            className="w-12 text-center font-medium text-primary text-lg bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-accent rounded px-1 disabled:opacity-50"
            aria-label={t.quantityAria}
          />

          <button
            onClick={handleIncrease}
            disabled={isAtMax || disabled}
            className="w-10 h-10 flex items-center justify-center border border-primary rounded-[--radius-button] text-primary hover:bg-primary hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t.increaseAria}
          >
            <span className="text-lg leading-none">+</span>
          </button>
        </div>
      </div>

      {/* Stock warning messages */}
      <AnimatePresence>
        {showMaxWarning && stockLevel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-error flex items-center gap-1"
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            {t.maxAvailable(stockLevel)}
          </motion.div>
        )}

        {isNearMax && !showMaxWarning && stockLevel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-amber-600 flex items-center gap-1"
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {t.onlyLeft(stockLevel)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
