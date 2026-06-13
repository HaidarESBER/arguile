import type { NextRequest } from "next/server";

/**
 * In-memory sliding-window rate limiter keyed by an arbitrary string
 * (typically the client IP).
 *
 * IMPORTANT — serverless caveat:
 * This limiter keeps its state in the memory of the current server instance.
 * On serverless platforms (Vercel, AWS Lambda...) each instance has its own
 * memory, instances are recycled frequently, and concurrent requests may hit
 * different instances. The limit is therefore BEST-EFFORT: it stops naive
 * floods and brute-force from a single client, but it is not a hard global
 * guarantee. For production-grade rate limiting, move this to a shared store
 * such as Upstash Redis (@upstash/ratelimit) or Vercel KV — the call sites
 * only use `checkRateLimit()`, so swapping the backend is a one-file change.
 */

interface RateLimitResult {
  /** True when the request is allowed, false when the limit is exceeded. */
  allowed: boolean;
  /** Seconds the client should wait before retrying (0 when allowed). */
  retryAfterSeconds: number;
  /** Requests remaining in the current window (0 when blocked). */
  remaining: number;
}

/** Map of key -> sorted list of request timestamps (ms) inside the window. */
const buckets = new Map<string, number[]>();

/** Hard cap on tracked keys to bound memory usage on long-lived instances. */
const MAX_TRACKED_KEYS = 10_000;

let lastSweep = Date.now();
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;

/** Remove buckets whose entries are all older than their window. */
function sweep(now: number, windowMs: number): void {
  if (now - lastSweep < SWEEP_INTERVAL_MS && buckets.size < MAX_TRACKED_KEYS) {
    return;
  }
  lastSweep = now;
  for (const [key, timestamps] of buckets) {
    const fresh = timestamps.filter((t) => now - t < windowMs);
    if (fresh.length === 0) {
      buckets.delete(key);
    } else {
      buckets.set(key, fresh);
    }
  }
  // Worst case (flood of unique keys): drop oldest entries wholesale.
  if (buckets.size >= MAX_TRACKED_KEYS) {
    const toDelete = Math.floor(MAX_TRACKED_KEYS / 2);
    let deleted = 0;
    for (const key of buckets.keys()) {
      if (deleted >= toDelete) break;
      buckets.delete(key);
      deleted++;
    }
  }
}

/**
 * Sliding-window rate limit check.
 *
 * @param key       Unique identifier for the client/route, e.g. `login:1.2.3.4`.
 * @param limit     Maximum number of requests allowed inside the window.
 * @param windowMs  Window size in milliseconds (default: 60 000 = 1 minute).
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number = 60_000
): RateLimitResult {
  const now = Date.now();
  sweep(now, windowMs);

  const timestamps = (buckets.get(key) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    buckets.set(key, timestamps);
    const oldest = timestamps[0];
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((oldest + windowMs - now) / 1000)
    );
    return { allowed: false, retryAfterSeconds, remaining: 0 };
  }

  timestamps.push(now);
  buckets.set(key, timestamps);
  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: limit - timestamps.length,
  };
}

/**
 * Extract the client IP from proxy headers.
 * Vercel/most reverse proxies set `x-forwarded-for` (client IP first)
 * and/or `x-real-ip`. Falls back to "unknown" so callers always get a key
 * (all unknown clients then share one bucket, which fails safe).
 */
export function getClientIp(request: NextRequest | Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

/**
 * Standard 429 payload, shared by all rate-limited routes, per locale.
 * The French value must stay identical to the historical message.
 */
export const RATE_LIMIT_MESSAGES = {
  fr: "Trop de requêtes. Veuillez réessayer dans quelques instants.",
  en: "Too many requests. Please try again in a few moments.",
} as const;

/**
 * Standard French 429 payload, shared by all rate-limited routes.
 * Kept for callers that build their own per-locale string maps.
 */
export const RATE_LIMIT_MESSAGE = RATE_LIMIT_MESSAGES.fr;

/**
 * Localized 429 message for a given locale (default "fr").
 * @param locale - Locale for the shopper-facing message
 */
export function getRateLimitMessage(locale: "fr" | "en" = "fr"): string {
  return RATE_LIMIT_MESSAGES[locale];
}
