"use client";

import Image from "next/image";
import { Order, OrderStatus } from "@/types/order";
import { formatCartTotal } from "@/types/cart";
import { formatDateLong } from "@/lib/date-utils";
import { useLocale } from "@/contexts/LocaleContext";

const STRINGS = {
  fr: {
    // fr values match orderStatusLabels in @/types/order
    statusLabels: {
      pending_payment: "En attente de paiement",
      pending: "En attente",
      confirmed: "Confirmée",
      processing: "En préparation",
      shipped: "Expédiée",
      delivered: "Livrée",
      cancelled: "Annulée",
      refunded: "Remboursée",
    } as Record<OrderStatus, string>,
    orderNumber: "Numéro de commande",
    status: "Statut",
    placedOn: (date: string) => `Commande passée le ${date}`,
    shippingAddress: "Adresse de livraison",
    itemsOrdered: "Articles commandés",
    quantity: (n: number) => `Quantité: ${n}`,
    unitPrice: "Prix unitaire:",
    subtotal: "Sous-total",
    shipping: "Livraison",
    total: "Total",
    notes: "Notes",
  },
  en: {
    statusLabels: {
      pending_payment: "Awaiting payment",
      pending: "Pending",
      confirmed: "Confirmed",
      processing: "Being prepared",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      refunded: "Refunded",
    } as Record<OrderStatus, string>,
    orderNumber: "Order number",
    status: "Status",
    placedOn: (date: string) => `Order placed on ${date}`,
    shippingAddress: "Shipping address",
    itemsOrdered: "Items ordered",
    quantity: (n: number) => `Quantity: ${n}`,
    unitPrice: "Unit price:",
    subtotal: "Subtotal",
    shipping: "Shipping",
    total: "Total",
    notes: "Notes",
  },
} as const;

interface OrderDetailsProps {
  order: Order;
}

/**
 * OrderDetails component
 *
 * Displays complete order information:
 * - Order number and status
 * - Shipping address (formatted in French)
 * - Order items with images, quantities, and prices
 * - Subtotal, shipping, and total
 * - Order date in French locale
 *
 * @example
 * <OrderDetails order={order} />
 */
export function OrderDetails({ order }: OrderDetailsProps) {
  const { locale } = useLocale();
  const t = STRINGS[locale];

  // Format date in French locale
  const orderDate = formatDateLong(order.createdAt, locale);

  return (
    <div className="bg-background-card rounded-[--radius-card] p-6">
      {/* Order header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <p className="text-sm text-muted">{t.orderNumber}</p>
          <p className="font-heading text-xl text-primary">{order.orderNumber}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm text-muted">{t.status}</p>
          <p className="font-medium text-primary">
            {t.statusLabels[order.status]}
          </p>
        </div>
      </div>

      {/* Order date */}
      <div className="border-t border-background-secondary pt-4 mb-6">
        <p className="text-sm text-muted">
          {t.placedOn(orderDate)}
        </p>
      </div>

      {/* Shipping address */}
      <div className="border-t border-background-secondary pt-6 mb-6">
        <h2 className="font-heading text-lg text-primary mb-3">
          {t.shippingAddress}
        </h2>
        <address className="text-muted not-italic leading-relaxed">
          {order.shippingAddress.firstName} {order.shippingAddress.lastName}
          <br />
          {order.shippingAddress.address}
          {order.shippingAddress.addressLine2 && (
            <>
              <br />
              {order.shippingAddress.addressLine2}
            </>
          )}
          <br />
          {order.shippingAddress.postalCode} {order.shippingAddress.city}
          <br />
          {order.shippingAddress.country}
          <br />
          <br />
          <span className="text-primary">{order.shippingAddress.email}</span>
          <br />
          {order.shippingAddress.phone}
        </address>
      </div>

      {/* Order items */}
      <div className="border-t border-background-secondary pt-6">
        <h2 className="font-heading text-lg text-primary mb-4">
          {t.itemsOrdered}
        </h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.productId} className="flex gap-4">
              {/* Product image */}
              <div className="relative w-20 h-20 flex-shrink-0 rounded-[--radius-button] overflow-hidden bg-background-secondary">
                {item.productImage ? (
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-primary">{item.productName}</h3>
                <p className="text-sm text-muted">{t.quantity(item.quantity)}</p>
                <p className="text-sm text-muted">
                  {t.unitPrice} {formatCartTotal(item.price)}
                </p>
              </div>

              {/* Line total */}
              <div className="text-right">
                <p className="font-medium text-primary">
                  {formatCartTotal(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-background-secondary mt-6 pt-4 space-y-2">
          <div className="flex justify-between text-muted">
            <span>{t.subtotal}</span>
            <span>{formatCartTotal(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>{t.shipping}</span>
            <span>{formatCartTotal(order.shipping)}</span>
          </div>
          <div className="flex justify-between font-medium text-lg text-primary pt-2 border-t border-background-secondary">
            <span>{t.total}</span>
            <span>{formatCartTotal(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="border-t border-background-secondary pt-6 mt-6">
          <h2 className="font-heading text-lg text-primary mb-2">
            {t.notes}
          </h2>
          <p className="text-muted">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
