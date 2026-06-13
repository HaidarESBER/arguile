import { NextRequest, NextResponse } from "next/server";
import { RegisterData } from "@/types/user";
import { validatePassword } from "@/lib/password-validation";
import { createClient } from "@/lib/supabase/server";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit";

const STRINGS = {
  fr: {
    rateLimited: RATE_LIMIT_MESSAGE,
    allFieldsRequired: "Tous les champs sont requis",
    emailExists: "Un compte existe déjà avec cette adresse email",
    registerError: "Erreur lors de l'inscription",
  },
  en: {
    rateLimited: "Too many requests. Please try again in a few moments.",
    allFieldsRequired: "All fields are required",
    emailExists: "An account already exists with this email address",
    registerError: "Error while creating the account",
  },
} as const;

export async function POST(request: NextRequest) {
  const v = request.cookies.get("locale")?.value;
  const locale = v === "en" ? "en" : "fr";
  const t = STRINGS[locale];

  try {
    // Rate limit: 5 registrations per minute per IP (abuse mitigation)
    const rate = checkRateLimit(`auth-register:${getClientIp(request)}`, 5);
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
    const { email, password, firstName, lastName } = body as RegisterData;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: t.allFieldsRequired },
        { status: 400 }
      );
    }

    // Validate password strength before calling Supabase
    const passwordValidation = validatePassword(password, locale);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Shared Supabase server client (handles cookie plumbing).
    // In Route Handlers, cookies set via next/headers are applied to the response.
    const supabase = await createClient();

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
      },
    });

    if (error) {
      // Map Supabase error messages to French
      if (error.message.includes("already registered") || error.message.includes("User already registered")) {
        return NextResponse.json(
          { error: t.emailExists },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: t.registerError },
        { status: 400 }
      );
    }

    // Upsert the profile name fields. The DB trigger creates the profile row
    // on signup; an upsert avoids racing it (no arbitrary setTimeout needed):
    // it updates the row if the trigger already created it, inserts otherwise.
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: data.user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
        { onConflict: "id" }
      );

    if (upsertError) {
      console.error("Error upserting profile:", upsertError);
    }

    // Fetch the updated profile
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
        firstName: profile?.first_name || firstName.trim(),
        lastName: profile?.last_name || lastName.trim(),
        isAdmin: profile?.is_admin || false,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: t.registerError },
      { status: 400 }
    );
  }
}
