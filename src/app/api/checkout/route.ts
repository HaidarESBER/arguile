import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createOrder } from '@/lib/orders'
import { getAllProducts } from '@/lib/products'
import { validatePromotion } from '@/lib/promotions'
import { calculateDiscount } from '@/types/promotion'
import { calculateShippingCost, ShippingMethod } from '@/lib/shipping'
import { getCountryByCode } from '@/data/countries'
import { OrderItem } from '@/types/order'
import {
  ShippingAddress,
  europeanCountries,
  EuropeanCountry,
} from '@/types/checkout'
import {
  checkRateLimit,
  getClientIp,
  getRateLimitMessage,
} from '@/lib/rate-limit'
import { devFixturesActive } from '@/data/dev-fixtures'
import { createDevOrder } from '@/lib/dev-orders'

interface CheckoutRequestBody {
  items: OrderItem[]
  shippingAddress: ShippingAddress
  /** Shipping method only — the cost is recomputed server-side */
  shippingMethod?: ShippingMethod
  notes?: string
  discountCode?: string
}

/** Maximum quantity per line item */
const MAX_QUANTITY_PER_ITEM = 50

// Shopper-visible API response messages
const STRINGS = {
  fr: {
    paymentUnavailable:
      'Le paiement est indisponible : configuration Stripe/Supabase manquante.',
    cartEmpty: 'Le panier est vide',
    shippingAddressRequired: "L'adresse de livraison est requise",
    invalidQuantity: (productName: string) =>
      `Quantité invalide pour ${productName}`,
    countryNotSupported: 'Pays de livraison non pris en charge',
    productNotFound: (productName: string) =>
      `Produit introuvable: ${productName}`,
    productOutOfStock: (name: string) => `Produit en rupture de stock: ${name}`,
    insufficientStock: (name: string, stockLevel: number) =>
      `Stock insuffisant pour ${name} (${stockLevel} disponible${stockLevel > 1 ? 's' : ''})`,
    promoUnavailableDemo: 'Les codes promo sont indisponibles en mode démo.',
    invalidPromoCode: 'Code promo invalide',
    couponError: 'Erreur lors de l’application du code promo. Veuillez réessayer.',
    sessionCreationError: 'Erreur lors de la creation de la session de paiement',
  },
  en: {
    paymentUnavailable:
      'Payment is unavailable: Stripe/Supabase configuration is missing.',
    cartEmpty: 'Your cart is empty',
    shippingAddressRequired: 'The shipping address is required',
    invalidQuantity: (productName: string) =>
      `Invalid quantity for ${productName}`,
    countryNotSupported: 'Shipping country not supported',
    productNotFound: (productName: string) =>
      `Product not found: ${productName}`,
    productOutOfStock: (name: string) => `Product out of stock: ${name}`,
    insufficientStock: (name: string, stockLevel: number) =>
      `Insufficient stock for ${name} (${stockLevel} available)`,
    promoUnavailableDemo: 'Promo codes are unavailable in demo mode.',
    invalidPromoCode: 'Invalid promo code',
    couponError: 'An error occurred while applying the promo code. Please try again.',
    sessionCreationError: 'An error occurred while creating the payment session',
  },
} as const

export async function POST(request: NextRequest) {
  const v = request.cookies.get('locale')?.value
  const locale = v === 'en' ? 'en' : 'fr'
  const t = STRINGS[locale]

  try {
    // Payments need real credentials: a Stripe key for the session and
    // Supabase for the order row. In dev fixture mode we run a MOCK checkout
    // instead (validated like the real one, order kept in memory, payment
    // skipped); outside dev, missing credentials is a hard 503.
    const paymentsConfigured =
      Boolean(process.env.STRIPE_SECRET_KEY) &&
      Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.SUPABASE_SERVICE_ROLE_KEY
      )
    const mockCheckout = !paymentsConfigured && devFixturesActive()
    if (!paymentsConfigured && !mockCheckout) {
      return NextResponse.json(
        {
          error: t.paymentUnavailable,
        },
        { status: 503 }
      )
    }

    // Stripe session creation costs money/API quota — limit per IP.
    const rate = checkRateLimit(`checkout:${getClientIp(request)}`, 10, 60_000)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: getRateLimitMessage(locale) },
        {
          status: 429,
          headers: { 'Retry-After': String(rate.retryAfterSeconds) },
        }
      )
    }

    const body: CheckoutRequestBody = await request.json()
    const { items, shippingAddress, shippingMethod, notes, discountCode } = body

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: t.cartEmpty },
        { status: 400 }
      )
    }

    if (!shippingAddress || !shippingAddress.email) {
      return NextResponse.json(
        { error: t.shippingAddressRequired },
        { status: 400 }
      )
    }

    // Validate quantities (integer, positive, capped)
    for (const item of items) {
      const q = item.quantity
      if (!Number.isInteger(q) || q <= 0 || q > MAX_QUANTITY_PER_ITEM) {
        return NextResponse.json(
          { error: t.invalidQuantity(item.productName) },
          { status: 400 }
        )
      }
    }

    // Security: shipping cost is NEVER taken from the client. Recompute it
    // from the shipping address country + method using the rates in code.
    const countryEntry =
      europeanCountries[shippingAddress.country as EuropeanCountry]
    const country = countryEntry ? getCountryByCode(countryEntry.code) : undefined
    if (!country) {
      return NextResponse.json(
        { error: t.countryNotSupported },
        { status: 400 }
      )
    }
    const method: ShippingMethod =
      shippingMethod === 'express' ? 'express' : 'standard'

    // Security: Look up product prices from DB (never trust client prices)
    const allProducts = await getAllProducts()
    const productMap = new Map(allProducts.map(p => [p.id, p]))

    // Verify all products exist, are in stock, and build DB-verified price map
    const dbPriceMap: Record<string, number> = {}
    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json(
          { error: t.productNotFound(item.productName) },
          { status: 400 }
        )
      }
      if (!product.inStock) {
        return NextResponse.json(
          { error: t.productOutOfStock(product.name) },
          { status: 400 }
        )
      }
      if (
        typeof product.stockLevel === 'number' &&
        item.quantity > product.stockLevel
      ) {
        return NextResponse.json(
          {
            error: t.insufficientStock(product.name, product.stockLevel),
          },
          { status: 400 }
        )
      }
      dbPriceMap[item.productId] = product.price
    }

    // Calculate subtotal from DB-verified prices
    const subtotal = items.reduce(
      (sum, item) => sum + dbPriceMap[item.productId] * item.quantity,
      0
    )

    // Shipping is recomputed server-side; free standard shipping (France)
    // kicks in from FREE_SHIPPING_THRESHOLD, based on the verified subtotal.
    const shippingRate = calculateShippingCost(country.region, method, subtotal)
    const shippingCost = shippingRate.cost

    // Server-side discount validation (NEVER trust client discount amount)
    let serverDiscountAmount = 0
    let validatedDiscountCode: string | undefined = undefined

    if (discountCode && mockCheckout) {
      // Promotion validation needs Supabase — not available in demo mode
      return NextResponse.json(
        { error: t.promoUnavailableDemo },
        { status: 400 }
      )
    }

    if (discountCode) {
      const validation = await validatePromotion(discountCode, subtotal)

      if (!validation.valid || !validation.promotion) {
        return NextResponse.json(
          { error: validation.error || t.invalidPromoCode },
          { status: 400 }
        )
      }

      serverDiscountAmount = calculateDiscount(subtotal, validation.promotion)
      validatedDiscountCode = validation.promotion.code
    }

    const total = subtotal - serverDiscountAmount + shippingCost

    // DEV MOCK CHECKOUT: same validations as above, but the order lives in
    // memory and payment is skipped — straight to the confirmation page.
    if (mockCheckout) {
      const devOrder = createDevOrder({
        items: items.map(item => ({
          ...item,
          price: dbPriceMap[item.productId],
        })),
        subtotal,
        shipping: shippingCost,
        total,
        shippingAddress,
        notes,
        status: 'confirmed',
      })
      return NextResponse.json({
        url: `/commande/confirmation/${devOrder.orderNumber}`,
        mock: true,
      })
    }

    // Create order in DB with pending_payment status
    const order = await createOrder({
      items: items.map(item => ({
        ...item,
        price: dbPriceMap[item.productId], // Use DB-verified price
      })),
      subtotal,
      shipping: shippingCost,
      total,
      shippingAddress,
      notes,
      discountCode: validatedDiscountCode,
      discountAmount: serverDiscountAmount > 0 ? serverDiscountAmount : undefined,
      status: 'pending_payment',
    })

    // Build Stripe line_items from order items
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const line_items = items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.productName,
          images: item.productImage
            ? [
                item.productImage.startsWith('http')
                  ? item.productImage
                  : `${siteUrl}${item.productImage}`,
              ]
            : [],
        },
        unit_amount: dbPriceMap[item.productId],
      },
      quantity: item.quantity,
    }))

    // Build Stripe session options (shipping cost computed server-side above)
    const sessionOptions: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      line_items,
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: shippingCost, currency: 'eur' },
            display_name:
              shippingCost > 0
                ? `Livraison ${shippingRate.carrier}`
                : 'Livraison gratuite',
          },
        },
      ],
      customer_email: shippingAddress.email,
      client_reference_id: order.id,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        ...(validatedDiscountCode ? { discountCode: validatedDiscountCode, discountAmount: String(serverDiscountAmount) } : {}),
      },
      locale: 'fr',
      success_url: `${siteUrl}/commande/confirmation/${order.orderNumber}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/panier`,
    }

    // Apply discount as a Stripe coupon if applicable
    if (serverDiscountAmount > 0 && validatedDiscountCode) {
      try {
        const coupon = await stripe.coupons.create({
          amount_off: serverDiscountAmount,
          currency: 'eur',
          duration: 'once',
          max_redemptions: 1,
          name: `Remise ${validatedDiscountCode}`,
          metadata: { orderId: order.id, orderNumber: order.orderNumber },
        })
        sessionOptions.discounts = [{ coupon: coupon.id }]
      } catch (couponError) {
        // Without the coupon the Stripe line items are full price: the
        // customer would be charged MORE than the order total they saw.
        // Abort instead of silently dropping the discount.
        console.error('Failed to create Stripe coupon, aborting checkout:', couponError)
        const { updateOrderStatus } = await import('@/lib/orders')
        try {
          await updateOrderStatus(order.id, 'cancelled')
        } catch {
          console.error('Failed to cancel order after coupon failure:', order.id)
        }
        return NextResponse.json(
          { error: t.couponError },
          { status: 500 }
        )
      }
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create(sessionOptions)

    // Update order with Stripe session ID via Supabase
    const { updateOrderStripeData } = await import('@/lib/orders')
    try {
      await updateOrderStripeData(order.id, { stripeSessionId: session.id })
    } catch {
      // Non-blocking: order was created, session works, just couldn't save session ID
      console.error('Failed to update order with Stripe session ID')
    }

    // NOTE: promotion usage is incremented in the Stripe webhook once the
    // payment succeeds (abandoned sessions must not burn limited-use codes).

    return NextResponse.json({
      url: session.url,
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: t.sessionCreationError },
      { status: 500 }
    )
  }
}
