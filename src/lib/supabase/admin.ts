import { createClient } from "@supabase/supabase-js";

/**
 * True when real Supabase credentials are available. When false, the data
 * layer should log expected query failures as warnings, not errors (the
 * placeholder client fails every query by design).
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Log a data-layer fetch failure: a real error when Supabase is configured,
 * a quiet warning when running intentionally on the placeholder client
 * (console.error feeds the Next.js dev-overlay issue badge).
 */
export function logSupabaseError(message: string, error: unknown): void {
  if (isSupabaseConfigured()) {
    console.error(message, error);
  } else {
    console.warn(`${message} (placeholder Supabase — expected)`);
  }
}

/**
 * Create a Supabase admin client with service role key.
 * Bypasses RLS - use ONLY for server-side admin operations.
 * NEVER expose this client to the browser.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    const missing = [
      !supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : null,
      !serviceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : null,
    ]
      .filter(Boolean)
      .join(", ");

    // In production, a silent placeholder client would make the build/runtime
    // "succeed" with an empty catalog and broken features. Fail loudly,
    // unless the escape hatch ALLOW_PLACEHOLDER_SUPABASE=true is set
    // (useful for local `next build` runs without credentials).
    if (
      process.env.NODE_ENV === "production" &&
      process.env.ALLOW_PLACEHOLDER_SUPABASE !== "true"
    ) {
      throw new Error(
        `Supabase admin client cannot be created: missing environment variable(s) ${missing}. ` +
          `Set them in your deployment environment, or set ALLOW_PLACEHOLDER_SUPABASE=true ` +
          `to intentionally build without Supabase credentials (the site will have an empty catalog).`
      );
    }

    // Dev (or explicit escape hatch): return a client pointed at a
    // placeholder URL so callers that handle errors gracefully (returning []
    // or null) can proceed without crashing the entire build.
    console.warn(
      `[supabase/admin] WARNING: missing environment variable(s) ${missing}. ` +
        `Using a PLACEHOLDER Supabase client — every query will fail and the catalog will be empty.`
    );
    return createClient("https://placeholder.supabase.co", "placeholder", {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
