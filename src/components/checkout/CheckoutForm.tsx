"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui";
import { GuestCheckout } from "./GuestCheckout";
import { ShippingForm } from "./ShippingForm";
import { ShippingCalculator } from "./ShippingCalculator";
import { PaymentMethods } from "./PaymentMethods";
import { OrderSummary } from "./OrderSummary";
import { DiscountCodeInput, AppliedDiscount } from "./DiscountCodeInput";
import { CartItem, calculateSubtotal } from "@/types/cart";
import {
  ShippingAddress,
  CheckoutFormData,
  defaultShippingAddress,
  europeanCountries,
  EuropeanCountry,
  isValidEmail,
  isValidFrenchPostalCode,
  isValidPhone,
} from "@/types/checkout";
import { ShippingMethod } from "@/lib/shipping";
import { UserSession } from "@/types/user";
import { useLocale } from "@/contexts/LocaleContext";

const STRINGS = {
  fr: {
    emailRequired: "L'email est requis",
    emailInvalid: "L'email n'est pas valide",
    firstNameRequired: "Le prénom est requis",
    lastNameRequired: "Le nom est requis",
    phoneRequired: "Le téléphone est requis",
    phoneInvalid: "Le numéro de téléphone n'est pas valide",
    addressRequired: "L'adresse est requise",
    cityRequired: "La ville est requise",
    postalCodeRequired: "Le code postal est requis",
    postalCodeInvalid: "Le code postal n'est pas valide pour ce pays",
    acceptTermsRequired:
      "Veuillez accepter les conditions générales de vente pour continuer",
    genericOrderError: "Une erreur est survenue lors de la commande",
    notesLabel: "Notes pour la commande (optionnel)",
    notesPlaceholder: "Instructions spéciales pour la livraison...",
    closeError: "Fermer l'erreur",
    termsBefore: "J'ai lu et j'accepte les",
    termsLink: "conditions générales de vente",
    termsRequired: "(obligatoire)",
    redirecting: "Redirection vers le paiement",
    proceedToPayment: "Procéder au paiement",
    securePayment: "Paiement sécurisé via Stripe",
  },
  en: {
    emailRequired: "Email is required",
    emailInvalid: "Email is not valid",
    firstNameRequired: "First name is required",
    lastNameRequired: "Last name is required",
    phoneRequired: "Phone number is required",
    phoneInvalid: "Phone number is not valid",
    addressRequired: "Address is required",
    cityRequired: "City is required",
    postalCodeRequired: "Postal code is required",
    postalCodeInvalid: "Postal code is not valid for this country",
    acceptTermsRequired:
      "Please accept the terms of sale to continue",
    genericOrderError: "An error occurred while placing the order",
    notesLabel: "Order notes (optional)",
    notesPlaceholder: "Special delivery instructions...",
    closeError: "Dismiss error",
    termsBefore: "I have read and accept the",
    termsLink: "terms of sale",
    termsRequired: "(required)",
    redirecting: "Redirecting to payment",
    proceedToPayment: "Proceed to payment",
    securePayment: "Secure payment via Stripe",
  },
} as const;

/**
 * CheckoutFormData plus the selected shipping method. The server recomputes
 * the shipping cost from the address country + method (never trusts the
 * client-side cost).
 */
export interface CheckoutSubmitData extends CheckoutFormData {
  shippingMethod: ShippingMethod;
}

interface CheckoutFormProps {
  items: CartItem[];
  onSubmit: (data: CheckoutSubmitData) => Promise<void>;
}

type FieldErrors = Partial<Record<keyof ShippingAddress, string>>;

/**
 * CheckoutForm orchestrates the checkout flow
 *
 * Features:
 * - Guest checkout with optional account creation
 * - Auto-fill email for logged-in users
 * - Two-column layout on desktop (form + summary)
 * - Stacked on mobile (summary first)
 * - Section-based progression (email -> shipping -> discount -> payment)
 * - Client-side validation
 * - Loading state during submission
 */
export function CheckoutForm({ items, onSubmit }: CheckoutFormProps) {
  const { locale } = useLocale();
  const t = STRINGS[locale];

  // User session state
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Guest checkout state
  const [email, setEmail] = useState("");

  // Fetch user session on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "include",
        });
        const data = await response.json();

        if (data.user) {
          setUser(data.user);
          // Pre-fill email with user's account email
          setEmail(data.user.email);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setIsLoadingSession(false);
      }
    };

    fetchSession();
  }, []);

  // Shipping state — cost is null until the calculator reports one, so the
  // summary can tell "not computed yet" apart from "free shipping"
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(
    defaultShippingAddress
  );
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");

  // Discount state
  const [discountCode, setDiscountCode] = useState<AppliedDiscount | null>(null);

  const [notes, setNotes] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const cartTotal = calculateSubtotal(items);

  const handleDiscountApplied = useCallback((discount: AppliedDiscount | null) => {
    setDiscountCode(discount);
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FieldErrors = {};

    // Email validation (from guest checkout)
    if (!email.trim()) {
      setSubmitError(t.emailRequired);
      return false;
    } else if (!isValidEmail(email)) {
      setSubmitError(t.emailInvalid);
      return false;
    }

    // Required fields validation
    if (!shippingAddress.firstName.trim()) {
      newErrors.firstName = t.firstNameRequired;
    }
    if (!shippingAddress.lastName.trim()) {
      newErrors.lastName = t.lastNameRequired;
    }
    if (!shippingAddress.phone.trim()) {
      newErrors.phone = t.phoneRequired;
    } else if (!isValidPhone(shippingAddress.phone)) {
      newErrors.phone = t.phoneInvalid;
    }
    if (!shippingAddress.address.trim()) {
      newErrors.address = t.addressRequired;
    }
    if (!shippingAddress.city.trim()) {
      newErrors.city = t.cityRequired;
    }
    if (!shippingAddress.postalCode.trim()) {
      newErrors.postalCode = t.postalCodeRequired;
    } else if (!isValidFrenchPostalCode(shippingAddress.postalCode, shippingAddress.country)) {
      newErrors.postalCode = t.postalCodeInvalid;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return false;
    }

    // CGV acceptance is required before payment (consumer law)
    if (!acceptedTerms) {
      setSubmitError(t.acceptTermsRequired);
      return false;
    }

    return true;
  }, [email, shippingAddress, acceptedTerms, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Store email in shipping address for order data
      const updatedAddress = { ...shippingAddress, email };

      await onSubmit({
        shippingAddress: updatedAddress,
        shippingCost: shippingCost ?? 0,
        shippingMethod,
        notes: notes.trim() || undefined,
        discountCode: discountCode?.code,
        discountAmount: discountCode?.amount,
      });
      // Success: the browser is navigating to Stripe — keep the button
      // disabled so a second click can't create a duplicate order.
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : t.genericOrderError
      );
      setIsSubmitting(false);
    }
  };

  // Build discount prop for OrderSummary
  const discountProp = discountCode
    ? { code: discountCode.code, amount: discountCode.amount, label: discountCode.label }
    : undefined;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order summary on mobile (shown first) */}
        <div className="lg:hidden">
          <OrderSummary items={items} shippingCost={shippingCost} discount={discountProp} />
        </div>

        {/* Shipping form (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Email (guest checkout only) */}
          <GuestCheckout
            email={email}
            onEmailChange={setEmail}
            user={user}
            isLoadingSession={isLoadingSession}
          />

          {/* Section 2: Shipping information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <ShippingForm
              address={shippingAddress}
              onChange={setShippingAddress}
              errors={errors}
            />
          </motion.div>

          {/* Section 3: Shipping calculator (country driven by the address) */}
          <ShippingCalculator
            cartTotalCents={cartTotal}
            onShippingCostChange={setShippingCost}
            onShippingMethodChange={setShippingMethod}
            countryCode={
              europeanCountries[shippingAddress.country as EuropeanCountry]?.code ??
              "FR"
            }
          />

          {/* Section 4: Discount code */}
          <DiscountCodeInput
            subtotalCents={cartTotal}
            onDiscountApplied={handleDiscountApplied}
          />

          {/* Section 5: Payment */}
          <PaymentMethods />

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-primary mb-1"
            >
              {t.notesLabel}
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-[--radius-button] border border-background-secondary bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              placeholder={t.notesPlaceholder}
            />
          </motion.div>

          {/* Submit error */}
          <AnimatePresence>
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="p-4 bg-red-50 border border-red-200 rounded-[--radius-button] text-red-700 flex items-center gap-3"
              >
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
                  className="flex-shrink-0"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span className="flex-1">{submitError}</span>
                <button
                  onClick={() => setSubmitError(null)}
                  className="flex-shrink-0 text-red-700 hover:text-red-900 transition-colors"
                  aria-label={t.closeError}
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
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CGV acceptance (required before payment) */}
          <label
            htmlFor="accept-terms"
            className="flex items-start gap-3 cursor-pointer text-sm text-text"
          >
            <input
              type="checkbox"
              id="accept-terms"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                if (e.target.checked) setSubmitError(null);
              }}
              className="mt-0.5 h-4 w-4 rounded border-background-secondary accent-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <span>
              {t.termsBefore}{" "}
              <Link
                href="/cgv"
                target="_blank"
                className="underline underline-offset-2 text-primary hover:text-accent transition-colors"
              >
                {t.termsLink}
              </Link>{" "}
              <span className="text-muted">{t.termsRequired}</span>
            </span>
          </label>

          {/* Submit button */}
          <motion.div whileHover={{ scale: isSubmitting ? 1 : 1.01 }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className={`w-full ${isSubmitting ? "cursor-wait" : ""}`}
              disabled={isSubmitting}
            >
              <span className="flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    {/* Cloud icon (Nuage brand theme) rotating */}
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
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                    </motion.svg>
                    <span>
                      {t.redirecting}
                      <motion.span
                        className="inline-flex gap-0.5 ml-0.5"
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
                    </span>
                  </>
                ) : (
                  t.proceedToPayment
                )}
              </span>
            </Button>
          </motion.div>

          {/* Secure payment reassurance + accepted cards */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center gap-2 text-text-muted">
              <Lock className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
              <span className="text-xs">{t.securePayment}</span>
            </div>
            <ul className="flex items-center justify-center flex-wrap gap-2">
              {["Visa", "Mastercard", "CB", "American Express"].map((card) => (
                <li
                  key={card}
                  className="px-2.5 py-1 rounded-full border border-background-secondary text-xs text-text-muted"
                >
                  {card}
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Order summary on desktop (1/3 width, right side) */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <OrderSummary items={items} shippingCost={shippingCost} discount={discountProp} />
          </div>
        </div>
      </div>
    </form>
  );
}
