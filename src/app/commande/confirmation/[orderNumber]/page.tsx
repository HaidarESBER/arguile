import { Metadata } from "next";
import Link from "next/link";
import { Container, Button } from "@/components/ui";
import { OrderConfirmation } from "@/components/order";
import { getOrderByNumber } from "@/lib/orders";
import { stripe } from "@/lib/stripe";

interface ConfirmationPageProps {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

/**
 * Generate page metadata with order number
 */
export async function generateMetadata({ params }: ConfirmationPageProps): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Confirmation de commande ${orderNumber}`,
    description: "Votre commande a été confirmée. Merci pour votre achat.",
    robots: { index: false, follow: false },
  };
}

/**
 * Order confirmation page
 *
 * Displays order details after successful checkout:
 * - Order number and status
 * - Shipping address
 * - Items ordered with prices
 * - Totals
 * - Next steps and navigation
 *
 * Handles Stripe return flow:
 * - Verifies session_id from Stripe redirect
 * - Passes paymentVerified prop to OrderConfirmation
 * - Handles edge case where webhook hasn't fired yet
 *
 * Handles order not found with friendly message.
 */
export default async function ConfirmationPage({ params, searchParams }: ConfirmationPageProps) {
  const { orderNumber } = await params;
  const { session_id: sessionId } = await searchParams;
  const order = await getOrderByNumber(orderNumber);

  // Handle order not found
  if (!order) {
    return (
      <Container as="main" size="md" className="py-12">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
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
              className="text-red-600"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl text-primary mb-4">
            Commande introuvable
          </h1>
          <p className="text-muted mb-8">
            Nous n&apos;avons pas trouve de commande avec le numéro{" "}
            <span className="font-medium text-primary">{orderNumber}</span>.
            <br />
            Veuillez verifier le numéro et reessayer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/produits">
              <Button variant="primary" size="md">
                Voir nos produits
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" size="md">
                Retour a l&apos;accueil
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  // Verify Stripe session if session_id is present (Stripe redirect flow)
  let paymentVerified = false;

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      // Verify session belongs to this order
      if (session.client_reference_id === order.id && session.payment_status === 'paid') {
        paymentVerified = true;
      }
    } catch (error) {
      // If session retrieval fails, show order without verification
      console.error('Failed to verify Stripe session:', error);
    }
  }

  // If order is already confirmed (webhook fired), consider it verified
  if (order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') {
    paymentVerified = true;
  }

  return (
    <Container as="main" size="lg" className="py-12">
      <OrderConfirmation
        order={order}
        paymentVerified={paymentVerified}
        orderStatus={order.status}
      />
    </Container>
  );
}
