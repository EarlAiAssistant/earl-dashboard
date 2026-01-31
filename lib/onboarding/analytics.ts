/**
 * Onboarding Analytics
 * Re-exports from the main analytics module for backward compatibility
 * 
 * @deprecated Import from '@/lib/analytics' instead
 */

import { OnboardingAnalytics as Analytics, track } from '@/lib/analytics'

// Re-export the OnboardingAnalytics with legacy naming
export const OnboardingAnalytics = {
  viewed: Analytics.started,
  stepClicked: Analytics.stepViewed,
  stepCompleted: Analytics.stepCompleted,
  completed: Analytics.completed,
  skipped: Analytics.skipped,
  modalViewed: Analytics.modalViewed,
  modalDismissed: Analytics.modalDismissed,
  modalGetStartedClicked: Analytics.getStartedClicked,
}

// Legacy function for backward compatibility
export function trackOnboardingEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  track(eventName, properties)
}
