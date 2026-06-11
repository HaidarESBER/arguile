import { NextRequest, NextResponse } from "next/server";
import { updateOrderTracking } from "@/lib/orders";

/**
 * POST /api/update-order-tracking
 *
 * Updates tracking information for an order
 *
 * Body:
 * - orderId: string
 * - trackingNumber?: string
 * - trackingUrl?: string
 * - estimatedDelivery?: string
 *
 * Returns:
 * - 200: Tracking info updated successfully
 * - 400: Missing required fields
 * - 500: Update failed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, trackingNumber, trackingUrl, estimatedDelivery } = body;

    // Validate orderId
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Update tracking info
    const updatedOrder = await updateOrderTracking(orderId, {
      trackingNumber,
      trackingUrl,
      estimatedDelivery,
    });

    return NextResponse.json(
      { success: true, order: updatedOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order tracking:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update tracking information",
      },
      { status: 500 }
    );
  }
}
