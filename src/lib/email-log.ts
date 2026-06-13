import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface EmailLogEntry {
  id: string;
  kind: string;
  recipient: string;
  subject: string;
  status: "sent" | "failed";
  error: string | null;
  createdAt: string;
}

/** French labels for the email kinds recorded by the mailer. */
export const emailKindLabels: Record<string, string> = {
  order_confirmation: "Confirmation de commande",
  shipping: "Expédition",
  status_update: "Mise à jour de statut",
  contact: "Formulaire de contact",
  welcome: "Bienvenue (newsletter)",
  abandoned_cart: "Panier abandonné",
  winback: "Relance client",
  other: "Autre",
};

interface EmailLogRow {
  id: string;
  kind: string;
  recipient: string;
  subject: string;
  status: string;
  error: string | null;
  created_at: string;
}

/**
 * Fetch the most recent sent/failed emails for the admin email log.
 * Returns [] when Supabase is unavailable or the table doesn't exist yet.
 */
export async function getEmailLog(limit = 200): Promise<EmailLogEntry[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("email_log")
      .select("id, kind, recipient, subject, status, error, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return (data as EmailLogRow[]).map((row) => ({
      id: row.id,
      kind: row.kind,
      recipient: row.recipient,
      subject: row.subject,
      status: row.status === "failed" ? "failed" : "sent",
      error: row.error,
      createdAt: row.created_at,
    }));
  } catch {
    return [];
  }
}
