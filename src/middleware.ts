import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { categorySlugs } from "@/lib/categories";
import type { ProductCategory } from "@/types/product";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  isLocale,
  type Locale,
} from "@/lib/i18n/config";

/**
 * Pick a language for first-time visitors: France gets French, the rest of
 * the world gets English. Uses the CDN geo header (Vercel/Cloudflare); when
 * absent (local dev, self-hosted) falls back to the Accept-Language header.
 */
function detectLocale(request: NextRequest): Locale {
  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry");

  if (country) {
    return country.toUpperCase() === "FR" ? "fr" : "en";
  }

  const acceptLanguage = request.headers.get("accept-language") || "";
  return /(^|,)\s*fr\b/i.test(acceptLanguage) ? "fr" : "en";
}

export async function middleware(request: NextRequest) {
  // Resolve the locale before routing: injecting it into the request cookies
  // (forwarded via NextResponse.next({ request })) lets the very first page
  // render already use the geo-detected language, not just the next one.
  let detectedLocale: Locale | null = null;
  if (!isLocale(request.cookies.get(LOCALE_COOKIE)?.value)) {
    detectedLocale = detectLocale(request);
    request.cookies.set(LOCALE_COOKIE, detectedLocale);
  }

  const response = await handleRequest(request);

  if (detectedLocale) {
    response.cookies.set(LOCALE_COOKIE, detectedLocale, {
      path: "/",
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: "lax",
    });
  }

  return response;
}

async function handleRequest(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  // Legacy category filter URLs (/produits?categorie=chicha) moved to
  // dedicated pages (/produits/chichas) — 308 here so crawlers get a real
  // HTTP redirect instead of the streamed meta-refresh the page fallback emits.
  if (pathname === "/produits") {
    const legacyCategory = request.nextUrl.searchParams.get("categorie");
    if (legacyCategory && legacyCategory in categorySlugs) {
      const url = request.nextUrl.clone();
      url.pathname = `/produits/${categorySlugs[legacyCategory as ProductCategory]}`;
      url.searchParams.delete("categorie");
      return NextResponse.redirect(url, 308);
    }
  }

  // Stripe webhooks must bypass auth — called directly by Stripe without cookies
  if (pathname.startsWith("/api/webhooks/")) {
    return NextResponse.next({ request });
  }

  const isProtectedPage = pathname.startsWith("/admin");
  const isProtectedApi =
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/update-order-tracking") ||
    pathname.startsWith("/api/send-order-email") ||
    pathname.startsWith("/api/send-shipping-email");

  // Short-circuit for anonymous visitors: without Supabase auth cookies there
  // is no session to refresh, so skip the auth network round-trip entirely.
  // Protected routes are still rejected immediately (user would be null anyway).
  const hasAuthCookies = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-"));

  // Without Supabase credentials no session can exist (and createServerClient
  // would throw), so treat every request as anonymous. Stray sb-* cookies from
  // other localhost Supabase projects would otherwise crash the dev server.
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!hasAuthCookies || !supabaseConfigured) {
    if (isProtectedPage) {
      const loginUrl = new URL("/compte", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isProtectedApi) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    return NextResponse.next({ request });
  }

  // Refresh Supabase auth session for requests that carry auth cookies
  const { supabaseResponse, supabase, user } = await updateSession(request);

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/compte", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user is admin via profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protect admin API routes
  if (
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/update-order-tracking") ||
    pathname.startsWith("/api/send-order-email") ||
    pathname.startsWith("/api/send-shipping-email")
  ) {
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin via profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)",
  ],
};
