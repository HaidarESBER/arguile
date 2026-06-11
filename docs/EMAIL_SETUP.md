# Email Workflow Setup Guide

This guide explains how to set up order confirmation emails using Resend.

## Overview

The email workflow automatically sends order confirmation emails to customers after they complete checkout. Emails include:
- Order number and confirmation
- Itemized order details
- Shipping address
- Total price breakdown
- Next steps information

## Setup Steps

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (allows 100 emails/day, 3,000/month)
3. Verify your email address

### 2. Get Your API Key

1. Log into your Resend dashboard
2. Navigate to **API Keys** section
3. Click **Create API Key**
4. Give it a name (e.g., "Nuage Production")
5. Copy the API key (starts with `re_`)

### 3. Add API Key to Environment

1. Open `.env.local` in the project root
2. Replace the placeholder with your actual API key:
   ```
   RESEND_API_KEY=re_your_actual_api_key_here
   ```
3. Save the file
4. Restart your Next.js development server

### 4. Verify Your Domain (Important for Production)

**For Development/Testing:**
- Resend allows you to send emails from `onboarding@resend.dev` without domain verification
- These emails will work but may end up in spam

**For Production:**
1. Go to **Domains** section in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `nuage.fr`)
4. Add the DNS records shown to your domain provider:
   - SPF record
   - DKIM records
5. Wait for DNS propagation (can take 24-48 hours)
6. Once verified, update the `from` address in `/src/app/api/send-order-email/route.ts`:
   ```typescript
   from: "Nuage <commandes@yourdomain.com>",
   ```

### 5. Test the Email Flow

1. Start your development server: `npm run dev`
2. Add a product to cart
3. Go through checkout with a real email address you can access
4. Complete the order
5. Check your inbox for the confirmation email

## Email Template Customization

The email template is located at `/src/emails/OrderConfirmationEmail.tsx`.

You can customize:
- **Brand colors**: Update the style constants at the bottom
- **Content**: Modify the text and sections
- **Logo**: Add an `<Img>` component with your logo URL
- **Layout**: Adjust the React Email components

Example to add a logo:
```tsx
<Img
  src="https://yourdomain.com/logo.png"
  width="150"
  height="50"
  alt="Nuage"
  style={{ margin: "0 auto" }}
/>
```

## Troubleshooting

### Emails Not Sending

1. **Check API key**: Make sure `RESEND_API_KEY` is set correctly in `.env.local`
2. **Restart server**: Changes to `.env.local` require server restart
3. **Check console**: Look for error messages in the browser console or terminal
4. **Verify email**: Make sure the customer email is valid

### Emails Going to Spam

1. **Verify domain**: Use a verified domain instead of `onboarding@resend.dev`
2. **Add SPF/DKIM**: Complete DNS setup in Resend dashboard
3. **Warm up domain**: Start with small volumes and gradually increase

### Rate Limits

Free tier limits:
- 100 emails per day
- 3,000 emails per month

For higher volumes, upgrade to a paid plan at [resend.com/pricing](https://resend.com/pricing).

## Future Enhancements

Consider adding:
- **Shipping confirmation emails** when order status changes to "shipped"
- **Delivery confirmation emails** when order is delivered
- **Order update emails** if status changes
- **Marketing emails** for promotions (requires separate consent)

## API Endpoint

The email sending API is located at:
```
POST /api/send-order-email
```

Body:
```json
{
  "order": {
    "orderNumber": "NU-2026-0001",
    "items": [...],
    "shippingAddress": {...},
    ...
  }
}
```

This endpoint is called automatically after checkout completion in `/src/app/commande/page.tsx`.

## Support

- **Resend Documentation**: [resend.com/docs](https://resend.com/docs)
- **React Email Components**: [react.email/docs](https://react.email/docs)
- **Resend Support**: support@resend.com
