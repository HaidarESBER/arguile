/**
 * Server-side analytics helper library
 * DO NOT confuse with client-side src/lib/analytics.ts
 *
 * Purpose: Query pre-aggregated metrics and raw events for admin dashboards
 * Uses: createAdminClient() for admin-only access
 *
 * Phase 21 will consume these helpers for admin analytics dashboards
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { ServerAnalyticsEvent } from '@/types/analytics';

// =============================================================================
// TypeScript Types
// =============================================================================

export interface DailyMetrics {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  total_events: number;
  unique_sessions: number;
  unique_users: number;
  page_views: number;
  product_views: number;
  add_to_cart_count: number;
  purchases: number;
  total_revenue: number; // in cents
  search_queries: number;
  avg_session_duration: number; // in seconds (placeholder)
  bounce_rate: number; // percentage (placeholder)
  created_at: string;
  updated_at: string;
}

export interface MetricsSummary {
  totalSessions: number;
  totalUsers: number;
  totalRevenue: number; // in cents
  totalPurchases: number;
  avgRevenuePerUser: number; // in cents
  conversionRate: number; // percentage
}

export interface TopEvent {
  key: string; // productId, query, etc.
  count: number;
  label?: string; // Optional human-readable label
  uniqueCount?: number; // Optional unique visitors count
}

// =============================================================================
// Query Helpers
// =============================================================================

/**
 * Get daily metrics for a date range
 * @param startDate - Start date (inclusive)
 * @param endDate - End date (inclusive)
 * @returns Array of daily metrics ordered by date ascending
 */
export async function getDailyMetrics(
  startDate: Date,
  endDate: Date
): Promise<DailyMetrics[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('daily_metrics')
    .select('*')
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) {
    console.error('getDailyMetrics error:', error.message);
    throw new Error(`Failed to fetch daily metrics: ${error.message}`);
  }

  return data || [];
}

/**
 * Get aggregated metrics summary for last N days
 * @param days - Number of days to aggregate (default: 30)
 * @returns Summary object with totals and calculated metrics
 */
export async function getMetricsSummary(days: number = 30): Promise<MetricsSummary> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const metrics = await getDailyMetrics(startDate, endDate);

  // Aggregate totals
  const totalSessions = metrics.reduce((sum, m) => sum + m.unique_sessions, 0);
  const totalUsers = metrics.reduce((sum, m) => sum + m.unique_users, 0);
  const totalRevenue = metrics.reduce((sum, m) => sum + m.total_revenue, 0);
  const totalPurchases = metrics.reduce((sum, m) => sum + m.purchases, 0);

  // Calculate derived metrics
  const avgRevenuePerUser = totalUsers > 0 ? Math.round(totalRevenue / totalUsers) : 0;
  const conversionRate = totalSessions > 0 ? (totalPurchases / totalSessions) * 100 : 0;

  return {
    totalSessions,
    totalUsers,
    totalRevenue,
    totalPurchases,
    avgRevenuePerUser,
    conversionRate,
  };
}

/**
 * Get top events by type (most viewed products, top searches, etc.)
 * @param eventType - Event type to query (e.g., 'product_view', 'search')
 * @param limit - Maximum number of results (default: 10)
 * @returns Array of top events with counts
 */
export async function getTopEvents(
  eventType: string,
  limit: number = 10
): Promise<TopEvent[]> {
  const supabase = createAdminClient();

  // Determine which JSONB key to group by based on event type
  let groupByKey: string;
  let labelKey: string | null = null;

  if (eventType === 'product_view' || eventType === 'add_to_cart') {
    groupByKey = 'productId';
    labelKey = 'productName';
  } else if (eventType === 'search') {
    groupByKey = 'query';
  } else {
    groupByKey = 'key'; // Generic fallback
  }

  // Query raw events and aggregate in application
  // (Supabase doesn't support GROUP BY JSONB fields easily in client lib)
  const { data, error } = await supabase
    .from('analytics_events')
    .select('event_data')
    .eq('event_type', eventType)
    .limit(10000); // Limit to prevent memory issues

  if (error) {
    console.error('getTopEvents error:', error.message);
    throw new Error(`Failed to fetch top events: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Aggregate counts and names in application
  const stats = new Map<string, { count: number; label?: string }>();
  for (const row of data) {
    const key = row.event_data?.[groupByKey];
    if (key) {
      const existing = stats.get(key);
      const label = labelKey ? row.event_data?.[labelKey] : undefined;

      if (existing) {
        existing.count++;
      } else {
        stats.set(key, { count: 1, label: label || key });
      }
    }
  }

  // Convert to array and sort by count descending
  const topEvents = Array.from(stats.entries())
    .map(([key, data]) => ({ key, count: data.count, label: data.label }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return topEvents;
}

/**
 * Get most recent analytics events for real-time activity feed
 * @param limit - Maximum number of events to return (default: 50)
 * @returns Array of recent events ordered by created_at descending
 */
export async function getRealtimeEvents(limit: number = 50): Promise<ServerAnalyticsEvent[]> {
  const supabase = createAdminClient();

  // Filter out technical events (web_vital, etc.) - only show business events
  const businessEventTypes = [
    'page_view',
    'product_view',
    'add_to_cart',
    'remove_from_cart',
    'checkout_started',
    'purchase',
    'search',
    'wishlist_add',
    'wishlist_remove'
  ];

  const { data, error } = await supabase
    .from('analytics_events')
    .select('*')
    .in('event_type', businessEventTypes)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getRealtimeEvents error:', error.message);
    throw new Error(`Failed to fetch realtime events: ${error.message}`);
  }

  return data || [];
}

/**
 * Trigger daily aggregation for a specific date
 * @param date - Date to aggregate (default: yesterday)
 * @returns void (throws on error)
 */
export async function triggerDailyAggregation(date?: Date): Promise<void> {
  const supabase = createAdminClient();

  // Default to yesterday if no date provided
  const targetDate = date || new Date(Date.now() - 24 * 60 * 60 * 1000);
  const dateString = targetDate.toISOString().split('T')[0];

  // Call the aggregate_daily_metrics function
  const { error } = await supabase.rpc('aggregate_daily_metrics', {
    target_date: dateString,
  });

  if (error) {
    console.error('triggerDailyAggregation error:', error.message);
    throw new Error(`Failed to trigger aggregation: ${error.message}`);
  }
}

/**
 * Get product views with UNIQUE visitor counts
 * @param limit - Maximum number of products to return (default: 10)
 * @returns Array of products with total views and unique visitor counts
 */
export async function getProductViewsWithUniqueVisitors(limit: number = 10): Promise<TopEvent[]> {
  const supabase = createAdminClient();

  // Get all product_view events with session_id
  const { data, error } = await supabase
    .from('analytics_events')
    .select('event_data, session_id')
    .eq('event_type', 'product_view')
    .limit(10000); // Limit to prevent memory issues

  if (error) {
    console.error('getProductViewsWithUniqueVisitors error:', error.message);
    throw new Error(`Failed to fetch product views: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Aggregate total views and unique sessions per product
  const productStats = new Map<string, { count: number; sessions: Set<string>; name: string }>();

  for (const row of data) {
    const productId = row.event_data?.productId;
    const productName = row.event_data?.productName || productId;
    const sessionId = row.session_id;

    if (productId && sessionId) {
      const existing = productStats.get(productId);
      if (existing) {
        existing.count++;
        existing.sessions.add(sessionId);
      } else {
        productStats.set(productId, {
          count: 1,
          sessions: new Set([sessionId]),
          name: productName
        });
      }
    }
  }

  // Convert to array with uniqueCount and product name
  const results = Array.from(productStats.entries())
    .map(([key, stats]) => ({
      key,
      label: stats.name,
      count: stats.count,
      uniqueCount: stats.sessions.size
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return results;
}

/**
 * Get product wishlist counts (how many times each product was favorited)
 * @param limit - Maximum number of products to return (default: 10)
 * @returns Array of products with wishlist counts
 */
export async function getTopWishlistedProducts(limit: number = 10): Promise<TopEvent[]> {
  const supabase = createAdminClient();

  // Count wishlist_add events per product
  const { data, error } = await supabase
    .from('analytics_events')
    .select('event_data')
    .eq('event_type', 'wishlist_add')
    .limit(10000); // Limit to prevent memory issues

  if (error) {
    console.error('getTopWishlistedProducts error:', error.message);
    throw new Error(`Failed to fetch wishlist data: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Aggregate counts by productId with names
  const stats = new Map<string, { count: number; name: string }>();
  for (const row of data) {
    const productId = row.event_data?.productId;
    const productName = row.event_data?.productName || productId;

    if (productId) {
      const existing = stats.get(productId);
      if (existing) {
        existing.count++;
      } else {
        stats.set(productId, { count: 1, name: productName });
      }
    }
  }

  // Convert to array and sort by count descending
  const topProducts = Array.from(stats.entries())
    .map(([key, data]) => ({ key, label: data.name, count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return topProducts;
}

/**
 * Get total unique visitors across all time
 * Note: A "unique visitor" is tracked by unique session_id values
 * @returns Number of unique visitor sessions
 */
export async function getUniqueVisitorsCount(): Promise<number> {
  const supabase = createAdminClient();

  // Count distinct session_ids
  const { data, error } = await supabase
    .from('analytics_events')
    .select('session_id', { count: 'exact', head: false });

  if (error) {
    console.error('getUniqueVisitorsCount error:', error.message);
    return 0;
  }

  if (!data) {
    return 0;
  }

  // Count unique session IDs
  const uniqueSessions = new Set(data.map(row => row.session_id));
  return uniqueSessions.size;
}

// =============================================================================
// Sales Analytics Helpers (Phase 22)
// =============================================================================

/**
 * Category revenue data
 */
export interface CategoryRevenue {
  category: string;
  revenue: number; // in cents
  orderCount: number;
  avgOrderValue: number; // in cents
}

/**
 * Top selling product data
 */
export interface TopSellingProduct {
  productId: string;
  name: string;
  category: string;
  revenue: number; // in cents
  unitsSold: number;
  avgPrice: number; // in cents
}

/**
 * Average order value trend data
 */
export interface AOVTrend {
  date: string; // ISO date string (YYYY-MM-DD)
  avgOrderValue: number; // in cents
  orderCount: number;
}

/**
 * Get revenue breakdown by product category
 * @returns Array of category revenue data
 */
export async function getRevenueByCategory(): Promise<CategoryRevenue[]> {
  const supabase = createAdminClient();

  // Fetch order_items and products separately (no FK relationship exists)
  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select('product_id, quantity, price');

  if (itemsError) {
    console.error('getRevenueByCategory error:', itemsError.message);
    return [];
  }

  if (!orderItems || orderItems.length === 0) {
    return [];
  }

  // Fetch all products to get categories
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, category');

  if (productsError) {
    console.error('getRevenueByCategory products error:', productsError.message);
    return [];
  }

  if (!products || products.length === 0) {
    return [];
  }

  // Create product lookup map
  const productMap = new Map(products.map(p => [p.id, p.category]));

  // Aggregate by category
  const categoryMap = new Map<string, { revenue: number; orderCount: number }>();

  for (const item of orderItems) {
    const category = productMap.get(item.product_id);
    if (!category) continue;

    const itemRevenue = item.price * item.quantity;
    const existing = categoryMap.get(category) || { revenue: 0, orderCount: 0 };

    categoryMap.set(category, {
      revenue: existing.revenue + itemRevenue,
      orderCount: existing.orderCount + 1,
    });
  }

  // Convert to array and calculate averages
  const results: CategoryRevenue[] = Array.from(categoryMap.entries()).map(
    ([category, data]) => ({
      category,
      revenue: data.revenue,
      orderCount: data.orderCount,
      avgOrderValue: Math.round(data.revenue / data.orderCount),
    })
  );

  // Sort by revenue descending
  return results.sort((a, b) => b.revenue - a.revenue);
}

/**
 * Get top selling products by total revenue
 * @param limit - Maximum number of products to return (default: 10)
 * @returns Array of top selling products
 */
export async function getTopSellingProducts(limit: number = 10): Promise<TopSellingProduct[]> {
  const supabase = createAdminClient();

  // Fetch order_items and products separately (no FK relationship exists)
  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select('product_id, quantity, price');

  if (itemsError) {
    console.error('getTopSellingProducts error:', itemsError.message);
    return [];
  }

  if (!orderItems || orderItems.length === 0) {
    return [];
  }

  // Fetch all products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, category');

  if (productsError) {
    console.error('getTopSellingProducts products error:', productsError.message);
    return [];
  }

  if (!products || products.length === 0) {
    return [];
  }

  // Create product lookup map
  const productsById = new Map(products.map(p => [p.id, p]));

  // Aggregate by product_id
  const productMap = new Map<string, {
    name: string;
    category: string;
    revenue: number;
    unitsSold: number;
    totalPrice: number;
  }>();

  for (const item of orderItems) {
    const productId = item.product_id;
    const product = productsById.get(productId);
    if (!product || !productId) continue;

    const itemRevenue = item.price * item.quantity;
    const existing = productMap.get(productId);

    if (existing) {
      productMap.set(productId, {
        ...existing,
        revenue: existing.revenue + itemRevenue,
        unitsSold: existing.unitsSold + item.quantity,
        totalPrice: existing.totalPrice + (item.price * item.quantity),
      });
    } else {
      productMap.set(productId, {
        name: product.name,
        category: product.category,
        revenue: itemRevenue,
        unitsSold: item.quantity,
        totalPrice: item.price * item.quantity,
      });
    }
  }

  // Convert to array and calculate averages
  const results: TopSellingProduct[] = Array.from(productMap.entries()).map(
    ([productId, data]) => ({
      productId,
      name: data.name,
      category: data.category,
      revenue: data.revenue,
      unitsSold: data.unitsSold,
      avgPrice: Math.round(data.revenue / data.unitsSold),
    })
  );

  // Sort by revenue descending and limit
  return results.sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

/**
 * Get average order value trends over time
 * @param days - Number of days to include (default: 30)
 * @returns Array of daily AOV data
 */
export async function getAOVTrends(days: number = 30): Promise<AOVTrend[]> {
  const supabase = createAdminClient();

  // Calculate start date
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Query orders for the date range
  const { data: orders, error } = await supabase
    .from('orders')
    .select('total, created_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getAOVTrends error:', error.message);
    return [];
  }

  if (!orders || orders.length === 0) {
    return [];
  }

  // Group by date
  const dateMap = new Map<string, { total: number; count: number }>();

  for (const order of orders) {
    const date = order.created_at.split('T')[0]; // Extract YYYY-MM-DD
    const existing = dateMap.get(date) || { total: 0, count: 0 };

    dateMap.set(date, {
      total: existing.total + order.total,
      count: existing.count + 1,
    });
  }

  // Convert to array and calculate averages
  const results: AOVTrend[] = Array.from(dateMap.entries()).map(
    ([date, data]) => ({
      date,
      avgOrderValue: Math.round(data.total / data.count),
      orderCount: data.count,
    })
  );

  // Sort by date ascending
  return results.sort((a, b) => a.date.localeCompare(b.date));
}

// =============================================================================
// Inventory Management Analytics (Phase 22-02)
// =============================================================================

export interface StockAlert {
  productId: string;
  name: string;
  category: string;
  stockLevel: number;
  urgency: 'critical' | 'urgent' | 'limited';
}

export interface InventoryVelocity {
  productId: string;
  name: string;
  stockLevel: number;
  unitsSold: number;
  dailyVelocity: number;
  daysRemaining: number;
}

export interface RestockRecommendation {
  productId: string;
  name: string;
  currentStock: number;
  dailyVelocity: number;
  daysRemaining: number;
  recommendedRestock: number;
  estimatedStockoutDate: string; // ISO date string
}

/**
 * Get products with low stock levels
 * @returns Array of products with urgency indicators
 */
export async function getStockAlerts(): Promise<StockAlert[]> {
  const supabase = createAdminClient();

  // Query products where inStock = true and stockLevel <= 10
  const { data, error } = await supabase
    .from('products')
    .select('id, name, category, stock_level, in_stock')
    .eq('in_stock', true)
    .not('stock_level', 'is', null)
    .lte('stock_level', 10)
    .order('stock_level', { ascending: true });

  if (error) {
    console.error('getStockAlerts error:', error.message);
    throw new Error(`Failed to fetch stock alerts: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Map to StockAlert with urgency calculation
  const alerts: StockAlert[] = data.map(product => {
    let urgency: 'critical' | 'urgent' | 'limited';
    if (product.stock_level === 0) {
      urgency = 'critical';
    } else if (product.stock_level <= 5) {
      urgency = 'urgent';
    } else {
      urgency = 'limited';
    }

    return {
      productId: product.id,
      name: product.name,
      category: product.category,
      stockLevel: product.stock_level,
      urgency,
    };
  });

  return alerts;
}

/**
 * Get sales velocity per product
 * @param days - Number of days to analyze (default: 30)
 * @returns Array of products with velocity and days remaining
 */
export async function getInventoryVelocity(days: number = 30): Promise<InventoryVelocity[]> {
  const supabase = createAdminClient();

  // Calculate date range
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Fetch orders in date range first
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, created_at')
    .gte('created_at', startDate.toISOString());

  if (ordersError) {
    console.error('getInventoryVelocity orders error:', ordersError.message);
    return [];
  }

  if (!orders || orders.length === 0) {
    return [];
  }

  // Get order IDs from the date range
  const orderIds = new Set(orders.map(o => o.id));

  // Fetch all order_items
  const { data: orderItems, error: orderItemsError } = await supabase
    .from('order_items')
    .select('order_id, product_id, quantity');

  if (orderItemsError) {
    console.error('getInventoryVelocity error:', orderItemsError.message);
    return [];
  }

  // Aggregate units sold per product (only for orders in date range)
  const salesByProduct = new Map<string, number>();
  if (orderItems && orderItems.length > 0) {
    for (const item of orderItems) {
      // Only count items from orders in our date range
      if (orderIds.has(item.order_id)) {
        const productId = item.product_id;
        const quantity = item.quantity;
        salesByProduct.set(productId, (salesByProduct.get(productId) || 0) + quantity);
      }
    }
  }

  // Get products with stock levels
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, stock_level')
    .not('stock_level', 'is', null)
    .gt('stock_level', 0);

  if (productsError) {
    console.error('getInventoryVelocity products error:', productsError.message);
    throw new Error(`Failed to fetch products: ${productsError.message}`);
  }

  if (!products || products.length === 0) {
    return [];
  }

  // Calculate velocity and days remaining
  const velocities: InventoryVelocity[] = products
    .map(product => {
      const unitsSold = salesByProduct.get(product.id) || 0;
      const dailyVelocity = unitsSold / days;
      const daysRemaining = dailyVelocity > 0
        ? Math.floor(product.stock_level / dailyVelocity)
        : Infinity;

      return {
        productId: product.id,
        name: product.name,
        stockLevel: product.stock_level,
        unitsSold,
        dailyVelocity,
        daysRemaining,
      };
    })
    .filter(v => v.daysRemaining !== Infinity) // Only include products with sales
    .sort((a, b) => a.daysRemaining - b.daysRemaining); // Soonest first

  return velocities;
}

/**
 * Get restock recommendations based on sales velocity
 * @param targetDays - Target days of inventory to maintain (default: 60)
 * @returns Array of products needing restock with recommended quantities
 */
export async function getRestockRecommendations(targetDays: number = 60): Promise<RestockRecommendation[]> {
  // Get inventory velocity data
  const velocities = await getInventoryVelocity(30);

  // Filter products needing restock (< targetDays remaining)
  const recommendations: RestockRecommendation[] = velocities
    .filter(v => v.daysRemaining < targetDays)
    .map(v => {
      // Calculate recommended restock quantity
      const targetStock = v.dailyVelocity * targetDays;
      const neededStock = targetStock - v.stockLevel;

      // Round up to nearest 5 for practical ordering
      const recommendedRestock = Math.ceil(neededStock / 5) * 5;

      // Estimate when stockout will occur
      const stockoutDate = new Date();
      stockoutDate.setDate(stockoutDate.getDate() + v.daysRemaining);

      return {
        productId: v.productId,
        name: v.name,
        currentStock: v.stockLevel,
        dailyVelocity: v.dailyVelocity,
        daysRemaining: v.daysRemaining,
        recommendedRestock: Math.max(0, recommendedRestock),
        estimatedStockoutDate: stockoutDate.toISOString(),
      };
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining); // Most urgent first

  return recommendations;
}

// =============================================================================
// Order Intelligence Analytics (Phase 22-03)
// =============================================================================

export interface TimePattern {
  dayOfWeek: number; // 0-6, Sunday = 0
  hour: number; // 0-23
  orderCount: number;
}

export interface PeakTimes {
  peakDay: string; // French day name
  peakHour: number;
  peakDayCount: number;
  peakHourCount: number;
}

export interface ShippingDistribution {
  shippingTier: string;
  label: string;
  orderCount: number;
  percentage: number;
  totalRevenue: number; // in cents
}

export interface StatusFunnelStep {
  status: string;
  label: string;
  orderCount: number;
  percentage: number;
  dropOffRate?: number;
}

/**
 * Convert day of week number to French day name
 */
function getDayNameFr(dayOfWeek: number): string {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[dayOfWeek] || 'Inconnu';
}

/**
 * Get order volume by day of week and hour (time heatmap)
 * @param days - Number of days to analyze (default: 30)
 * @returns Object with patterns array and peak times
 */
export async function getOrdersByTimePattern(days: number = 30): Promise<{
  patterns: TimePattern[];
  peakTimes: PeakTimes;
}> {
  const supabase = createAdminClient();

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Fetch orders from last N days
  const { data: orders, error } = await supabase
    .from('orders')
    .select('created_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (error) {
    console.error('getOrdersByTimePattern error:', error.message);
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  if (!orders || orders.length === 0) {
    // Return empty structure with all zero counts
    const patterns: TimePattern[] = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        patterns.push({ dayOfWeek: day, hour, orderCount: 0 });
      }
    }
    return {
      patterns,
      peakTimes: {
        peakDay: 'Aucun',
        peakHour: 0,
        peakDayCount: 0,
        peakHourCount: 0,
      },
    };
  }

  // Group by dayOfWeek and hour
  const countMap = new Map<string, number>();
  const dayCountMap = new Map<number, number>();
  const hourCountMap = new Map<number, number>();

  for (const order of orders) {
    const date = new Date(order.created_at);
    const dayOfWeek = date.getDay(); // 0-6
    const hour = date.getHours(); // 0-23

    // Count for heatmap
    const key = `${dayOfWeek}-${hour}`;
    countMap.set(key, (countMap.get(key) || 0) + 1);

    // Count by day
    dayCountMap.set(dayOfWeek, (dayCountMap.get(dayOfWeek) || 0) + 1);

    // Count by hour
    hourCountMap.set(hour, (hourCountMap.get(hour) || 0) + 1);
  }

  // Build complete patterns array (all day/hour combinations)
  const patterns: TimePattern[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`;
      patterns.push({
        dayOfWeek: day,
        hour,
        orderCount: countMap.get(key) || 0,
      });
    }
  }

  // Find peak times
  let peakDay = 0;
  let peakDayCount = 0;
  dayCountMap.forEach((count, day) => {
    if (count > peakDayCount) {
      peakDayCount = count;
      peakDay = day;
    }
  });

  let peakHour = 0;
  let peakHourCount = 0;
  hourCountMap.forEach((count, hour) => {
    if (count > peakHourCount) {
      peakHourCount = count;
      peakHour = hour;
    }
  });

  return {
    patterns,
    peakTimes: {
      peakDay: getDayNameFr(peakDay),
      peakHour,
      peakDayCount,
      peakHourCount,
    },
  };
}

/**
 * Get shipping method distribution
 * @returns Array of shipping tiers with counts and percentages
 */
export async function getShippingDistribution(): Promise<ShippingDistribution[]> {
  const supabase = createAdminClient();

  // Fetch all orders with shipping info
  const { data: orders, error } = await supabase
    .from('orders')
    .select('shipping');

  if (error) {
    console.error('getShippingDistribution error:', error.message);
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  if (!orders || orders.length === 0) {
    return [];
  }

  // Group by shipping tier
  const tiers = {
    free: { count: 0, revenue: 0 },
    standard: { count: 0, revenue: 0 },
    express: { count: 0, revenue: 0 },
  };

  for (const order of orders) {
    const shipping = order.shipping || 0;

    if (shipping === 0) {
      tiers.free.count++;
      tiers.free.revenue += 0;
    } else if (shipping < 1000) {
      tiers.standard.count++;
      tiers.standard.revenue += shipping;
    } else {
      tiers.express.count++;
      tiers.express.revenue += shipping;
    }
  }

  const totalOrders = orders.length;

  const distribution: ShippingDistribution[] = [
    {
      shippingTier: 'free',
      label: 'Livraison Gratuite',
      orderCount: tiers.free.count,
      percentage: totalOrders > 0 ? (tiers.free.count / totalOrders) * 100 : 0,
      totalRevenue: tiers.free.revenue,
    },
    {
      shippingTier: 'standard',
      label: 'Livraison Standard',
      orderCount: tiers.standard.count,
      percentage: totalOrders > 0 ? (tiers.standard.count / totalOrders) * 100 : 0,
      totalRevenue: tiers.standard.revenue,
    },
    {
      shippingTier: 'express',
      label: 'Livraison Express',
      orderCount: tiers.express.count,
      percentage: totalOrders > 0 ? (tiers.express.count / totalOrders) * 100 : 0,
      totalRevenue: tiers.express.revenue,
    },
  ];

  // Sort by orderCount descending
  return distribution.sort((a, b) => b.orderCount - a.orderCount);
}

/**
 * Get order status funnel with conversion rates
 * @returns Array of funnel steps with counts and drop-off rates
 */
export async function getOrderStatusFunnel(): Promise<StatusFunnelStep[]> {
  const supabase = createAdminClient();

  // Fetch all orders grouped by status
  const { data: orders, error } = await supabase
    .from('orders')
    .select('status');

  if (error) {
    console.error('getOrderStatusFunnel error:', error.message);
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  if (!orders || orders.length === 0) {
    return [];
  }

  // Count by status
  const statusCounts = new Map<string, number>();
  for (const order of orders) {
    const status = order.status;
    statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
  }

  const totalOrders = orders.length;

  // French status labels
  const statusLabels: Record<string, string> = {
    pending_payment: 'En attente de paiement',
    pending: 'En attente',
    confirmed: 'Confirmée',
    processing: 'En préparation',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  };

  // Define funnel in lifecycle order
  const funnelOrder = [
    'pending_payment',
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ];

  const funnel: StatusFunnelStep[] = [];
  let previousCount = totalOrders;

  for (const status of funnelOrder) {
    const count = statusCounts.get(status) || 0;
    const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0;

    // Calculate drop-off rate from previous step
    let dropOffRate: number | undefined;
    if (status !== 'pending_payment' && status !== 'cancelled') {
      dropOffRate = previousCount > 0 ? ((previousCount - count) / previousCount) * 100 : 0;
    }

    funnel.push({
      status,
      label: statusLabels[status] || status,
      orderCount: count,
      percentage,
      dropOffRate,
    });

    // Update previous count for next iteration (skip cancelled)
    if (status !== 'cancelled') {
      previousCount = count;
    }
  }

  return funnel;
}
