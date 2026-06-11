export interface BrowseHistoryEntry {
  id: string;
  userId: string;
  productId: string;
  viewedAt: string;
}

export interface CategoryAffinity {
  category: string;
  viewCount: number;
  wishlistCount: number;
  purchaseCount: number;
  score: number; // Weighted score based on signals
}

export interface PriceRangePreference {
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
}

// Known event_data fields read by the admin dashboard; events may carry
// additional arbitrary keys.
export interface ServerAnalyticsEventData {
  productId?: string;
  productName?: string;
  total?: number;
  query?: string;
  [key: string]: unknown;
}

// Server-side analytics event (matches analytics_events table schema)
export interface ServerAnalyticsEvent {
  id: string;
  event_type: string;
  event_data: ServerAnalyticsEventData;
  session_id: string;
  user_id: string | null;
  created_at: string;
  url: string | null;
  referrer: string | null;
  user_agent: string | null;
}

// Event tracking options for API payload
export interface EventTrackingOptions {
  eventType: string;
  eventData: Record<string, unknown>;
  sessionId: string;
  url: string;
  referrer?: string;
}
