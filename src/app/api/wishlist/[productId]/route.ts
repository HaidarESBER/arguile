import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/session';
import { assertSameOrigin } from '@/lib/security';

/**
 * DELETE /api/wishlist/:productId
 * Remove product from wishlist
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    const session = await requireAuth();
    const supabase = await createClient();
    const { productId } = await params;

    // Delete the wishlist item
    const { data, error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', session.id)
      .eq('product_id', productId)
      .select();

    if (error) {
      console.error('Error removing from wishlist:', error);
      return NextResponse.json(
        { error: 'Failed to remove from wishlist' },
        { status: 500 }
      );
    }

    // If no rows were deleted, item wasn't in wishlist
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Item not found in wishlist' },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error removing from wishlist:', error);

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
