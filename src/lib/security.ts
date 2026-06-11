import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight request security helpers shared by API route handlers.
 */

/**
 * Compute the set of origins allowed to call cookie-authenticated
 * mutating endpoints.
 */
function getAllowedOrigins(): string[] {
  const origins: string[] = [];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      origins.push(new URL(siteUrl).origin);
    } catch {
      // Malformed NEXT_PUBLIC_SITE_URL — ignore, dev fallbacks below still apply.
    }
  }

  // In development, allow localhost variants.
  if (process.env.NODE_ENV !== "production") {
    origins.push("http://localhost:3000", "http://127.0.0.1:3000");
  }

  return origins;
}

/**
 * CSRF mitigation: validate the Origin header of a mutating request
 * (POST/PATCH/PUT/DELETE) against NEXT_PUBLIC_SITE_URL (plus localhost in dev).
 *
 * Returns a 403 NextResponse when the Origin is present but does not match,
 * or null when the request is acceptable. A missing Origin header is
 * tolerated (same-site GET navigations, server-to-server calls and some
 * older clients do not send it); modern browsers always send Origin on
 * cross-site fetch/form POSTs, which is the attack vector we care about.
 *
 * Usage in a route handler:
 *   const csrfError = assertSameOrigin(request);
 *   if (csrfError) return csrfError;
 */
export function assertSameOrigin(request: NextRequest): NextResponse | null {
  const origin = request.headers.get("origin");

  // Tolerate missing Origin (same-site GET, curl, server-to-server).
  if (!origin) return null;

  const allowed = getAllowedOrigins();

  // If no allowed origin could be determined (NEXT_PUBLIC_SITE_URL unset in
  // production), fall back to comparing against the request's own host.
  if (allowed.length === 0) {
    try {
      if (new URL(origin).host === request.nextUrl.host) return null;
    } catch {
      // Malformed Origin header — reject below.
    }
  } else if (allowed.includes(origin)) {
    return null;
  }

  return NextResponse.json(
    { error: "Origine de la requête non autorisée" },
    { status: 403 }
  );
}

/**
 * Fail-closed authentication for Vercel cron endpoints.
 *
 * - CRON_SECRET missing  -> 500 (endpoint refuses to run unauthenticated)
 * - Bad/missing bearer   -> 401
 * - Valid bearer         -> null (proceed)
 *
 * Usage:
 *   const authError = requireCronAuth(request);
 *   if (authError) return authError;
 */
export function requireCronAuth(request: NextRequest): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("[Cron] CRON_SECRET not configured — refusing request");
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
