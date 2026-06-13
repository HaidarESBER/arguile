import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/notify-back-in-stock
 * Subscribe to back-in-stock notifications
 *
 * Body:
 * - email: string
 * - productId: string
 * - productName: string
 */

// Shopper-visible API response messages
const STRINGS = {
  fr: {
    missingFields: "Email et ID produit requis",
    invalidEmail: "Format d'email invalide",
    alreadySubscribed: "Vous êtes déjà inscrit pour ce produit",
    subscriptionFailed: "Échec de l'inscription",
    subscriptionSuccess: "Inscription réussie",
    internalError: "Erreur interne du serveur",
  },
  en: {
    missingFields: "Email and product ID required",
    invalidEmail: "Invalid email format",
    alreadySubscribed: "You are already subscribed for this product",
    subscriptionFailed: "Subscription failed",
    subscriptionSuccess: "Subscription successful",
    internalError: "Internal server error",
  },
} as const;

export async function POST(request: NextRequest) {
  const v = request.cookies.get("locale")?.value;
  const locale = v === "en" ? "en" : "fr";
  const t = STRINGS[locale];

  try {
    const body = await request.json();
    const { email, productId, productName } = body;

    // Validate input
    if (!email || !productId) {
      return NextResponse.json(
        { error: t.missingFields },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: t.invalidEmail },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if notification already exists
    const { data: existing } = await supabase
      .from("back_in_stock_notifications")
      .select("id")
      .eq("email", email)
      .eq("product_id", productId)
      .eq("notified", false)
      .single();

    if (existing) {
      return NextResponse.json(
        { message: t.alreadySubscribed },
        { status: 200 }
      );
    }

    // Create notification subscription
    const { error: insertError } = await supabase
      .from("back_in_stock_notifications")
      .insert({
        email,
        product_id: productId,
        product_name: productName,
        notified: false,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Error creating notification:", insertError);
      return NextResponse.json(
        { error: t.subscriptionFailed },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: t.subscriptionSuccess },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in notify-back-in-stock:", error);
    return NextResponse.json(
      { error: t.internalError },
      { status: 500 }
    );
  }
}
