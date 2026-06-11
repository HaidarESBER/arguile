import { NextRequest, NextResponse } from "next/server";
import { batchTranslateReviews } from "@/lib/ai/translate-reviews";
import { requireCronAuth } from "@/lib/security";

/**
 * Cron job to translate pending reviews to French
 * Configured to run every 6 hours via vercel.json
 *
 * Endpoint: GET /api/cron/translate-reviews
 * Auth: Bearer token via CRON_SECRET environment variable
 */
export async function GET(request: NextRequest) {
  // Fail closed: missing CRON_SECRET -> 500, bad bearer -> 401
  const authError = requireCronAuth(request);
  if (authError) return authError;

  try {
    // Translate up to 10 pending reviews
    const result = await batchTranslateReviews(10);

    console.log(
      `[Cron /api/cron/translate-reviews] ${result.translated} translated, ${result.errors} errors`
    );

    return NextResponse.json({
      success: true,
      translated: result.translated,
      errors: result.errors,
      errorDetails: result.errorDetails,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Cron /api/cron/translate-reviews] Error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
