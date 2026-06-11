import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import type { ReactNode } from "react";
import { SUPPORT_EMAIL } from "@/lib/support";

/**
 * Shared branded layout for every Nuage email.
 *
 * - Dark taupe header band with the logo (the cream logo needs a dark
 *   background) and gold tagline
 * - Cream page, white card, brand typography
 * - Consistent footer: support contact, sanitary notice, copyright and an
 *   optional unsubscribe link (required for marketing mail)
 *
 * The logo is referenced by absolute URL (emails cannot use relative paths):
 * it renders once the site is deployed and NEXT_PUBLIC_SITE_URL points to a
 * publicly reachable domain. The text wordmark below it guarantees the
 * header still reads correctly when images are blocked.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** Brand palette (mirrors src/app/globals.css) */
export const emailTheme = {
  gold: "#d4af37",
  goldDark: "#b8941f",
  taupe: "#2b251f",
  taupeSoft: "#3a342c",
  cream: "#f5f0e8",
  card: "#ffffff",
  text: "#3a342c",
  muted: "#8a7d6d",
  border: "#e9e0d2",
};

interface EmailLayoutProps {
  /** Inbox preview snippet */
  preview: string;
  children: ReactNode;
  /** Adds the legally required unsubscribe link (marketing emails) */
  unsubscribeUrl?: string;
}

export function EmailLayout({ preview, children, unsubscribeUrl }: EmailLayoutProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Brand header */}
          <Section style={header}>
            <Img
              src={`${SITE_URL}/logo.png`}
              alt="Nuage"
              height="52"
              style={logoImg}
            />
            <Text style={brandName}>NUAGE</Text>
            <Text style={tagline}>L&apos;art de la détente</Text>
          </Section>

          {/* Content card */}
          <Section style={card}>{children}</Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Des questions ? Répondez à cet email ou écrivez-nous à{" "}
              <Link href={`mailto:${SUPPORT_EMAIL}`} style={footerLink}>
                {SUPPORT_EMAIL}
              </Link>
            </Text>
            <Text style={footerLegal}>
              Fumer est dangereux pour la santé. Vente interdite aux mineurs.
            </Text>
            <Text style={footerLegal}>
              © {new Date().getFullYear()} Nuage. Tous droits réservés.
            </Text>
            {unsubscribeUrl && (
              <Text style={unsubscribeText}>
                <Link href={unsubscribeUrl} style={unsubscribeLink}>
                  Se désabonner
                </Link>
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ---------------------------------------------------------------------------
// Layout styles
// ---------------------------------------------------------------------------

const main = {
  backgroundColor: emailTheme.cream,
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
  padding: "24px 0",
};

const container = {
  margin: "0 auto",
  maxWidth: "600px",
};

const header = {
  backgroundColor: emailTheme.taupe,
  borderRadius: "12px 12px 0 0",
  padding: "28px 20px 22px",
  textAlign: "center" as const,
};

const logoImg = {
  margin: "0 auto 10px",
};

const brandName = {
  fontSize: "22px",
  fontWeight: "600",
  color: "#e8dfd5",
  letterSpacing: "0.35em",
  margin: "0 0 2px 0",
};

const tagline = {
  fontSize: "13px",
  color: emailTheme.gold,
  fontStyle: "italic",
  margin: "0",
};

const card = {
  backgroundColor: emailTheme.card,
  borderRadius: "0 0 12px 12px",
  border: `1px solid ${emailTheme.border}`,
  borderTop: "none",
  padding: "32px 28px",
};

const footer = {
  textAlign: "center" as const,
  padding: "24px 20px 0",
};

const footerText = {
  fontSize: "12px",
  color: emailTheme.muted,
  margin: "0 0 8px 0",
};

const footerLink = {
  color: emailTheme.goldDark,
  textDecoration: "underline",
};

const footerLegal = {
  fontSize: "11px",
  color: emailTheme.muted,
  margin: "0 0 4px 0",
};

const unsubscribeText = {
  fontSize: "11px",
  margin: "12px 0 0 0",
};

const unsubscribeLink = {
  color: emailTheme.muted,
  textDecoration: "underline",
};

// ---------------------------------------------------------------------------
// Shared content styles (imported by the templates)
// ---------------------------------------------------------------------------

export const h1 = {
  fontSize: "22px",
  fontWeight: "700",
  color: emailTheme.taupe,
  margin: "0 0 14px 0",
};

export const h2 = {
  fontSize: "16px",
  fontWeight: "700",
  color: emailTheme.taupe,
  margin: "0 0 10px 0",
};

export const text = {
  fontSize: "14px",
  lineHeight: "23px",
  color: emailTheme.text,
  margin: "0 0 12px 0",
};

export const mutedText = {
  fontSize: "13px",
  lineHeight: "21px",
  color: emailTheme.muted,
  margin: "0 0 10px 0",
};

export const section = {
  marginBottom: "8px",
};

export const hr = {
  borderColor: emailTheme.border,
  margin: "20px 0",
};

/** Gold pill highlighting key info (order number, promo code…) */
export const infoPill = {
  fontSize: "15px",
  color: emailTheme.taupe,
  margin: "0",
  padding: "12px 16px",
  backgroundColor: emailTheme.cream,
  border: `1px solid ${emailTheme.border}`,
  borderRadius: "10px",
  textAlign: "center" as const,
};

export const ctaSection = {
  textAlign: "center" as const,
  margin: "8px 0 4px",
};

/** Primary gold button — dark text on gold, like the site */
export const ctaButton = {
  backgroundColor: emailTheme.gold,
  color: emailTheme.taupe,
  fontSize: "15px",
  fontWeight: "700",
  padding: "13px 36px",
  borderRadius: "999px",
  textDecoration: "none",
  display: "inline-block",
};

export const itemText = {
  fontSize: "14px",
  lineHeight: "23px",
  color: emailTheme.text,
  margin: "0 0 6px 0",
};

export const totalRowText = {
  fontSize: "14px",
  color: emailTheme.muted,
  margin: "0 0 6px 0",
};

export const totalBoldText = {
  fontSize: "16px",
  fontWeight: "700",
  color: emailTheme.taupe,
  margin: "0",
};

export const addressText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: emailTheme.text,
  margin: "0",
};
