/**
 * Customer Intelligence & RFM Analysis Library
 * Phase 23-01: Customer Segmentation & RFM Analysis
 *
 * Purpose: Query and analyze customer purchase behavior using RFM methodology
 * Uses: createAdminClient() for admin-only access
 */

import { createAdminClient } from '@/lib/supabase/admin';

// =============================================================================
// TypeScript Types
// =============================================================================

export interface CustomerRFM {
  email: string;
  firstName: string;
  lastName: string;
  recency: number; // days since last order
  frequency: number; // total orders
  monetary: number; // total revenue in cents
  recencyScore: number; // 1-5
  frequencyScore: number; // 1-5
  monetaryScore: number; // 1-5
  rfmScore: string; // e.g., "555", "344"
  segment: 'VIP' | 'Champions' | 'Fidèles' | 'À Risque' | 'Inactifs';
  firstOrderDate: string;
  lastOrderDate: string;
  avgOrderValue: number; // cents
}

export interface CustomerSegmentStats {
  segment: string;
  count: number;
  percentage: number;
  totalRevenue: number; // cents
  avgOrderValue: number; // cents
}

export interface Cohort {
  cohortMonth: string; // YYYY-MM
  cohortLabel: string; // "Janvier 2026"
  customerCount: number;
  firstOrderTotal: number; // cents
  totalRevenue: number; // cents (all-time)
  retention: Record<number, number>; // month offset → % retained
  // e.g., { 0: 100, 1: 45, 2: 38, 3: 32 }
}

export interface CustomerLTV {
  email: string;
  currentLTV: number; // cents (total spent to date)
  projectedLTV: number; // cents (current + expected future)
  orderCount: number;
  avgOrderValue: number; // cents
  daysSinceFirstOrder: number;
  purchaseFrequency: number; // orders per 90 days
  expectedFutureOrders: number; // projected orders in next 90 days
  segment: string; // from RFM
}

export interface BehavioralMetrics {
  totalCustomers: number;
  browsersOnly: number; // browsed but never purchased
  wishlisters: number; // added to wishlist
  purchasers: number; // made at least 1 purchase
  browseToCart: number; // % who browse and add to cart
  wishlistToPurchase: number; // % who wishlist and purchase
  avgDaysToPurchase: number; // avg days from first browse to first purchase
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Calculate quintile score for a value within an array
 * @param value - Value to score
 * @param sortedValues - Array of values sorted ascending
 * @returns Score from 1 (lowest quintile) to 5 (highest quintile)
 */
function calculateQuintileScore(value: number, sortedValues: number[]): number {
  const n = sortedValues.length;
  if (n === 0) return 1;
  if (n === 1) return 5;

  // Find position in sorted array
  let position = 0;
  for (let i = 0; i < sortedValues.length; i++) {
    if (sortedValues[i] <= value) {
      position = i;
    }
  }

  // Convert position to quintile (1-5)
  const percentile = (position + 1) / n;
  if (percentile <= 0.2) return 1;
  if (percentile <= 0.4) return 2;
  if (percentile <= 0.6) return 3;
  if (percentile <= 0.8) return 4;
  return 5;
}

/**
 * Determine customer segment based on RFM score
 * @param rfmScore - Three-digit RFM score (e.g., "555", "344")
 * @returns Segment label in French
 */
function determineSegment(rfmScore: string): 'VIP' | 'Champions' | 'Fidèles' | 'À Risque' | 'Inactifs' {
  // VIP: 555, 554, 545, 455
  if (['555', '554', '545', '455'].includes(rfmScore)) {
    return 'VIP';
  }

  // Champions: 544, 454, 445, 444, 543
  if (['544', '454', '445', '444', '543'].includes(rfmScore)) {
    return 'Champions';
  }

  // Fidèles: 434, 443, 344, 353, 433
  if (['434', '443', '344', '353', '433'].includes(rfmScore)) {
    return 'Fidèles';
  }

  // À Risque: 343, 334, 333, 324, 243
  if (['343', '334', '333', '324', '243'].includes(rfmScore)) {
    return 'À Risque';
  }

  // Inactifs: Everything else (low scores)
  return 'Inactifs';
}

// =============================================================================
// Query Helpers
// =============================================================================

/**
 * Get RFM analysis for all customers with purchase history
 * @returns Array of customers with RFM scores and segments, sorted by monetary value DESC
 */
export async function getRFMSegments(): Promise<CustomerRFM[]> {
  const supabase = createAdminClient();

  // Query all orders with email
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('user_email, total, created_at')
    .order('created_at', { ascending: true });

  if (ordersError) {
    console.error('getRFMSegments orders error:', ordersError.message);
    throw new Error(`Failed to fetch orders: ${ordersError.message}`);
  }

  if (!orders || orders.length === 0) {
    return [];
  }

  // Query all profiles to get first_name and last_name
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('email, first_name, last_name');

  if (profilesError) {
    console.error('getRFMSegments profiles error:', profilesError.message);
    // Continue without profiles - will use email as fallback
  }

  // Create profile lookup map
  const profileMap = new Map<string, { firstName: string; lastName: string }>();
  if (profiles && profiles.length > 0) {
    for (const profile of profiles) {
      profileMap.set(profile.email, {
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
      });
    }
  }

  // Aggregate customer data
  const now = new Date();
  const customerMap = new Map<string, {
    frequency: number;
    monetary: number;
    firstOrderDate: string;
    lastOrderDate: string;
  }>();

  for (const order of orders) {
    const email = order.user_email;
    const existing = customerMap.get(email);

    if (existing) {
      customerMap.set(email, {
        frequency: existing.frequency + 1,
        monetary: existing.monetary + order.total,
        firstOrderDate: existing.firstOrderDate, // Keep earliest
        lastOrderDate: order.created_at, // Update to latest
      });
    } else {
      customerMap.set(email, {
        frequency: 1,
        monetary: order.total,
        firstOrderDate: order.created_at,
        lastOrderDate: order.created_at,
      });
    }
  }

  // Calculate recency and build customer array
  const customers = Array.from(customerMap.entries()).map(([email, data]) => {
    const lastOrderDate = new Date(data.lastOrderDate);
    const recencyDays = Math.floor((now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));

    const profile = profileMap.get(email);

    return {
      email,
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      recency: recencyDays,
      frequency: data.frequency,
      monetary: data.monetary,
      firstOrderDate: data.firstOrderDate,
      lastOrderDate: data.lastOrderDate,
      avgOrderValue: Math.round(data.monetary / data.frequency),
    };
  });

  // Calculate quintile scores
  // For recency: lower is better (invert: 0 days = 5 score, 90+ days = 1 score)
  const recencyValues = customers.map(c => c.recency).sort((a, b) => a - b);
  const frequencyValues = customers.map(c => c.frequency).sort((a, b) => a - b);
  const monetaryValues = customers.map(c => c.monetary).sort((a, b) => a - b);

  // Score each customer and determine segment
  const customersWithRFM: CustomerRFM[] = customers.map(customer => {
    // Recency score: invert (lower days = higher score)
    const recencyScore = 6 - calculateQuintileScore(customer.recency, recencyValues);
    const frequencyScore = calculateQuintileScore(customer.frequency, frequencyValues);
    const monetaryScore = calculateQuintileScore(customer.monetary, monetaryValues);

    const rfmScore = `${recencyScore}${frequencyScore}${monetaryScore}`;
    const segment = determineSegment(rfmScore);

    return {
      ...customer,
      recencyScore,
      frequencyScore,
      monetaryScore,
      rfmScore,
      segment,
    };
  });

  // Sort by monetary value descending
  return customersWithRFM.sort((a, b) => b.monetary - a.monetary);
}

/**
 * Get aggregated statistics by customer segment
 * @returns Array of segment stats sorted by total revenue DESC
 */
export async function getCustomerSegmentStats(): Promise<CustomerSegmentStats[]> {
  const customers = await getRFMSegments();

  if (customers.length === 0) {
    return [];
  }

  // Group by segment
  const segmentMap = new Map<string, {
    count: number;
    totalRevenue: number;
    totalOrders: number;
  }>();

  for (const customer of customers) {
    const segment = customer.segment;
    const existing = segmentMap.get(segment);

    if (existing) {
      segmentMap.set(segment, {
        count: existing.count + 1,
        totalRevenue: existing.totalRevenue + customer.monetary,
        totalOrders: existing.totalOrders + customer.frequency,
      });
    } else {
      segmentMap.set(segment, {
        count: 1,
        totalRevenue: customer.monetary,
        totalOrders: customer.frequency,
      });
    }
  }

  const totalCustomers = customers.length;

  // Convert to array with calculated metrics
  const stats: CustomerSegmentStats[] = Array.from(segmentMap.entries()).map(
    ([segment, data]) => ({
      segment,
      count: data.count,
      percentage: (data.count / totalCustomers) * 100,
      totalRevenue: data.totalRevenue,
      avgOrderValue: Math.round(data.totalRevenue / data.totalOrders),
    })
  );

  // Sort by total revenue descending
  return stats.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

/**
 * Get top N customers by total revenue
 * @param limit - Number of top customers to return (default: 20)
 * @returns Array of top customers with RFM metrics
 */
export async function getTopCustomers(limit: number = 20): Promise<CustomerRFM[]> {
  const customers = await getRFMSegments();

  // Already sorted by monetary value DESC in getRFMSegments
  return customers.slice(0, limit);
}

/**
 * Format month number to French month label
 * @param month - YYYY-MM format
 * @returns French month label (e.g., "Janvier 2026")
 */
function formatMonthLabel(month: string): string {
  const [year, monthNum] = month.split('-');
  const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
  const formatter = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });
  const formatted = formatter.format(date);
  // Capitalize first letter
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Get cohort analysis by first purchase month
 * @returns Array of cohorts with retention metrics, sorted by cohortMonth DESC
 */
export async function getCohorts(): Promise<Cohort[]> {
  const supabase = createAdminClient();

  // Query all orders with email and created_at
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('user_email, total, created_at')
    .order('created_at', { ascending: true });

  if (ordersError) {
    console.error('getCohorts orders error:', ordersError.message);
    throw new Error(`Failed to fetch orders: ${ordersError.message}`);
  }

  if (!orders || orders.length === 0) {
    return [];
  }

  // Build customer first order map
  const customerFirstOrder = new Map<string, { date: Date; month: string; total: number }>();

  for (const order of orders) {
    const email = order.user_email;
    const orderDate = new Date(order.created_at);
    const month = orderDate.toISOString().substring(0, 7); // YYYY-MM

    if (!customerFirstOrder.has(email)) {
      customerFirstOrder.set(email, {
        date: orderDate,
        month,
        total: order.total,
      });
    }
  }

  // Build cohort map
  const cohortMap = new Map<string, {
    customers: Set<string>;
    firstOrderTotal: number;
    totalRevenue: number;
    customerOrders: Map<string, Set<string>>; // email → set of order months
  }>();

  // Initialize cohorts and track all orders
  for (const order of orders) {
    const email = order.user_email;
    const firstOrderData = customerFirstOrder.get(email);
    if (!firstOrderData) continue;

    const cohortMonth = firstOrderData.month;
    const orderDate = new Date(order.created_at);
    const orderMonth = orderDate.toISOString().substring(0, 7);

    if (!cohortMap.has(cohortMonth)) {
      cohortMap.set(cohortMonth, {
        customers: new Set(),
        firstOrderTotal: 0,
        totalRevenue: 0,
        customerOrders: new Map(),
      });
    }

    const cohort = cohortMap.get(cohortMonth)!;
    cohort.customers.add(email);
    cohort.totalRevenue += order.total;

    // Track customer's order months
    if (!cohort.customerOrders.has(email)) {
      cohort.customerOrders.set(email, new Set());
    }
    cohort.customerOrders.get(email)!.add(orderMonth);

    // Track first order total
    if (orderMonth === cohortMonth) {
      cohort.firstOrderTotal += order.total;
    }
  }

  // Calculate retention for each cohort
  const cohorts: Cohort[] = [];

  for (const [cohortMonth, data] of cohortMap.entries()) {
    const retention: Record<number, number> = {};
    const totalCustomers = data.customers.size;

    // Calculate retention for each month offset (0 to 12)
    for (let offset = 0; offset <= 12; offset++) {
      const cohortDate = new Date(cohortMonth + '-01');
      const targetMonth = new Date(cohortDate.getFullYear(), cohortDate.getMonth() + offset, 1)
        .toISOString()
        .substring(0, 7);

      let retainedCount = 0;
      for (const orderMonths of data.customerOrders.values()) {
        // Check if customer ordered in or before target month
        for (const orderMonth of orderMonths) {
          if (orderMonth <= targetMonth) {
            retainedCount++;
            break;
          }
        }
      }

      retention[offset] = totalCustomers > 0 ? Math.round((retainedCount / totalCustomers) * 100) : 0;
    }

    cohorts.push({
      cohortMonth,
      cohortLabel: formatMonthLabel(cohortMonth),
      customerCount: totalCustomers,
      firstOrderTotal: data.firstOrderTotal,
      totalRevenue: data.totalRevenue,
      retention,
    });
  }

  // Sort by cohortMonth DESC (newest first)
  return cohorts.sort((a, b) => b.cohortMonth.localeCompare(a.cohortMonth));
}

/**
 * Get customer lifetime value analysis
 * @param email - Optional email to filter specific customer
 * @returns Array of customers with LTV metrics, sorted by projectedLTV DESC
 */
export async function getCustomerLTV(email?: string): Promise<CustomerLTV[]> {
  const supabase = createAdminClient();

  // Query all orders
  let query = supabase
    .from('orders')
    .select('user_email, total, created_at')
    .order('created_at', { ascending: true });

  if (email) {
    query = query.eq('user_email', email);
  }

  const { data: orders, error: ordersError } = await query;

  if (ordersError) {
    console.error('getCustomerLTV orders error:', ordersError.message);
    throw new Error(`Failed to fetch orders: ${ordersError.message}`);
  }

  if (!orders || orders.length === 0) {
    return [];
  }

  // Get RFM segments for segment info
  const rfmSegments = await getRFMSegments();
  const segmentMap = new Map<string, string>();
  for (const customer of rfmSegments) {
    segmentMap.set(customer.email, customer.segment);
  }

  // Aggregate customer data
  const customerMap = new Map<string, {
    currentLTV: number;
    orderCount: number;
    firstOrderDate: Date;
  }>();

  for (const order of orders) {
    const customerEmail = order.user_email;
    const existing = customerMap.get(customerEmail);

    if (existing) {
      customerMap.set(customerEmail, {
        currentLTV: existing.currentLTV + order.total,
        orderCount: existing.orderCount + 1,
        firstOrderDate: existing.firstOrderDate,
      });
    } else {
      customerMap.set(customerEmail, {
        currentLTV: order.total,
        orderCount: 1,
        firstOrderDate: new Date(order.created_at),
      });
    }
  }

  // Calculate LTV metrics
  const now = new Date();
  const ltvData: CustomerLTV[] = [];

  for (const [customerEmail, data] of customerMap.entries()) {
    const daysSinceFirstOrder = Math.floor(
      (now.getTime() - data.firstOrderDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const avgOrderValue = Math.round(data.currentLTV / data.orderCount);

    // Calculate purchase frequency (orders per 90 days)
    // Exclude first order from frequency calculation
    let purchaseFrequency = 0;
    if (data.orderCount > 1 && daysSinceFirstOrder > 0) {
      purchaseFrequency = ((data.orderCount - 1) / daysSinceFirstOrder) * 90;
    }

    // Project future orders for next 90 days
    const expectedFutureOrders = Math.round(purchaseFrequency * 100) / 100; // Round to 2 decimals

    // Calculate projected LTV
    const projectedLTV = data.currentLTV + Math.round(expectedFutureOrders * avgOrderValue);

    ltvData.push({
      email: customerEmail,
      currentLTV: data.currentLTV,
      projectedLTV,
      orderCount: data.orderCount,
      avgOrderValue,
      daysSinceFirstOrder,
      purchaseFrequency: Math.round(purchaseFrequency * 100) / 100,
      expectedFutureOrders,
      segment: segmentMap.get(customerEmail) || 'Inactifs',
    });
  }

  // Sort by projected LTV DESC
  return ltvData.sort((a, b) => b.projectedLTV - a.projectedLTV);
}

/**
 * Get behavioral metrics showing customer journey conversion
 * @returns Behavioral metrics with conversion rates
 */
export async function getBehavioralMetrics(): Promise<BehavioralMetrics> {
  const supabase = createAdminClient();

  // Get total authenticated users (profiles)
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('email');

  if (profilesError) {
    console.error('getBehavioralMetrics profiles error:', profilesError.message);
    throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
  }

  const totalCustomers = profiles?.length || 0;

  // Get users with browse history
  const { data: browseHistory, error: browseError } = await supabase
    .from('browse_history')
    .select('user_id');

  const browserUserIds = new Set<string>();
  if (browseHistory && !browseError) {
    for (const entry of browseHistory) {
      browserUserIds.add(entry.user_id);
    }
  }

  // Get users with wishlist entries
  const { data: wishlist, error: wishlistError } = await supabase
    .from('wishlist')
    .select('user_id');

  const wishlisterUserIds = new Set<string>();
  if (wishlist && !wishlistError) {
    for (const entry of wishlist) {
      wishlisterUserIds.add(entry.user_id);
    }
  }

  // Get users with orders (need to map email to user_id from profiles)
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('user_email');

  const purchaserEmails = new Set<string>();
  if (orders && !ordersError) {
    for (const order of orders) {
      purchaserEmails.add(order.user_email);
    }
  }

  // Map emails to user IDs for purchasers
  const { data: profilesWithId, error: profilesWithIdError } = await supabase
    .from('profiles')
    .select('id, email');

  const emailToIdMap = new Map<string, string>();
  if (profilesWithId && !profilesWithIdError) {
    for (const profile of profilesWithId) {
      emailToIdMap.set(profile.email, profile.id);
    }
  }

  const purchaserUserIds = new Set<string>();
  for (const email of purchaserEmails) {
    const userId = emailToIdMap.get(email);
    if (userId) {
      purchaserUserIds.add(userId);
    }
  }

  // Calculate metrics
  const browsersOnly = browserUserIds.size - purchaserUserIds.size;
  const wishlisters = wishlisterUserIds.size;
  const purchasers = purchaserUserIds.size;

  // Browse-to-cart: users who browsed and added to wishlist (proxy for cart)
  let browseToCartCount = 0;
  for (const userId of browserUserIds) {
    if (wishlisterUserIds.has(userId)) {
      browseToCartCount++;
    }
  }
  const browseToCart = browserUserIds.size > 0
    ? Math.round((browseToCartCount / browserUserIds.size) * 100)
    : 0;

  // Wishlist-to-purchase: users who wishlisted and purchased
  let wishlistToPurchaseCount = 0;
  for (const userId of wishlisterUserIds) {
    if (purchaserUserIds.has(userId)) {
      wishlistToPurchaseCount++;
    }
  }
  const wishlistToPurchase = wishlisterUserIds.size > 0
    ? Math.round((wishlistToPurchaseCount / wishlisterUserIds.size) * 100)
    : 0;

  // Average days to purchase: avg(first_order_date - profile_created_at) for purchasers
  let totalDaysToPurchase = 0;
  let purchasersWithData = 0;

  // Get all orders with created_at for days-to-purchase calculation
  const { data: ordersWithDate, error: ordersWithDateError } = await supabase
    .from('orders')
    .select('user_email, created_at')
    .order('created_at', { ascending: true });

  if (ordersWithDate && !ordersWithDateError) {
    // Get first order per customer
    const firstOrderMap = new Map<string, Date>();
    for (const order of ordersWithDate) {
      const email = order.user_email;
      const orderDate = new Date(order.created_at);
      if (!firstOrderMap.has(email) || orderDate < firstOrderMap.get(email)!) {
        firstOrderMap.set(email, orderDate);
      }
    }

    // Calculate days to purchase
    const { data: profilesWithCreated } = await supabase
      .from('profiles')
      .select('email, created_at');

    if (profilesWithCreated) {
      for (const profile of profilesWithCreated) {
        const firstOrder = firstOrderMap.get(profile.email);
        if (firstOrder && profile.created_at) {
          const createdAt = new Date(profile.created_at);
          const days = Math.floor((firstOrder.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
          if (days >= 0) {
            totalDaysToPurchase += days;
            purchasersWithData++;
          }
        }
      }
    }
  }

  const avgDaysToPurchase = purchasersWithData > 0
    ? Math.round(totalDaysToPurchase / purchasersWithData)
    : 0;

  return {
    totalCustomers,
    browsersOnly: Math.max(0, browsersOnly),
    wishlisters,
    purchasers,
    browseToCart,
    wishlistToPurchase,
    avgDaysToPurchase,
  };
}
