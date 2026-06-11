import { NextRequest, NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { Order } from "@/types/order";

/**
 * POST /api/send-order-email
 *
 * Sends order confirmation email to customer (admin-protected by middleware).
 * Delegates to the shared mailer in src/lib/email.ts — no duplicate logic.
 *
 * Body:
 * - order: Order object with all order details
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order } = body as { order: Order };

    if (!order || !order.shippingAddress?.email) {
      return NextResponse.json(
        { error: "Order data or email is missing" },
        { status: 400 }
      );
    }

    const { success, error } = await sendOrderConfirmationEmail(order);

    if (!success) {
      const status = error === "Email service not configured" ? 503 : 500;
      return NextResponse.json({ error }, { status });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in send-order-email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
