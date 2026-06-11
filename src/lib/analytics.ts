import { Product } from "@/types/product";

/**
 * Analytics wrapper - abstraction layer for tracking events
 *
 * For MVP: Console logging + localStorage event storage
 * Future: Easy swap to real analytics provider (GA4, Plausible, etc.)
 *
 * Privacy-compliant:
 * - No cookies set without consent (GDPR)
 * - Anonymous tracking (no PII)
 * - Respect Do Not Track header
 */

/** Arbitrary event payload tracked alongside an analytics event */
export type AnalyticsEventData = Record<string, unknown>;

// Type declarations for analytics providers on window
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    ttq?: {
      track: (eventName: string, data?: Record<string, unknown>) => void;
      page: () => void;
    };
    fbq?: (
      command: 'init' | 'track' | 'trackCustom',
      eventName: string,
      data?: Record<string, unknown>
    ) => void;
    clarity?: (
      command: 'set' | 'identify' | 'consent',
      ...args: (string | number | boolean)[]
    ) => void;
  }
}

interface AnalyticsEvent {
  type: string;
  timestamp: string;
  data: AnalyticsEventData;
}

const STORAGE_KEY = 'nuage_analytics_events';
const MAX_STORED_EVENTS = 100;
const SESSION_ID_KEY = 'nuage_session_id';

/**
 * Check if analytics should be disabled
 */
function isTrackingDisabled(): boolean {
  // Respect Do Not Track browser setting
  if (navigator.doNotTrack === '1') {
    return true;
  }

  // Disable in development (optional)
  if (process.env.NODE_ENV === 'development') {
    return false; // Set to true to disable in dev
  }

  return false;
}

/**
 * Get or create anonymous session ID
 * Stored in sessionStorage (resets on tab close, privacy-friendly)
 */
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';

  try {
    // Check for existing session ID
    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);

    if (!sessionId) {
      // Generate new session ID
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }

    return sessionId;
  } catch (error) {
    console.warn('Failed to get/create session ID:', error);
    return '';
  }
}

/**
 * Send event to server for persistence
 * Fire-and-forget: non-blocking, no error handling
 */
function sendToServer(eventType: string, eventData: AnalyticsEventData) {
  if (typeof window === 'undefined') return;

  try {
    const sessionId = getOrCreateSessionId();
    if (!sessionId) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Analytics: No session ID, skipping server tracking');
      }
      return;
    }

    const payload = {
      eventType,
      eventData,
      sessionId,
      url: window.location.href,
      referrer: document.referrer || undefined,
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('📤 Sending analytics event to server:', payload);
    }

    // Fire-and-forget POST request
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true, // Ensures event sent even on page unload
    }).then(response => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Analytics event sent, status:', response.status);
      }
    }).catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        // warn, not error: console.error feeds the dev-overlay issue badge
        console.warn('Analytics event failed:', error);
      }
      // Silent failure - tracking should never break UX
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Analytics sendToServer error:', error);
    }
    // Silent failure - tracking should never break UX
  }
}

/**
 * Store event in localStorage (for MVP, before real analytics)
 */
function storeEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const events: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];

    events.push(event);

    // Keep only recent events to avoid localStorage bloat
    if (events.length > MAX_STORED_EVENTS) {
      events.splice(0, events.length - MAX_STORED_EVENTS);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.warn('Failed to store analytics event:', error);
  }
}

/**
 * Log event to console in development
 */
function logEvent(eventType: string, data: AnalyticsEventData) {
  if (process.env.NODE_ENV === 'development') {
    console.group(`📊 Analytics: ${eventType}`);
    console.log('Data:', data);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  }
}

/**
 * Generic event tracking (exported for custom events)
 */
export function trackEvent(eventType: string, data: AnalyticsEventData = {}) {
  if (isTrackingDisabled()) return;

  const event: AnalyticsEvent = {
    type: eventType,
    timestamp: new Date().toISOString(),
    data,
  };

  logEvent(eventType, data);
  storeEvent(event);

  // Send to analytics providers if available
  if (typeof window !== 'undefined') {
    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', eventType, data);
    }

    // TikTok Pixel
    if (window.ttq) {
      window.ttq.track(eventType, data);
    }

    // Meta Pixel
    if (window.fbq) {
      window.fbq('trackCustom', eventType, data);
    }

    // Microsoft Clarity (auto-tracks events, but we can tag)
    if (window.clarity) {
      window.clarity('set', eventType, JSON.stringify(data));
    }

    // Send to server for persistence (Phase 20: Analytics Foundation)
    sendToServer(eventType, data);
  }
}

// ============================================================================
// Page Views
// ============================================================================

export function trackPageView(url: string) {
  trackEvent('page_view', { url });

  // Send page views to providers
  if (typeof window !== 'undefined') {
    // Google Analytics 4 - automatically tracks page views
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: url,
        page_location: window.location.href,
      });
    }

    // TikTok Pixel - uses page()
    if (window.ttq) {
      window.ttq.page();
    }

    // Meta Pixel - uses PageView
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }
}

// ============================================================================
// E-commerce Events
// ============================================================================

export function trackProductView(productId: string, productName: string, price: number) {
  trackEvent('product_view', {
    productId,
    productName,
    price: (price / 100).toFixed(2),
    currency: 'EUR',
  });
}

export function trackAddToCart(product: Product, quantity: number = 1) {
  const eventData = {
    productId: product.id,
    productName: product.name,
    price: (product.price / 100).toFixed(2),
    quantity,
    currency: 'EUR',
    value: ((product.price * quantity) / 100).toFixed(2),
  };

  // Track with standard event name
  trackEvent('add_to_cart', eventData);

  // Send to providers with their specific event names
  if (typeof window !== 'undefined') {
    // Google Analytics 4 - uses 'add_to_cart'
    if (window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'EUR',
        value: parseFloat(eventData.value),
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: parseFloat(eventData.price),
          quantity: quantity,
        }]
      });
    }

    // TikTok Pixel - uses 'AddToCart'
    if (window.ttq) {
      window.ttq.track('AddToCart', {
        content_id: product.id,
        content_name: product.name,
        content_type: 'product',
        quantity: quantity,
        price: parseFloat(eventData.price),
        value: parseFloat(eventData.value),
        currency: 'EUR',
      });
    }

    // Meta Pixel - uses 'AddToCart'
    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: parseFloat(eventData.value),
        currency: 'EUR',
      });
    }
  }
}

export function trackRemoveFromCart(productId: string, productName: string, quantity: number) {
  trackEvent('remove_from_cart', {
    productId,
    productName,
    quantity,
  });
}

export interface Order {
  id: string;
  items: Array<{ product: Product; quantity: number }>;
  total: number;
  shipping: number;
  discount?: number;
}

export function trackPurchase(order: Order) {
  const eventData = {
    orderId: order.id,
    revenue: (order.total / 100).toFixed(2),
    shipping: (order.shipping / 100).toFixed(2),
    discount: order.discount ? (order.discount / 100).toFixed(2) : '0.00',
    currency: 'EUR',
    items: order.items.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      price: (item.product.price / 100).toFixed(2),
      quantity: item.quantity,
    })),
  };

  // Track with standard event name
  trackEvent('purchase', eventData);

  // Send to providers with their specific event names
  if (typeof window !== 'undefined') {
    const revenue = parseFloat(eventData.revenue);

    // Google Analytics 4 - uses 'purchase'
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: order.id,
        value: revenue,
        shipping: parseFloat(eventData.shipping),
        currency: 'EUR',
        items: order.items.map(item => ({
          item_id: item.product.id,
          item_name: item.product.name,
          price: item.product.price / 100,
          quantity: item.quantity,
        }))
      });
    }

    // TikTok Pixel - uses 'CompletePayment'
    if (window.ttq) {
      window.ttq.track('CompletePayment', {
        content_type: 'product',
        quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
        value: revenue,
        currency: 'EUR',
        contents: order.items.map(item => ({
          content_id: item.product.id,
          content_name: item.product.name,
          quantity: item.quantity,
          price: item.product.price / 100,
        }))
      });
    }

    // Meta Pixel - uses 'Purchase'
    if (window.fbq) {
      window.fbq('track', 'Purchase', {
        value: revenue,
        currency: 'EUR',
        contents: order.items.map(item => ({
          id: item.product.id,
          quantity: item.quantity,
        })),
        content_type: 'product',
      });
    }
  }
}

export function trackCheckoutStep(step: number, stepName: string) {
  trackEvent('checkout_step', {
    step,
    stepName,
  });
}

// ============================================================================
// Engagement Events
// ============================================================================

export function trackSearch(query: string, resultsCount: number) {
  trackEvent('search', {
    query,
    resultsCount,
  });
}

export function trackFilterApplied(filterType: string, filterValue: string) {
  trackEvent('filter_applied', {
    filterType,
    filterValue,
  });
}

export function trackWishlistAdd(productId: string, productName?: string) {
  trackEvent('wishlist_add', {
    productId,
    productName: productName || productId,
  });
}

export function trackWishlistRemove(productId: string, productName?: string) {
  trackEvent('wishlist_remove', {
    productId,
    productName: productName || productId,
  });
}

export function trackComparison(productIds: string[]) {
  trackEvent('comparison_view', {
    productIds,
    count: productIds.length,
  });
}

export function trackExitIntentShown() {
  trackEvent('exit_intent_shown', {});
}

export function trackExitIntentConverted(discountCode: string) {
  trackEvent('exit_intent_converted', {
    discountCode,
  });
}

// ============================================================================
// Core Web Vitals
// ============================================================================

export interface WebVital {
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export function trackWebVital(metric: WebVital) {
  trackEvent('web_vital', {
    name: metric.name,
    value: Math.round(metric.value),
    rating: metric.rating,
    id: metric.id,
  });
}

// ============================================================================
// Performance Monitoring
// ============================================================================

export function trackRouteChange(from: string, to: string, duration: number) {
  trackEvent('route_change', {
    from,
    to,
    duration: Math.round(duration),
  });
}

export function trackApiResponse(endpoint: string, duration: number, success: boolean) {
  trackEvent('api_response', {
    endpoint,
    duration: Math.round(duration),
    success,
  });
}

// ============================================================================
// Helper: Get stored events (for debugging/export)
// ============================================================================

export function getStoredEvents(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to retrieve analytics events:', error);
    return [];
  }
}

export function clearStoredEvents() {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear analytics events:', error);
  }
}
