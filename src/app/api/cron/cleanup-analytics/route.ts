import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * CRON Job: Cleanup old analytics events
 *
 * Runs: Daily (scheduled in Vercel CRON)
 * Purpose: Delete analytics events older than 90 days to prevent unbounded growth
 *
 * Schedule in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-analytics",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify CRON secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("[Cleanup Analytics] CRON_SECRET not configured");
      return NextResponse.json(
        { error: "CRON_SECRET not configured" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error("[Cleanup Analytics] Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Calculate cutoff date (90 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    const cutoffISO = cutoffDate.toISOString();

    console.log(`[Cleanup Analytics] Deleting events older than ${cutoffISO}`);

    // Delete old analytics events
    const { error, count } = await adminClient
      .from("analytics_events")
      .delete({ count: "exact" })
      .lt("created_at", cutoffISO);

    if (error) {
      console.error("[Cleanup Analytics] Error deleting old events:", error);
      return NextResponse.json(
        { error: "Failed to delete old events", details: error.message },
        { status: 500 }
      );
    }

    const deletedCount = count || 0;
    console.log(`[Cleanup Analytics] Successfully deleted ${deletedCount} old events`);

    return NextResponse.json({
      success: true,
      deletedCount,
      cutoffDate: cutoffISO,
      message: `Deleted ${deletedCount} analytics events older than 90 days`,
    });
  } catch (error) {
    console.error("[Cleanup Analytics] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
