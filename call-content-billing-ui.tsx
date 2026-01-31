// components/BillingDashboard.tsx
// Billing & usage dashboard for call-content subscription management

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUsageStats } from '@/lib/subscription-gate'
import { CreditCard, TrendingUp, Calendar, AlertCircle, Crown, Zap } from 'lucide-react'

interface PlanConfig {
  name: string
  price: number
  limit: number
  icon: any
  color: string
  features: string[]
}

const PLAN_CONFIGS: Record<string, PlanConfig> = {
  starter: {
    name: 'Starter',
    price: 97,
    limit: 20,
    icon: Zap,
    color: 'text-blue-500',
    features: ['20 transcripts/month', 'All content types', 'Email support'],
  },
  professional: {
    name: 'Professional',
    price: 197,
    limit: 50,
    icon: TrendingUp,
    color: 'text-purple-500',
    features: ['50 transcripts/month', 'Priority support', 'Custom templates'],
  },
  agency: {
    name: 'Agency',
    price: 497,
    limit: 150,
    icon: Crown,
    color: 'text-yellow-500',
    features: ['150 transcripts/month', 'Team collaboration', 'Dedicated manager'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 1200,
    limit: 999999,
    icon: Crown,
    color: 'text-red-500',
    features: ['Unlimited transcripts', 'Custom integrations', '24/7 support'],
  },
}

export default function BillingDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchUsageStats()
  }, [])

  const fetchUsageStats = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const data = await getUsageStats(user.id)
      setStats(data)
    }
    setLoading(false)
  }

  const handleUpgrade = async (tier: string) => {
    setCheckoutLoading(tier)

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })

      const { url, error } = await response.json()

      if (error) {
        alert(error)
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout')
    } finally {
      setCheckoutLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  const currentPlan = stats?.tier ? PLAN_CONFIGS[stats.tier] : null
  const percentUsed = stats?.percentUsed || 0
  const isNearLimit = percentUsed >= 80

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Current Plan Overview */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Billing & Usage</h1>
            <p className="text-gray-400">Manage your subscription and track usage</p>
          </div>
          {currentPlan && (
            <div className={`flex items-center gap-2 ${currentPlan.color}`}>
              <currentPlan.icon className="w-8 h-8" />
              <span className="text-2xl font-bold">{currentPlan.name}</span>
            </div>
          )}
        </div>

        {/* Usage Meter */}
        {stats && (
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Monthly Usage</h3>
                <p className="text-sm text-gray-400">
                  Resets on {stats.renewalDate ? new Date(stats.renewalDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">
                  {stats.used}
                  <span className="text-gray-400 text-lg">/{stats.limit}</span>
                </p>
                <p className="text-sm text-gray-400">{stats.remaining} remaining</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                  isNearLimit ? 'bg-red-500' : percentUsed >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentUsed, 100)}%` }}
              />
            </div>

            {isNearLimit && (
              <div className="mt-4 flex items-center gap-2 text-yellow-400 bg-yellow-900/30 border border-yellow-700 rounded-lg p-3">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">
                  You're running low on transcripts this month. Consider upgrading to avoid interruptions.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pricing Tiers */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(PLAN_CONFIGS).map(([tier, config]) => {
            const isCurrent = stats?.tier === tier
            const Icon = config.icon

            return (
              <div
                key={tier}
                className={`relative bg-gray-800 border rounded-xl p-6 transition-all ${
                  isCurrent
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Current Plan
                  </div>
                )}

                <div className={`flex items-center gap-2 mb-4 ${config.color}`}>
                  <Icon className="w-6 h-6" />
                  <h3 className="text-xl font-bold text-white">{config.name}</h3>
                </div>

                <div className="mb-4">
                  <p className="text-4xl font-bold text-white">
                    ${config.price}
                    <span className="text-gray-400 text-base font-normal">/mo</span>
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {config.limit === 999999 ? 'Unlimited' : config.limit} transcripts/month
                  </p>
                </div>

                <ul className="space-y-2 mb-6">
                  {config.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-green-500 mt-0.5">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(tier)}
                  disabled={isCurrent || checkoutLoading === tier}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    isCurrent
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {checkoutLoading === tier
                    ? 'Loading...'
                    : isCurrent
                    ? 'Current Plan'
                    : tier === 'enterprise'
                    ? 'Contact Sales'
                    : 'Upgrade'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Billing Info */}
      {stats?.tier && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-bold text-white">Billing Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Next Billing Date</p>
              <p className="text-lg font-medium text-white">
                {stats.renewalDate ? new Date(stats.renewalDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Payment Method</p>
              <p className="text-lg font-medium text-white">•••• •••• •••• 4242</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              Update Payment Method
            </button>
            <button className="px-4 py-2 bg-red-900/50 hover:bg-red-900/70 text-red-300 rounded-lg transition-colors">
              Cancel Subscription
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
