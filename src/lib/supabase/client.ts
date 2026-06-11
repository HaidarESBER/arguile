import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Without credentials createBrowserClient throws, which crashes every page
  // that checks the session (header, contexts). Fall back to a placeholder
  // client instead: queries fail gracefully and no session ever exists —
  // the storefront stays browsable. Mirrors lib/supabase/admin.ts.
  if (!url || !anonKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[supabase/client] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing — using placeholder client (no auth, empty data)."
      );
    }
    return createBrowserClient(
      "https://placeholder.supabase.co",
      "placeholder"
    );
  }

  return createBrowserClient(url, anonKey);
}
