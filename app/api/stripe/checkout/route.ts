import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export const dynamic = 'force-dynamic'

const PRICING_TIERS = {
  starter: {
    priceId: process.env.STRIPE_PRICE_STARTER!,
    limit: 10,
  },
  professional: {
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL!,
    limit: 30,
  },
  agency: {
    priceId: process.env.STRIPE_PRICE_AGENCY!,
    limit: 100,
  },
}

/**
 * POST /api/stripe/checkout
 * Create Stripe checkout session
 * 
 * Body:
 * {
 *   "tier": "starter" | "professional" | "agency",
 *   "userId": "uuid",
 *   "email": "user@example.com"
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tier, userId, email } = body

    if (!tier || !userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: tier, userId, email' },
        { status: 400 }
      )
    }

    if (!PRICING_TIERS[tier as keyof typeof PRICING_TIERS]) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be: starter, professional, or agency' },
        { status: 400 }
      )
    }

    const priceConfig = PRICING_TIERS[tier as keyof typeof PRICING_TIERS]

    // Create or retrieve customer
    let customer: Stripe.Customer
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
        },
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
      metadata: {
        userId,
        tier,
        limit: priceConfig.limit.toString(),
      },
      subscription_data: {
        metadata: {
          userId,
          tier,
        },
        trial_period_days: 14, // 14-day trial
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create checkout session',
      },
      { status: 500 }
    )
  }
}
