import { NextRequest, NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/orders";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit";

/**
 * POST /api/verify-order
 *
 * Verifies that an order exists and matches the provided email.
 * Used for order tracking security - ensures only the customer can view their order.
 *
 * Body:
 * - orderNumber: string
 * - email: string
 *
 * Returns:
 * - 200: Order exists and email matches
 * - 400: Missing required fields
 * - 404: Verification failed (generic message — does not reveal whether the
 *        order exists, to prevent order-number enumeration)
 * - 429: Rate limit exceeded
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 attempts per minute per IP (anti-enumeration)
    const rate = checkRateLimit(`verify-order:${getClientIp(request)}`, 10);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: RATE_LIMIT_MESSAGE },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSeconds) },
        }
      );
    }

    const body = await request.json();
    const { orderNumber, email } = body as {
      orderNumber: string;
      email: string;
    };

    // Validate inputs
    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: "Numéro de commande et email requis" },
        { status: 400 }
      );
    }

    // Generic failure message for both "not found" and "email mismatch":
    // distinct messages would let an attacker enumerate valid order numbers.
    const genericFailure = NextResponse.json(
      { error: "Numéro de commande ou adresse email incorrect" },
      { status: 404 }
    );

    // Get order from database
    const order = await getOrderByNumber(orderNumber);

    if (!order) {
      return genericFailure;
    }

    // Verify email matches (case-insensitive)
    const orderEmail = order.shippingAddress.email.toLowerCase();
    const providedEmail = email.toLowerCase().trim();

    if (orderEmail !== providedEmail) {
      return genericFailure;
    }

    // Success - email matches
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error verifying order:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification" },
      { status: 500 }
    );
  }
}
