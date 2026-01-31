'use client'

import { useState, useEffect } from 'react'
import { CreditCard, TrendingUp, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react'
import BoosterPackCard from '@/components/billing/BoosterPackCard'

interface BillingData {
  tier: 'starter' | 'professional' | 'agency'
  status: 'trial' | 'active' | 'past_due' | 'canceled'
  transcriptsUsed: number
  transcriptLimit: number
  boosterCredits: number
  currentPeriodEnd: string
  trialEndsAt?: string
  userId: string
  email: string
}

export default function BillingPage() {
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch actual billing data from API
    // For now, mock data
    setBillingData({
      tier: 'professional',
      status: 'trial',
      transcriptsUsed: 25,
      transcriptLimit: 30,
      boosterCredits: 0,
      currentPeriodEnd: '2026-02-14T00:00:00Z',
      trialEndsAt: '2026-02-14T00:00:00Z',
      userId: 'mock-user-id',
      email: 'user@example.com',
    })
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!billingData) {
    return <div>Error loading billing data</div>
  }

  const effectiveLimit = billingData.transcriptLimit + billingData.boosterCredits
  const usagePercent = (billingData.transcriptsUsed / effectiveLimit) * 100
  const daysLeft = billingData.trialEndsAt
    ? Math.ceil((new Date(billingData.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  const plans = [
    {
      name: 'Starter',
      price: 27,
      limit: 10,
      features: ['10 transcripts/month', 'All templates', 'Email support'],
    },
    {
      name: 'Professional',
      price: 67,
      limit: 30,
      features: ['30 transcripts/month', 'Custom templates', 'Priority support', 'Zapier integration'],
      popular: true,
    },
    {
      name: 'Agency',
      price: 197,
      limit: 100,
      features: ['100 transcripts/month', 'API access', 'White-label', 'Team collaboration', 'Phone support'],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Billing & Usage</h1>

        {/* Current Plan Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {billingData.tier} Plan
              </h2>
              <p className="text-gray-600 mt-1">
                {billingData.status === 'trial' && `${daysLeft} days left in trial`}
                {billingData.status === 'active' && 'Active subscription'}
                {billingData.status === 'past_due' && 'Payment failed'}
                {billingData.status === 'canceled' && 'Subscription canceled'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {billingData.status === 'trial' && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Trial
                </span>
              )}
              {billingData.status === 'active' && (
                <CheckCircle className="text-green-600" size={32} />
              )}
              {billingData.status === 'past_due' && (
                <AlertTriangle className="text-red-600" size={32} />
              )}
            </div>
          </div>

          {/* Usage Meter */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Transcripts Used This Month
              </span>
              <span className="text-sm font-bold text-gray-900">
                {billingData.transcriptsUsed} / {billingData.transcriptLimit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  usagePercent >= 90
                    ? 'bg-red-600'
                    : usagePercent >= 80
                    ? 'bg-yellow-500'
                    : 'bg-green-600'
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              ></div>
            </div>
            {usagePercent >= 80 && (
              <p className="text-sm text-yellow-700 mt-2 flex items-center gap-1">
                <AlertTriangle size={16} />
                You're at {Math.round(usagePercent)}% of your monthly limit
              </p>
            )}
            {billingData.boosterCredits > 0 && (
              <p className="text-sm text-amber-600 mt-1">
                Includes +{billingData.boosterCredits} booster credits
              </p>
            )}
          </div>

          {/* Next Billing Date */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              {billingData.status === 'trial' ? 'Trial ends' : 'Next billing date'}
            </span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(billingData.currentPeriodEnd).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Booster Pack Card - shown when near limit */}
        {usagePercent >= 60 && (
          <div className="mb-8">
            <BoosterPackCard
              userId={billingData.userId}
              email={billingData.email}
              currentUsage={billingData.transcriptsUsed}
              limit={billingData.transcriptLimit}
              boosterCredits={billingData.boosterCredits}
              variant="full"
            />
          </div>
        )}

        {/* Upgrade CTA (if on trial or lower tier) */}
        {billingData.status === 'trial' && (
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Upgrade to Continue Using Call-Content</h3>
                <p className="text-blue-100">
                  Your trial ends in {daysLeft} days. Upgrade now and save 30% with code TRIAL30
                </p>
              </div>
              <button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
                Upgrade Now <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Plan Comparison */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Compare Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-lg shadow-md p-6 relative ${
                plan.popular ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  billingData.tier.toLowerCase() === plan.name.toLowerCase()
                    ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
                disabled={billingData.tier.toLowerCase() === plan.name.toLowerCase()}
              >
                {billingData.tier.toLowerCase() === plan.name.toLowerCase()
                  ? 'Current Plan'
                  : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard size={24} />
            Payment Method
          </h2>
          {billingData.status === 'trial' ? (
            <p className="text-gray-600">
              No payment method on file. Add a card to continue after your trial ends.
            </p>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-600">VISA</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                  <p className="text-sm text-gray-600">Expires 12/2027</p>
                </div>
              </div>
              <button className="text-blue-600 hover:underline font-medium">
                Update
              </button>
            </div>
          )}
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={24} />
            Billing History
          </h2>
          <div className="space-y-4">
            {billingData.status === 'trial' ? (
              <p className="text-gray-600">No billing history yet</p>
            ) : (
              <>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Professional Plan</p>
                    <p className="text-sm text-gray-600">Jan 1, 2026</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">$67.00</p>
                    <span className="text-sm text-green-600">Paid</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
