"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface AppliedDiscount {
  code: string;
  amount: number; // in cents
  label: string;
}

interface DiscountCodeInputProps {
  subtotalCents: number;
  onDiscountApplied: (discount: AppliedDiscount | null) => void;
}

/**
 * DiscountCodeInput allows customers to enter and validate a discount code.
 *
 * Features:
 * - Auto-uppercases input
 * - Validates against /api/promotions/validate
 * - Shows success badge with code + discount label + "Retirer" button
 * - Shows error messages in red
 * - Re-validates when subtotal changes
 * - Checks sessionStorage for auto-apply from ExitIntentModal
 */
export function DiscountCodeInput({
  subtotalCents,
  onDiscountApplied,
}: DiscountCodeInputProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] =
    useState<AppliedDiscount | null>(null);
  const prevSubtotalRef = useRef(subtotalCents);
  const hasAutoApplied = useRef(false);

  // Check sessionStorage for pending discount code on mount
  useEffect(() => {
    if (hasAutoApplied.current) return;
    hasAutoApplied.current = true;

    const pendingCode = sessionStorage.getItem("pendingDiscountCode");
    if (pendingCode) {
      sessionStorage.removeItem("pendingDiscountCode");
      setCode(pendingCode.toUpperCase());
      // Auto-apply the code
      applyCode(pendingCode);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-validate when subtotal changes and a discount is applied
  useEffect(() => {
    if (
      appliedDiscount &&
      prevSubtotalRef.current !== subtotalCents
    ) {
      prevSubtotalRef.current = subtotalCents;
      revalidateDiscount(appliedDiscount.code);
    }
  }, [subtotalCents]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyCode = useCallback(
    async (codeToApply: string) => {
      const trimmed = codeToApply.trim().toUpperCase();
      if (!trimmed) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/promotions/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: trimmed, subtotal: subtotalCents }),
        });

        const data = await response.json();

        if (data.valid) {
          const discount: AppliedDiscount = {
            code: data.promotion.code,
            amount: data.discountAmount,
            label: data.label,
          };
          setAppliedDiscount(discount);
          onDiscountApplied(discount);
          setError(null);
        } else {
          setError(data.error || "Code promo invalide");
          setAppliedDiscount(null);
          onDiscountApplied(null);
        }
      } catch {
        setError("Erreur lors de la validation du code promo");
        setAppliedDiscount(null);
        onDiscountApplied(null);
      } finally {
        setIsLoading(false);
      }
    },
    [subtotalCents, onDiscountApplied]
  );

  const revalidateDiscount = useCallback(
    async (discountCode: string) => {
      try {
        const response = await fetch("/api/promotions/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: discountCode,
            subtotal: subtotalCents,
          }),
        });

        const data = await response.json();

        if (data.valid) {
          const discount: AppliedDiscount = {
            code: data.promotion.code,
            amount: data.discountAmount,
            label: data.label,
          };
          setAppliedDiscount(discount);
          onDiscountApplied(discount);
        } else {
          // Discount no longer valid (e.g., subtotal dropped below minimum)
          setAppliedDiscount(null);
          onDiscountApplied(null);
          setError(data.error || "Code promo invalide pour ce montant");
        }
      } catch {
        // Keep existing discount on network error during re-validation
      }
    },
    [subtotalCents, onDiscountApplied]
  );

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setCode("");
    setError(null);
    onDiscountApplied(null);
  };

  const handleApply = () => {
    applyCode(code);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="bg-background-card rounded-[--radius-card] p-6">
        <h3 className="font-heading text-lg text-primary mb-4 flex items-center gap-2">
          {/* Tag icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
            <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
          </svg>
          Code promo
        </h3>

        <AnimatePresence mode="wait">
          {appliedDiscount ? (
            /* Success state: badge with code + remove button */
            <motion.div
              key="applied"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between gap-3 p-3 bg-success/10 border border-success/20 rounded-[--radius-button]"
            >
              <div className="flex items-center gap-2">
                {/* Check icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-success flex-shrink-0"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span className="text-sm font-medium text-success">
                  {appliedDiscount.label}
                </span>
              </div>
              <button
                type="button"
                onClick={removeDiscount}
                className="text-sm text-muted hover:text-primary transition-colors underline"
              >
                Retirer
              </button>
            </motion.div>
          ) : (
            /* Input state: code input + apply button.
               NOT a <form>: this component lives inside the checkout <form>,
               and nested forms are invalid HTML (hydration error). Enter is
               handled on the input instead. */
            <motion.div
              key="input"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      // Apply the code without submitting the checkout form
                      e.preventDefault();
                      if (!isLoading && code.trim()) handleApply();
                    }
                  }}
                  placeholder="Entrez votre code promo"
                  className="flex-1 px-4 py-3 rounded-[--radius-button] border border-background-secondary bg-background text-primary placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={isLoading || !code.trim()}
                  className="px-6 py-3 bg-primary text-background rounded-[--radius-button] hover:bg-accent hover:text-primary transition-colors font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <motion.span
                      className="inline-flex gap-0.5"
                      initial={{ opacity: 1 }}
                    >
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: 0,
                          type: "tween",
                        }}
                      >
                        .
                      </motion.span>
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: 0.2,
                          type: "tween",
                        }}
                      >
                        .
                      </motion.span>
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: 0.4,
                          type: "tween",
                        }}
                      >
                        .
                      </motion.span>
                    </motion.span>
                  ) : (
                    "Appliquer"
                  )}
                </button>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm text-red-600"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
