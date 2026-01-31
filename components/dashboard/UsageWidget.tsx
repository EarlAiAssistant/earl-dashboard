'use client'

import { useState, useEffect } from 'react'
import { 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  ChevronRight,
  Sparkles,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface UsageData {
  transcriptsUsed: number
  transcriptLimit: number
  boosterCredits: number
  tier: string
  status: string
  daysUntilReset: number
  usageHistory?: { date: string; count: number }[]
}

interface UsageWidgetProps {
  initialData?: UsageData
  compact?: boolean
  showHistory?: boolean
}

export default function UsageWidget({ 
  initialData, 
  compact = false,
  showHistory = true 
}: UsageWidgetProps) {
  const [data, setData] = useState<UsageData | null>(initialData || null)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  // Fetch usage data
  const fetchUsage = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/usage')
      if (!response.ok) throw new Error('Failed to fetch usage')
      const usageData = await response.json()
      setData(usageData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load usage')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!initialData) {
      fetchUsage()
    }
  }, [initialData])

  // Mock data for demo
  const mockData: UsageData = {
    transcriptsUsed: 18,
    transcriptLimit: 30,
    boosterCredits: 0,
    tier: 'professional',
    status: 'active',
    daysUntilReset: 12,
    usageHistory: [
      { date: '2026-01-25', count: 3 },
      { date: '2026-01-26', count: 5 },
      { date: '2026-01-27', count: 2 },
      { date: '2026-01-28', count: 4 },
      { date: '2026-01-29', count: 2 },
      { date: '2026-01-30', count: 1 },
      { date: '2026-01-31', count: 1 },
    ],
  }

  const displayData = data || mockData
  const effectiveLimit = displayData.transcriptLimit + displayData.boosterCredits
  const usagePercent = Math.round((displayData.transcriptsUsed / effectiveLimit) * 100)
  const remaining = Math.max(0, effectiveLimit - displayData.transcriptsUsed)
  
  const isNearLimit = usagePercent >= 80
  const isAtLimit = usagePercent >= 100

  // Determine status color
  const getStatusColor = () => {
    if (isAtLimit) return 'text-red-600 dark:text-red-400'
    if (isNearLimit) return 'text-amber-600 dark:text-amber-400'
    return 'text-green-600 dark:text-green-400'
  }

  const getProgressColor = () => {
    if (isAtLimit) return 'bg-red-500'
    if (isNearLimit) return 'bg-amber-500'
    return 'bg-green-500'
  }

  if (loading) {
    return (
      <div className={cn(
        'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6',
        compact && 'p-4'
      )}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn(
        'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6',
        compact && 'p-4'
      )}>
        <div className="text-center text-gray-500">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchUsage}
            className="mt-2 text-blue-600 hover:underline text-sm flex items-center gap-1 mx-auto"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Usage
          </span>
          <span className={cn('text-sm font-bold', getStatusColor())}>
            {displayData.transcriptsUsed}/{effectiveLimit}
          </span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all', getProgressColor())}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
        {isNearLimit && (
          <Link
            href="/billing"
            className="mt-3 flex items-center justify-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline"
          >
            <Zap className="w-3 h-3" />
            Get more credits
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Usage This Month
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Resets in {displayData.daysUntilReset} days
          </span>
        </div>
      </div>

      {/* Main Stats */}
      <div className="p-6">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className={cn('text-4xl font-bold', getStatusColor())}>
                {displayData.transcriptsUsed}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                / {effectiveLimit} transcripts
              </span>
            </div>
            {displayData.boosterCredits > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Includes +{displayData.boosterCredits} booster credits
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {remaining}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              remaining
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4">
          <div
            className={cn('h-full transition-all duration-500', getProgressColor())}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>

        {/* Usage History Mini Chart */}
        {showHistory && displayData.usageHistory && (
          <div className="mt-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Last 7 days
            </p>
            <div className="flex items-end gap-1 h-12">
              {displayData.usageHistory.map((day, i) => {
                const maxCount = Math.max(...displayData.usageHistory!.map(d => d.count), 1)
                const height = (day.count / maxCount) * 100
                return (
                  <div
                    key={i}
                    className="flex-1 bg-blue-200 dark:bg-blue-900 rounded-t hover:bg-blue-300 dark:hover:bg-blue-800 transition-colors"
                    style={{ height: `${Math.max(height, 10)}%` }}
                    title={`${day.date}: ${day.count} transcripts`}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* Warning/CTA */}
        {isAtLimit && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  You've reached your limit
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Upgrade your plan or buy a booster pack to continue.
                </p>
              </div>
            </div>
          </div>
        )}

        {isNearLimit && !isAtLimit && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Running low on transcripts
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Only {remaining} left this month.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {displayData.tier} Plan
          </span>
          <Link
            href="/billing"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            Manage billing
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * Mini usage indicator for headers/sidebars
 */
export function UsageMiniIndicator({ 
  used, 
  limit 
}: { 
  used: number
  limit: number 
}) {
  const percent = Math.round((used / limit) * 100)
  const isNearLimit = percent >= 80
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all',
            isNearLimit ? 'bg-amber-500' : 'bg-green-500'
          )}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <span className={cn(
        'text-xs font-medium',
        isNearLimit ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'
      )}>
        {used}/{limit}
      </span>
    </div>
  )
}
