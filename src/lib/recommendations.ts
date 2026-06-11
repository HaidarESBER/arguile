import { createAdminClient } from '@/lib/supabase/admin';
import { Product, ProductCategory } from '@/types/product';

/** Shape of a `products` table row as selected from Supabase */
interface ProductRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price?: number;
  images: string[];
  category: ProductCategory;
  in_stock: boolean;
  stock_level?: number;
  featured: boolean;
}

interface RecommendationContext {
  userId?: string;
  productId?: string; // For "related products" on product page
  limit?: number;
}

/**
 * Get personalized product recommendations
 *
 * Algorithm:
 * - For authenticated users: Uses wishlist + browse history to determine preferences
 * - For guest users: Returns featured/popular products
 * - For product pages: Returns products in same category
 *
 * Scoring factors:
 * - Category affinity (from wishlist + browse history)
 * - Price range similarity
 * - Popularity (view counts)
 * - Featured status
 */
export async function getRecommendations(
  context: RecommendationContext
): Promise<Product[]> {
  const supabase = createAdminClient();
  const { userId, productId, limit = 6 } = context;

  // If no user context, return popular/featured products
  if (!userId) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('in_stock', true)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    return (data || []).map(mapDatabaseProduct);
  }

  // For product-specific recommendations (related products)
  if (productId) {
    return getRelatedProductsFromDB(productId, userId, limit);
  }

  // For personalized recommendations
  return getPersonalizedRecommendations(userId, limit);
}

/**
 * Get related products based on intelligent recommendation logic (client-side)
 *
 * Priority:
 * 1. Same category products (exclude current)
 * 2. Similar price range (±30%)
 * 3. Featured products as fallback
 *
 * Returns randomized recommendations
 */
export function getRelatedProducts(
  currentProduct: Product,
  allProducts: Product[],
  count: number = 6
): Product[] {
  // Filter out current product and out-of-stock items
  const availableProducts = allProducts.filter(
    (p) => p.id !== currentProduct.id && p.inStock
  );

  // Primary: Same category
  const sameCategory = availableProducts.filter(
    (p) => p.category === currentProduct.category
  );

  // Secondary: Similar price range (±30%)
  const priceMin = currentProduct.price * 0.7;
  const priceMax = currentProduct.price * 1.3;
  const similarPrice = availableProducts.filter(
    (p) => p.price >= priceMin && p.price <= priceMax
  );

  // Tertiary: Featured products
  const featured = availableProducts.filter((p) => p.featured);

  // Build recommendation pool with priority
  let recommendations: Product[] = [];

  // Add same category first
  if (sameCategory.length > 0) {
    recommendations = [...sameCategory];
  }

  // Add similar price if we need more
  if (recommendations.length < count) {
    const uniqueSimilarPrice = similarPrice.filter(
      (p) => !recommendations.find((r) => r.id === p.id)
    );
    recommendations = [...recommendations, ...uniqueSimilarPrice];
  }

  // Add featured as fallback
  if (recommendations.length < count) {
    const uniqueFeatured = featured.filter(
      (p) => !recommendations.find((r) => r.id === p.id)
    );
    recommendations = [...recommendations, ...uniqueFeatured];
  }

  // Shuffle and return requested count
  const shuffled = recommendations.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get related products based on same category (server-side with database)
 */
export async function getRelatedProductsFromDB(
  productId: string,
  userId: string,
  limit: number
): Promise<Product[]> {
  const supabase = createAdminClient();

  // Get current product category
  const { data: currentProduct } = await supabase
    .from('products')
    .select('category')
    .eq('id', productId)
    .single();

  if (!currentProduct) {
    return [];
  }

  // Get products in same category, excluding current product and user's wishlist
  const { data: wishlistIds } = await supabase
    .from('wishlist')
    .select('product_id')
    .eq('user_id', userId);

  const excludeIds = [productId, ...(wishlistIds || []).map(w => w.product_id)];

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', currentProduct.category)
    .eq('in_stock', true)
    .not('id', 'in', `(${excludeIds.join(',')})`)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    // Fallback to featured products
    const { data: fallback } = await supabase
      .from('products')
      .select('*')
      .eq('in_stock', true)
      .eq('featured', true)
      .limit(limit);
    return (fallback || []).map(mapDatabaseProduct);
  }

  return data.map(mapDatabaseProduct);
}

/**
 * Get personalized recommendations based on user behavior
 */
async function getPersonalizedRecommendations(
  userId: string,
  limit: number
): Promise<Product[]> {
  const supabase = createAdminClient();

  // Get user's category affinity from browse history
  const { data: browseHistory } = await supabase
    .from('browse_history')
    .select('product_id')
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false })
    .limit(20);

  if (browseHistory && browseHistory.length > 0) {
    // Get product IDs from browse history
    const viewedProductIds = browseHistory.map(b => b.product_id);

    // Get categories of viewed products
    const { data: viewedProducts } = await supabase
      .from('products')
      .select('category')
      .in('id', viewedProductIds);

    if (viewedProducts && viewedProducts.length > 0) {
      // Count category occurrences
      const categoryCounts = viewedProducts.reduce((acc: Record<string, number>, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {});

      // Get most viewed categories
      const topCategories = Object.entries(categoryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([cat]) => cat);

      // Get user's wishlist to exclude
      const { data: wishlistIds } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', userId);

      const excludeIds = (wishlistIds || []).map(w => w.product_id);

      // Get products in top categories
      let query = supabase
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .in('category', topCategories);

      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`);
      }

      const { data } = await query
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (data && data.length > 0) {
        return data.map(mapDatabaseProduct);
      }
    }
  }

  // Fallback: featured products not in wishlist
  const { data: wishlistIds } = await supabase
    .from('wishlist')
    .select('product_id')
    .eq('user_id', userId);

  const excludeIds = (wishlistIds || []).map(w => w.product_id);

  let query = supabase
    .from('products')
    .select('*')
    .eq('in_stock', true)
    .eq('featured', true);

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`);
  }

  const { data } = await query
    .order('created_at', { ascending: false })
    .limit(limit);

  return (data || []).map(mapDatabaseProduct);
}

/**
 * Map database product to Product type
 * Converts snake_case to camelCase and handles type conversions
 */
function mapDatabaseProduct(dbProduct: ProductRow): Product {
  return {
    id: dbProduct.id,
    slug: dbProduct.slug,
    name: dbProduct.name,
    description: dbProduct.description,
    shortDescription: dbProduct.short_description,
    price: dbProduct.price,
    compareAtPrice: dbProduct.compare_at_price,
    images: dbProduct.images,
    category: dbProduct.category,
    inStock: dbProduct.in_stock,
    stockLevel: dbProduct.stock_level,
    featured: dbProduct.featured,
  };
}
