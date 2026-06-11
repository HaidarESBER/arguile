import { createAdminClient, logSupabaseError } from '@/lib/supabase/admin';
import { DEV_FIXTURE_RATINGS, devFixturesActive } from '@/data/dev-fixtures';
import { createClient } from '@/lib/supabase/server';
import { Review, ProductRatingStats } from '@/data/reviews'; // Import types

/** Joined `profiles` columns selected with a review */
interface ReviewProfileRow {
  first_name: string;
  last_name: string;
}

/** Shape of a `reviews` row as selected by getProductReviews */
interface ProductReviewRow {
  id: string;
  product_id: string;
  user_id: string | null;
  user_name: string | null;
  rating: number;
  comment: string;
  verified_purchase: boolean;
  review_photos: string[] | null;
  created_at: string;
  profiles: ReviewProfileRow | null;
}

/** Shape of a `reviews` row as selected by the admin moderation queries */
export interface AdminReviewRow {
  id: string;
  product_id: string;
  user_id: string | null;
  user_name: string | null;
  rating: number;
  comment: string;
  verified_purchase: boolean;
  review_photos: string[] | null;
  created_at: string;
  status: string;
  products: {
    name: string;
    images: string[];
  };
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

/**
 * Get reviews for a specific product from database
 */
export async function getProductReviews(productId: string): Promise<Review[]> {
  const supabase = createAdminClient(); // Public read, no auth needed

  const { data, error} = await supabase
    .from('reviews')
    .select(`
      id,
      product_id,
      user_id,
      user_name,
      rating,
      comment,
      verified_purchase,
      review_photos,
      created_at,
      profiles!user_id (
        first_name,
        last_name
      )
    `)
    .eq('product_id', productId)
    .eq('status', 'approved') // Only show approved reviews
    .order('created_at', { ascending: false });

  // Supabase's query typings infer the `profiles` FK join as an array, but at
  // runtime this many-to-one join returns a single object (or null), hence the
  // cast through unknown.
  const rows = (data || []) as unknown as ProductReviewRow[];

  // Sort reviews: photos first, then by date
  const sorted = rows.sort((a, b) => {
    const aHasPhotos = a.review_photos && a.review_photos.length > 0;
    const bHasPhotos = b.review_photos && b.review_photos.length > 0;

    // Reviews with photos come first
    if (aHasPhotos && !bHasPhotos) return -1;
    if (!aHasPhotos && bHasPhotos) return 1;

    // If both have photos or both don't, sort by date (already sorted from query)
    return 0;
  });

  if (error) {
    logSupabaseError('Reviews query error:', error.message);
    return []; // Return empty array if table doesn't exist yet
  }

  // Transform to Review format
  return sorted.map((row) => {
    // Scraped review (no user_id, has user_name)
    if (!row.user_id && row.user_name) {
      return {
        id: row.id,
        productId: row.product_id,
        authorName: row.user_name,
        rating: row.rating,
        comment: row.comment,
        date: row.created_at,
        verifiedPurchase: row.verified_purchase,
        photos: row.review_photos || [],
      };
    }

    // User review (has user_id and profiles)
    return {
      id: row.id,
      productId: row.product_id,
      authorName: row.profiles
        ? `${row.profiles.first_name} ${row.profiles.last_name.charAt(0)}.`
        : 'Anonyme',
      rating: row.rating,
      comment: row.comment,
      date: row.created_at,
      verifiedPurchase: row.verified_purchase,
      photos: row.review_photos || [],
    };
  });
}

/**
 * Calculate rating statistics for a product
 */
export async function getProductRatingStats(productId: string): Promise<ProductRatingStats | null> {
  const reviews = await getProductReviews(productId);

  if (reviews.length === 0) return null;

  const totalReviews = reviews.length;
  const sumRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = sumRatings / totalReviews;

  const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const review of reviews) {
    ratingBreakdown[review.rating as keyof typeof ratingBreakdown]++;
  }

  return {
    productId,
    averageRating,
    totalReviews,
    ratingBreakdown,
  };
}

/**
 * Batch calculate rating statistics for multiple products (optimized)
 * Fetches all reviews in a single query to avoid N+1 pattern
 */
export async function getBatchProductRatingStats(productIds: string[]): Promise<Record<string, ProductRatingStats>> {
  if (devFixturesActive()) {
    const out: Record<string, ProductRatingStats> = {};
    for (const id of productIds) {
      if (DEV_FIXTURE_RATINGS[id]) out[id] = DEV_FIXTURE_RATINGS[id];
    }
    return out;
  }

  const supabase = createAdminClient();

  // Fetch all reviews for all products in a single query
  const { data, error } = await supabase
    .from('reviews')
    .select('product_id, rating')
    .in('product_id', productIds)
    .eq('status', 'approved');

  if (error || !data) {
    logSupabaseError('Error fetching batch reviews:', error);
    return {};
  }

  // Group reviews by product ID
  const reviewsByProduct = new Map<string, number[]>();

  for (const row of data) {
    const existing = reviewsByProduct.get(row.product_id) || [];
    existing.push(row.rating);
    reviewsByProduct.set(row.product_id, existing);
  }

  // Calculate stats for each product
  const statsMap: Record<string, ProductRatingStats> = {};

  for (const [productId, ratings] of reviewsByProduct) {
    if (ratings.length === 0) continue;

    const totalReviews = ratings.length;
    const sumRatings = ratings.reduce((sum, rating) => sum + rating, 0);
    const averageRating = sumRatings / totalReviews;

    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const rating of ratings) {
      ratingBreakdown[rating as keyof typeof ratingBreakdown]++;
    }

    statsMap[productId] = {
      productId,
      averageRating,
      totalReviews,
      ratingBreakdown,
    };
  }

  return statsMap;
}

/**
 * Create a new review for a product
 */
export async function createReview({
  productId,
  userId,
  rating,
  comment,
  photos = [],
}: {
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  photos?: string[];
}): Promise<Review> {
  const supabase = await createClient(); // User context for RLS

  // Check if user has purchased this product (verified purchase)
  const { data: orders } = await supabase
    .from('order_items')
    .select('id, orders!inner(user_email)')
    .eq('product_id', productId)
    .limit(1);

  const verifiedPurchase = orders && orders.length > 0;

  // Insert review
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      product_id: productId,
      user_id: userId,
      rating,
      comment,
      verified_purchase: verifiedPurchase,
      review_photos: photos,
    })
    .select(`
      id,
      product_id,
      rating,
      comment,
      verified_purchase,
      created_at,
      profiles!user_id (
        first_name,
        last_name
      )
    `)
    .single();

  if (error) throw error;

  // Supabase's query typings infer the `profiles` FK join as an array, but at
  // runtime this many-to-one join returns a single object.
  const profile = data.profiles as unknown as ReviewProfileRow;

  return {
    id: data.id,
    productId: data.product_id,
    authorName: `${profile.first_name} ${profile.last_name.charAt(0)}.`,
    rating: data.rating,
    comment: data.comment,
    date: data.created_at,
    verifiedPurchase: data.verified_purchase,
  };
}

/**
 * Get all pending reviews for admin moderation
 */
export async function getPendingReviews(): Promise<AdminReviewRow[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      product_id,
      user_id,
      user_name,
      rating,
      comment,
      verified_purchase,
      review_photos,
      created_at,
      status,
      products!product_id (
        name,
        images
      ),
      profiles!user_id (
        first_name,
        last_name,
        email
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending reviews:', error);
    return [];
  }

  // Supabase's query typings infer the `products`/`profiles` FK joins as
  // arrays, but at runtime these many-to-one joins return single objects.
  return (data || []) as unknown as AdminReviewRow[];
}

/**
 * Get all reviews (all statuses) for admin panel
 */
export async function getAllReviewsAdmin(): Promise<AdminReviewRow[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      product_id,
      user_id,
      user_name,
      rating,
      comment,
      verified_purchase,
      review_photos,
      created_at,
      status,
      products!product_id (
        name,
        images
      ),
      profiles!user_id (
        first_name,
        last_name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all reviews:', error);
    return [];
  }

  // Supabase's query typings infer the `products`/`profiles` FK joins as
  // arrays, but at runtime these many-to-one joins return single objects.
  return (data || []) as unknown as AdminReviewRow[];
}

/**
 * Approve a review
 */
export async function approveReview(reviewId: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('reviews')
    .update({ status: 'approved' })
    .eq('id', reviewId);

  if (error) throw error;
}

/**
 * Reject a review
 */
export async function rejectReview(reviewId: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('reviews')
    .update({ status: 'rejected' })
    .eq('id', reviewId);

  if (error) throw error;
}

/**
 * Delete a review permanently
 */
export async function deleteReview(reviewId: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (error) throw error;
}

/**
 * Toggle verified purchase status
 */
export async function toggleVerifiedStatus(reviewId: string, verified: boolean): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('reviews')
    .update({ verified_purchase: verified })
    .eq('id', reviewId);

  if (error) throw error;
}

/**
 * Create a scraped review (imported from external source)
 * Uses admin client and doesn't require user authentication
 */
export async function createScrapedReview({
  productId,
  userName,
  rating,
  comment,
  verifiedPurchase = true,
  reviewPhotos = [],
}: {
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  verifiedPurchase?: boolean;
  reviewPhotos?: string[];
}): Promise<Review> {
  const supabase = createAdminClient(); // Admin context to bypass RLS

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      product_id: productId,
      user_id: null, // Scraped reviews don't have user accounts
      user_name: userName,
      rating,
      comment,
      verified_purchase: verifiedPurchase,
      review_photos: reviewPhotos,
      status: 'approved', // Scraped reviews bypass moderation
    })
    .select('id, product_id, user_name, rating, comment, verified_purchase, review_photos, created_at')
    .single();

  if (error) {
    console.error('Failed to create scraped review:', error);
    throw error;
  }

  return {
    id: data.id,
    productId: data.product_id,
    authorName: data.user_name,
    rating: data.rating,
    comment: data.comment,
    date: data.created_at,
    photos: data.review_photos || [],
    verifiedPurchase: data.verified_purchase,
  };
}
