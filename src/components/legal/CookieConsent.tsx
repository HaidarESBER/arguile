"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";

const STRINGS = {
  fr: {
    ariaLabel: "Gestion des cookies",
    title: "Cookies",
    intro:
      "Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez accepter, refuser ou personnaliser votre choix.",
    essentialLabel: "Cookies essentiels",
    essentialRequired: "(obligatoires)",
    essentialDesc:
      "Nécessaires au fonctionnement du site (panier, authentification, préférences).",
    analyticsLabel: "Cookies analytiques",
    analyticsDesc:
      "Nous aident à comprendre comment vous utilisez le site pour l'améliorer (Google Analytics, Microsoft Clarity).",
    marketingLabel: "Cookies marketing",
    marketingDesc:
      "Permettent de vous proposer des publicités pertinentes et de mesurer l'efficacité de nos campagnes (TikTok Pixel, Meta Pixel).",
    back: "Retour",
    reject: "Refuser",
    save: "Enregistrer",
    customize: "Personnaliser",
    accept: "Accepter",
    privacyPolicy: "Politique de confidentialité",
  },
  en: {
    ariaLabel: "Cookie settings",
    title: "Cookies",
    intro:
      "We use cookies to improve your experience. You can accept, decline or customize your choice.",
    essentialLabel: "Essential cookies",
    essentialRequired: "(required)",
    essentialDesc:
      "Necessary for the site to work (cart, authentication, preferences).",
    analyticsLabel: "Analytics cookies",
    analyticsDesc:
      "Help us understand how you use the site so we can improve it (Google Analytics, Microsoft Clarity).",
    marketingLabel: "Marketing cookies",
    marketingDesc:
      "Allow us to show you relevant ads and measure the effectiveness of our campaigns (TikTok Pixel, Meta Pixel).",
    back: "Back",
    reject: "Decline",
    save: "Save",
    customize: "Customize",
    accept: "Accept",
    privacyPolicy: "Privacy policy",
  },
} as const;

/**
 * Cookie consent banner - RGPD/GDPR compliant
 *
 * Features:
 * - Shown immediately on first visit (CNIL requirement)
 * - Granular consent (essential, analytics, marketing)
 * - Persists in localStorage
 * - Blocks non-essential scripts until consent
 * - Link to privacy policy
 * - Accessible: role="dialog", 14px minimum text, 44px touch targets
 */

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

export function CookieConsent() {
  const { locale } = useLocale();
  const t = STRINGS[locale];
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [hadNonEssentialConsent, setHadNonEssentialConsent] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true
    analytics: false,
    marketing: false,
    timestamp: 0,
  });

  useEffect(() => {
    // Check if consent already given
    const savedConsent = localStorage.getItem("nuage_cookie_consent");

    if (!savedConsent) {
      // CNIL: the consent banner must be available immediately
      // Reads localStorage on mount (init-once); deferred to effect to avoid SSR hydration mismatch
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(true);
      return;
    }

    // Load saved preferences
    try {
      const parsed = JSON.parse(savedConsent) as CookiePreferences;
      setPreferences(parsed);
      setHadNonEssentialConsent(Boolean(parsed.analytics || parsed.marketing));

      // Re-show banner if consent is > 6 months old (RGPD requirement)
      const sixMonthsAgo = Date.now() - 6 * 30 * 24 * 60 * 60 * 1000;
      if (parsed.timestamp < sixMonthsAgo) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    const consentData = {
      ...prefs,
      timestamp: Date.now(),
    };

    localStorage.setItem("nuage_cookie_consent", JSON.stringify(consentData));
    setPreferences(consentData);
    setIsVisible(false);

    // Tell listeners (e.g. the support-chat launcher, which stays hidden
    // while the banner occupies the bottom of the screen) that a choice
    // was made — matters on the no-reload path below.
    window.dispatchEvent(new Event("nuage:cookie-consent"));

    // Reload only when needed to apply the new consent:
    // - consent granted: load analytics/marketing scripts
    // - consent withdrawn after a previous grant: unload already-loaded scripts
    const grantsNonEssential = consentData.analytics || consentData.marketing;
    if (grantsNonEssential || hadNonEssentialConsent) {
      window.location.reload();
    }
  };

  const handleAcceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    });
  };

  const handleRejectAll = () => {
    savePreferences({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    });
  };

  const handleSaveCustom = () => {
    savePreferences(preferences);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-4 right-4 left-4 sm:left-auto z-[9999] sm:max-w-md"
        role="dialog"
        aria-label={t.ariaLabel}
      >
        <div className="bg-background border border-primary/20 rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-base" aria-hidden="true">🍪</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-heading font-bold text-primary mb-1">
                  {t.title}
                </h3>
                <p className="text-sm text-primary/70 leading-snug">
                  {t.intro}
                </p>
              </div>
            </div>

            {/* Detailed preferences (collapsible) */}
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 space-y-4 border-t border-primary/10 pt-4"
              >
                {/* Essential cookies */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="essential"
                    checked={true}
                    disabled
                    className="mt-1 w-5 h-5 rounded border-primary/30 text-primary focus:ring-accent disabled:opacity-50"
                  />
                  <div className="flex-1">
                    <label htmlFor="essential" className="text-sm font-semibold text-primary block mb-1">
                      {t.essentialLabel} <span className="text-sm font-normal text-primary/50">{t.essentialRequired}</span>
                    </label>
                    <p className="text-sm text-primary/60">
                      {t.essentialDesc}
                    </p>
                  </div>
                </div>

                {/* Analytics cookies */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="analytics"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded border-primary/30 text-primary focus:ring-accent"
                  />
                  <div className="flex-1">
                    <label htmlFor="analytics" className="text-sm font-semibold text-primary block mb-1 cursor-pointer">
                      {t.analyticsLabel}
                    </label>
                    <p className="text-sm text-primary/60">
                      {t.analyticsDesc}
                    </p>
                  </div>
                </div>

                {/* Marketing cookies */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="marketing"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded border-primary/30 text-primary focus:ring-accent"
                  />
                  <div className="flex-1">
                    <label htmlFor="marketing" className="text-sm font-semibold text-primary block mb-1 cursor-pointer">
                      {t.marketingLabel}
                    </label>
                    <p className="text-sm text-primary/60">
                      {t.marketingDesc}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              {showDetails ? (
                <>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="flex-1 px-4 py-2.5 min-h-[44px] text-sm text-primary hover:bg-primary/5 rounded-md transition-colors"
                  >
                    {t.back}
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="flex-1 px-4 py-2.5 min-h-[44px] text-sm border border-primary/20 text-primary rounded-md hover:bg-primary/5 transition-all"
                  >
                    {t.reject}
                  </button>
                  <button
                    onClick={handleSaveCustom}
                    className="flex-1 px-4 py-2.5 min-h-[44px] text-sm bg-primary text-background rounded-md hover:bg-accent transition-colors font-medium"
                  >
                    {t.save}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowDetails(true)}
                    className="flex-1 px-4 py-2.5 min-h-[44px] text-sm text-primary hover:bg-primary/5 rounded-md transition-colors"
                  >
                    {t.customize}
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="flex-1 px-4 py-2.5 min-h-[44px] text-sm border border-primary/20 text-primary rounded-md hover:bg-primary/5 transition-all"
                  >
                    {t.reject}
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 px-4 py-2.5 min-h-[44px] text-sm bg-primary text-background rounded-md hover:bg-accent transition-colors font-medium"
                  >
                    {t.accept}
                  </button>
                </>
              )}
            </div>

            {/* Link to privacy policy */}
            <p className="mt-3 text-sm text-primary/60 text-center">
              <Link href="/mentions-legales" className="underline hover:text-primary inline-block py-1">
                {t.privacyPolicy}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
