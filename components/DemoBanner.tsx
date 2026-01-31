'use client'

import { useState } from 'react'
import { X, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { DEMO_BANNER } from '@/lib/demo'

interface DemoBannerProps {
  onDismiss?: () => void
}

export default function DemoBanner({ onDismiss }: DemoBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              {DEMO_BANNER.message}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href={DEMO_BANNER.ctaUrl}
              className="bg-white text-orange-600 hover:bg-orange-50 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap"
            >
              {DEMO_BANNER.ctaText}
            </Link>
            
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Compact demo mode indicator for sidebars/headers
 */
export function DemoModeIndicator() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
      <Sparkles className="w-3 h-3" />
      <span>Demo Mode</span>
    </div>
  )
}

/**
 * Demo login button for landing pages
 */
export function TryDemoButton({ className }: { className?: string }) {
  return (
    <Link
      href="/demo"
      className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors ${className}`}
    >
      <Sparkles className="w-4 h-4" />
      Try Demo
    </Link>
  )
}
