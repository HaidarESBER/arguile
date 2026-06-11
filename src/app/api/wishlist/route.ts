import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/session';
import { assertSameOrigin } from '@/lib/security';

/** Shape of a `wishlist` row with its joined `products` row */
interface WishlistRowWithProduct {
  id: string;
  user_id: string;
  product_id: string;
  added_at: string;
  products: {
    id: string;
    slug: string;
    name: string;
    description: string;
    short_description: string;
    price: number;
    compare_at_price: number | null;
    images: string[];
    category: string;
    in_stock: boolean;
    stock_level: number | null;
    featured: boolean;
  } | null;
}

/**
 * GET /api/wishlist
 * Fetch user's wishlist with product details
 */
export async function GET() {
  try {
    const session = await requireAuth();
    const supabase = await createClient();

    // Query wishlist items with product details using a join
    const { data: items, error } = await supabase
      .from('wishlist')
      .select(`
        id,
        user_id,
        product_id,
        added_at,
        products (
          id,
          slug,
          name,
          description,
          short_description,
          price,
          compare_at_price,
          images,
          category,
          in_stock,
          stock_level,
          featured
        )
      `)
      .eq('user_id', session.id)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching wishlist:', error);
      return NextResponse.json(
        { error: 'Failed to fetch wishlist' },
        { status: 500 }
      );
    }

    // Supabase's query typings infer the `products` FK join as an array, but
    // at runtime this many-to-one join returns a single object (or null).
    const rows = (items || []) as unknown as WishlistRowWithProduct[];

    // Transform the data to match our TypeScript types
    const wishlistItems = rows.map((item) => ({
      id: item.id,
      userId: item.user_id,
      productId: item.product_id,
      addedAt: item.added_at,
      product: item.products ? {
        id: item.products.id,
        slug: item.products.slug,
        name: item.products.name,
        description: item.products.description,
        shortDescription: item.products.short_description,
        price: item.products.price,
        compareAtPrice: item.products.compare_at_price,
        images: item.products.images,
        category: item.products.category,
        inStock: item.products.in_stock,
        stockLevel: item.products.stock_level,
        featured: item.products.featured,
      } : null,
    })).filter((item) => item.product !== null);

    return NextResponse.json({
      items: wishlistItems,
      count: wishlistItems.length,
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wishlist
 * Add product to wishlist
 */
export async function POST(request: NextRequest) {
  try {
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    const session = await requireAuth();
    const supabase = await createClient();

    const body = await request.json();
    const { productId } = body;

    // Validation
    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      );
    }

    // Validate product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Insert wishlist item (ON CONFLICT DO NOTHING via RLS and UNIQUE constraint)
    const { data: item, error: insertError } = await supabase
      .from('wishlist')
      .insert({
        user_id: session.id,
        product_id: productId,
      })
      .select()
      .single();

    // If conflict (already in wishlist), return 200 instead of error
    if (insertError) {
      if (insertError.code === '23505') {
        // UNIQUE constraint violation - already in wishlist
        return NextResponse.json(
          { message: 'Product already in wishlist' },
          { status: 200 }
        );
      }

      console.error('Error adding to wishlist:', insertError);
      return NextResponse.json(
        { error: 'Failed to add to wishlist' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        item: {
          id: item.id,
          userId: item.user_id,
          productId: item.product_id,
          addedAt: item.added_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding to wishlist:', error);

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
