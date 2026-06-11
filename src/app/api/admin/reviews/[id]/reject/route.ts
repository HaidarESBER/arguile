import { NextRequest, NextResponse } from 'next/server';
import { rejectReview } from '@/lib/reviews';
import { requireAdmin } from '@/lib/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access (defense-in-depth)
    await requireAdmin();

    const { id } = await params;
    await rejectReview(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rejecting review:', error);

    if (error instanceof Error &&
        (error.message === 'Authentication required' || error.message === 'Admin access required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to reject review' },
      { status: 500 }
    );
  }
}
