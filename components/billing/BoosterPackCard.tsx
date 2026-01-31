'use client'

import { useState } from 'react'
import { Zap, Check, Loader2, AlertCircle } from 'lucide-react'

interface BoosterPackCardProps {
  userId: string
  email: string
  currentUsage: number
  limit: number
  boosterCredits?: number
  showWhenNearLimit?: boolean // Only show when user is at 80%+ usage
  variant?: 'compact' | 'full' // compact for inline, full for billing page
}

export default function BoosterPackCard({
  userId,
  email,
  currentUsage,
  limit,
  boosterCredits = 0,
  showWhenNearLimit = false,
  variant = 'full',
}: BoosterPackCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const usagePercent = Math.round((currentUsage / limit) * 100)
  const effectiveLimit = limit + boosterCredits
  const isNearLimit = usagePercent >= 80
  const isAtLimit = currentUsage >= limit
  const isOverLimit = currentUsage >= effectiveLimit

  // Don't show if showWhenNearLimit is true and user is not near limit
  if (showWhenNearLimit && !isNearLimit) {
    return null
  }

  const handlePurchase = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/booster-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout')
      }

      // Redirect to Stripe checkout
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsLoading(false)
    }
  }

  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-full">
              <Zap className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-900">
                {isAtLimit ? 'Out of transcripts!' : 'Running low?'}
              </p>
              <p className="text-xs text-amber-700">
                +5 transcripts for $47
              </p>
            </div>
          </div>
          <button
            onClick={handlePurchase}
            disabled={isLoading}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Buy Now'
            )}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Transcript Booster Pack</h3>
            <p className="text-amber-100 text-sm">One-time purchase, use anytime this month</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Current status */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Your usage this month</span>
            <span className={`font-medium ${isAtLimit ? 'text-red-600' : 'text-gray-900'}`}>
              {currentUsage} / {effectiveLimit} transcripts
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isOverLimit
                  ? 'bg-red-500'
                  : isAtLimit
                  ? 'bg-amber-500'
                  : isNearLimit
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, (currentUsage / effectiveLimit) * 100)}%` }}
            />
          </div>
          {boosterCredits > 0 && (
            <p className="text-xs text-amber-600 mt-1">
              Includes +{boosterCredits} booster credits
            </p>
          )}
        </div>

        {/* Price and value */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold text-gray-900">$47</span>
          <span className="text-gray-500">one-time</span>
        </div>

        {/* What you get */}
        <ul className="space-y-2 mb-6">
          <li className="flex items-center gap-2 text-sm text-gray-700">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span><strong>+5 additional transcripts</strong> added to your limit</span>
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-700">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>Use anytime this billing cycle</span>
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-700">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>Stack multiple booster packs if needed</span>
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-700">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span>Credits don't expire until next billing cycle</span>
          </li>
        </ul>

        {/* CTA */}
        <button
          onClick={handlePurchase}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              <span>Buy Booster Pack</span>
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          </div>
        )}

        {/* Fine print */}
        <p className="mt-4 text-xs text-gray-500 text-center">
          Booster credits reset at your next billing cycle.
          Consider upgrading your plan for more monthly transcripts.
        </p>
      </div>
    </div>
  )
}
