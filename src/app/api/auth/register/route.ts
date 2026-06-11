import { NextRequest, NextResponse } from "next/server";
import { RegisterData } from "@/types/user";
import { validatePassword } from "@/lib/password-validation";
import { createClient } from "@/lib/supabase/server";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 registrations per minute per IP (abuse mitigation)
    const rate = checkRateLimit(`auth-register:${getClientIp(request)}`, 5);
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
    const { email, password, firstName, lastName } = body as RegisterData;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Validate password strength before calling Supabase
    const passwordValidation = validatePassword(password);
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
          { error: "Un compte existe deja avec cette adresse email" },
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
        { error: "Erreur lors de l'inscription" },
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
      { error: "Erreur lors de l'inscription" },
      { status: 400 }
    );
  }
}
