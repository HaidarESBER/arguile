import { NextRequest, NextResponse } from "next/server";
import { processPipeline } from "@/lib/pipeline";
import { requireCronAuth } from "@/lib/security";

export async function GET(request: NextRequest) {
  // Fail closed: missing CRON_SECRET -> 500, bad bearer -> 401
  const authError = requireCronAuth(request);
  if (authError) return authError;

  try {
    const result = await processPipeline();
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Cron /api/cron/curate] Error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
