/**
 * Global type declarations for analytics providers
 */

/** Event/config parameters accepted by third-party analytics providers */
type AnalyticsProviderParams = Record<string, unknown>;

interface Window {
  // Google Analytics 4
  gtag?: (
    command: 'config' | 'event' | 'js' | 'set',
    targetId: string | Date,
    config?: AnalyticsProviderParams
  ) => void;
  dataLayer?: unknown[];

  // TikTok Pixel
  ttq?: {
    track: (event: string, data?: AnalyticsProviderParams) => void;
    page: () => void;
    identify: (data: AnalyticsProviderParams) => void;
    _i?: Record<string, unknown>;
    _t?: Record<string, unknown>;
    _o?: Record<string, unknown>;
  };

  // Meta Pixel (Facebook)
  fbq?: (
    command: 'init' | 'track' | 'trackCustom',
    eventName: string,
    data?: AnalyticsProviderParams
  ) => void;
  _fbq?: unknown;

  // Microsoft Clarity
  clarity?: (
    command: 'set' | 'identify' | 'consent',
    ...args: (string | number | boolean)[]
  ) => void;
}
