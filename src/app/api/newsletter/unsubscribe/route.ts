import { NextRequest, NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/newsletter-tokens";
import { unsubscribe } from "@/lib/newsletter";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Shopper-visible API response messages
const STRINGS = {
  fr: {
    rateLimited: "Trop de requêtes. Veuillez réessayer dans quelques instants.",
    emailRequired: "Email requis",
    invalidEmailFormat: "Format d'email invalide",
    internalError: "Erreur interne du serveur",
  },
  en: {
    rateLimited: "Too many requests. Please try again in a few moments.",
    emailRequired: "Email required",
    invalidEmailFormat: "Invalid email format",
    internalError: "Internal server error",
  },
} as const;

/**
 * GET /api/newsletter/unsubscribe?token=xxx
 * One-click unsubscribe from email links (token-based).
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/desabonnement?error=invalid", SITE_URL)
    );
  }

  const email = verifyUnsubscribeToken(token);

  if (!email) {
    return NextResponse.redirect(
      new URL("/desabonnement?error=invalid", SITE_URL)
    );
  }

  const success = await unsubscribe(email);

  if (success) {
    return NextResponse.redirect(
      new URL("/desabonnement?success=true", SITE_URL)
    );
  }

  return NextResponse.redirect(
    new URL("/desabonnement?error=invalid", SITE_URL)
  );
}

/**
 * POST /api/newsletter/unsubscribe
 * Manual unsubscribe from the unsubscribe page.
 */
export async function POST(request: NextRequest) {
  const v = request.cookies.get("locale")?.value;
  const locale = v === "en" ? "en" : "fr";
  const t = STRINGS[locale];

  try {
    // Rate limit: 5 per minute per IP (prevents mass unsubscription abuse)
    const rate = checkRateLimit(
      `newsletter-unsubscribe:${getClientIp(request)}`,
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
    const { email } = body;

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

    const success = await unsubscribe(email);

    return NextResponse.json({ success });
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    return NextResponse.json(
      { error: t.internalError },
      { status: 500 }
    );
  }
}
