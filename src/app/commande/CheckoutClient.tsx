"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui";
import { CheckoutForm, CheckoutSubmitData } from "@/components/checkout/CheckoutForm";
import { useCart } from "@/contexts/CartContext";
import { OrderItem } from "@/types/order";

/**
 * Client side of the checkout page (/commande)
 *
 * Renders the full checkout flow (email, address, shipping, discount code,
 * payment) and submits the order to /api/checkout, which creates the Stripe
 * Checkout Session. API errors are surfaced in French by CheckoutForm.
 */
export function CheckoutClient() {
  const { items, isHydrated } = useCart();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect to cart if empty — but only once the cart has actually been
  // loaded from localStorage. Redirecting before hydration bounced users
  // back to /panier on every full page load of /commande.
  useEffect(() => {
    if (isHydrated && items.length === 0 && !isRedirecting) {
      router.push("/panier");
    }
  }, [isHydrated, items.length, router, isRedirecting]);

  const handleSubmit = async (data: CheckoutSubmitData) => {
    const orderItems: OrderItem[] = items.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.images[0] || "",
      price: item.product.price,
      quantity: item.quantity,
    }));

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: orderItems,
        shippingAddress: data.shippingAddress,
        // Only the method is sent — the cost is recomputed server-side
        shippingMethod: data.shippingMethod,
        notes: data.notes,
        discountCode: data.discountCode,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      // CheckoutForm catches and displays this message
      throw new Error(
        result.error || "Erreur lors de la création de la session de paiement"
      );
    }

    setIsRedirecting(true);
    window.location.href = result.url;
  };

  // Don't render until the cart is loaded, nor if it is empty
  if (!isHydrated || items.length === 0) {
    return null;
  }

  return (
    <Container as="main" size="lg" className="py-12">
      <div className="mb-8">
        <Link
          href="/panier"
          className="text-sm text-muted hover:text-primary transition-colors inline-flex items-center gap-1"
        >
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
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Retour au panier
        </Link>
        <h1 className="font-heading text-3xl text-primary mt-4">
          Finaliser ma commande
        </h1>
      </div>

      <CheckoutForm items={items} onSubmit={handleSubmit} />
    </Container>
  );
}
