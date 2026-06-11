"use server";

import { UserSession } from "@/types/user";
import { createClient } from "@/lib/supabase/server";

/**
 * Get the current user session from Supabase Auth
 * @returns User session if authenticated, null otherwise
 */
export async function getSession(): Promise<UserSession | null> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Fetch profile for additional data
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return {
      id: user.id,
      email: user.email || "",
      firstName: profile?.first_name || "",
      lastName: profile?.last_name || "",
      isAdmin: profile?.is_admin || false,
      phone: profile?.phone || undefined,
      savedAddresses: profile?.saved_addresses || undefined,
      preferences: profile?.preferences || undefined,
    };
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}

/**
 * Require authentication - throws if user is not logged in
 * @returns User session
 * @throws Error if not authenticated
 */
export async function requireAuth(): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    throw new Error("Authentication required");
  }

  return session;
}

/**
 * Require admin access - throws if user is not admin
 * @returns User session
 * @throws Error if not authenticated or not admin
 */
export async function requireAdmin(): Promise<UserSession> {
  const session = await requireAuth();

  if (!session.isAdmin) {
    throw new Error("Admin access required");
  }

  return session;
}

/**
 * Check if current user is authenticated
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

/**
 * Check if current user is admin
 * @returns true if admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.isAdmin === true;
}
