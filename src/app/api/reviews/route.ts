import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProductReviews, createReview } from '@/lib/reviews';
import { assertSameOrigin } from '@/lib/security';

/**
 * GET /api/reviews?productId={id}
 * Fetch all reviews for a product
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }

  try {
    const reviews = await getProductReviews(productId);
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

/**
 * POST /api/reviews
 * Create a new review (requires authentication)
 */
export async function POST(request: NextRequest) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) return csrfError;

  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { productId, rating, comment, photos } = body;

    // Validation
    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    if (comment.length < 10 || comment.length > 1000) {
      return NextResponse.json({ error: 'Comment must be between 10 and 1000 characters' }, { status: 400 });
    }

    // Validate photos array if provided
    if (photos && (!Array.isArray(photos) || photos.length > 3)) {
      return NextResponse.json({ error: 'Maximum 3 photos allowed' }, { status: 400 });
    }

    const review = await createReview({
      productId,
      userId: user.id,
      rating: Number(rating),
      comment: comment.trim(),
      photos: photos || [],
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);

    // Check for duplicate review (UNIQUE constraint violation)
    if ((error as { code?: string })?.code === '23505') {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
