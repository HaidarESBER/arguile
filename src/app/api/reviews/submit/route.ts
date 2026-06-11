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

/**
 * Validate that every image URL is https and hosted on the Supabase project
 * storage domain (derived from NEXT_PUBLIC_SUPABASE_URL). Prevents storing
 * arbitrary attacker-controlled URLs that would later be rendered on product
 * pages.
 */
function validateImages(images: unknown): { ok: boolean; error?: string } {
  if (images === undefined || images === null) return { ok: true };

  if (!Array.isArray(images) || images.length > MAX_IMAGES) {
    return {
      ok: false,
      error: `Maximum ${MAX_IMAGES} images autorisées`,
    };
  }

  let allowedHost: string;
  try {
    allowedHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).host;
  } catch {
    return { ok: false, error: "Configuration du stockage indisponible" };
  }

  for (const image of images) {
    if (typeof image !== "string" || image.length > 2048) {
      return { ok: false, error: "URL d'image invalide" };
    }
    let parsed: URL;
    try {
      parsed = new URL(image);
    } catch {
      return { ok: false, error: "URL d'image invalide" };
    }
    if (parsed.protocol !== "https:" || parsed.host !== allowedHost) {
      return { ok: false, error: "URL d'image non autorisée" };
    }
  }

  return { ok: true };
}

export async function POST(request: NextRequest) {
  try {
    // CSRF: reject cross-origin submissions
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    // Rate limit: 5 review submissions per minute per IP
    const rate = checkRateLimit(`reviews-submit:${getClientIp(request)}`, 5);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: RATE_LIMIT_MESSAGE },
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
        { error: "Tous les champs requis doivent être remplis" },
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
        { error: "La note doit être entre 1 et 5" },
        { status: 400 }
      );
    }

    if (typeof comment !== "string" || comment.trim().length < MIN_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: `Le commentaire doit contenir au moins ${MIN_COMMENT_LENGTH} caractères` },
        { status: 400 }
      );
    }

    if (comment.trim().length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: `Le commentaire ne peut pas dépasser ${MAX_COMMENT_LENGTH} caractères` },
        { status: 400 }
      );
    }

    if (typeof name !== "string" || name.trim().length === 0 || name.trim().length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Le nom doit contenir entre 1 et ${MAX_NAME_LENGTH} caractères` },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || email.trim().length > 254 || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    // Validate image URLs: https only, Supabase storage host only
    const imagesValidation = validateImages(images);
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
        { error: "Échec de la soumission de l'avis" },
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
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
