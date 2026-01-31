import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

/**
 * Get the Stripe instance (lazy initialization)
 * This prevents build errors when STRIPE_SECRET_KEY isn't set
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    })
  }
  return stripeInstance
}
