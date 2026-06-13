"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Container, Button } from "@/components/ui";
import { SUPPORT_EMAIL } from "@/lib/support";
import { useLocale } from "@/contexts/LocaleContext";

const STRINGS = {
  fr: {
    enterOrderNumber: "Veuillez entrer votre numéro de commande",
    enterEmail: "Veuillez entrer votre adresse email",
    orderNotFound: "Commande introuvable",
    genericError: "Une erreur est survenue. Veuillez réessayer.",
    title: "Suivre ma commande",
    subtitle:
      "Entrez votre numéro de commande et votre email pour suivre votre colis",
    orderNumberLabel: "Numéro de commande",
    orderNumberHint: "Vous le trouverez dans votre email de confirmation",
    emailLabel: "Adresse email",
    emailPlaceholder: "votre@email.com",
    searching: "Recherche en cours...",
    trackOrder: "Suivre ma commande",
    needHelp: "Besoin d'aide ?",
    helpText:
      "Si vous ne trouvez pas votre numéro de commande, vérifiez l'email de confirmation que vous avez reçu après votre achat.",
    contactUsAt: "Pour toute question, contactez-nous à",
  },
  en: {
    enterOrderNumber: "Please enter your order number",
    enterEmail: "Please enter your email address",
    orderNotFound: "Order not found",
    genericError: "An error occurred. Please try again.",
    title: "Track my order",
    subtitle:
      "Enter your order number and email to track your parcel",
    orderNumberLabel: "Order number",
    orderNumberHint: "You will find it in your confirmation email",
    emailLabel: "Email address",
    emailPlaceholder: "your@email.com",
    searching: "Searching...",
    trackOrder: "Track my order",
    needHelp: "Need help?",
    helpText:
      "If you cannot find your order number, check the confirmation email you received after your purchase.",
    contactUsAt: "For any questions, contact us at",
  },
} as const;

/**
 * Order Tracking Lookup Page
 *
 * Allows customers to track their order by entering:
 * - Order number (e.g., NU-2026-0001)
 * - Email address (for verification)
 *
 * Redirects to order details page after validation.
 */
export default function OrderTrackingPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = STRINGS[locale];
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate inputs
      if (!orderNumber.trim()) {
        setError(t.enterOrderNumber);
        setIsLoading(false);
        return;
      }

      if (!email.trim()) {
        setError(t.enterEmail);
        setIsLoading(false);
        return;
      }

      // Verify order exists and email matches
      const response = await fetch("/api/verify-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t.orderNotFound);
        setIsLoading(false);
        return;
      }

      // Redirect to order details page — the email is re-verified
      // server-side there (the page is gated against order-number guessing)
      router.push(
        `/suivi/${encodeURIComponent(orderNumber.trim())}?email=${encodeURIComponent(email.trim())}`
      );
    } catch (error) {
      console.error("Error tracking order:", error);
      setError(t.genericError);
      setIsLoading(false);
    }
  };

  return (
    <Container as="main" size="md" className="py-12">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </motion.div>
          <h1 className="font-heading text-3xl text-text mb-2">
            {t.title}
          </h1>
          <p className="text-muted">
            {t.subtitle}
          </p>
        </div>

        {/* Tracking Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Order Number Input */}
          <div>
            <label
              htmlFor="orderNumber"
              className="block text-sm font-medium text-text mb-2"
            >
              {t.orderNumberLabel}
            </label>
            <input
              type="text"
              id="orderNumber"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="NU-2026-0001"
              className="w-full px-4 py-3 rounded-[--radius-button] border border-background-secondary bg-background text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={isLoading}
            />
            <p className="text-xs text-muted mt-1">
              {t.orderNumberHint}
            </p>
          </div>

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text mb-2"
            >
              {t.emailLabel}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="w-full px-4 py-3 rounded-[--radius-button] border border-background-secondary bg-background text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-error/10 border border-error/30 rounded-[--radius-button] text-error text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </motion.svg>
                {t.searching}
              </span>
            ) : (
              t.trackOrder
            )}
          </Button>
        </motion.form>

        {/* Help Section */}
        <div className="mt-8 p-4 bg-background-secondary rounded-[--radius-button]">
          <h3 className="text-sm font-medium text-primary mb-2">
            {t.needHelp}
          </h3>
          <p className="text-xs text-muted mb-2">
            {t.helpText}
          </p>
          <p className="text-xs text-muted">
            {t.contactUsAt}{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-accent hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
          </p>
        </div>
      </div>
    </Container>
  );
}
