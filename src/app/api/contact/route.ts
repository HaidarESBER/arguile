import { NextRequest, NextResponse } from "next/server";
import { sendEmail, getFromAddress, isMailerConfigured } from "@/lib/mailer";
import { SUPPORT_EMAIL } from "@/lib/support";

/**
 * Contact form API route.
 *
 * - Validates name / email / subject / message (presence, lengths, email format)
 * - Simple in-memory per-IP cooldown: 1 message per minute
 * - Sends the message to the shop via the shared SMTP mailer (Brevo)
 *
 * Env vars:
 * - SMTP_* (see src/lib/mailer.ts): required to actually send emails
 * - CONTACT_EMAIL (optional): recipient address, defaults to SUPPORT_EMAIL
 */

const CONTACT_RECIPIENT = process.env.CONTACT_EMAIL || SUPPORT_EMAIL;

const COOLDOWN_MS = 60 * 1000; // 1 message par minute et par IP

// In-memory cooldown map (resets on server restart - acceptable for this use)
const lastSubmissionByIp = new Map<string, number>();

const SUBJECT_LABELS: Record<string, string> = {
  commande: "Question sur une commande",
  produit: "Question sur un produit",
  livraison: "Problème de livraison",
  retour: "Retour / Remboursement",
  autre: "Autre",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: NextRequest) {
  try {
    // --- Rate limiting (1 message / minute / IP) ---
    const ip = getClientIp(request);
    const now = Date.now();
    const last = lastSubmissionByIp.get(ip);
    if (last !== undefined && now - last < COOLDOWN_MS) {
      return NextResponse.json(
        {
          error:
            "Vous venez déjà d'envoyer un message. Merci de patienter une minute avant de réessayer.",
        },
        { status: 429 }
      );
    }

    // Opportunistic cleanup so the map doesn't grow unbounded
    if (lastSubmissionByIp.size > 1000) {
      for (const [key, timestamp] of lastSubmissionByIp) {
        if (now - timestamp > COOLDOWN_MS) {
          lastSubmissionByIp.delete(key);
        }
      }
    }

    // --- Parse and validate body ---
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Requête invalide." },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = (body ?? {}) as {
      name?: unknown;
      email?: unknown;
      subject?: unknown;
      message?: unknown;
    };

    if (typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Veuillez indiquer votre nom (2 caractères minimum)." },
        { status: 400 }
      );
    }
    if (name.trim().length > 100) {
      return NextResponse.json(
        { error: "Le nom ne peut pas dépasser 100 caractères." },
        { status: 400 }
      );
    }

    if (
      typeof email !== "string" ||
      email.trim().length > 254 ||
      !EMAIL_REGEX.test(email.trim())
    ) {
      return NextResponse.json(
        { error: "Veuillez indiquer une adresse email valide." },
        { status: 400 }
      );
    }

    if (typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json(
        { error: "Votre message doit contenir au moins 10 caractères." },
        { status: 400 }
      );
    }
    if (message.trim().length > 5000) {
      return NextResponse.json(
        { error: "Votre message ne peut pas dépasser 5000 caractères." },
        { status: 400 }
      );
    }

    const subjectKey =
      typeof subject === "string" && subject in SUBJECT_LABELS
        ? subject
        : "autre";
    const subjectLabel = SUBJECT_LABELS[subjectKey];

    // --- Send via the shared SMTP mailer (Brevo) ---
    if (!isMailerConfigured()) {
      console.error("Contact form: SMTP is not configured");
      return NextResponse.json(
        {
          error:
            `Le service d'envoi est momentanément indisponible. Merci de nous écrire directement à ${SUPPORT_EMAIL}.`,
        },
        { status: 503 }
      );
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanMessage = message.trim();

    const { success, error } = await sendEmail({
      from: getFromAddress("transactional"),
      to: CONTACT_RECIPIENT,
      replyTo: cleanEmail,
      subject: `[Contact] ${subjectLabel} — ${cleanName}`,
      html: `
        <h2>Nouveau message depuis le formulaire de contact</h2>
        <p><strong>Nom :</strong> ${escapeHtml(cleanName)}</p>
        <p><strong>Email :</strong> ${escapeHtml(cleanEmail)}</p>
        <p><strong>Sujet :</strong> ${escapeHtml(subjectLabel)}</p>
        <p><strong>Message :</strong></p>
        <p style="white-space:pre-wrap">${escapeHtml(cleanMessage)}</p>
      `,
    });

    if (!success) {
      console.error("Contact form: error sending email:", error);
      return NextResponse.json(
        {
          error:
            `L'envoi du message a échoué. Merci de réessayer ou de nous écrire à ${SUPPORT_EMAIL}.`,
        },
        { status: 502 }
      );
    }

    lastSubmissionByIp.set(ip, now);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form: unexpected error:", err);
    return NextResponse.json(
      { error: "Une erreur inattendue est survenue. Merci de réessayer." },
      { status: 500 }
    );
  }
}
