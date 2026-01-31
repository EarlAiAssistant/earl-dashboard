import posthog from 'posthog-js'

export function trackOnboardingEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  if (typeof window === 'undefined') return

  try {
    // Check if PostHog is initialized
    if (posthog && posthog.__loaded) {
      posthog.capture(eventName, properties)
    }
  } catch (err) {
    console.error('Error tracking onboarding event:', err)
  }
}

// Pre-defined event tracking functions
export const OnboardingAnalytics = {
  viewed: () => trackOnboardingEvent('onboarding_checklist_viewed'),
  
  stepClicked: (step: string) => 
    trackOnboardingEvent('onboarding_step_clicked', { step }),
  
  stepCompleted: (step: string, timeSeconds: number) =>
    trackOnboardingEvent('onboarding_step_completed', { step, time_seconds: timeSeconds }),
  
  completed: (timeToComplete: number) =>
    trackOnboardingEvent('onboarding_completed', { time_to_complete: timeToComplete }),
  
  skipped: (currentStep: string) =>
    trackOnboardingEvent('onboarding_skipped', { step: currentStep }),
  
  modalViewed: () =>
    trackOnboardingEvent('onboarding_modal_viewed'),
  
  modalDismissed: () =>
    trackOnboardingEvent('onboarding_modal_dismissed'),
  
  modalGetStartedClicked: () =>
    trackOnboardingEvent('onboarding_modal_get_started_clicked'),
}
