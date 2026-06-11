import { Metadata } from "next";
import Link from "next/link";
import { Container, Button } from "@/components/ui";
import { OrderTracking } from "@/components/order/OrderTracking";
import { getOrderByNumber } from "@/lib/orders";

interface OrderTrackingPageProps {
  params: Promise<{ orderNumber: string }>;
}

/**
 * Generate page metadata with order number
 */
export async function generateMetadata({
  params,
}: OrderTrackingPageProps): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Suivi de commande ${orderNumber}`,
    description: "Suivez l'état de votre commande en temps réel.",
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
}: OrderTrackingPageProps) {
  const { orderNumber } = await params;
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
            Nous n&apos;avons pas trouvé de commande avec le numéro{" "}
            <span className="font-medium text-primary">{orderNumber}</span>.
          </p>
          <Link href="/suivi">
            <Button variant="primary" size="md">
              Nouvelle recherche
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
