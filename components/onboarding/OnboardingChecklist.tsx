'use client'

import { useEffect } from 'react'
import { CheckCircle2, X, Upload, Sparkles, Download } from 'lucide-react'
import { useOnboarding } from '@/lib/onboarding/hooks'
import { trackOnboardingEvent } from '@/lib/onboarding/analytics'
import OnboardingChecklistItem from './OnboardingChecklistItem'
import OnboardingProgress from './OnboardingProgress'

export default function OnboardingChecklist() {
  const { 
    onboarding, 
    loading, 
    dismissOnboarding,
    shouldShowChecklist 
  } = useOnboarding()

  useEffect(() => {
    if (shouldShowChecklist && onboarding) {
      trackOnboardingEvent('onboarding_checklist_viewed', {
        steps_completed: onboarding.steps_completed,
        total_steps: onboarding.total_steps,
      })
    }
  }, [shouldShowChecklist, onboarding])

  // Don't show if loading, completed, or dismissed
  if (loading || !shouldShowChecklist || !onboarding) {
    return null
  }

  const progress = (onboarding.steps_completed / onboarding.total_steps) * 100

  const steps = [
    {
      id: 'upload',
      title: 'Upload your first transcript',
      description: 'Upload a transcript or audio file to get started',
      completed: onboarding.has_uploaded_transcript,
      icon: Upload,
      href: '/documents',
    },
    {
      id: 'generate',
      title: 'Generate your first content',
      description: 'Turn your transcript into a blog post, case study, or more',
      completed: onboarding.has_generated_content,
      icon: Sparkles,
      href: '/documents',
    },
    {
      id: 'export',
      title: 'Export your content',
      description: 'Download or copy your generated content',
      completed: onboarding.has_exported_content,
      icon: Download,
      href: '/documents',
    },
  ]

  const handleDismiss = async () => {
    await dismissOnboarding()
    trackOnboardingEvent('onboarding_skipped', {
      step: `${onboarding.steps_completed}/${onboarding.total_steps}`,
    })
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Getting Started
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Complete these steps to unlock the full power of Call-Content
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss checklist"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <OnboardingProgress progress={progress} />

      {/* Checklist Items */}
      <div className="space-y-3 mt-4">
        {steps.map((step) => (
          <OnboardingChecklistItem
            key={step.id}
            {...step}
          />
        ))}
      </div>

      {/* Completion Message */}
      {onboarding.steps_completed === onboarding.total_steps && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-900">
            🎉 Congratulations! You're all set up.
          </p>
          <p className="text-sm text-green-700 mt-1">
            You can now create unlimited content from your transcripts.
          </p>
        </div>
      )}
    </div>
  )
}
