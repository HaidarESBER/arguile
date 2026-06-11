"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle } from "lucide-react";

interface NotifyMeFormProps {
  productId: string;
  productName: string;
}

const NUAGE_EASING = [0.21, 0.47, 0.32, 0.98] as const;
const NUAGE_DURATION = 0.4;

/**
 * Back-in-stock notification form
 * Allows users to subscribe for email notifications when product is restocked
 */
export function NotifyMeForm({ productId, productName }: NotifyMeFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/notify-back-in-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          productId,
          productName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Échec de l'inscription");
      }

      setIsSuccess(true);
      setEmail("");

      // Reset success state after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background-secondary/30 border border-border rounded-xl p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-primary mb-1">
            Produit indisponible
          </h3>
          <p className="text-sm text-muted">
            Soyez informé par email dès que ce produit est de retour en stock
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: NUAGE_DURATION, ease: NUAGE_EASING }}
            className="flex items-center gap-3 bg-green-50 text-green-700 p-4 rounded-lg"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Inscription confirmée !</p>
              <p className="text-sm text-green-600">
                Nous vous informerons par email dès que le produit sera disponible.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: NUAGE_DURATION, ease: NUAGE_EASING }}
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            <div>
              <label htmlFor="notify-email" className="sr-only">
                Adresse email
              </label>
              <input
                id="notify-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-error"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-background hover:bg-accent hover:text-primary px-6 py-2.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? "Inscription..." : "Me notifier"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
