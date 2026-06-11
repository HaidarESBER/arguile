/**
 * Single source of truth for the customer-support email address.
 *
 * TEMPORARY: routed to a personal Gmail until the shop's own domain
 * mailboxes (support@/contact@...) exist. Change it HERE only — every
 * mailto: link, chatbot fallback message and email-template footer
 * imports this constant.
 *
 * Safe to import from client and server components (plain constant).
 */
export const SUPPORT_EMAIL = "haidarchreif@gmail.com";
