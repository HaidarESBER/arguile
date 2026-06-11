import Image from "next/image";
import { Order, orderStatusLabels } from "@/types/order";
import { formatCartTotal } from "@/types/cart";
import { formatDateLong } from "@/lib/date-utils";

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
  // Format date in French locale
  const orderDate = formatDateLong(order.createdAt);

  return (
    <div className="bg-background-card rounded-[--radius-card] p-6">
      {/* Order header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <p className="text-sm text-muted">Numéro de commande</p>
          <p className="font-heading text-xl text-primary">{order.orderNumber}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm text-muted">Statut</p>
          <p className="font-medium text-primary">
            {orderStatusLabels[order.status]}
          </p>
        </div>
      </div>

      {/* Order date */}
      <div className="border-t border-background-secondary pt-4 mb-6">
        <p className="text-sm text-muted">
          Commande passée le {orderDate}
        </p>
      </div>

      {/* Shipping address */}
      <div className="border-t border-background-secondary pt-6 mb-6">
        <h2 className="font-heading text-lg text-primary mb-3">
          Adresse de livraison
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
          Articles commandés
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
                <p className="text-sm text-muted">Quantité: {item.quantity}</p>
                <p className="text-sm text-muted">
                  Prix unitaire: {formatCartTotal(item.price)}
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
            <span>Sous-total</span>
            <span>{formatCartTotal(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Livraison</span>
            <span>{formatCartTotal(order.shipping)}</span>
          </div>
          <div className="flex justify-between font-medium text-lg text-primary pt-2 border-t border-background-secondary">
            <span>Total</span>
            <span>{formatCartTotal(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="border-t border-background-secondary pt-6 mt-6">
          <h2 className="font-heading text-lg text-primary mb-2">
            Notes
          </h2>
          <p className="text-muted">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
