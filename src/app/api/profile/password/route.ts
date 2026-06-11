import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { assertSameOrigin } from "@/lib/security";

interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Validate password strength
 * Requirements: 12+ characters, uppercase, lowercase, digit, special character
 */
function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  if (password.length < 12) {
    return { valid: false, error: "Le mot de passe doit contenir au moins 12 caractères" };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Le mot de passe doit contenir au moins une majuscule" };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Le mot de passe doit contenir au moins une minuscule" };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Le mot de passe doit contenir au moins un chiffre" };
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, error: "Le mot de passe doit contenir au moins un caractère spécial" };
  }

  return { valid: true };
}

/**
 * POST /api/profile/password
 * Change user password
 */
export async function POST(request: NextRequest) {
  try {
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    const session = await requireAuth();
    const supabase = await createClient();

    const body = (await request.json()) as PasswordChangeRequest;

    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        { error: "Mot de passe actuel et nouveau mot de passe requis" },
        { status: 400 }
      );
    }

    // Validate new password
    const validation = validatePassword(body.newPassword);
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
        { error: "Mot de passe actuel incorrect" },
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
        { error: "Erreur lors de la mise à jour du mot de passe" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mot de passe modifié avec succès",
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
