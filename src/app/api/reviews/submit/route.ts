import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertSameOrigin } from "@/lib/security";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit";

const MAX_NAME_LENGTH = 100;
const MIN_COMMENT_LENGTH = 10;
const MAX_COMMENT_LENGTH = 1000;
const MAX_IMAGES = 5;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STRINGS = {
  fr: {
    rateLimited: RATE_LIMIT_MESSAGE,
    maxImages: (max: number) => `Maximum ${max} images autorisées`,
    storageUnavailable: "Configuration du stockage indisponible",
    invalidImageUrl: "URL d'image invalide",
    disallowedImageUrl: "URL d'image non autorisée",
    requiredFields: "Tous les champs requis doivent être remplis",
    ratingRange: "La note doit être entre 1 et 5",
    commentTooShort: (min: number) =>
      `Le commentaire doit contenir au moins ${min} caractères`,
    commentTooLong: (max: number) =>
      `Le commentaire ne peut pas dépasser ${max} caractères`,
    nameLength: (max: number) =>
      `Le nom doit contenir entre 1 et ${max} caractères`,
    invalidEmail: "Format d'email invalide",
    submitFailed: "Échec de la soumission de l'avis",
    serverError: "Erreur serveur",
  },
  en: {
    rateLimited: "Too many requests. Please try again in a few moments.",
    maxImages: (max: number) => `Maximum ${max} images allowed`,
    storageUnavailable: "Storage configuration unavailable",
    invalidImageUrl: "Invalid image URL",
    disallowedImageUrl: "Image URL not allowed",
    requiredFields: "All required fields must be filled in",
    ratingRange: "The rating must be between 1 and 5",
    commentTooShort: (min: number) =>
      `The comment must be at least ${min} characters long`,
    commentTooLong: (max: number) =>
      `The comment cannot exceed ${max} characters`,
    nameLength: (max: number) =>
      `The name must be between 1 and ${max} characters long`,
    invalidEmail: "Invalid email format",
    submitFailed: "Failed to submit the review",
    serverError: "Server error",
  },
} as const;

type Strings = (typeof STRINGS)[keyof typeof STRINGS];

/**
 * Validate that every image URL is https and hosted on the Supabase project
 * storage domain (derived from NEXT_PUBLIC_SUPABASE_URL). Prevents storing
 * arbitrary attacker-controlled URLs that would later be rendered on product
 * pages.
 */
function validateImages(images: unknown, t: Strings): { ok: boolean; error?: string } {
  if (images === undefined || images === null) return { ok: true };

  if (!Array.isArray(images) || images.length > MAX_IMAGES) {
    return {
      ok: false,
      error: t.maxImages(MAX_IMAGES),
    };
  }

  let allowedHost: string;
  try {
    allowedHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).host;
  } catch {
    return { ok: false, error: t.storageUnavailable };
  }

  for (const image of images) {
    if (typeof image !== "string" || image.length > 2048) {
      return { ok: false, error: t.invalidImageUrl };
    }
    let parsed: URL;
    try {
      parsed = new URL(image);
    } catch {
      return { ok: false, error: t.invalidImageUrl };
    }
    if (parsed.protocol !== "https:" || parsed.host !== allowedHost) {
      return { ok: false, error: t.disallowedImageUrl };
    }
  }

  return { ok: true };
}

export async function POST(request: NextRequest) {
  const v = request.cookies.get("locale")?.value;
  const locale = v === "en" ? "en" : "fr";
  const t = STRINGS[locale];

  try {
    // CSRF: reject cross-origin submissions
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    // Rate limit: 5 review submissions per minute per IP
    const rate = checkRateLimit(`reviews-submit:${getClientIp(request)}`, 5);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: t.rateLimited },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSeconds) },
        }
      );
    }

    const supabase = await createClient();
    const body = await request.json();

    const { productId, rating, comment, name, email, images } = body;

    // Validation
    if (!productId || !rating || !comment || !name || !email) {
      return NextResponse.json(
        { error: t.requiredFields },
        { status: 400 }
      );
    }

    if (
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        { error: t.ratingRange },
        { status: 400 }
      );
    }

    if (typeof comment !== "string" || comment.trim().length < MIN_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: t.commentTooShort(MIN_COMMENT_LENGTH) },
        { status: 400 }
      );
    }

    if (comment.trim().length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: t.commentTooLong(MAX_COMMENT_LENGTH) },
        { status: 400 }
      );
    }

    if (typeof name !== "string" || name.trim().length === 0 || name.trim().length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: t.nameLength(MAX_NAME_LENGTH) },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || email.trim().length > 254 || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: t.invalidEmail },
        { status: 400 }
      );
    }

    // Validate image URLs: https only, Supabase storage host only
    const imagesValidation = validateImages(images, t);
    if (!imagesValidation.ok) {
      return NextResponse.json(
        { error: imagesValidation.error },
        { status: 400 }
      );
    }

    // Get current user (optional - for logged-in users)
    const { data: { user } } = await supabase.auth.getUser();

    // Insert review with pending status
    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        product_id: productId,
        user_id: user?.id || null,
        rating,
        comment: comment.trim(),
        reviewer_name: name.trim(),
        reviewer_email: email.trim().toLowerCase(),
        images: images || [],
        status: "pending", // Will be reviewed by admin
        verified_purchase: false, // Can be updated by admin
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating review:", error);
      return NextResponse.json(
        { error: t.submitFailed },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("Error in review submission:", error);
    return NextResponse.json(
      { error: t.serverError },
      { status: 500 }
    );
  }
}
