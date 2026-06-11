import { NextResponse } from "next/server";
import { batchTranslateReviews } from "@/lib/ai/translate-reviews";
import { requireAdmin } from "@/lib/session";

/**
 * Admin endpoint to manually trigger review translation
 * Requires admin authentication
 */
export async function POST() {
  try {
    // Verify admin access (defense-in-depth)
    await requireAdmin();

    // Translate up to 20 pending reviews
    const result = await batchTranslateReviews(20);

    console.log(
      `[Admin translate-reviews] ${result.translated} translated, ${result.errors} errors`
    );

    return NextResponse.json({
      success: true,
      translated: result.translated,
      errors: result.errors,
      errorDetails: result.errorDetails,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Admin translate-reviews] Error:", message);

    if (error instanceof Error &&
        (error.message === 'Authentication required' || error.message === 'Admin access required')) {
      return NextResponse.json(
        { error: message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
