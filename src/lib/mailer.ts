import "server-only";
import nodemailer, { Transporter } from "nodemailer";
import { render } from "@react-email/render";
import type { ReactElement } from "react";

/**
 * Mailer — single delivery point for every email the site sends.
 *
 * Transport priority:
 *   1. Brevo REST API   (BREVO_API_KEY, xkeysib-…) — preferred: serverless-
 *      friendly, no SMTP handshake, same infrastructure.
 *   2. SMTP relay       (SMTP_HOST/SMTP_USER/SMTP_PASSWORD) — fallback for
 *      any provider speaking SMTP.
 *
 * The sender (EMAIL_FROM) MUST be a validated sender in Brevo
 * (Senders & Domains), otherwise sends are rejected.
 */

const DEFAULT_FROM = process.env.EMAIL_FROM || "Nuage <commandes@nuage.fr>";
const MARKETING_FROM = process.env.EMAIL_FROM_MARKETING || DEFAULT_FROM;

export function getFromAddress(kind: "transactional" | "marketing"): string {
  return kind === "marketing" ? MARKETING_FROM : DEFAULT_FROM;
}

/** Parse `Name <email>` (or a bare address) into Brevo's sender shape. */
function parseAddress(address: string): { name?: string; email: string } {
  const match = address.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (match) {
    return { name: match[1] || undefined, email: match[2] };
  }
  return { email: address.trim() };
}

let cachedTransport: Transporter | null | undefined;

/** Lazy SMTP transport — null when SMTP is not configured. */
function getSmtpTransport(): Transporter | null {
  if (cachedTransport !== undefined) return cachedTransport;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    cachedTransport = null;
    return null;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  cachedTransport = nodemailer.createTransport({
    host,
    port,
    // 465 = implicit TLS; 587 = STARTTLS (secure:false + requireTLS)
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user, pass },
  });
  return cachedTransport;
}

export function isMailerConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY) || getSmtpTransport() !== null;
}

interface SendEmailOptions {
  from?: string;
  to: string | string[];
  subject: string;
  /** React Email template (rendered to HTML + plain text) */
  react?: ReactElement;
  /** Pre-built HTML body (used when no react template is given) */
  html?: string;
  replyTo?: string;
  /** Extra headers, e.g. List-Unsubscribe for marketing mail */
  headers?: Record<string, string>;
}

/**
 * Send an email through Brevo (API first, SMTP fallback).
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<{ success: boolean; error?: string }> {
  if (!isMailerConfigured()) {
    return {
      success: false,
      error: "Email service not configured (BREVO_API_KEY or SMTP_*)",
    };
  }

  try {
    let html = options.html;
    let text: string | undefined;
    if (options.react) {
      html = await render(options.react);
      text = await render(options.react, { plainText: true });
    }

    const from = options.from || DEFAULT_FROM;
    const toList = Array.isArray(options.to) ? options.to : [options.to];

    const apiKey = process.env.BREVO_API_KEY;
    if (apiKey) {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: parseAddress(from),
          to: toList.map((email) => ({ email })),
          subject: options.subject,
          htmlContent: html,
          textContent: text,
          ...(options.replyTo ? { replyTo: parseAddress(options.replyTo) } : {}),
          ...(options.headers ? { headers: options.headers } : {}),
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        console.error(`Brevo API send failed (${response.status}):`, body);
        return { success: false, error: `Brevo API ${response.status}: ${body.slice(0, 200)}` };
      }

      return { success: true };
    }

    // SMTP fallback
    const transport = getSmtpTransport();
    if (!transport) {
      return { success: false, error: "Email service not configured" };
    }

    await transport.sendMail({
      from,
      to: toList,
      subject: options.subject,
      html,
      text,
      replyTo: options.replyTo,
      headers: options.headers,
    });

    return { success: true };
  } catch (err) {
    console.error("Email send failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Email send failed",
    };
  }
}
