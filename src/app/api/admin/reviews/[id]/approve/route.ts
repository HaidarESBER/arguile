import { NextRequest, NextResponse } from 'next/server';
import { approveReview } from '@/lib/reviews';
import { requireAdmin } from '@/lib/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access (defense-in-depth)
    await requireAdmin();

    const { id } = await params;
    await approveReview(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving review:', error);

    if (error instanceof Error &&
        (error.message === 'Authentication required' || error.message === 'Admin access required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to approve review' },
      { status: 500 }
    );
  }
}
