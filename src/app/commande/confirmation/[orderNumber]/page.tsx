import { Metadata } from "next";
import Link from "next/link";
import { Container, Button } from "@/components/ui";
import { OrderConfirmation } from "@/components/order";
import { getOrderByNumber } from "@/lib/orders";
import { getSession } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import { getLocale } from "@/lib/i18n/server";

interface ConfirmationPageProps {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

const STRINGS = {
  fr: {
    metaTitle: (orderNumber: string) => `Confirmation de commande ${orderNumber}`,
    metaDescription: "Votre commande a été confirmée. Merci pour votre achat.",
    notFoundTitle: "Commande introuvable",
    notFoundBefore: "Nous n'avons pas trouvé de commande avec le numéro",
    notFoundAfter: "Veuillez vérifier le numéro et réessayer.",
    viewProducts: "Voir nos produits",
    backToHome: "Retour à l'accueil",
    orderTitle: (orderNumber: string) => `Commande ${orderNumber}`,
    notBuyerMessage:
      "Pour consulter les détails de cette commande, utilisez le lien envoyé par email ou suivez votre commande avec votre adresse email.",
    trackOrder: "Suivre ma commande",
  },
  en: {
    metaTitle: (orderNumber: string) => `Order confirmation ${orderNumber}`,
    metaDescription: "Your order has been confirmed. Thank you for your purchase.",
    notFoundTitle: "Order not found",
    notFoundBefore: "We could not find an order with the number",
    notFoundAfter: "Please check the number and try again.",
    viewProducts: "View our products",
    backToHome: "Back to home",
    orderTitle: (orderNumber: string) => `Order ${orderNumber}`,
    notBuyerMessage:
      "To view the details of this order, use the link sent by email or track your order with your email address.",
    trackOrder: "Track my order",
  },
} as const;

/**
 * Generate page metadata with order number
 */
export async function generateMetadata({ params }: ConfirmationPageProps): Promise<Metadata> {
  const { orderNumber } = await params;
  const locale = await getLocale();
  const t = STRINGS[locale];
  return {
    title: t.metaTitle(orderNumber),
    description: t.metaDescription,
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
  const locale = await getLocale();
  const t = STRINGS[locale];
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
            {t.notFoundTitle}
          </h1>
          <p className="text-muted mb-8">
            {t.notFoundBefore}{" "}
            <span className="font-medium text-primary">{orderNumber}</span>.
            <br />
            {t.notFoundAfter}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/produits">
              <Button variant="primary" size="md">
                {t.viewProducts}
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" size="md">
                {t.backToHome}
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  // Verify Stripe session if session_id is present (Stripe redirect flow).
  // A matching session also proves the visitor is the buyer: the session_id
  // is only known to whoever went through this checkout.
  let paymentVerified = false;
  let isBuyer = false;

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      // Verify session belongs to this order
      if (session.client_reference_id === order.id) {
        isBuyer = true;
        if (session.payment_status === 'paid') {
          paymentVerified = true;
        }
      }
    } catch (error) {
      // If session retrieval fails, show order without verification
      console.error('Failed to verify Stripe session:', error);
    }
  }

  // Logged-in users can view their own orders
  if (!isBuyer) {
    const user = await getSession();
    if (
      user?.email &&
      user.email.toLowerCase() === order.shippingAddress.email?.toLowerCase()
    ) {
      isBuyer = true;
    }
  }

  // Order numbers are sequential (NU-YYYY-NNNN) and therefore guessable —
  // never show the order contents (name, address, items) to a visitor who
  // can't prove the order is theirs.
  if (!isBuyer) {
    return (
      <Container as="main" size="md" className="py-12">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-primary mb-4">
            {t.orderTitle(orderNumber)}
          </h1>
          <p className="text-muted mb-8">
            {t.notBuyerMessage}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/suivi">
              <Button variant="primary" size="md">
                {t.trackOrder}
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" size="md">
                {t.backToHome}
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    );
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
