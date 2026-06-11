import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { formatPrice } from "@/types/product";
import { OrderStatusSelect, OrderTrackingForm } from "@/components/admin";
import { calculateLineTotal } from "@/types/order";
import { formatDateTime } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/admin/commandes"
            className="text-sm text-primary/60 hover:text-primary transition-colors"
          >
            &larr; Retour aux commandes
          </Link>
          <h2 className="mt-2 text-2xl font-heading font-semibold text-primary">
            Commande {order.orderNumber}
          </h2>
          <p className="mt-1 text-sm text-primary/60">
            Passee le {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-primary/60">Statut:</span>
          <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items (Left Column - 2/3) */}
        <div className="lg:col-span-2 bg-secondary rounded-lg border border-primary/10 overflow-hidden">
          <div className="px-4 py-3 bg-primary/5 border-b border-primary/10">
            <h3 className="font-medium text-primary">Articles commandés</h3>
          </div>
          <div className="divide-y divide-primary/10">
            {order.items.map((item, index) => (
              <div key={index} className="p-4 flex gap-4">
                {item.productImage ? (
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary/10 rounded flex items-center justify-center">
                    <span className="text-primary/40 text-xs">N/A</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-primary truncate">
                    {item.productName}
                  </p>
                  <p className="mt-1 text-sm text-primary/60">
                    {formatPrice(item.price)} x {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary">
                    {formatPrice(calculateLineTotal(item))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address & Totals (Right Column - 1/3) */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-secondary rounded-lg border border-primary/10 overflow-hidden">
            <div className="px-4 py-3 bg-primary/5 border-b border-primary/10">
              <h3 className="font-medium text-primary">Adresse de livraison</h3>
            </div>
            <div className="p-4 text-sm text-primary/80 space-y-1">
              <p className="font-medium text-primary">
                {order.shippingAddress.firstName}{" "}
                {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.postalCode} {order.shippingAddress.city}
              </p>
              <p>{order.shippingAddress.country}</p>
              <div className="pt-2 mt-2 border-t border-primary/10">
                <p>{order.shippingAddress.email}</p>
                <p>{order.shippingAddress.phone}</p>
              </div>
            </div>
          </div>

          {/* Order Totals */}
          <div className="bg-secondary rounded-lg border border-primary/10 overflow-hidden">
            <div className="px-4 py-3 bg-primary/5 border-b border-primary/10">
              <h3 className="font-medium text-primary">Recapitulatif</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-primary/70">Sous-total</span>
                <span className="text-primary">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary/70">Livraison</span>
                <span className="text-primary">
                  {formatPrice(order.shipping)}
                </span>
              </div>
              <div className="pt-3 border-t border-primary/10 flex justify-between">
                <span className="font-medium text-primary">Total</span>
                <span className="font-semibold text-primary">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {(order.stripeSessionId || order.stripePaymentIntentId) && (
            <div className="bg-secondary rounded-lg border border-primary/10 overflow-hidden">
              <div className="px-4 py-3 bg-primary/5 border-b border-primary/10">
                <h3 className="font-medium text-primary">Paiement</h3>
              </div>
              <div className="p-4 text-sm text-primary/80 space-y-2">
                {order.stripePaymentIntentId && (
                  <div>
                    <p className="text-primary/60 text-xs uppercase tracking-wide mb-1">
                      Reference de paiement
                    </p>
                    <p className="font-mono text-primary text-xs">
                      {order.stripePaymentIntentId.length > 20
                        ? `${order.stripePaymentIntentId.slice(0, 10)}...${order.stripePaymentIntentId.slice(-8)}`
                        : order.stripePaymentIntentId}
                    </p>
                    <a
                      href={`https://dashboard.stripe.com/test/payments/${order.stripePaymentIntentId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-800 underline transition-colors"
                    >
                      Voir sur Stripe Dashboard
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Notes */}
          {order.notes && (
            <div className="bg-secondary rounded-lg border border-primary/10 overflow-hidden">
              <div className="px-4 py-3 bg-primary/5 border-b border-primary/10">
                <h3 className="font-medium text-primary">Notes</h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-primary/80 whitespace-pre-wrap">
                  {order.notes}
                </p>
              </div>
            </div>
          )}

          {/* Tracking Information */}
          <div className="bg-secondary rounded-lg border border-primary/10 overflow-hidden">
            <div className="px-4 py-3 bg-primary/5 border-b border-primary/10">
              <h3 className="font-medium text-primary">Informations de suivi</h3>
            </div>
            <div className="p-4">
              <OrderTrackingForm order={order} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
