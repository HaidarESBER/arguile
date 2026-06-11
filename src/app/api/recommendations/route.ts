import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getRecommendations } from '@/lib/recommendations';

/**
 * GET /api/recommendations
 *
 * Returns recommended products for current user
 *
 * Query params:
 * - productId (optional) - Get related products for this product
 * - limit (optional, default 6) - Number of recommendations
 *
 * Response:
 * {
 *   "recommendations": Product[],
 *   "count": number,
 *   "personalized": boolean
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '6');

    // Get user session (optional - works for guests too)
    const session = await getSession();
    const userId = session?.id;

    const recommendations = await getRecommendations({
      userId,
      productId,
      limit
    });

    return NextResponse.json({
      recommendations,
      count: recommendations.length,
      personalized: !!userId
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    // Return empty array on error (graceful degradation)
    return NextResponse.json({
      recommendations: [],
      count: 0,
      personalized: false
    });
  }
}
