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
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, productId, productName } = body;

    // Validate input
    if (!email || !productId) {
      return NextResponse.json(
        { error: "Email et ID produit requis" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
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
        { message: "Vous êtes déjà inscrit pour ce produit" },
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
        { error: "Échec de l'inscription" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Inscription réussie" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in notify-back-in-stock:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
