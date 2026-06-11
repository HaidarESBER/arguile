import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { triggerDailyAggregation } from "@/lib/analytics-server";

/**
 * Trigger daily metrics aggregation
 * POST /api/analytics/aggregate
 * Body: { date?: string } - date in YYYY-MM-DD format, defaults to yesterday
 *
 * Authentication: Requires admin user (profiles.is_admin = true)
 *
 * Purpose:
 * - Manual backfill of historical data (call with past dates)
 * - Testing aggregation logic before setting up cron
 * - On-demand refresh from admin dashboard (Phase 21)
 *
 * Future: Set up Vercel Cron to call this endpoint daily
 */

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { date } = body;

    // Parse date or default to yesterday
    let targetDate: Date;
    if (date) {
      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json(
          { error: "Invalid date format. Use YYYY-MM-DD" },
          { status: 400 }
        );
      }
      targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 });
      }
    } else {
      // Default to yesterday
      targetDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    // Trigger aggregation
    await triggerDailyAggregation(targetDate);

    // Fetch the aggregated metrics to return
    const dateString = targetDate.toISOString().split("T")[0];
    const { data: metrics, error: metricsError } = await supabase
      .from("daily_metrics")
      .select("*")
      .eq("date", dateString)
      .single();

    if (metricsError) {
      console.error("Failed to fetch aggregated metrics:", metricsError.message);
      return NextResponse.json(
        {
          success: true,
          date: dateString,
          message: "Aggregation completed but failed to fetch metrics",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        date: dateString,
        metrics,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[POST /api/analytics/aggregate] Error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
