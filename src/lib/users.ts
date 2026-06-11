"use server";

import { UserSession } from "@/types/user";
import { validatePassword } from "@/lib/password-validation";
import { createClient } from "@/lib/supabase/server";

export { validatePassword };

/**
 * Get user by ID from Supabase profiles table
 * @param id - User ID (UUID)
 * @returns User session if found
 */
export async function getUserById(id: string): Promise<UserSession | null> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !profile) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    firstName: profile.first_name,
    lastName: profile.last_name,
    isAdmin: profile.is_admin || false,
  };
}

/**
 * Get user by email from Supabase profiles table
 * @param email - User email
 * @returns User session if found
 */
export async function getUserByEmail(email: string): Promise<UserSession | null> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (error || !profile) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    firstName: profile.first_name,
    lastName: profile.last_name,
    isAdmin: profile.is_admin || false,
  };
}
