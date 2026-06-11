import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Stripe webhooks must bypass auth — called directly by Stripe without cookies
  if (pathname.startsWith("/api/webhooks/")) {
    return NextResponse.next();
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

    return NextResponse.next();
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
