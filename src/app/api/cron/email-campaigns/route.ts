import { NextRequest, NextResponse } from "next/server";
import { runWinBackCampaign } from "@/lib/email-campaigns";
import { requireCronAuth } from "@/lib/security";

/**
 * Cron job to run email marketing campaigns.
 * Configured to run every Monday at 10:00 AM via vercel.json.
 *
 * Endpoint: GET /api/cron/email-campaigns
 * Auth: Bearer token via CRON_SECRET environment variable
 */
export async function GET(request: NextRequest) {
  // Fail closed: missing CRON_SECRET -> 500, bad bearer -> 401
  const authError = requireCronAuth(request);
  if (authError) return authError;

  try {
    const winBackResult = await runWinBackCampaign();

    console.log(
      `[Cron /api/cron/email-campaigns] Win-back: ${winBackResult.sent} sent, ${winBackResult.skipped} skipped, ${winBackResult.errors} errors`
    );

    // Always return 200 to prevent Vercel cron retries
    return NextResponse.json({
      success: true,
      campaigns: [winBackResult],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Cron /api/cron/email-campaigns] Error:", message);
    // Return 200 even on error to prevent Vercel cron retries
    return NextResponse.json({
      success: false,
      error: message,
    });
  }
}
