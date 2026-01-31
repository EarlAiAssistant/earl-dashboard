'use client'

import { CheckCircle2, Circle, LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { trackOnboardingEvent } from '@/lib/onboarding/analytics'

interface OnboardingChecklistItemProps {
  id: string
  title: string
  description: string
  completed: boolean
  icon: LucideIcon
  href: string
}

export default function OnboardingChecklistItem({
  id,
  title,
  description,
  completed,
  icon: Icon,
  href,
}: OnboardingChecklistItemProps) {
  const handleClick = () => {
    if (!completed) {
      trackOnboardingEvent('onboarding_step_clicked', {
        step: id,
      })
    }
  }

  const content = (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg transition-all ${
        completed
          ? 'bg-white border border-green-200 opacity-75'
          : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm cursor-pointer'
      }`}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {completed ? (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        ) : (
          <Circle className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4
              className={`font-medium ${
                completed ? 'text-gray-600 line-through' : 'text-gray-900'
              }`}
            >
              {title}
            </h4>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
          <Icon
            className={`w-5 h-5 flex-shrink-0 ${
              completed ? 'text-green-500' : 'text-blue-500'
            }`}
          />
        </div>
      </div>
    </div>
  )

  if (completed) {
    return content
  }

  return (
    <Link href={href} onClick={handleClick}>
      {content}
    </Link>
  )
}
