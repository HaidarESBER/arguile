import { NextRequest, NextResponse } from "next/server";
import { subscribe } from "@/lib/newsletter";
import { sendWelcomeEmail } from "@/lib/email";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit";

/**
 * POST /api/newsletter/subscribe
 * Subscribe an email to the newsletter and send a welcome email.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 subscriptions per minute per IP (abuse / email-spam guard)
    const rate = checkRateLimit(
      `newsletter-subscribe:${getClientIp(request)}`,
      5
    );
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
    const { email, source } = body;

    // Validate email format
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    const result = await subscribe(email, source || "footer");

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Erreur lors de l'inscription" },
        { status: 500 }
      );
    }

    // Send welcome email only for new subscribers (not re-subscriptions that were already active)
    if (!result.alreadySubscribed) {
      // Fire-and-forget welcome email
      sendWelcomeEmail(email).catch((err) =>
        console.error("Error sending welcome email:", err)
      );
    }

    return NextResponse.json({
      success: true,
      alreadySubscribed: result.alreadySubscribed,
    });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
