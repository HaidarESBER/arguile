import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertSameOrigin } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    // CSRF: reject cross-origin logout attempts
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    // Shared Supabase server client (handles cookie plumbing).
    // In Route Handlers, cookies set via next/headers are applied to the response.
    const supabase = await createClient();

    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la deconnexion" },
      { status: 500 }
    );
  }
}
