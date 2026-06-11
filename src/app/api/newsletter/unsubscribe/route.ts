import { NextRequest, NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/newsletter-tokens";
import { unsubscribe } from "@/lib/newsletter";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
  try {
    // Rate limit: 5 per minute per IP (prevents mass unsubscription abuse)
    const rate = checkRateLimit(
      `newsletter-unsubscribe:${getClientIp(request)}`,
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
    const { email } = body;

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

    const success = await unsubscribe(email);

    return NextResponse.json({ success });
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
