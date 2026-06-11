import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import { OrderConfirmationEmail } from "@/emails/OrderConfirmationEmail";
import { ShippingNotificationEmail } from "@/emails/ShippingNotificationEmail";
import { OrderStatusUpdateEmail } from "@/emails/OrderStatusUpdateEmail";
import { WelcomeEmail } from "@/emails/WelcomeEmail";
import { AbandonedCartEmail } from "@/emails/AbandonedCartEmail";
import { WinBackEmail } from "@/emails/WinBackEmail";
import { sendEmail, getFromAddress } from "@/lib/mailer";
import { Order } from "@/types/order";

/**
 * DEV-ONLY email template preview.
 *
 * GET /api/dev/email-preview?template=confirmation
 *   → renders the template with sample data as HTML (view in browser)
 * GET /api/dev/email-preview?template=confirmation&send=1
 *   → also sends it to CONTACT_EMAIL for a real-inbox check
 *
 * Templates: confirmation | shipping | status | welcome | abandoned | winback
 * Returns 404 outside development.
 */

const SAMPLE_ORDER: Order = {
  id: "dev-preview-order",
  orderNumber: "NU-2026-0042",
  items: [
    {
      productId: "p1",
      productName: "Chicha Crystal Premium",
      productImage: "/chicha.jpg",
      price: 12999,
      quantity: 1,
    },
    {
      productId: "p2",
      productName: "Charbon Naturel Coco 1 kg",
      productImage: "/coal.webp",
      price: 899,
      quantity: 2,
    },
  ],
  subtotal: 14797,
  shipping: 0,
  total: 14797,
  status: "confirmed",
  shippingAddress: {
    email: "client@example.fr",
    firstName: "Jean",
    lastName: "Dupont",
    address: "12 rue de la Paix",
    city: "Paris",
    postalCode: "75002",
    phone: "0612345678",
    country: "FR",
  },
  trackingNumber: "6A12345678901",
  trackingUrl: "https://www.laposte.fr/outils/suivre-vos-envois?code=6A12345678901",
  estimatedDelivery: "3-4 jours ouvrés",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const UNSUB = "https://example.com/api/newsletter/unsubscribe?token=preview";

function buildTemplate(name: string) {
  switch (name) {
    case "confirmation":
      return OrderConfirmationEmail({ order: SAMPLE_ORDER });
    case "shipping":
      return ShippingNotificationEmail({
        order: SAMPLE_ORDER,
        trackingNumber: SAMPLE_ORDER.trackingNumber,
        trackingUrl: SAMPLE_ORDER.trackingUrl,
        estimatedDelivery: SAMPLE_ORDER.estimatedDelivery,
      });
    case "status":
      return OrderStatusUpdateEmail({
        order: SAMPLE_ORDER,
        newStatus: "delivered",
        oldStatus: "shipped",
      });
    case "welcome":
      return WelcomeEmail({ unsubscribeUrl: UNSUB });
    case "abandoned":
      return AbandonedCartEmail({ order: SAMPLE_ORDER, unsubscribeUrl: UNSUB });
    case "winback":
      return WinBackEmail({
        firstName: "Jean",
        products: [
          { name: "Chicha Crystal Premium", price: 12999 },
          { name: "Bol Céramique Artisanal", price: 2499 },
        ],
        unsubscribeUrl: UNSUB,
      });
    default:
      return null;
  }
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const template = searchParams.get("template") || "confirmation";
  const element = buildTemplate(template);

  if (!element) {
    return NextResponse.json(
      {
        error: `Unknown template "${template}"`,
        available: ["confirmation", "shipping", "status", "welcome", "abandoned", "winback"],
      },
      { status: 400 }
    );
  }

  const html = await render(element);

  if (searchParams.get("send")) {
    const to = process.env.CONTACT_EMAIL;
    if (!to) {
      return NextResponse.json({ error: "CONTACT_EMAIL not set" }, { status: 400 });
    }
    const result = await sendEmail({
      from: getFromAddress("transactional"),
      to,
      subject: `[Aperçu] Template "${template}" — Nuage`,
      html,
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }
  }

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
