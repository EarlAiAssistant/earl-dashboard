import { OnboardingStep } from './types'

/**
 * Mark an onboarding step as complete
 * Call this from your upload/generate/export flows
 */
export async function markOnboardingStepComplete(step: OnboardingStep): Promise<void> {
  try {
    const response = await fetch('/api/onboarding/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ step }),
    })

    if (!response.ok) {
      console.error('Failed to mark onboarding step complete:', await response.text())
    }
  } catch (error) {
    console.error('Error marking onboarding step complete:', error)
  }
}

/**
 * Get the current onboarding status
 */
export async function getOnboardingStatus() {
  try {
    const response = await fetch('/api/onboarding/status')
    
    if (!response.ok) {
      throw new Error('Failed to fetch onboarding status')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching onboarding status:', error)
    return null
  }
}
