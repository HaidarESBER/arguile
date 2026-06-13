import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { assertSameOrigin } from "@/lib/security";

interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

type PasswordLocale = "fr" | "en";

const STRINGS = {
  fr: {
    minLength: "Le mot de passe doit contenir au moins 12 caractères",
    uppercase: "Le mot de passe doit contenir au moins une majuscule",
    lowercase: "Le mot de passe doit contenir au moins une minuscule",
    digit: "Le mot de passe doit contenir au moins un chiffre",
    special: "Le mot de passe doit contenir au moins un caractère spécial",
    missingFields: "Mot de passe actuel et nouveau mot de passe requis",
    incorrectCurrent: "Mot de passe actuel incorrect",
    updateError: "Erreur lors de la mise à jour du mot de passe",
    success: "Mot de passe modifié avec succès",
  },
  en: {
    minLength: "Password must be at least 12 characters long",
    uppercase: "Password must contain at least one uppercase letter",
    lowercase: "Password must contain at least one lowercase letter",
    digit: "Password must contain at least one digit",
    special: "Password must contain at least one special character",
    missingFields: "Current password and new password are required",
    incorrectCurrent: "Current password is incorrect",
    updateError: "Error while updating the password",
    success: "Password changed successfully",
  },
} as const;

/**
 * Validate password strength
 * Requirements: 12+ characters, uppercase, lowercase, digit, special character
 */
function validatePassword(
  password: string,
  locale: PasswordLocale
): {
  valid: boolean;
  error?: string;
} {
  const t = STRINGS[locale];

  if (password.length < 12) {
    return { valid: false, error: t.minLength };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: t.uppercase };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: t.lowercase };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: t.digit };
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, error: t.special };
  }

  return { valid: true };
}

/**
 * POST /api/profile/password
 * Change user password
 */
export async function POST(request: NextRequest) {
  const v = request.cookies.get("locale")?.value;
  const locale = v === "en" ? "en" : "fr";
  const t = STRINGS[locale];

  try {
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    const session = await requireAuth();
    const supabase = await createClient();

    const body = (await request.json()) as PasswordChangeRequest;

    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        { error: t.missingFields },
        { status: 400 }
      );
    }

    // Validate new password
    const validation = validatePassword(body.newPassword, locale);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.email,
      password: body.currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { error: t.incorrectCurrent },
        { status: 401 }
      );
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: body.newPassword,
    });

    if (updateError) {
      console.error("Error updating password:", updateError);
      return NextResponse.json(
        { error: t.updateError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: t.success,
    });
  } catch (error) {
    console.error("Error changing password:", error);

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
