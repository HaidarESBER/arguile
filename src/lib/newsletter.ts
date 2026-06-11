"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { NewsletterSubscriber, SubscribeResult } from "@/types/newsletter";

// ---------------------------------------------------------------------------
// DB row <-> TypeScript mapping
// ---------------------------------------------------------------------------

interface SubscriberRow {
  id: string;
  email: string;
  status: string;
  source: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
  created_at: string;
}

function toSubscriber(row: SubscriberRow): NewsletterSubscriber {
  return {
    id: row.id,
    email: row.email,
    status: row.status as "active" | "unsubscribed",
    source: row.source,
    subscribedAt: row.subscribed_at,
    unsubscribedAt: row.unsubscribed_at,
    createdAt: row.created_at,
  };
}

// ---------------------------------------------------------------------------
// Subscribe / Unsubscribe
// ---------------------------------------------------------------------------

/**
 * Subscribe an email to the newsletter.
 * If the email was previously unsubscribed, reactivate it.
 */
export async function subscribe(
  email: string,
  source: string = "footer"
): Promise<SubscribeResult> {
  const supabase = createAdminClient();

  // Check if already exists
  const { data: existing } = await supabase
    .from("newsletter_subscribers")
    .select("id, status")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (existing) {
    if (existing.status === "active") {
      return { success: true, alreadySubscribed: true };
    }

    // Reactivate previously unsubscribed user
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({
        status: "active",
        unsubscribed_at: null,
        subscribed_at: new Date().toISOString(),
        source,
      })
      .eq("id", existing.id);

    if (error) {
      console.error("Error reactivating subscriber:", error);
      return { success: false, error: "Erreur lors de l'inscription" };
    }

    return { success: true };
  }

  // Insert new subscriber
  const { error } = await supabase.from("newsletter_subscribers").insert({
    email: email.toLowerCase().trim(),
    status: "active",
    source,
  });

  if (error) {
    console.error("Error subscribing:", error);
    return { success: false, error: "Erreur lors de l'inscription" };
  }

  return { success: true };
}

/**
 * Unsubscribe an email from the newsletter.
 */
export async function unsubscribe(email: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({
      status: "unsubscribed",
      unsubscribed_at: new Date().toISOString(),
    })
    .eq("email", email.toLowerCase().trim());

  if (error) {
    console.error("Error unsubscribing:", error);
    return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

/**
 * Get all subscribers, optionally filtered by status.
 */
export async function getSubscribers(
  status?: "active" | "unsubscribed"
): Promise<NewsletterSubscriber[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Error fetching subscribers:", error);
    return [];
  }

  return data.map(toSubscriber);
}

/**
 * Count active subscribers.
 */
export async function getSubscriberCount(): Promise<number> {
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  if (error) {
    console.error("Error counting subscribers:", error);
    return 0;
  }

  return count ?? 0;
}

/**
 * Check if an email is actively subscribed.
 */
export async function isSubscribed(email: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("newsletter_subscribers")
    .select("status")
    .eq("email", email.toLowerCase().trim())
    .eq("status", "active")
    .single();

  return !!data;
}
