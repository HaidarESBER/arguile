"use client";

import { useEffect, useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useLocale } from "@/contexts/LocaleContext";

const STRINGS = {
  fr: {
    ariaLabel: "Avertissement sanitaire",
    warning: "Fumer est dangereux pour la santé.",
    minors: " Vente interdite aux mineurs — 18+ uniquement.",
    close: "Fermer l'avertissement",
  },
  en: {
    ariaLabel: "Health warning",
    warning: "Smoking is harmful to your health.",
    minors: " Sale to minors prohibited — 18+ only.",
    close: "Close the warning",
  },
} as const;

const DISMISS_KEY = "health-warning-dismissed";

/**
 * Health warning banner - MANDATORY for tobacco-related products
 *
 * - Rendered immediately on every page load (no delay)
 * - Dismissible, but only for the current session: it reappears on the
 *   next visit so the sanitary message stays regularly visible
 */
export function HealthWarning() {
  const { locale } = useLocale();
  const t = STRINGS[locale];
  // Start visible (SSR renders the banner); hide after mount if dismissed
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === "1") {
      // Hydration-safe: sessionStorage is only readable client-side
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div
      role="note"
      aria-label={t.ariaLabel}
      className="relative z-[9998] bg-[#241f1a] border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-3 py-1">
        <div className="flex items-center justify-center gap-1.5">
          <ExclamationTriangleIcon
            className="w-3.5 h-3.5 text-warning flex-shrink-0"
            aria-hidden="true"
          />
          <p className="text-xs text-text-muted text-center">
            {t.warning}
            <span className="hidden sm:inline">{t.minors}</span>
          </p>
          <button
            onClick={handleDismiss}
            aria-label={t.close}
            className="ml-1 w-6 h-6 flex items-center justify-center rounded-full text-text-muted hover:text-text hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <svg
              aria-hidden="true"
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
