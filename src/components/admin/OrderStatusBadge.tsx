import { OrderStatus, orderStatusLabels } from "@/types/order";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

/**
 * Status badge color mapping
 * - pending: yellow/amber
 * - confirmed: blue
 * - processing: purple
 * - shipped: teal
 * - delivered: green
 * - cancelled: red
 */
const statusStyles: Record<OrderStatus, string> = {
  pending_payment: "bg-orange-100 text-orange-800",
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-teal-100 text-teal-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

/**
 * Display-only status badge with color coding
 */
export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${statusStyles[status]}`}
    >
      {orderStatusLabels[status]}
    </span>
  );
}
