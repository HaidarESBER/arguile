"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
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

  // Shipping state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(
    defaultShippingAddress
  );
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");

  // Discount state
  const [discountCode, setDiscountCode] = useState<AppliedDiscount | null>(null);

  const [notes, setNotes] = useState("");
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
      setSubmitError("L'email est requis");
      return false;
    } else if (!isValidEmail(email)) {
      setSubmitError("L'email n'est pas valide");
      return false;
    }

    // Required fields validation
    if (!shippingAddress.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    }
    if (!shippingAddress.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    }
    if (!shippingAddress.phone.trim()) {
      newErrors.phone = "Le téléphone est requis";
    } else if (!isValidPhone(shippingAddress.phone)) {
      newErrors.phone = "Le numéro de téléphone n'est pas valide";
    }
    if (!shippingAddress.address.trim()) {
      newErrors.address = "L'adresse est requise";
    }
    if (!shippingAddress.city.trim()) {
      newErrors.city = "La ville est requise";
    }
    if (!shippingAddress.postalCode.trim()) {
      newErrors.postalCode = "Le code postal est requis";
    } else if (!isValidFrenchPostalCode(shippingAddress.postalCode, shippingAddress.country)) {
      newErrors.postalCode = "Le code postal n'est pas valide pour ce pays";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, shippingAddress]);

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
        shippingCost,
        shippingMethod,
        notes: notes.trim() || undefined,
        discountCode: discountCode?.code,
        discountAmount: discountCode?.amount,
      });

    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la commande"
      );
    } finally {
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
              Notes pour la commande (optionnel)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-[--radius-button] border border-background-secondary bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              placeholder="Instructions spéciales pour la livraison..."
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
                  aria-label="Fermer l'erreur"
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
                      Redirection vers le paiement
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
                  "Procéder au paiement"
                )}
              </span>
            </Button>
          </motion.div>

          <p className="text-xs text-muted text-center">
            En confirmant votre commande, vous acceptez nos conditions générales de vente.
          </p>
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
