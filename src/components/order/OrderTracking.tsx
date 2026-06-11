"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Order, OrderStatus, orderStatusLabels } from "@/types/order";
import { Button } from "@/components/ui";
import { OrderDetails } from "./OrderDetails";

interface OrderTrackingProps {
  order: Order;
}

/**
 * OrderTracking component
 *
 * Displays order tracking information with:
 * - Visual status timeline
 * - Current status highlight
 * - Tracking number and link (if shipped)
 * - Estimated delivery
 * - Full order details
 */
export function OrderTracking({ order }: OrderTrackingProps) {
  const {
    orderNumber,
    status,
    trackingNumber,
    trackingUrl,
    estimatedDelivery,
  } = order;

  // Define status progression
  const statusFlow: OrderStatus[] = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
  ];

  // Get index of current status
  const currentStatusIndex = statusFlow.indexOf(status);

  // Check if status is completed
  const isStatusCompleted = (checkStatus: OrderStatus): boolean => {
    const checkIndex = statusFlow.indexOf(checkStatus);
    return checkIndex <= currentStatusIndex;
  };

  // Check if status is current
  const isStatusCurrent = (checkStatus: OrderStatus): boolean => {
    return checkStatus === status;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-heading text-3xl text-primary mb-2">
          Suivi de commande
        </h1>
        <p className="text-lg text-primary font-medium">
          Commande {orderNumber}
        </p>
      </div>

      {/* Status Timeline */}
      <div className="bg-background-secondary rounded-[--radius-card] p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Timeline */}
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-background-secondary" />
            <div
              className="absolute top-6 left-0 h-0.5 bg-accent transition-all duration-500"
              style={{
                width: `${(currentStatusIndex / (statusFlow.length - 1)) * 100}%`,
              }}
            />

            {/* Status Points */}
            <div className="relative flex justify-between">
              {statusFlow.map((statusItem, index) => {
                const completed = isStatusCompleted(statusItem);
                const current = isStatusCurrent(statusItem);
                const cancelled = status === "cancelled";

                return (
                  <div
                    key={statusItem}
                    className="flex flex-col items-center"
                    style={{ flex: 1 }}
                  >
                    {/* Status Circle */}
                    <motion.div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                        cancelled
                          ? "bg-red-100 border-red-300"
                          : completed
                          ? "bg-accent border-accent"
                          : "bg-background border-background-secondary"
                      }`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      {completed ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={cancelled ? "text-red-600" : "text-white"}
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-muted" />
                      )}
                    </motion.div>

                    {/* Status Label */}
                    <p
                      className={`mt-3 text-xs md:text-sm text-center transition-colors ${
                        current
                          ? "text-primary font-medium"
                          : completed
                          ? "text-primary"
                          : "text-muted"
                      }`}
                    >
                      {orderStatusLabels[statusItem]}
                    </p>

                    {/* Current Status Indicator */}
                    {current && !cancelled && (
                      <motion.div
                        className="mt-1 px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                      >
                        En cours
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cancelled Status */}
          {status === "cancelled" && (
            <motion.div
              className="mt-6 p-4 bg-red-50 border border-red-200 rounded-[--radius-button] text-red-700"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="font-medium">Commande annulée</p>
              <p className="text-sm mt-1">
                Cette commande a été annulée. Si vous avez des questions,
                contactez-nous.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Tracking Information (if shipped) */}
      {status === "shipped" && trackingNumber && (
        <motion.div
          className="bg-background-secondary rounded-[--radius-card] p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="font-heading text-xl text-primary mb-4">
            Informations de livraison
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted mb-1">Numéro de suivi</p>
              <p className="text-lg font-medium text-primary">
                {trackingNumber}
              </p>
            </div>
            {estimatedDelivery && (
              <div>
                <p className="text-sm text-muted mb-1">Livraison estimée</p>
                <p className="text-base text-primary">{estimatedDelivery}</p>
              </div>
            )}
            {trackingUrl && (
              <div className="pt-2">
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary" size="md">
                    <span className="flex items-center gap-2">
                      Suivre mon colis
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </span>
                  </Button>
                </a>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Order Details */}
      <OrderDetails order={order} />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/produits">
          <Button variant="primary" size="md">
            Continuer mes achats
          </Button>
        </Link>
        <Link href="/">
          <Button variant="secondary" size="md">
            Retour à l&apos;accueil
          </Button>
        </Link>
      </div>
    </div>
  );
}
