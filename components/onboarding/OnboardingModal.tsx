'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle2, Upload, Sparkles, Download } from 'lucide-react'
import { trackOnboardingEvent } from '@/lib/onboarding/analytics'

interface OnboardingModalProps {
  onClose: () => void
}

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Check if user has seen the modal before
    const hasSeenModal = localStorage.getItem('onboarding_modal_seen')
    if (!hasSeenModal) {
      setShow(true)
      trackOnboardingEvent('onboarding_modal_viewed')
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem('onboarding_modal_seen', 'true')
    setShow(false)
    onClose()
    trackOnboardingEvent('onboarding_modal_dismissed')
  }

  const handleGetStarted = () => {
    localStorage.setItem('onboarding_modal_seen', 'true')
    setShow(false)
    onClose()
    trackOnboardingEvent('onboarding_modal_get_started_clicked')
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-8 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Call-Content! 🎉
          </h2>
          <p className="text-gray-600 text-lg">
            Let's get you set up in just 3 simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                1. Upload a transcript
              </h3>
              <p className="text-sm text-gray-600">
                Upload a call transcript or audio file to get started
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-lg">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                2. Generate content
              </h3>
              <p className="text-sm text-gray-600">
                Turn your transcript into blog posts, case studies, social media posts, and more
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                3. Export and publish
              </h3>
              <p className="text-sm text-gray-600">
                Download your content and publish it wherever you need
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleGetStarted}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
        >
          Let's Get Started! →
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Takes less than 5 minutes to complete
        </p>
      </div>
    </div>
  )
}
