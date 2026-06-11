"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface ProductViewTrackerProps {
  productId: string;
  productName?: string;
}

/**
 * Fire-and-forget product view tracker
 * Tracks product views for:
 * 1. Browse history (recommendations) via /api/track/view
 * 2. Analytics dashboard via trackEvent()
 * Completely silent - no UI, no error propagation
 */
export function ProductViewTracker({ productId, productName }: ProductViewTrackerProps) {
  useEffect(() => {
    // Track for browse history (authenticated users only)
    fetch("/api/track/view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
      keepalive: true,
    }).catch(() => {
      // Silent failure
    });

    // Track for analytics dashboard (all visitors)
    trackEvent("product_view", {
      productId,
      productName: productName || productId,
    });
  }, [productId, productName]);

  // No UI
  return null;
}
