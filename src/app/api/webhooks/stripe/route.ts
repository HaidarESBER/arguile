import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOrderById } from '@/lib/orders'
import { getPromotionByCode, incrementPromotionUses } from '@/lib/promotions'
import { sendOrderConfirmationEmail, sendAbandonedCartEmail } from '@/lib/email'

/**
 * POST /api/webhooks/stripe
 *
 * Stripe webhook handler for payment lifecycle events.
 * Verifies webhook signature, handles checkout.session.completed
 * and checkout.session.expired events.
 *
 * Returns 500 on retryable processing failures so Stripe retries the
 * delivery. The idempotency check on order status makes retries safe.
 * Uses request.text() (not .json()) for signature verification.
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    // Misconfiguration, not a bad request: without the secret every event
    // would 400 as "Invalid signature", which hides the real problem.
    console.error('Webhook: STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    )
  }

  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.client_reference_id

        if (!orderId) {
          console.error('Webhook: No client_reference_id in session', session.id)
          return NextResponse.json({ received: true })
        }

        // Only process if payment is complete
        if (session.payment_status !== 'paid') {
          console.log('Webhook: Payment not yet paid for session', session.id)
          return NextResponse.json({ received: true })
        }

        const supabase = createAdminClient()

        // Idempotency check: skip if already confirmed or beyond
        const { data: existingOrder, error: fetchError } = await supabase
          .from('orders')
          .select('status')
          .eq('id', orderId)
          .single()

        if (fetchError || !existingOrder) {
          console.error('Webhook: Order not found:', orderId, fetchError)
          // Retryable: the order may not be visible yet (transient DB issue)
          return NextResponse.json(
            { error: 'Order not found' },
            { status: 500 }
          )
        }

        const completedStatuses = ['confirmed', 'processing', 'shipped', 'delivered', 'refunded']
        if (completedStatuses.includes(existingOrder.status)) {
          console.log('Webhook: Order already processed, skipping:', orderId)
          return NextResponse.json({ received: true })
        }

        // Update order to confirmed with Stripe payment intent ID.
        // The status filter makes this atomic: of two concurrent deliveries
        // of the same event, only one flips the row and runs fulfillment
        // (stock, promotion usage, email) — the other matches zero rows.
        const { data: updatedRows, error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'confirmed',
            stripe_payment_intent_id: session.payment_intent as string,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId)
          .eq('status', existingOrder.status)
          .select('id')

        if (updateError) {
          console.error('Webhook: Failed to update order:', updateError)
          // Retryable: order is still pending_payment, Stripe will retry
          return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
          )
        }

        if (!updatedRows || updatedRows.length === 0) {
          // A concurrent delivery won the race and is handling fulfillment
          console.log('Webhook: Order updated concurrently, skipping:', orderId)
          return NextResponse.json({ received: true })
        }

        console.log('Webhook: Order confirmed:', orderId)

        // Everything below runs at most once thanks to the idempotency check
        // above (the order is now confirmed). Failures here are logged but
        // return 200: a Stripe retry would be skipped anyway.
        const order = await getOrderById(orderId)

        if (order) {
          // Decrement stock atomically (guarded SQL function, never below 0)
          for (const item of order.items) {
            const { data: decremented, error: stockError } = await supabase.rpc(
              'decrement_product_stock',
              { p_product_id: item.productId, p_quantity: item.quantity }
            )
            if (stockError) {
              console.error(
                'Webhook: Failed to decrement stock for product',
                item.productId,
                stockError
              )
            } else if (decremented === false) {
              console.warn(
                'Webhook: Stock not decremented (insufficient or untracked) for product',
                item.productId
              )
            }
          }

          // Count promotion usage now that the payment succeeded
          if (order.discountCode) {
            try {
              const promotion = await getPromotionByCode(order.discountCode)
              if (promotion) {
                await incrementPromotionUses(promotion.id)
              }
            } catch (promoError) {
              console.error('Webhook: Failed to increment promotion uses:', promoError)
            }
          }

          // Send confirmation email directly (no HTTP round-trip — the
          // /api/send-order-email route is admin-protected by middleware)
          const emailResult = await sendOrderConfirmationEmail(order)
          if (!emailResult.success) {
            console.error(
              'Webhook: Failed to send confirmation email:',
              emailResult.error
            )
          }
        } else {
          console.error('Webhook: Could not load confirmed order:', orderId)
        }

        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.client_reference_id

        if (!orderId) {
          console.log('Webhook: No client_reference_id in expired session', session.id)
          return NextResponse.json({ received: true })
        }

        const supabase = createAdminClient()

        // Only cancel if still pending_payment
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('status')
          .eq('id', orderId)
          .single()

        if (existingOrder && existingOrder.status === 'pending_payment') {
          await supabase
            .from('orders')
            .update({
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)

          console.log('Webhook: Expired session, order cancelled:', orderId)

          // Send abandoned cart recovery email
          const order = await getOrderById(orderId)

          if (order && order.shippingAddress?.email) {
            sendAbandonedCartEmail(order).catch((err: unknown) =>
              console.error('Failed to send abandoned cart email:', err)
            )
          }
        }

        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge

        // Partial refunds need a human decision — flag them, don't flip status
        if (!charge.refunded) {
          console.warn(
            'Webhook: Partial refund on charge',
            charge.id,
            '— order status left unchanged, handle in admin'
          )
          break
        }

        const paymentIntentId =
          typeof charge.payment_intent === 'string'
            ? charge.payment_intent
            : charge.payment_intent?.id

        if (!paymentIntentId) {
          console.error('Webhook: Refunded charge has no payment intent:', charge.id)
          break
        }

        const supabase = createAdminClient()
        const { data: refundedRows, error: refundError } = await supabase
          .from('orders')
          .update({ status: 'refunded', updated_at: new Date().toISOString() })
          .eq('stripe_payment_intent_id', paymentIntentId)
          .select('id, order_number')

        if (refundError) {
          console.error('Webhook: Failed to mark order refunded:', refundError)
          return NextResponse.json(
            { error: 'Failed to mark order refunded' },
            { status: 500 }
          )
        }
        if (!refundedRows || refundedRows.length === 0) {
          console.error(
            'Webhook: No order found for refunded payment intent:',
            paymentIntentId
          )
        } else {
          console.log(
            'Webhook: Order marked refunded:',
            refundedRows.map(r => r.order_number).join(', ')
          )
        }
        break
      }

      case 'charge.dispute.created': {
        // Disputes need evidence before a deadline — surface them loudly so
        // they show up in error monitoring, but leave the order status to a
        // human (the funds are withheld by Stripe either way).
        const dispute = event.data.object as Stripe.Dispute
        const paymentIntentId =
          typeof dispute.payment_intent === 'string'
            ? dispute.payment_intent
            : dispute.payment_intent?.id
        console.error(
          'Webhook: DISPUTE OPENED — payment intent:',
          paymentIntentId,
          'amount:',
          dispute.amount,
          'reason:',
          dispute.reason,
          '— respond before the evidence deadline in the Stripe dashboard'
        )
        break
      }

      default:
        console.log('Webhook: Unhandled event type:', event.type)
    }
  } catch (error) {
    // Return 500 so Stripe retries; the idempotency check above makes
    // retries safe for checkout.session.completed.
    console.error('Webhook: Error processing event:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}
