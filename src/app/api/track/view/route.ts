import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Track product view for browse history
 * POST /api/track/view
 * Body: { productId: string }
 *
 * Fire-and-forget pattern: Silent failures, no blocking
 * Only tracks if user is authenticated and hasn't opted out
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return new NextResponse(null, { status: 204 });
    }

    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Guest users not tracked (MVP decision)
      return new NextResponse(null, { status: 204 });
    }

    // Check user's tracking preference
    const { data: profile } = await supabase
      .from("profiles")
      .select("preferences")
      .eq("id", user.id)
      .single();

    // Respect opt-out preference
    if (profile?.preferences?.track_browsing === false) {
      return new NextResponse(null, { status: 204 });
    }

    // Check if product was viewed recently (within 30 minutes)
    // Avoid duplicate tracking in same session
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: recentView } = await supabase
      .from("browse_history")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .gte("viewed_at", thirtyMinutesAgo)
      .single();

    if (recentView) {
      // Already tracked recently, skip
      return new NextResponse(null, { status: 204 });
    }

    // Insert browse history entry
    await supabase
      .from("browse_history")
      .insert({
        user_id: user.id,
        product_id: productId,
      });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Silent failure - tracking should never break UX
    console.error("Failed to track product view:", error);
    return new NextResponse(null, { status: 204 });
  }
}
