"use client";

import { useReportWebVitals } from 'next/web-vitals';
import { trackWebVital, type WebVital } from '@/lib/analytics';

/**
 * WebVitalsReporter - Monitors Core Web Vitals and reports to analytics
 *
 * Tracks:
 * - LCP (Largest Contentful Paint): < 2.5s
 * - FID (First Input Delay): < 100ms
 * - CLS (Cumulative Layout Shift): < 0.1
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 * - INP (Interaction to Next Paint)
 *
 * In development: Logs to console
 * In production: Sends to analytics provider
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Map Next.js metric to our WebVital type
    const webVital: WebVital = {
      name: metric.name as WebVital['name'],
      value: metric.value,
      rating: metric.rating as WebVital['rating'],
      delta: metric.delta,
      id: metric.id,
    };

    trackWebVital(webVital);
  });

  return null;
}
