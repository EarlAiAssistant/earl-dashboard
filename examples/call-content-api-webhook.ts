// app/api/stripe-webhook/route.ts
// Stripe Webhook Handler for call-content subscription events

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Initialize Supabase with service role (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')!

    let event: Stripe.Event

    // Verify webhook signature
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id
  const tier = subscription.metadata.tier

  if (!userId) {
    console.error('No supabase_user_id in subscription metadata')
    return
  }

  const periodEnd = new Date(subscription.current_period_end * 1000)
  const periodStart = new Date(subscription.current_period_start * 1000)

  // Update user profile with subscription info
  const { error } = await supabase
    .from('profiles')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_tier: tier,
      subscription_period_end: periodEnd.toISOString(),
      subscription_period_start: periodStart.toISOString(),
      stripe_customer_id: subscription.customer as string,
      // Reset usage counter on new billing period
      transcripts_used_this_month: 0,
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user subscription:', error)
    throw error
  }

  console.log(`Subscription ${subscription.status} for user ${userId}, tier: ${tier}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id

  if (!userId) {
    console.error('No supabase_user_id in subscription metadata')
    return
  }

  // Update user profile to reflect canceled subscription
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'canceled',
      subscription_tier: null,
    })
    .eq('id', userId)

  if (error) {
    console.error('Error handling subscription deletion:', error)
    throw error
  }

  console.log(`Subscription canceled for user ${userId}`)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  
  if (!subscriptionId) return

  // Get subscription to find user
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata.supabase_user_id

  if (!userId) return

  // Reset monthly usage counter on successful payment
  const { error } = await supabase
    .from('profiles')
    .update({
      transcripts_used_this_month: 0,
      subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      subscription_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Error resetting usage counter:', error)
  }

  console.log(`Payment succeeded for user ${userId}, usage counter reset`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string
  
  if (!subscriptionId) return

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata.supabase_user_id

  if (!userId) return

  // Update subscription status to past_due
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'past_due',
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating failed payment status:', error)
  }

  console.log(`Payment failed for user ${userId}, marked as past_due`)
  
  // TODO: Send email notification to user about failed payment
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id

  if (!userId) {
    console.error('No supabase_user_id in checkout session metadata')
    return
  }

  // Get the subscription from the session
  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )
    await handleSubscriptionChange(subscription)
  }

  console.log(`Checkout completed for user ${userId}`)
}

// Disable body parsing for webhook
export const config = {
  api: {
    bodyParser: false,
  },
}
