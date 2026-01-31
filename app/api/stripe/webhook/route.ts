import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export const dynamic = 'force-dynamic'

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 * 
 * Events handled:
 * - checkout.session.completed
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
    event = stripe.webhooks.constructEvent(
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
        const tier = session.metadata?.tier
        const customerId = session.customer as string

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
            })
            .eq('id', user.id)
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
            })
            .eq('id', user.id)
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
            })
            .eq('id', user.id)
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
        }
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Check if this is a booster pack purchase
        if (session.metadata?.type === 'booster_pack') {
          const userId = session.metadata.userId
          const credits = parseInt(session.metadata.credits || '5', 10)

          if (userId) {
            // Add credits to user's monthly limit (temporary boost for this billing cycle)
            const { data: user } = await supabase
              .from('users')
              .select('monthly_transcript_limit')
              .eq('id', userId)
              .single()

            if (user) {
              await supabase
                .from('users')
                .update({
                  monthly_transcript_limit: user.monthly_transcript_limit + credits,
                })
                .eq('id', userId)

              // Log the booster pack purchase
              await supabase
                .from('usage_log')
                .insert({
                  user_id: userId,
                  action_type: 'booster_pack_purchased',
                  metadata: {
                    credits,
                    price: session.amount_total ? session.amount_total / 100 : 47,
                    session_id: session.id,
                  },
                })
            }
          }
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
