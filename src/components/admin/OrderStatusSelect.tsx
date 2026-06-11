"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { OrderStatus, orderStatusLabels } from "@/types/order";
import { updateOrderStatusAction } from "@/app/admin/commandes/actions";

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusChange?: (newStatus: OrderStatus) => void;
}

const statusOptions: OrderStatus[] = [
  "pending_payment",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

/**
 * Dropdown to change order status
 * Calls the admin-guarded updateOrderStatusAction Server Action on change
 */
export function OrderStatusSelect({
  orderId,
  currentStatus,
  onStatusChange,
}: OrderStatusSelectProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    setStatus(newStatus);

    startTransition(async () => {
      try {
        await updateOrderStatusAction(orderId, newStatus);
        onStatusChange?.(newStatus);
        router.refresh();
      } catch (error) {
        // Revert on error
        setStatus(currentStatus);
        console.error("Failed to update order status:", error);
      }
    });
  };

  return (
    <div className="relative">
      <select
        value={status}
        onChange={handleChange}
        disabled={isPending}
        className={`
          appearance-none
          px-3 py-2 pr-8
          bg-secondary
          border border-primary/30
          rounded-md
          text-primary
          text-sm
          cursor-pointer
          hover:border-primary/50
          focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
          disabled:opacity-50 disabled:cursor-wait
          transition-colors
        `}
      >
        {statusOptions.map((option) => (
          <option key={option} value={option}>
            {orderStatusLabels[option]}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        {isPending ? (
          <svg
            className="w-4 h-4 animate-spin text-primary/50"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 text-primary/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
