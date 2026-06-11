"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { isValidEmail } from "@/types/checkout";
import { UserSession } from "@/types/user";

interface GuestCheckoutProps {
  email: string;
  onEmailChange: (email: string) => void;
  user: UserSession | null;
  isLoadingSession: boolean;
}

/**
 * GuestCheckout component for email capture (guest checkout only —
 * the optional account-creation flow was removed)
 *
 * Features:
 * - Email first (required for order)
 * - Auto-fill email for logged-in users with checkbox option
 * - Email validation on blur
 * - Trust signals for GDPR compliance
 */
export function GuestCheckout({
  email,
  onEmailChange,
  user,
  isLoadingSession,
}: GuestCheckoutProps) {
  const [emailError, setEmailError] = useState<string>("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [useAccountEmail, setUseAccountEmail] = useState(true);

  // When user logs in or session loads, enable useAccountEmail
  useEffect(() => {
    if (user && !isLoadingSession) {
      // Syncs checkbox state when the session loads asynchronously after mount; not derivable during render (user can toggle it afterwards)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUseAccountEmail(true);
      onEmailChange(user.email);
    }
  }, [user, isLoadingSession, onEmailChange]);

  // When toggling useAccountEmail
  const handleUseAccountEmailChange = (checked: boolean) => {
    setUseAccountEmail(checked);
    if (checked && user) {
      onEmailChange(user.email);
      setEmailError("");
    } else {
      onEmailChange("");
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    if (!email.trim()) {
      setEmailError("L'email est requis");
    } else if (!isValidEmail(email)) {
      setEmailError("L'email n'est pas valide");
    } else {
      setEmailError("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl text-primary">Votre email</h2>
        {/* Login prompt removed: guest checkout only (the button was a
            dead placeholder anyway) */}
      </div>

      {/* Use account email checkbox (only for logged-in users) */}
      {user && !isLoadingSession && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={useAccountEmail}
              onChange={(e) => handleUseAccountEmailChange(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-background-secondary text-accent focus:ring-accent focus:ring-2"
            />
            <span className="text-sm text-primary group-hover:text-accent transition-colors">
              Utiliser l&apos;email associé à mon compte ({user.email})
            </span>
          </label>
        </motion.div>
      )}

      {/* Email field */}
      <div>
        <label
          htmlFor="checkout-email"
          className="block text-sm font-medium text-primary mb-1"
        >
          Adresse email *
        </label>
        <input
          type="email"
          id="checkout-email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          onBlur={handleEmailBlur}
          disabled={!!(user && useAccountEmail)}
          className={`w-full px-4 py-3 rounded-[--radius-button] border ${
            emailError && emailTouched
              ? "border-red-500 focus:ring-red-500"
              : "border-background-secondary focus:ring-accent"
          } bg-background text-primary focus:outline-none focus:ring-2 ${
            user && useAccountEmail ? "opacity-60 cursor-not-allowed" : ""
          }`}
          placeholder="jean.dupont@email.com"
          autoComplete="email"
        />
        {emailError && emailTouched && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-500"
          >
            {emailError}
          </motion.p>
        )}
        <p className="mt-2 text-xs text-muted flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Recevez la confirmation et le suivi de votre commande
        </p>
      </div>

      {/* Account creation removed: guest checkout only — order tracking
          works via /suivi with order number + email */}

      {/* Trust signal */}
      <div className="flex items-center gap-2 text-xs text-muted p-3 bg-background-secondary rounded-[--radius-button]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0 text-accent"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>Vos donnees sont sécurisées. Aucun email marketing sans votre consentement.</span>
      </div>
    </motion.div>
  );
}
