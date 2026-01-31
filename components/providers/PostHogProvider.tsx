'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Only initialize PostHog on client side
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        // Capture pageviews automatically
        capture_pageview: true,
        // Capture page leave events
        capture_pageleave: true,
        // Respect Do Not Track
        respect_dnt: true,
        // Enable session recording (optional)
        enable_recording_console_log: false,
        // Disable autocapture for now (we'll track specific events)
        autocapture: false,
        // Debug mode in development
        debug: process.env.NODE_ENV === 'development',
        // Persistence
        persistence: 'localStorage',
        // Bootstrap with identified user if available
        bootstrap: {
          distinctID: undefined, // Will be set when user logs in
        },
      })
    }
  }, [])

  // If no PostHog key, just render children without provider
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>
  }

  return <PHProvider client={posthog}>{children}</PHProvider>
}

/**
 * Identify user after login
 */
export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.identify(userId, properties)
  }
}

/**
 * Reset user identity on logout
 */
export function resetUser() {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.reset()
  }
}

/**
 * Track custom event
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.capture(eventName, properties)
  }
}

/**
 * Set super properties (attached to all events)
 */
export function setSuperProperties(properties: Record<string, any>) {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.register(properties)
  }
}
