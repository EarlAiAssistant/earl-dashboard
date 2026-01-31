# Onboarding Checklist UI Implementation Specification

**Last Updated:** January 31, 2026  
**Status:** Ready for Implementation  
**Priority:** High (User Activation)

---

## 1. Overview

### Purpose
Guide new users through key activation steps to ensure they experience core product value within their first session. Users who complete onboarding are **3-5x more likely to convert** to paid plans.

### Success Metrics
- **Primary:** 70% of signups complete onboarding within first session
- **Secondary:** Time to activation < 10 minutes
- **Conversion:** Users who complete onboarding have 25%+ trial-to-paid conversion

### User Flow
```
User signs up
    ↓
Dashboard shows onboarding checklist (sidebar + modal)
    ↓
Step 1: Upload first transcript ✓
    ↓
Step 2: Generate first content piece ✓
    ↓
Step 3: Export content ✓
    ↓
Checklist auto-dismisses
    ↓
User marked as "activated"
```

---

## 2. Component Architecture

### 2.1 File Structure

```
components/
  ├── onboarding/
  │   ├── OnboardingChecklist.tsx       # Main checklist component
  │   ├── OnboardingModal.tsx           # Welcome modal on first visit
  │   ├── OnboardingChecklistItem.tsx   # Individual checklist item
  │   └── OnboardingProgress.tsx        # Progress bar component
  │
lib/
  ├── onboarding/
  │   ├── hooks.ts                      # useOnboarding custom hook
  │   ├── types.ts                      # TypeScript types
  │   └── analytics.ts                  # PostHog event tracking
  │
app/
  ├── api/
  │   └── onboarding/
  │       ├── status/route.ts           # GET onboarding status
  │       └── complete/route.ts         # POST mark step complete
```

---

## 3. Database Schema

### 3.1 New Table: `user_onboarding`

```sql
CREATE TABLE public.user_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Onboarding steps (boolean flags)
  has_uploaded_transcript BOOLEAN DEFAULT false,
  has_generated_content BOOLEAN DEFAULT false,
  has_exported_content BOOLEAN DEFAULT false,
  
  -- Completion tracking
  is_completed BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  
  -- Metadata
  steps_completed INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 3,
  time_to_complete_seconds INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_user_onboarding_user_id ON public.user_onboarding(user_id);
CREATE INDEX idx_user_onboarding_completed ON public.user_onboarding(is_completed);
CREATE INDEX idx_user_onboarding_active ON public.user_onboarding(is_completed, is_dismissed)
  WHERE is_completed = false AND is_dismissed = false;

-- RLS Policies
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding status"
  ON public.user_onboarding FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding status"
  ON public.user_onboarding FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding status"
  ON public.user_onboarding FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Trigger to auto-update updated_at
CREATE TRIGGER user_onboarding_updated_at
  BEFORE UPDATE ON public.user_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to auto-calculate completion
CREATE OR REPLACE FUNCTION public.update_onboarding_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Count completed steps
  NEW.steps_completed := (
    (CASE WHEN NEW.has_uploaded_transcript THEN 1 ELSE 0 END) +
    (CASE WHEN NEW.has_generated_content THEN 1 ELSE 0 END) +
    (CASE WHEN NEW.has_exported_content THEN 1 ELSE 0 END)
  );
  
  -- Mark as completed if all steps done
  IF NEW.steps_completed >= NEW.total_steps AND NEW.is_completed = false THEN
    NEW.is_completed := true;
    NEW.completed_at := NOW();
    NEW.time_to_complete_seconds := EXTRACT(EPOCH FROM (NOW() - NEW.started_at))::INTEGER;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_onboarding_completion_trigger
  BEFORE UPDATE ON public.user_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION public.update_onboarding_completion();
```

### 3.2 Migration File

**File:** `supabase/migrations/20260131000000_add_onboarding_tracking.sql`

---

## 4. Component Implementation

### 4.1 Main Checklist Component

**File:** `components/onboarding/OnboardingChecklist.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { CheckCircle2, Circle, Upload, Sparkles, Download, X } from 'lucide-react'
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
      href: '/upload',
    },
    {
      id: 'generate',
      title: 'Generate your first content',
      description: 'Turn your transcript into a blog post, case study, or more',
      completed: onboarding.has_generated_content,
      icon: Sparkles,
      href: '/generate',
    },
    {
      id: 'export',
      title: 'Export your content',
      description: 'Download or copy your generated content',
      completed: onboarding.has_exported_content,
      icon: Download,
      href: '/export',
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
```

---

### 4.2 Checklist Item Component

**File:** `components/onboarding/OnboardingChecklistItem.tsx`

```typescript
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
```

---

### 4.3 Progress Bar Component

**File:** `components/onboarding/OnboardingProgress.tsx`

```typescript
interface OnboardingProgressProps {
  progress: number
}

export default function OnboardingProgress({ progress }: OnboardingProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-600 font-medium">Progress</span>
        <span className="text-blue-600 font-semibold">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
```

---

### 4.4 Welcome Modal Component

**File:** `components/onboarding/OnboardingModal.tsx`

```typescript
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
```

---

## 5. Custom Hooks

### 5.1 useOnboarding Hook

**File:** `lib/onboarding/hooks.ts`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { OnboardingStatus } from './types'

export function useOnboarding() {
  const [onboarding, setOnboarding] = useState<OnboardingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Fetch onboarding status
  const fetchOnboarding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        // If no record exists, create one
        if (error.code === 'PGRST116') {
          const { data: newRecord } = await supabase
            .from('user_onboarding')
            .insert({ user_id: user.id })
            .select()
            .single()
          
          setOnboarding(newRecord)
        }
      } else {
        setOnboarding(data)
      }
    } catch (err) {
      console.error('Error fetching onboarding:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOnboarding()
  }, [])

  // Mark step as complete
  const completeStep = async (step: keyof OnboardingStatus) => {
    if (!onboarding) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('user_onboarding')
      .update({ [step]: true })
      .eq('user_id', user.id)
      .select()
      .single()

    if (!error && data) {
      setOnboarding(data)
    }
  }

  // Dismiss onboarding
  const dismissOnboarding = async () => {
    if (!onboarding) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('user_onboarding')
      .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single()

    if (!error && data) {
      setOnboarding(data)
    }
  }

  // Should show checklist
  const shouldShowChecklist = onboarding && !onboarding.is_completed && !onboarding.is_dismissed

  return {
    onboarding,
    loading,
    completeStep,
    dismissOnboarding,
    refetch: fetchOnboarding,
    shouldShowChecklist,
  }
}
```

---

## 6. TypeScript Types

**File:** `lib/onboarding/types.ts`

```typescript
export interface OnboardingStatus {
  id: string
  user_id: string
  has_uploaded_transcript: boolean
  has_generated_content: boolean
  has_exported_content: boolean
  is_completed: boolean
  is_dismissed: boolean
  started_at: string
  completed_at: string | null
  dismissed_at: string | null
  steps_completed: number
  total_steps: number
  time_to_complete_seconds: number | null
  created_at: string
  updated_at: string
}

export type OnboardingStep = 
  | 'has_uploaded_transcript'
  | 'has_generated_content'
  | 'has_exported_content'
```

---

## 7. Analytics Tracking

**File:** `lib/onboarding/analytics.ts`

```typescript
import posthog from 'posthog-js'

export function trackOnboardingEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  if (typeof window === 'undefined') return

  try {
    posthog.capture(eventName, properties)
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
```

---

## 8. API Routes

### 8.1 Get Onboarding Status

**File:** `app/api/onboarding/status/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No record exists, create one
        const { data: newRecord, error: insertError } = await supabase
          .from('user_onboarding')
          .insert({ user_id: user.id })
          .select()
          .single()

        if (insertError) {
          return NextResponse.json({ error: insertError.message }, { status: 500 })
        }

        return NextResponse.json(newRecord)
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

### 8.2 Mark Step Complete

**File:** `app/api/onboarding/complete/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import posthog from 'posthog-node'

const posthogClient = new posthog.PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY!,
  { host: process.env.NEXT_PUBLIC_POSTHOG_HOST }
)

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { step } = body

    if (!step) {
      return NextResponse.json({ error: 'Step is required' }, { status: 400 })
    }

    // Validate step
    const validSteps = ['has_uploaded_transcript', 'has_generated_content', 'has_exported_content']
    if (!validSteps.includes(step)) {
      return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
    }

    // Update the step
    const { data, error } = await supabase
      .from('user_onboarding')
      .update({ [step]: true })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Track analytics
    posthogClient.capture({
      distinctId: user.id,
      event: 'onboarding_step_completed',
      properties: {
        step: step.replace('has_', ''),
        steps_completed: data.steps_completed,
        total_steps: data.total_steps,
      },
    })

    // If completed, track completion event
    if (data.is_completed && data.time_to_complete_seconds) {
      posthogClient.capture({
        distinctId: user.id,
        event: 'onboarding_completed',
        properties: {
          time_to_complete: data.time_to_complete_seconds,
        },
      })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## 9. Integration with Dashboard

### 9.1 Add Checklist to Dashboard

**File:** `app/page.tsx` (modify existing)

```typescript
import OnboardingChecklist from '@/components/onboarding/OnboardingChecklist'
import OnboardingModal from '@/components/onboarding/OnboardingModal'

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-8">
      {/* Onboarding Modal (shows once on first visit) */}
      <OnboardingModal onClose={() => {}} />

      {/* Dashboard Header */}
      <div className="mb-6 md:mb-8">
        {/* ... existing header ... */}
      </div>

      {/* Onboarding Checklist */}
      <div className="mb-6">
        <OnboardingChecklist />
      </div>

      {/* Existing Dashboard Content */}
      <div className="mb-6">
        <EarlStatus />
      </div>

      <KanbanBoard />
    </div>
  )
}
```

---

## 10. Testing Plan

### 10.1 Unit Tests

**Test coverage:**
- ✅ OnboardingChecklist component renders correctly
- ✅ OnboardingChecklistItem shows correct state (completed/incomplete)
- ✅ OnboardingProgress calculates percentage correctly
- ✅ useOnboarding hook fetches and updates status
- ✅ Analytics events are tracked correctly

**Test file:** `__tests__/onboarding.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OnboardingChecklist from '@/components/onboarding/OnboardingChecklist'
import { useOnboarding } from '@/lib/onboarding/hooks'

// Mock the hook
jest.mock('@/lib/onboarding/hooks')

describe('OnboardingChecklist', () => {
  it('renders checklist with all steps', () => {
    (useOnboarding as jest.Mock).mockReturnValue({
      onboarding: {
        has_uploaded_transcript: false,
        has_generated_content: false,
        has_exported_content: false,
        steps_completed: 0,
        total_steps: 3,
        is_completed: false,
        is_dismissed: false,
      },
      loading: false,
      shouldShowChecklist: true,
    })

    render(<OnboardingChecklist />)
    
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('Upload your first transcript')).toBeInTheDocument()
    expect(screen.getByText('Generate your first content')).toBeInTheDocument()
    expect(screen.getByText('Export your content')).toBeInTheDocument()
  })

  it('shows completed state for finished steps', () => {
    (useOnboarding as jest.Mock).mockReturnValue({
      onboarding: {
        has_uploaded_transcript: true,
        has_generated_content: false,
        has_exported_content: false,
        steps_completed: 1,
        total_steps: 3,
        is_completed: false,
        is_dismissed: false,
      },
      loading: false,
      shouldShowChecklist: true,
    })

    render(<OnboardingChecklist />)
    
    // Check for completed icon (CheckCircle2)
    const uploadStep = screen.getByText('Upload your first transcript').closest('div')
    expect(uploadStep).toHaveClass('line-through')
  })

  it('calls dismissOnboarding when X button clicked', async () => {
    const dismissOnboarding = jest.fn()
    
    (useOnboarding as jest.Mock).mockReturnValue({
      onboarding: {
        has_uploaded_transcript: false,
        has_generated_content: false,
        has_exported_content: false,
        steps_completed: 0,
        total_steps: 3,
        is_completed: false,
        is_dismissed: false,
      },
      loading: false,
      shouldShowChecklist: true,
      dismissOnboarding,
    })

    render(<OnboardingChecklist />)
    
    const dismissButton = screen.getByLabelText('Dismiss checklist')
    await userEvent.click(dismissButton)
    
    expect(dismissOnboarding).toHaveBeenCalled()
  })
})
```

---

### 10.2 Integration Tests

**Test scenarios:**
1. **New user signup flow**
   - Sign up → See welcome modal → Click "Get Started" → See checklist
   
2. **Step completion flow**
   - Upload transcript → Step 1 marked complete
   - Generate content → Step 2 marked complete
   - Export content → Step 3 marked complete → Checklist shows completion message

3. **Dismiss flow**
   - Click X button → Checklist disappears
   - Refresh page → Checklist stays dismissed

4. **Analytics tracking**
   - Each step completion triggers PostHog event
   - Modal view/dismiss tracked
   - Completion time calculated correctly

---

### 10.3 E2E Tests (Playwright)

**File:** `e2e/onboarding.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Onboarding Flow', () => {
  test('complete onboarding flow', async ({ page }) => {
    // Sign up
    await page.goto('/signup')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Should see welcome modal
    await expect(page.getByText('Welcome to Call-Content!')).toBeVisible()
    await page.click('text=Let\'s Get Started!')

    // Should see onboarding checklist
    await expect(page.getByText('Getting Started')).toBeVisible()
    await expect(page.getByText('Upload your first transcript')).toBeVisible()

    // Upload transcript
    await page.click('text=Upload your first transcript')
    // ... upload flow ...

    // Verify step 1 completed
    await expect(page.getByText('Upload your first transcript').locator('..')).toHaveClass(/line-through/)

    // Generate content
    await page.click('text=Generate your first content')
    // ... generation flow ...

    // Export content
    await page.click('text=Export your content')
    // ... export flow ...

    // Should see completion message
    await expect(page.getByText('Congratulations! You\'re all set up.')).toBeVisible()
  })
})
```

---

## 11. Implementation Checklist

### Phase 1: Database Setup (30 min)
- [ ] Create migration file for `user_onboarding` table
- [ ] Run migration on Supabase
- [ ] Verify RLS policies work correctly

### Phase 2: Backend (1 hour)
- [ ] Create `/api/onboarding/status` route
- [ ] Create `/api/onboarding/complete` route
- [ ] Test API routes with Postman/Thunder Client

### Phase 3: Utilities & Hooks (1 hour)
- [ ] Create `lib/onboarding/types.ts`
- [ ] Create `lib/onboarding/hooks.ts`
- [ ] Create `lib/onboarding/analytics.ts`
- [ ] Test hooks with mock data

### Phase 4: UI Components (2-3 hours)
- [ ] Create `OnboardingProgress` component
- [ ] Create `OnboardingChecklistItem` component
- [ ] Create `OnboardingChecklist` component
- [ ] Create `OnboardingModal` component
- [ ] Test components in isolation

### Phase 5: Integration (1 hour)
- [ ] Add checklist to dashboard (`app/page.tsx`)
- [ ] Wire up onboarding hooks
- [ ] Test full flow locally

### Phase 6: Step Triggers (1-2 hours)
- [ ] Add `completeStep('has_uploaded_transcript')` to upload flow
- [ ] Add `completeStep('has_generated_content')` to generation flow
- [ ] Add `completeStep('has_exported_content')` to export flow
- [ ] Test step completion triggers

### Phase 7: Analytics (30 min)
- [ ] Install PostHog SDK (if not already)
- [ ] Verify events are being tracked
- [ ] Create PostHog dashboard for onboarding metrics

### Phase 8: Testing (2 hours)
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Write E2E tests
- [ ] Run all tests and fix issues

### Phase 9: Polish (1 hour)
- [ ] Add loading states
- [ ] Add error handling
- [ ] Mobile responsiveness
- [ ] Accessibility (keyboard navigation, ARIA labels)

### Phase 10: Deployment (30 min)
- [ ] Deploy to staging
- [ ] Test on staging
- [ ] Deploy to production
- [ ] Monitor analytics

**Total Estimated Time:** 10-12 hours

---

## 12. Success Metrics

### Week 1 Targets
- **Checklist view rate:** 80%+ of new signups see the checklist
- **Step 1 completion:** 60%+ upload first transcript
- **Step 2 completion:** 50%+ generate first content
- **Full completion:** 40%+ complete all 3 steps
- **Time to activation:** < 10 minutes median

### Month 1 Targets
- **Activation rate:** 70%+ of signups complete onboarding
- **Trial-to-paid conversion:** 25%+ for activated users vs. 10% for non-activated

---

## 13. Future Enhancements

### Post-Launch Improvements
1. **Personalized steps** based on user role (marketer vs. agency)
2. **Demo transcript option** - "Try a demo" button that pre-fills data
3. **Video tutorials** embedded in each step
4. **Gamification** - badges, confetti animation on completion
5. **Email nudges** if onboarding incomplete after 24h
6. **In-app tooltips** highlighting next action
7. **Progress persistence** across sessions

---

## 14. Appendix: PostHog Events Reference

**Events to track:**

| Event Name | Trigger | Properties |
|-----------|---------|-----------|
| `onboarding_modal_viewed` | Welcome modal shown | - |
| `onboarding_modal_dismissed` | User closes modal | - |
| `onboarding_modal_get_started_clicked` | User clicks CTA | - |
| `onboarding_checklist_viewed` | Checklist rendered | `steps_completed`, `total_steps` |
| `onboarding_step_clicked` | User clicks on step | `step` |
| `onboarding_step_completed` | Step marked complete | `step`, `time_seconds` |
| `onboarding_completed` | All steps done | `time_to_complete` |
| `onboarding_skipped` | User dismisses checklist | `step` (current progress) |

---

## 15. Summary

This spec provides everything needed to implement a production-ready onboarding checklist:

✅ **Database schema** with automatic completion tracking  
✅ **React components** with Tailwind styling  
✅ **Custom hooks** for state management  
✅ **API routes** for backend logic  
✅ **PostHog analytics** tracking  
✅ **Testing plan** with unit, integration, and E2E tests  
✅ **Implementation checklist** with time estimates

**Next steps:**
1. Review this spec
2. Create the migration file
3. Start implementing components
4. Wire up the triggers
5. Test and deploy!

---

*Ready to build! 🚀*
