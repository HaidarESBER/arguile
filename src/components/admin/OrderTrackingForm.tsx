"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Order } from "@/types/order";
import { Button } from "@/components/ui";

interface OrderTrackingFormProps {
  order: Order;
}

/**
 * Form to add/edit tracking information for an order
 *
 * Features:
 * - Tracking number input
 * - Tracking URL input
 * - Estimated delivery date
 * - Save button
 * - Auto-sends shipping notification if order status is "shipped"
 */
export function OrderTrackingForm({ order }: OrderTrackingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [trackingNumber, setTrackingNumber] = useState(
    order.trackingNumber || ""
  );
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl || "");
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    order.estimatedDelivery || ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        const response = await fetch("/api/update-order-tracking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            trackingNumber: trackingNumber.trim() || undefined,
            trackingUrl: trackingUrl.trim() || undefined,
            estimatedDelivery: estimatedDelivery.trim() || undefined,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update tracking");
        }

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue"
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tracking Number */}
      <div>
        <label
          htmlFor="trackingNumber"
          className="block text-sm font-medium text-primary mb-1"
        >
          Numéro de suivi
        </label>
        <input
          type="text"
          id="trackingNumber"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Ex: 1234567890"
          className="w-full px-3 py-2 bg-background border border-primary/30 rounded-md text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          disabled={isPending}
        />
      </div>

      {/* Tracking URL */}
      <div>
        <label
          htmlFor="trackingUrl"
          className="block text-sm font-medium text-primary mb-1"
        >
          URL de suivi
        </label>
        <input
          type="url"
          id="trackingUrl"
          value={trackingUrl}
          onChange={(e) => setTrackingUrl(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 bg-background border border-primary/30 rounded-md text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          disabled={isPending}
        />
      </div>

      {/* Estimated Delivery */}
      <div>
        <label
          htmlFor="estimatedDelivery"
          className="block text-sm font-medium text-primary mb-1"
        >
          Livraison estimée
        </label>
        <input
          type="text"
          id="estimatedDelivery"
          value={estimatedDelivery}
          onChange={(e) => setEstimatedDelivery(e.target.value)}
          placeholder="Ex: 15 février 2026"
          className="w-full px-3 py-2 bg-background border border-primary/30 rounded-md text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          disabled={isPending}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
          Informations de suivi enregistrées avec succès !
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
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
            Enregistrement...
          </span>
        ) : (
          "Enregistrer"
        )}
      </Button>

      {order.status === "shipped" && trackingNumber && (
        <p className="text-xs text-muted text-center">
          L&apos;email de notification de livraison sera envoyé automatiquement
        </p>
      )}
    </form>
  );
}
