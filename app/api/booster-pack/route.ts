import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const BOOSTER_PACK_PRICE = 47 // $47 for +5 transcripts
const BOOSTER_PACK_CREDITS = 5

/**
 * POST /api/booster-pack
 * Purchase one-time booster pack (+5 transcript credits)
 * 
 * Body:
 * {
 *   "userId": "uuid",
 *   "email": "user@example.com"
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, email } = body

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, email' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get or create customer
    let customerId: string
    const { data: user } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (user?.stripe_customer_id) {
      customerId = user.stripe_customer_id
    } else {
      const customer = await getStripe().customers.create({
        email,
        metadata: { userId },
      })
      customerId = customer.id

      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Create one-time payment session
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Transcript Booster Pack',
              description: '+5 additional transcripts this month',
            },
            unit_amount: BOOSTER_PACK_PRICE * 100, // $47.00
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?booster=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing`,
      metadata: {
        userId,
        type: 'booster_pack',
        credits: BOOSTER_PACK_CREDITS.toString(),
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      credits: BOOSTER_PACK_CREDITS,
      price: BOOSTER_PACK_PRICE,
    })
  } catch (error) {
    console.error('Booster pack checkout error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create checkout session',
      },
      { status: 500 }
    )
  }
}
