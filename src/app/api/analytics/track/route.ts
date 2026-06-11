import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Track analytics event to server-side database
 * POST /api/analytics/track
 * Body: { eventType: string, eventData: object, sessionId: string, url: string, referrer?: string }
 *
 * Fire-and-forget pattern: Silent failures, no blocking, always returns 200
 * Privacy-compliant: Respects DNT header, sanitizes PII from event_data
 * Rate limiting: keyed primarily by client IP (a client-supplied sessionId can
 * be rotated at will by an attacker), with sessionId as a secondary key.
 */

/**
 * Sanitize event data to remove PII
 */
function sanitizeEventData(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;

  const sanitized = { ...(data as Record<string, unknown>) };
  const piiFields = [
    "email",
    "phone",
    "firstName",
    "lastName",
    "address",
    "postalCode",
    "creditCard",
    "password",
  ];

  for (const field of piiFields) {
    if (field in sanitized) {
      delete sanitized[field];
    }
  }

  return sanitized;
}

export async function POST(request: NextRequest) {
  try {
    // Respect Do Not Track header
    const dnt = request.headers.get("dnt");
    if (dnt === "1") {
      // Return 200 but don't track
      return new NextResponse(null, { status: 200 });
    }

    // Parse request body
    const body = await request.json();
    const { eventType, eventData, sessionId, url, referrer } = body;

    // Validate required fields
    if (!eventType || !sessionId) {
      return new NextResponse(null, { status: 200 }); // Fire-and-forget: no error response
    }

    // Rate limiting: primary key = client IP (cannot be rotated like a
    // client-supplied sessionId), secondary key = sessionId.
    const ip = getClientIp(request);
    const ipLimit = checkRateLimit(`analytics:ip:${ip}`, 100);
    const sessionLimit = checkRateLimit(
      `analytics:session:${String(sessionId).substring(0, 64)}`,
      100
    );
    if (!ipLimit.allowed || !sessionLimit.allowed) {
      console.warn(`Analytics rate limit exceeded for IP ${ip}`);
      return new NextResponse(null, { status: 200 }); // Silent drop
    }

    // Sanitize event data to remove PII
    const sanitizedData = sanitizeEventData(eventData || {});

    // Get user ID if authenticated (optional)
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch {
      // User not authenticated or error - continue without user_id
    }

    // Extract user agent from request headers
    const userAgent = request.headers.get("user-agent") || null;

    // Insert event using admin client (bypasses RLS)
    // Note: Old events are automatically cleaned up by the /api/cron/cleanup-analytics job
    // which runs daily and removes events older than 90 days
    const adminClient = createAdminClient();
    await adminClient.from("analytics_events").insert({
      event_type: eventType,
      event_data: sanitizedData,
      session_id: sessionId,
      user_id: userId,
      url: url || null,
      referrer: referrer || null,
      user_agent: userAgent,
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    // Silent failure - log error but return 200 (never break client experience)
    console.error("Failed to track analytics event:", error);
    return new NextResponse(null, { status: 200 });
  }
}
