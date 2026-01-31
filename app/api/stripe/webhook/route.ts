import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 * 
 * Events handled:
 * - checkout.session.completed (subscriptions + booster packs)
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 */
export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const customerId = session.customer as string

        // Handle booster pack purchase (one-time payment)
        if (session.metadata?.type === 'booster_pack') {
          const credits = parseInt(session.metadata.credits || '5', 10)

          if (userId) {
            // Get current user limits
            const { data: user } = await supabase
              .from('users')
              .select('monthly_transcript_limit, booster_credits')
              .eq('id', userId)
              .single()

            if (user) {
              // Add booster credits (separate from base limit)
              await supabase
                .from('users')
                .update({
                  booster_credits: (user.booster_credits || 0) + credits,
                })
                .eq('id', userId)

              // Log the booster pack purchase
              await supabase
                .from('usage_log')
                .insert({
                  user_id: userId,
                  action_type: 'booster_pack_purchased',
                  credits_added: credits,
                  amount_paid: session.amount_total ? session.amount_total / 100 : 47,
                  metadata: {
                    session_id: session.id,
                    payment_intent: session.payment_intent,
                  },
                })

              console.log(`✅ Booster pack: +${credits} credits for user ${userId}`)
            }
          }
        }
        // Handle subscription checkout
        else if (session.metadata?.tier) {
          const tier = session.metadata.tier

          if (userId && tier) {
            await supabase
              .from('users')
              .update({
                stripe_customer_id: customerId,
                subscription_tier: tier,
                subscription_status: 'trial',
                trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              })
              .eq('id', userId)

            console.log(`✅ Subscription: ${tier} tier for user ${userId}`)
          }
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const tier = subscription.metadata.tier
        const status = subscription.status

        // Get user by stripe_customer_id
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (user) {
          const monthlyLimit = tier === 'starter' ? 10 : tier === 'professional' ? 30 : 100

          await supabase
            .from('users')
            .update({
              subscription_tier: tier,
              subscription_status: status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              monthly_transcript_limit: monthlyLimit,
              // Reset booster credits at start of new billing period
              booster_credits: 0,
            })
            .eq('id', user.id)

          console.log(`✅ Subscription updated: ${tier} tier, ${status} status`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (user) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'canceled',
              monthly_transcript_limit: 0,
              booster_credits: 0,
            })
            .eq('id', user.id)

          console.log(`✅ Subscription canceled for user ${user.id}`)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (user) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'active',
              // Reset usage at billing renewal
              monthly_transcripts_used: 0,
              booster_credits: 0,
            })
            .eq('id', user.id)

          console.log(`✅ Payment succeeded, usage reset for user ${user.id}`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (user) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'past_due',
            })
            .eq('id', user.id)

          console.log(`⚠️ Payment failed for user ${user.id}`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
