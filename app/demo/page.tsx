'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2, CheckCircle } from 'lucide-react'
import { DEMO_CREDENTIALS, DEMO_USER, DEMO_TRANSCRIPTS, DEMO_CONTENT } from '@/lib/demo'

export default function DemoPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const steps = [
    'Setting up demo environment...',
    'Loading sample transcripts...',
    'Generating preview content...',
    'Preparing your dashboard...',
  ]

  useEffect(() => {
    // Simulate demo setup with progress
    const intervals = [500, 800, 600, 400]
    let currentStep = 0

    const runStep = () => {
      if (currentStep < steps.length) {
        setStep(currentStep)
        currentStep++
        setTimeout(runStep, intervals[currentStep - 1] || 500)
      } else {
        // Set demo session and redirect
        localStorage.setItem('demo_mode', 'true')
        localStorage.setItem('demo_user', JSON.stringify(DEMO_USER))
        setIsLoading(false)
        
        // Redirect to dashboard after a brief moment
        setTimeout(() => {
          router.push('/')
        }, 500)
      }
    }

    runStep()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center">
        {/* Header */}
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to Demo Mode
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Explore Call-Content with sample data. No signup required!
        </p>

        {/* Loading steps */}
        <div className="space-y-3 mb-8">
          {steps.map((stepText, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                index < step
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : index === step
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-400'
              }`}
            >
              {index < step ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : index === step ? (
                <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-current" />
              )}
              <span className="text-sm font-medium">{stepText}</span>
            </div>
          ))}
        </div>

        {/* Ready state */}
        {!isLoading && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-4">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Demo ready!</span>
            </div>
            <p className="text-sm text-gray-500">
              Redirecting to dashboard...
            </p>
          </div>
        )}

        {/* Demo info */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
            Demo includes:
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {DEMO_TRANSCRIPTS.length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                Sample Transcripts
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {DEMO_CONTENT.length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                Generated Content
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
