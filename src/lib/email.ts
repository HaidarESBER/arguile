"use server";

import { Order, OrderStatus } from "@/types/order";
import { OrderConfirmationEmail } from "@/emails/OrderConfirmationEmail";
import { ShippingNotificationEmail } from "@/emails/ShippingNotificationEmail";
import { OrderStatusUpdateEmail } from "@/emails/OrderStatusUpdateEmail";
import { WelcomeEmail } from "@/emails/WelcomeEmail";
import { AbandonedCartEmail } from "@/emails/AbandonedCartEmail";
import { WinBackEmail } from "@/emails/WinBackEmail";
import { generateUnsubscribeToken } from "@/lib/newsletter-tokens";
import { sendEmail, getFromAddress, isMailerConfigured } from "@/lib/mailer";

/**
 * All customer-facing emails, delivered through the SMTP relay configured in
 * src/lib/mailer.ts (Brevo). Templates are React Email components.
 */

/**
 * Send order confirmation email to customer.
 * Called after a successful payment (Stripe webhook).
 */
export async function sendOrderConfirmationEmail(
  order: Order
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isMailerConfigured()) {
      return { success: false, error: "Email service not configured" };
    }

    if (!order.shippingAddress?.email) {
      return { success: false, error: "Customer email is missing" };
    }

    const { success, error } = await sendEmail({
      from: getFromAddress("transactional"),
      to: order.shippingAddress.email,
      subject: `Confirmation de commande ${order.orderNumber}`,
      react: OrderConfirmationEmail({ order }),
    });

    if (!success) {
      console.error("Error sending order confirmation email:", error);
      return { success: false, error: "Failed to send order confirmation email" };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error sending order confirmation email:", err);
    return { success: false, error: "Unexpected error sending email" };
  }
}

/**
 * Send shipping notification email to customer.
 * Called when order status changes to "shipped".
 */
export async function sendShippingNotificationEmail(
  order: Order
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isMailerConfigured()) {
      return { success: false, error: "Email service not configured" };
    }

    if (!order.shippingAddress?.email) {
      return { success: false, error: "Customer email is missing" };
    }

    const { success, error } = await sendEmail({
      from: getFromAddress("transactional"),
      to: order.shippingAddress.email,
      subject: `Votre commande ${order.orderNumber} a été expédiée !`,
      react: ShippingNotificationEmail({
        order,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        estimatedDelivery: order.estimatedDelivery,
      }),
    });

    if (!success) {
      console.error("Error sending shipping notification email:", error);
      return { success: false, error: "Failed to send shipping notification email" };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error sending shipping notification email:", err);
    return { success: false, error: "Unexpected error sending email" };
  }
}

/**
 * Send order status update email to customer.
 * Called when order status changes (confirmed, processing, delivered, cancelled).
 * For "shipped" status, use sendShippingNotificationEmail instead.
 */
export async function sendOrderStatusUpdateEmail(
  order: Order,
  newStatus: OrderStatus,
  oldStatus: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isMailerConfigured()) {
      return { success: false, error: "Email service not configured" };
    }

    if (!order.shippingAddress?.email) {
      return { success: false, error: "Customer email is missing" };
    }

    const statusLabels: Record<OrderStatus, string> = {
      pending_payment: "En attente de paiement",
      pending: "En attente",
      confirmed: "Confirmée",
      processing: "En préparation",
      shipped: "Expédiée",
      delivered: "Livrée",
      cancelled: "Annulée",
    };

    const { success, error } = await sendEmail({
      from: getFromAddress("transactional"),
      to: order.shippingAddress.email,
      subject: `Mise à jour de votre commande ${order.orderNumber} — ${statusLabels[newStatus]}`,
      react: OrderStatusUpdateEmail({ order, newStatus, oldStatus }),
    });

    if (!success) {
      console.error("Error sending order status update email:", error);
      return { success: false, error: "Failed to send status update email" };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error sending order status update email:", err);
    return { success: false, error: "Unexpected error sending email" };
  }
}

// ---------------------------------------------------------------------------
// Newsletter Emails
// ---------------------------------------------------------------------------

/**
 * Generate the full unsubscribe URL with a signed token for an email.
 * Reused by all marketing emails.
 */
function getUnsubscribeUrl(email: string): string {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const token = generateUnsubscribeToken(email);
  return `${siteUrl}/api/newsletter/unsubscribe?token=${token}`;
}

/**
 * Send welcome email to a new newsletter subscriber.
 * Fire-and-forget pattern (never throws).
 */
export async function sendWelcomeEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isMailerConfigured()) {
      return { success: false, error: "Email service not configured" };
    }

    const unsubscribeUrl = getUnsubscribeUrl(email);

    const { success, error } = await sendEmail({
      from: getFromAddress("transactional"),
      to: email,
      subject: "Bienvenue dans l'univers Nuage !",
      react: WelcomeEmail({ unsubscribeUrl }),
      headers: { "List-Unsubscribe": `<${unsubscribeUrl}>` },
    });

    if (!success) {
      console.error("Error sending welcome email:", error);
      return { success: false, error: "Failed to send welcome email" };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error sending welcome email:", err);
    return { success: false, error: "Unexpected error sending email" };
  }
}

// ---------------------------------------------------------------------------
// Marketing Campaign Emails
// ---------------------------------------------------------------------------

/**
 * Send abandoned cart recovery email.
 * Called when a Stripe checkout session expires.
 * Fire-and-forget pattern (never throws).
 */
export async function sendAbandonedCartEmail(
  order: Order
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isMailerConfigured()) {
      return { success: false, error: "Email service not configured" };
    }

    if (!order.shippingAddress?.email) {
      return { success: false, error: "Customer email is missing" };
    }

    const email = order.shippingAddress.email;
    const firstName = order.shippingAddress.firstName || "";
    const unsubscribeUrl = getUnsubscribeUrl(email);

    const subject = firstName
      ? `Vous avez oublié quelque chose, ${firstName} ?`
      : "Vous avez oublié quelque chose ?";

    const { success, error } = await sendEmail({
      from: getFromAddress("marketing"),
      to: email,
      subject,
      react: AbandonedCartEmail({ order, unsubscribeUrl }),
      headers: { "List-Unsubscribe": `<${unsubscribeUrl}>` },
    });

    if (!success) {
      console.error("Error sending abandoned cart email:", error);
      return { success: false, error: "Failed to send abandoned cart email" };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error sending abandoned cart email:", err);
    return { success: false, error: "Unexpected error sending email" };
  }
}

/**
 * Send win-back email to inactive customers.
 * Called by the email campaigns cron job.
 * Fire-and-forget pattern (never throws).
 */
export async function sendWinBackEmail(
  email: string,
  firstName: string,
  products: Array<{ name: string; price: number }>
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isMailerConfigured()) {
      return { success: false, error: "Email service not configured" };
    }

    const unsubscribeUrl = getUnsubscribeUrl(email);

    const subject = firstName
      ? `Vous nous manquez, ${firstName} !`
      : "Vous nous manquez !";

    const { success, error } = await sendEmail({
      from: getFromAddress("marketing"),
      to: email,
      subject,
      react: WinBackEmail({ firstName, products, unsubscribeUrl }),
      headers: { "List-Unsubscribe": `<${unsubscribeUrl}>` },
    });

    if (!success) {
      console.error("Error sending win-back email:", error);
      return { success: false, error: "Failed to send win-back email" };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error sending win-back email:", err);
    return { success: false, error: "Unexpected error sending email" };
  }
}
