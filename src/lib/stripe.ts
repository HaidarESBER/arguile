import Stripe from 'stripe'

// Get Stripe secret key with fallback for build time
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ STRIPE_SECRET_KEY is not set. Stripe functionality will not work.');
}

export const stripe = new Stripe(stripeSecretKey || 'sk_test_placeholder', {
  typescript: true,
})
