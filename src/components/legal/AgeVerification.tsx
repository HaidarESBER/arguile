"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "nuage_age_verified";
const VALIDITY_MS = 365 * 24 * 60 * 60 * 1000; // 1 an

/**
 * Age verification modal - MANDATORY for 18+ products
 *
 * Features:
 * - Blocks entire site access until verified
 * - localStorage with 1-year validity
 * - Redirects minors away from the site
 * - Cannot be bypassed (no X button)
 * - Accessible: role="dialog", aria-modal, focus trap, initial focus
 */
export function AgeVerification() {
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Check if already verified (valid for 1 year)
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { verified?: boolean; timestamp?: number };
        if (
          parsed.verified === true &&
          typeof parsed.timestamp === "number" &&
          Date.now() - parsed.timestamp < VALIDITY_MS
        ) {
          return;
        }
      }
    } catch {
      // Invalid stored value - re-ask
    }

    // Reads localStorage on mount; deferred to effect to avoid SSR hydration mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowModal(true);
  }, []);

  // Move focus into the modal on open + trap Tab focus inside
  useEffect(() => {
    if (!showModal || !modalRef.current) return;

    const modal = modalRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Initial focus on the confirm button
    confirmButtonRef.current?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

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

    return () => {
      modal.removeEventListener("keydown", handleTab as EventListener);
      previouslyFocused?.focus();
    };
  }, [showModal]);

  // Lock body scroll while the gate is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  const handleConfirm = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ verified: true, timestamp: Date.now() })
      );
    } catch {
      // Storage unavailable - the gate will simply re-appear next visit
    }
    setShowModal(false);
  };

  const handleDeny = () => {
    // Redirect minors away from site
    window.location.href = "https://www.service-public.fr/particuliers/vosdroits/F2123";
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="age-verification-title"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-background rounded-2xl p-8 md:p-12 max-w-md w-full text-center shadow-2xl border border-primary/10"
          >
            {/* Logo */}
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-4xl" aria-hidden="true">🔞</span>
              </div>
            </div>

            {/* Title */}
            <h2
              id="age-verification-title"
              className="text-3xl font-heading font-bold text-primary mb-4"
            >
              Vérification d&apos;âge
            </h2>

            {/* Description */}
            <div className="mb-8 space-y-3">
              <p className="text-primary/70 text-lg">
                Vous devez être âgé(e) de <strong className="text-primary">18 ans ou plus</strong> pour accéder à ce site.
              </p>
              <p className="text-sm text-primary/50">
                En confirmant, vous certifiez avoir l&apos;âge légal requis pour acheter et utiliser nos produits.
              </p>
            </div>

            {/* Warning box */}
            <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">
                <strong>⚠️ Avertissement santé :</strong> Fumer est dangereux pour la santé.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDeny}
                className="flex-1 px-6 py-3 min-h-[44px] border-2 border-primary/20 text-primary rounded-[--radius-button] hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 font-medium"
              >
                J&apos;ai moins de 18 ans
              </button>
              <button
                ref={confirmButtonRef}
                onClick={handleConfirm}
                className="flex-1 px-6 py-3 min-h-[44px] bg-primary text-background rounded-[--radius-button] hover:bg-accent transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                J&apos;ai 18 ans ou plus
              </button>
            </div>

            {/* Legal notice */}
            <p className="mt-6 text-xs text-primary/40">
              Conformément à la législation française, la vente de nos produits est strictement interdite aux mineurs.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
