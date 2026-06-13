import { NextRequest, NextResponse } from "next/server";
import { LoginData } from "@/types/user";
import { createClient } from "@/lib/supabase/server";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit";

const STRINGS = {
  fr: {
    rateLimited: RATE_LIMIT_MESSAGE,
    missingFields: "Email et mot de passe requis",
    invalidCredentials: "Email ou mot de passe incorrect",
    loginError: "Erreur lors de la connexion",
  },
  en: {
    rateLimited: "Too many requests. Please try again in a few moments.",
    missingFields: "Email and password are required",
    invalidCredentials: "Incorrect email or password",
    loginError: "Error while signing in",
  },
} as const;

export async function POST(request: NextRequest) {
  const v = request.cookies.get("locale")?.value;
  const locale = v === "en" ? "en" : "fr";
  const t = STRINGS[locale];

  try {
    // Rate limit: 5 attempts per minute per IP (brute-force mitigation)
    const rate = checkRateLimit(`auth-login:${getClientIp(request)}`, 5);
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
    const { email, password } = body as LoginData;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: t.missingFields },
        { status: 400 }
      );
    }

    // Shared Supabase server client (handles cookie plumbing).
    // In Route Handlers, cookies set via next/headers are applied to the response.
    const supabase = await createClient();

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: t.invalidCredentials },
        { status: 401 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: t.invalidCredentials },
        { status: 401 }
      );
    }

    // Fetch profile to get additional data (first_name, last_name, is_admin)
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        firstName: profile?.first_name || "",
        lastName: profile?.last_name || "",
        isAdmin: profile?.is_admin || false,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: t.loginError },
      { status: 401 }
    );
  }
}
