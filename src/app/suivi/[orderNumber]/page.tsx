import { Metadata } from "next";
import Link from "next/link";
import { Container, Button } from "@/components/ui";
import { OrderTracking } from "@/components/order/OrderTracking";
import { getOrderByNumber } from "@/lib/orders";
import { getSession } from "@/lib/session";
import { getLocale } from "@/lib/i18n/server";

interface OrderTrackingPageProps {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ email?: string }>;
}

const STRINGS = {
  fr: {
    metaTitle: (orderNumber: string) => `Suivi de commande ${orderNumber}`,
    metaDescription: "Suivez l'état de votre commande en temps réel.",
    notFoundTitle: "Commande introuvable",
    notFoundBefore: "Aucune commande ne correspond au numéro",
    notFoundAfter: "et à cette adresse email.",
    notFoundHint: "Utilisez le formulaire de suivi avec l'email de votre commande.",
    trackOrder: "Suivre ma commande",
  },
  en: {
    metaTitle: (orderNumber: string) => `Order tracking ${orderNumber}`,
    metaDescription: "Track the status of your order in real time.",
    notFoundTitle: "Order not found",
    notFoundBefore: "No order matches the number",
    notFoundAfter: "and this email address.",
    notFoundHint: "Use the tracking form with the email used for your order.",
    trackOrder: "Track my order",
  },
} as const;

/**
 * Generate page metadata with order number
 */
export async function generateMetadata({
  params,
}: OrderTrackingPageProps): Promise<Metadata> {
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
 * Order Tracking Details Page
 *
 * Displays order status, timeline, and tracking information.
 * Accessed after verification from /suivi page.
 */
export default async function OrderTrackingDetailsPage({
  params,
  searchParams,
}: OrderTrackingPageProps) {
  const { orderNumber } = await params;
  const { email } = await searchParams;
  const order = await getOrderByNumber(orderNumber);

  // Order numbers are sequential (NU-YYYY-NNNN) and therefore guessable —
  // require proof of ownership: the customer's email (carried from the /suivi
  // lookup or the tracking email link) or a logged-in session with the same
  // email.
  let isOwner = false;
  if (order) {
    if (
      email &&
      email.trim().toLowerCase() ===
        order.shippingAddress.email?.toLowerCase()
    ) {
      isOwner = true;
    } else {
      const user = await getSession();
      if (
        user?.email &&
        user.email.toLowerCase() === order.shippingAddress.email?.toLowerCase()
      ) {
        isOwner = true;
      }
    }
  }

  // Same response for "not found" and "wrong email" so order numbers can't
  // be enumerated (mirrors /api/verify-order).
  if (!order || !isOwner) {
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
            Aucune commande ne correspond au numéro{" "}
            <span className="font-medium text-primary">{orderNumber}</span> et
            à cette adresse email.
            <br />
            Utilisez le formulaire de suivi avec l&apos;email de votre commande.
          </p>
          <Link href="/suivi">
            <Button variant="primary" size="md">
              Suivre ma commande
            </Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container as="main" size="lg" className="py-12">
      <OrderTracking order={order} />
    </Container>
  );
}
