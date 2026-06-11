"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendWinBackEmail } from "@/lib/email";

// ---------------------------------------------------------------------------
// Inactive Customer Detection
// ---------------------------------------------------------------------------

interface InactiveCustomer {
  email: string;
  firstName: string;
  lastName: string;
  lastOrderDate: string;
}

/**
 * Find customers whose most recent order is older than `daysSinceLastOrder` days.
 * Excludes unsubscribed newsletter subscribers.
 */
export async function getInactiveCustomers(
  daysSinceLastOrder: number
): Promise<InactiveCustomer[]> {
  const supabase = createAdminClient();

  // Get all completed orders (confirmed+) grouped by email
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "shipping_email, shipping_first_name, shipping_last_name, created_at, status"
    )
    .in("status", ["confirmed", "processing", "shipped", "delivered"]);

  if (error || !orders) {
    console.error("Error fetching orders for inactive customers:", error);
    return [];
  }

  // Group by email, find most recent order per customer
  const customerMap = new Map<
    string,
    { firstName: string; lastName: string; lastOrderDate: string }
  >();

  for (const order of orders) {
    const email = (order.shipping_email as string)?.toLowerCase()?.trim();
    if (!email) continue;

    const existing = customerMap.get(email);
    const orderDate = order.created_at as string;

    if (!existing || orderDate > existing.lastOrderDate) {
      customerMap.set(email, {
        firstName: order.shipping_first_name as string,
        lastName: order.shipping_last_name as string,
        lastOrderDate: orderDate,
      });
    }
  }

  // Filter by inactivity threshold
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastOrder);
  const cutoffIso = cutoffDate.toISOString();

  const inactiveCustomers: InactiveCustomer[] = [];

  for (const [email, customer] of customerMap) {
    if (customer.lastOrderDate < cutoffIso) {
      inactiveCustomers.push({
        email,
        firstName: customer.firstName || "",
        lastName: customer.lastName || "",
        lastOrderDate: customer.lastOrderDate,
      });
    }
  }

  // Filter out unsubscribed newsletter subscribers
  if (inactiveCustomers.length === 0) return [];

  const emails = inactiveCustomers.map((c) => c.email);
  const { data: unsubscribed } = await supabase
    .from("newsletter_subscribers")
    .select("email")
    .in("email", emails)
    .eq("status", "unsubscribed");

  const unsubscribedSet = new Set(
    (unsubscribed || []).map((s) => (s.email as string).toLowerCase())
  );

  return inactiveCustomers.filter((c) => !unsubscribedSet.has(c.email));
}

// ---------------------------------------------------------------------------
// Product Recommendations for Emails
// ---------------------------------------------------------------------------

interface EmailProduct {
  name: string;
  price: number;
}

/**
 * Fetch latest published and in-stock products for email recommendations.
 */
export async function getRecentProducts(
  limit: number
): Promise<EmailProduct[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select("name, price")
    .eq("in_stock", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("Error fetching recent products:", error);
    return [];
  }

  return data.map((p) => ({
    name: p.name as string,
    price: p.price as number,
  }));
}

// ---------------------------------------------------------------------------
// Campaign Runners
// ---------------------------------------------------------------------------

interface CampaignSummary {
  campaign: string;
  sent: number;
  skipped: number;
  errors: number;
}

/**
 * Run the win-back campaign:
 * - Find customers inactive for 30+ days
 * - Send personalized win-back emails with product recommendations
 * - Rate limited to max 50 emails per run (Resend free tier consideration)
 */
export async function runWinBackCampaign(): Promise<CampaignSummary> {
  const summary: CampaignSummary = {
    campaign: "win-back",
    sent: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    const inactiveCustomers = await getInactiveCustomers(30);
    const products = await getRecentProducts(3);

    // Rate limit: max 50 emails per cron run
    const batch = inactiveCustomers.slice(0, 50);
    summary.skipped = Math.max(0, inactiveCustomers.length - 50);

    for (const customer of batch) {
      try {
        const result = await sendWinBackEmail(
          customer.email,
          customer.firstName,
          products
        );

        if (result.success) {
          summary.sent++;
        } else {
          summary.errors++;
          console.error(
            `Win-back email failed for ${customer.email}:`,
            result.error
          );
        }
      } catch (err) {
        summary.errors++;
        console.error(
          `Unexpected error sending win-back to ${customer.email}:`,
          err
        );
      }
    }

    console.log(
      `[Win-back campaign] Sent: ${summary.sent}, Skipped: ${summary.skipped}, Errors: ${summary.errors}`
    );
  } catch (err) {
    console.error("[Win-back campaign] Fatal error:", err);
  }

  return summary;
}

/**
 * Future extension point for abandoned cart follow-up campaigns.
 * Currently a stub - returns immediately.
 */
export async function runAbandonedCartFollowUp(): Promise<CampaignSummary> {
  return {
    campaign: "abandoned-cart-followup",
    sent: 0,
    skipped: 0,
    errors: 0,
  };
}
