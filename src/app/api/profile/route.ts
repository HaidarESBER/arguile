import { NextRequest, NextResponse } from "next/server";
import { getSession, requireAuth } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { EmailPreferences, ProfileUpdateData } from "@/types/user";
import { assertSameOrigin } from "@/lib/security";

/**
 * GET /api/profile
 * Fetch current user profile
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ user: session });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile
 * Update user profile (firstName, lastName, phone, preferences)
 */
export async function PATCH(request: NextRequest) {
  try {
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    const session = await requireAuth();
    const supabase = await createClient();

    const body = (await request.json()) as ProfileUpdateData;

    // Build update object with only allowed fields
    const updateData: {
      first_name?: string;
      last_name?: string;
      phone?: string;
      preferences?: EmailPreferences;
    } = {};

    if (body.firstName !== undefined) {
      updateData.first_name = body.firstName;
    }

    if (body.lastName !== undefined) {
      updateData.last_name = body.lastName;
    }

    if (body.phone !== undefined) {
      updateData.phone = body.phone;
    }

    if (body.preferences !== undefined) {
      updateData.preferences = body.preferences;
    }

    // Update profile in database
    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", session.id);

    if (error) {
      console.error("Error updating profile:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // Fetch updated profile
    const updatedSession = await getSession();

    return NextResponse.json({
      success: true,
      user: updatedSession,
    });
  } catch (error) {
    console.error("Error updating profile:", error);

    if (error instanceof Error && error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
