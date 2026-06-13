import { NextRequest, NextResponse } from "next/server";
import { subscribe } from "@/lib/newsletter";
import { sendWelcomeEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Shopper-visible API response messages
const STRINGS = {
  fr: {
    rateLimited: "Trop de requêtes. Veuillez réessayer dans quelques instants.",
    emailRequired: "Email requis",
    invalidEmailFormat: "Format d'email invalide",
    subscribeError: "Erreur lors de l'inscription",
    internalError: "Erreur interne du serveur",
  },
  en: {
    rateLimited: "Too many requests. Please try again in a few moments.",
    emailRequired: "Email required",
    invalidEmailFormat: "Invalid email format",
    subscribeError: "Error while subscribing",
    internalError: "Internal server error",
  },
} as const;

/**
 * POST /api/newsletter/subscribe
 * Subscribe an email to the newsletter and send a welcome email.
 */
export async function POST(request: NextRequest) {
  const v = request.cookies.get("locale")?.value;
  const locale = v === "en" ? "en" : "fr";
  const t = STRINGS[locale];

  try {
    // Rate limit: 5 subscriptions per minute per IP (abuse / email-spam guard)
    const rate = checkRateLimit(
      `newsletter-subscribe:${getClientIp(request)}`,
      5
    );
    if (!rate.allowed) {
      return NextResponse.json(
        { error: t.rateLimited },
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
        { error: t.emailRequired },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: t.invalidEmailFormat },
        { status: 400 }
      );
    }

    const result = await subscribe(email, source || "footer");

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || t.subscribeError },
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
      { error: t.internalError },
      { status: 500 }
    );
  }
}
