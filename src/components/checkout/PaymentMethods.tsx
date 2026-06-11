"use client";

import { motion } from "framer-motion";

/**
 * PaymentMethods component for displaying payment options and secure messaging
 *
 * Features:
 * - Payment method icons (Visa, Mastercard, Amex, PayPal, Apple Pay, Google Pay)
 * - Secure payment messaging with trust badges
 * - Stripe redirect messaging
 * - 3D Secure branding
 */
export function PaymentMethods() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="space-y-4"
    >
      <h2 className="font-heading text-xl text-primary">Paiement</h2>

      {/* Payment method icons */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-muted mr-2">Nous acceptons:</span>
        {/* Visa */}
        <div className="h-8 px-3 py-1 rounded border border-background-secondary bg-background flex items-center justify-center grayscale hover:grayscale-0 transition-all">
          <svg
            width="40"
            height="14"
            viewBox="0 0 40 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.2 13.4L17.4 0.6H20.8L18.6 13.4H15.2Z"
              fill="#00579F"
            />
            <path
              d="M32.8 0.9C32.1 0.6 31 0.3 29.6 0.3C26.1 0.3 23.7 2.2 23.7 4.9C23.7 6.9 25.5 8 26.8 8.7C28.1 9.4 28.6 9.8 28.6 10.4C28.6 11.3 27.5 11.7 26.5 11.7C25 11.7 24.2 11.5 23 10.9L22.4 10.6L21.8 13.9C22.7 14.3 24.3 14.7 26 14.7C29.7 14.7 32 12.8 32.1 9.9C32.1 8.3 31 7.1 28.6 6.1C27.4 5.5 26.7 5 26.7 4.3C26.7 3.7 27.4 3.1 28.9 3.1C30.1 3.1 31 3.3 31.7 3.6L32 3.7L32.8 0.9Z"
              fill="#00579F"
            />
            <path
              d="M37.4 0.6H35C34 0.6 33.3 0.9 32.9 1.8L27.9 13.4H31.6L32.4 11.2H36.9L37.4 13.4H40.6L37.4 0.6ZM33.3 8.4L35 3.8L36 8.4H33.3Z"
              fill="#00579F"
            />
            <path
              d="M12.2 0.6L8.9 9.5L8.5 7.7C7.8 5.5 5.7 3.1 3.4 1.9L6.4 13.4H10.2L15.9 0.6H12.2Z"
              fill="#00579F"
            />
            <path
              d="M5.2 0.6H0.1L0 0.9C4.4 2 7.2 4.7 8.4 7.7L7.1 1.8C6.9 1 6.2 0.6 5.2 0.6Z"
              fill="#FAA61A"
            />
          </svg>
        </div>

        {/* Mastercard */}
        <div className="h-8 px-3 py-1 rounded border border-background-secondary bg-background flex items-center justify-center grayscale hover:grayscale-0 transition-all">
          <svg
            width="32"
            height="20"
            viewBox="0 0 32 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="10" r="10" fill="#EB001B" />
            <circle cx="20" cy="10" r="10" fill="#F79E1B" />
            <path
              d="M16 4.5C17.6 5.9 18.7 7.8 18.7 10C18.7 12.2 17.6 14.1 16 15.5C14.4 14.1 13.3 12.2 13.3 10C13.3 7.8 14.4 5.9 16 4.5Z"
              fill="#FF5F00"
            />
          </svg>
        </div>

        {/* American Express */}
        <div className="h-8 px-3 py-1 rounded border border-background-secondary bg-background flex items-center justify-center grayscale hover:grayscale-0 transition-all">
          <svg
            width="40"
            height="14"
            viewBox="0 0 40 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="40" height="14" rx="2" fill="#006FCF" />
            <text
              x="20"
              y="10"
              fontFamily="Arial, sans-serif"
              fontSize="8"
              fontWeight="bold"
              fill="white"
              textAnchor="middle"
            >
              AMEX
            </text>
          </svg>
        </div>

        {/* PayPal (future) */}
        <div className="h-8 px-3 py-1 rounded border border-background-secondary bg-background flex items-center justify-center opacity-50">
          <span className="text-xs font-medium text-[#003087]">PayPal</span>
        </div>

        {/* Apple Pay (future) */}
        <div className="h-8 px-3 py-1 rounded border border-background-secondary bg-background flex items-center justify-center opacity-50">
          <span className="text-xs font-medium">Apple Pay</span>
        </div>

        {/* Google Pay (future) */}
        <div className="h-8 px-3 py-1 rounded border border-background-secondary bg-background flex items-center justify-center opacity-50">
          <span className="text-xs font-medium">Google Pay</span>
        </div>
      </div>

      {/* Secure payment messaging */}
      <div className="p-4 bg-background-card rounded-[--radius-button] space-y-3">
        <div className="flex items-center gap-2">
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
            className="text-green-600"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="font-medium text-primary">
            Paiement 100% securise
          </span>
        </div>

        <div className="flex flex-col gap-2 text-xs text-muted">
          <div className="flex items-center gap-2">
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Connexion SSL securisee</span>
          </div>
          <div className="flex items-center gap-2">
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Vos informations bancaires ne sont jamais stockees</span>
          </div>
          <div className="flex items-center gap-2">
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Protection 3D Secure pour les paiements par carte</span>
          </div>
        </div>
      </div>

      {/* Stripe redirect message */}
      <div className="p-4 bg-background-card border border-background-secondary rounded-[--radius-button]">
        <p className="text-sm text-muted">
          Vous serez redirige vers notre partenaire de paiement securise Stripe
          pour finaliser votre achat.
        </p>
      </div>

      {/* Powered by Stripe */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted pt-2">
        <span>Paiement securise par</span>
        <svg
          width="40"
          height="16"
          viewBox="0 0 40 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.7 8c0-3.7 2.4-6.4 5.9-6.4 1.4 0 2.6.3 3.5.7v2.5c-.9-.5-1.9-.8-3.1-.8-2.1 0-3.4 1.5-3.4 4s1.3 4 3.4 4c1.2 0 2.2-.3 3.1-.8v2.5c-.9.4-2.1.7-3.5.7-3.5 0-5.9-2.7-5.9-6.4zm11.7-6.2h2.7v4h.1c.5-.9 1.6-1.6 3.1-1.6 2.3 0 3.6 1.6 3.6 4.1v5.4h-2.7V9c0-1.4-.6-2.3-1.9-2.3-1.2 0-2.2.9-2.2 2.3v4.7h-2.7V1.8zm13.2 10.8c.7 0 1.2-.2 1.7-.5v2c-.5.3-1.2.5-2.1.5-1.6 0-2.7-.9-2.7-3V6.9h-1.3V4.4h1.3V2.2h2.7v2.2h2.3v2.5h-2.3v4.5c0 .8.3 1.2.4 1.2zm7.2-8.2c1.5 0 2.5.7 3 1.6h.1V1.8h2.7v11.9h-2.7v-1.3h-.1c-.5.9-1.6 1.6-3 1.6-2.4 0-4-2-4-4.7 0-2.7 1.6-4.7 4-4.7zm.8 7c1.3 0 2.2-1.1 2.2-2.7s-.9-2.7-2.2-2.7-2.2 1.1-2.2 2.7.9 2.7 2.2 2.7z"
            fill="#635BFF"
          />
        </svg>
      </div>
    </motion.div>
  );
}
