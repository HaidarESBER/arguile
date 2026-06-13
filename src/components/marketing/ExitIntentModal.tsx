"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { isValidEmail } from "@/types/checkout";
import { useLocale } from "@/contexts/LocaleContext";

const STRINGS = {
  fr: {
    close: "Fermer",
    sentTitle: "Code envoyé !",
    sentBody: "Vérifiez votre boîte mail pour utiliser votre réduction.",
    sentCodeBefore: "Vous pouvez aussi utiliser directement le code :",
    wait: "Attendez !",
    firstOrder: "Première commande ?",
    offerBefore: "Profitez de ",
    offerStrong: "10% de réduction",
    offerAfter: "sur votre première commande",
    promoCode: "Code promo",
    copy: "Copier",
    emailLabel: "Recevez votre code par email",
    emailPlaceholder: "votre@email.com",
    send: "Envoyer",
    invalidEmail: "Email invalide, veuillez réessayer.",
    socialProof: "Rejoignez +500 clients satisfaits",
    noThanks: "Non merci",
  },
  en: {
    close: "Close",
    sentTitle: "Code sent!",
    sentBody: "Check your inbox to use your discount.",
    sentCodeBefore: "You can also use the code directly:",
    wait: "Wait!",
    firstOrder: "First order?",
    offerBefore: "Enjoy ",
    offerStrong: "10% off",
    offerAfter: "your first order",
    promoCode: "Promo code",
    copy: "Copy",
    emailLabel: "Get your code by email",
    emailPlaceholder: "your@email.com",
    send: "Send",
    invalidEmail: "Invalid email, please try again.",
    socialProof: "Join 500+ happy customers",
    noThanks: "No thanks",
  },
} as const;

/**
 * Exit-intent modal to capture abandoning visitors with first-purchase discount
 * Desktop only, shows once per session, non-intrusive UX
 */
export function ExitIntentModal() {
  const { locale } = useLocale();
  const t = STRINGS[locale];
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [hasEligibility, setHasEligibility] = useState(false);
  const [lastMouseY, setLastMouseY] = useState(0);

  useEffect(() => {
    // Check if already shown this session
    const hasShown = sessionStorage.getItem("exit-intent-shown");
    if (hasShown) return;

    // Desktop only
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    // Don't show on cart/checkout pages
    const pathname = window.location.pathname;
    if (pathname.includes("/panier") || pathname.includes("/commande")) return;

    // Track time on page (3 seconds minimum)
    const startTime = Date.now();

    const handleMouseMove = (e: MouseEvent) => {
      setLastMouseY(e.clientY);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger if mouse leaves at top (y < 10) and moved upward
      if (e.clientY < 10 && lastMouseY > e.clientY) {
        const timeOnPage = Date.now() - startTime;
        if (timeOnPage >= 3000) {
          setIsVisible(true);
          sessionStorage.setItem("exit-intent-shown", "true");
        }
      }
    };

    // Track eligibility after 3 seconds
    setTimeout(() => {
      setHasEligibility(true);
    }, 3000);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [lastMouseY]);

  const handleClose = () => {
    setIsVisible(false);
  };

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVisible) {
        handleClose();
      }
    };

    if (isVisible) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Email validation
    if (!isValidEmail(email)) {
      setStatus("error");
      return;
    }

    // Store email in localStorage (for future email marketing)
    localStorage.setItem("subscriber-email", email);

    // Store discount code in sessionStorage for auto-apply at checkout
    sessionStorage.setItem("pendingDiscountCode", "BIENVENUE10");

    // Success state
    setStatus("success");

    // Close after 3 seconds
    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  const copyDiscountCode = () => {
    navigator.clipboard.writeText("BIENVENUE10");
    // Store in sessionStorage so checkout can auto-apply it
    sessionStorage.setItem("pendingDiscountCode", "BIENVENUE10");
  };

  if (!hasEligibility || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-primary/70 z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-background rounded-[--radius-card] max-w-md w-full p-8 relative pointer-events-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-muted hover:text-primary transition-colors"
                aria-label={t.close}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              {/* Cloud graphic element (brand reinforcement) */}
              <div className="mb-6 flex justify-center">
                <svg
                  className="w-20 h-20 text-accent opacity-20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6.5 20q-2.28 0-3.89-1.57Q1 16.85 1 14.58q0-1.95 1.17-3.48 1.18-1.53 3.08-1.95.63-2.3 2.5-3.72Q9.63 4 12 4q2.93 0 4.96 2.04Q19 8.07 19 11q1.73.2 2.86 1.5 1.14 1.28 1.14 3 0 1.88-1.31 3.19T18.5 20Z" />
                </svg>
              </div>

              {status === "success" ? (
                /* Success state */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-success"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <h2 className="font-heading text-2xl text-primary mb-2">
                    {t.sentTitle}
                  </h2>
                  <p className="text-muted mb-4">
                    {t.sentBody}
                  </p>
                  <p className="text-sm text-muted">
                    {t.sentCodeBefore}{" "}
                    <span className="font-medium text-primary">BIENVENUE10</span>
                  </p>
                </motion.div>
              ) : (
                /* Main content */
                <>
                  <h2 className="font-heading text-3xl text-primary mb-2">
                    {t.wait}
                  </h2>
                  <h3 className="text-xl text-primary mb-4">
                    {t.firstOrder}
                  </h3>
                  <p className="text-muted mb-6">
                    {t.offerBefore}<span className="font-medium text-primary">{t.offerStrong}</span>{" "}
                    {t.offerAfter}
                  </p>

                  {/* Discount code display */}
                  <div className="mb-6 p-4 bg-background-secondary rounded-[--radius-card] border-2 border-accent/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted mb-1">{t.promoCode}</p>
                        <p className="text-2xl font-medium text-primary tracking-wider">
                          BIENVENUE10
                        </p>
                      </div>
                      <button
                        onClick={copyDiscountCode}
                        className="px-4 py-2 bg-accent text-background rounded-[--radius-button] hover:bg-accent/90 transition-colors text-sm font-medium"
                      >
                        {t.copy}
                      </button>
                    </div>
                  </div>

                  {/* Email form */}
                  <form onSubmit={handleSubmit} className="mb-6">
                    <label htmlFor="email" className="block text-sm text-muted mb-2">
                      {t.emailLabel}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setStatus("idle");
                        }}
                        placeholder={t.emailPlaceholder}
                        className="flex-1 px-4 py-2 border border-muted/20 rounded-[--radius-button] bg-background text-primary placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent"
                        required
                      />
                      <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-background rounded-[--radius-button] hover:bg-accent hover:text-primary transition-colors font-medium whitespace-nowrap"
                      >
                        {t.send}
                      </button>
                    </div>
                    {status === "error" && (
                      <p className="text-error text-sm mt-2">
                        {t.invalidEmail}
                      </p>
                    )}
                  </form>

                  {/* Social proof */}
                  <p className="text-center text-sm text-muted mb-4">
                    {t.socialProof}
                  </p>

                  {/* Dismiss link */}
                  <button
                    onClick={handleClose}
                    className="w-full text-center text-sm text-muted hover:text-primary transition-colors"
                  >
                    {t.noThanks}
                  </button>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
