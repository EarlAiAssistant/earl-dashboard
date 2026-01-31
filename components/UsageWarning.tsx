'use client'

import { AlertTriangle, Zap, ArrowRight } from 'lucide-react'
import { useState } from 'react'

interface UsageWarningProps {
  transcriptsUsed: number
  transcriptLimit: number
  inGracePeriod: boolean
  graceRemaining: number
  tier: string
}

export default function UsageWarning({
  transcriptsUsed,
  transcriptLimit,
  inGracePeriod,
  graceRemaining,
  tier,
}: UsageWarningProps) {
  const [purchasingBooster, setPurchasingBooster] = useState(false)

  const usagePercent = (transcriptsUsed / transcriptLimit) * 100

  // Don't show warning if usage is below 80%
  if (usagePercent < 80 && !inGracePeriod) {
    return null
  }

  const handlePurchaseBooster = async () => {
    setPurchasingBooster(true)
    
    try {
      // TODO: Get userId and email from auth context
      const response = await fetch('/api/booster-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-id-here', // Replace with actual user ID
          email: 'user@example.com', // Replace with actual email
        }),
      })

      const data = await response.json()

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Booster pack purchase failed:', error)
      alert('Failed to start checkout. Please try again.')
      setPurchasingBooster(false)
    }
  }

  // Grace period warning (red, urgent)
  if (inGracePeriod) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex items-start">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-semibold text-red-900 mb-1">
              Monthly Limit Reached
            </h3>
            <p className="text-sm text-red-800 mb-3">
              You've used <strong>{transcriptsUsed}/{transcriptLimit}</strong> transcripts this month.
              You have <strong>{graceRemaining} grace transcript(s)</strong> remaining.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handlePurchaseBooster}
                disabled={purchasingBooster}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {purchasingBooster ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Buy Booster Pack (+5 for $47)
                  </>
                )}
              </button>
              <a
                href="/billing"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-700 hover:bg-red-50 rounded-lg font-semibold text-sm transition-colors"
              >
                Upgrade Plan
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Near limit warning (yellow, 80-99%)
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-semibold text-yellow-900 mb-1">
            Approaching Monthly Limit
          </h3>
          <p className="text-sm text-yellow-800 mb-3">
            You've used <strong>{transcriptsUsed}/{transcriptLimit}</strong> transcripts ({Math.round(usagePercent)}%).
            You'll get {Math.max(1, Math.ceil(transcriptLimit * 0.1))} grace transcripts when you hit your limit.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handlePurchaseBooster}
              disabled={purchasingBooster}
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {purchasingBooster ? (
                <>Processing...</>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Get More (+5 for $47)
                </>
              )}
            </button>
            <a
              href="/billing"
              className="inline-flex items-center gap-2 px-4 py-2 text-yellow-700 hover:underline font-semibold text-sm"
            >
              View Plans
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
