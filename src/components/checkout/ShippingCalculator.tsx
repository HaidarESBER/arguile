"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  EUROPEAN_COUNTRIES,
  detectUserCountry,
  getCountryByCode,
  getCountryName,
} from "@/data/countries";
import {
  calculateShippingCost,
  formatShippingPrice,
  shouldShowCustomsWarning,
  getCustomsWarningMessage,
  ShippingMethod,
  ShippingRate,
} from "@/lib/shipping";
import { useLocale } from "@/contexts/LocaleContext";

const STRINGS = {
  fr: {
    heading: "Livraison",
    shippingTo: "Livraison vers",
    accordingToAddress: "(selon l'adresse saisie)",
    countryLabel: "Pays de livraison *",
    methodLabel: "Mode de livraison *",
    standard: "Standard",
    express: "Express",
  },
  en: {
    heading: "Shipping",
    shippingTo: "Shipping to",
    accordingToAddress: "(based on the address entered)",
    countryLabel: "Shipping country *",
    methodLabel: "Shipping method *",
    standard: "Standard",
    express: "Express",
  },
} as const;

interface ShippingCalculatorProps {
  cartTotalCents: number;
  onShippingCostChange: (cost: number) => void;
  onShippingMethodChange?: (method: ShippingMethod) => void;
  /**
   * Controlled country code (e.g. "FR"). When provided, the country is driven
   * by the shipping address and the internal country dropdown is hidden.
   */
  countryCode?: string;
}

/**
 * ShippingCalculator component for European countries
 *
 * Features:
 * - Country dropdown with flag emojis
 * - Auto-detect country from browser locale
 * - Standard/Express shipping method selection
 * - Real-time cost calculation
 * - Delivery time estimates
 * - Customs warning for non-EU > €200
 * - Smooth cost update animations
 */
export function ShippingCalculator({
  cartTotalCents,
  onShippingCostChange,
  onShippingMethodChange,
  countryCode,
}: ShippingCalculatorProps) {
  const { locale } = useLocale();
  const t = STRINGS[locale];
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("FR");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [shippingRate, setShippingRate] = useState<ShippingRate | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Controlled by the shipping address country, or auto-detect on mount
  useEffect(() => {
    if (countryCode) {
      // Syncs with the controlled prop / browser-locale detection; deferred to effect to avoid SSR hydration mismatch
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCountryCode(countryCode);
      return;
    }
    const detectedCountry = detectUserCountry();
    setSelectedCountryCode(detectedCountry);
  }, [countryCode]);

  // Calculate shipping cost when country or method changes
  useEffect(() => {
    const country = getCountryByCode(selectedCountryCode);
    if (country) {
      // Pass the cart subtotal so free shipping (France ≥ threshold) shows
      // here exactly as the server will charge it.
      const rate = calculateShippingCost(country.region, shippingMethod, cartTotalCents, locale);
      // Rate depends on the country detected client-side; computing it during render would change SSR output (hydration mismatch)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShippingRate(rate);
      onShippingCostChange(rate.cost);
      if (onShippingMethodChange) {
        onShippingMethodChange(shippingMethod);
      }
    }
  }, [selectedCountryCode, shippingMethod, cartTotalCents, locale, onShippingCostChange, onShippingMethodChange]);

  const selectedCountry = getCountryByCode(selectedCountryCode);
  const showCustomsWarning =
    selectedCountry &&
    shouldShowCustomsWarning(selectedCountry.region, cartTotalCents);

  const handleCountryChange = (code: string) => {
    setSelectedCountryCode(code);
    setIsOpen(false);
  };

  const handleMethodChange = (method: ShippingMethod) => {
    setShippingMethod(method);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-4"
    >
      <h2 className="font-heading text-xl text-text">{t.heading}</h2>

      {/* Country driven by the shipping address (controlled mode) */}
      {countryCode && selectedCountry && (
        <p className="text-sm text-muted flex items-center gap-2">
          <span className="text-lg">{selectedCountry.flag}</span>
          <span>
            {t.shippingTo} <span className="text-text font-medium">{getCountryName(selectedCountry, locale)}</span>{" "}
            {t.accordingToAddress}
          </span>
        </p>
      )}

      {/* Country selection (only when not driven by the address) */}
      {!countryCode && (
      <div>
        <label
          htmlFor="shipping-country"
          className="block text-sm font-medium text-text mb-1"
        >
          {t.countryLabel}
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-4 py-3 rounded-[--radius-button] border border-background-secondary bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              {selectedCountry && (
                <>
                  <span className="text-lg">{selectedCountry.flag}</span>
                  <span>{getCountryName(selectedCountry, locale)}</span>
                </>
              )}
            </span>
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
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-10 w-full mt-1 bg-background border border-background-secondary rounded-[--radius-button] shadow-lg max-h-60 overflow-y-auto"
              >
                {EUROPEAN_COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountryChange(country.code)}
                    className="w-full px-4 py-2 text-left hover:bg-background-secondary transition-colors flex items-center gap-2"
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-text">{getCountryName(country, locale)}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      )}

      {/* Shipping method selection */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">
          {t.methodLabel}
        </label>
        <div className="space-y-2">
          {/* Standard shipping */}
          <label className="flex items-start gap-3 p-3 rounded-[--radius-button] border border-background-secondary hover:border-accent cursor-pointer transition-colors">
            <input
              type="radio"
              name="shipping-method"
              value="standard"
              checked={shippingMethod === "standard"}
              onChange={() => handleMethodChange("standard")}
              className="mt-1 w-4 h-4 text-accent focus:ring-accent focus:ring-2"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
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
                    className="text-accent"
                  >
                    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                    <path d="M15 18H9" />
                    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                    <circle cx="17" cy="18" r="2" />
                    <circle cx="7" cy="18" r="2" />
                  </svg>
                  <span className="font-medium text-text">{t.standard}</span>
                </div>
                {shippingRate && shippingMethod === "standard" && (
                  <motion.span
                    key={shippingRate.cost}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="font-medium text-accent"
                  >
                    {formatShippingPrice(shippingRate.cost)}
                  </motion.span>
                )}
              </div>
              {shippingRate && shippingMethod === "standard" && (
                <div className="text-xs text-muted mt-1">
                  {shippingRate.carrier} • {shippingRate.estimatedDays}
                </div>
              )}
            </div>
          </label>

          {/* Express shipping */}
          <label className="flex items-start gap-3 p-3 rounded-[--radius-button] border border-background-secondary hover:border-accent cursor-pointer transition-colors">
            <input
              type="radio"
              name="shipping-method"
              value="express"
              checked={shippingMethod === "express"}
              onChange={() => handleMethodChange("express")}
              className="mt-1 w-4 h-4 text-accent focus:ring-accent focus:ring-2"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
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
                    className="text-accent"
                  >
                    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  <span className="font-medium text-text">{t.express}</span>
                </div>
                {shippingRate && shippingMethod === "express" && (
                  <motion.span
                    key={shippingRate.cost}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="font-medium text-accent"
                  >
                    {formatShippingPrice(shippingRate.cost)}
                  </motion.span>
                )}
              </div>
              {shippingRate && shippingMethod === "express" && (
                <div className="text-xs text-muted mt-1">
                  {shippingRate.carrier} • {shippingRate.estimatedDays}
                </div>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Customs warning for non-EU > €200 */}
      <AnimatePresence>
        {showCustomsWarning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-3 bg-yellow-50 border border-yellow-200 rounded-[--radius-button] flex items-start gap-2"
          >
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
              className="flex-shrink-0 text-yellow-700 mt-0.5"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="text-xs text-yellow-800">{getCustomsWarningMessage(locale)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
