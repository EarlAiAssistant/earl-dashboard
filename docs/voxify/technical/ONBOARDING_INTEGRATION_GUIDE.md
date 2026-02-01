# Onboarding Checklist Integration Guide

This guide explains how to integrate the onboarding checklist into the Call-Content app.

## 🚀 Quick Start

### 1. Run the Database Migration

```bash
# Navigate to your project directory
cd /home/ubuntu/.openclaw/workspace

# Run the migration via Supabase CLI
supabase migration up

# OR apply manually via Supabase dashboard:
# 1. Go to SQL Editor in Supabase dashboard
# 2. Copy contents of supabase/migrations/20260131000000_add_onboarding_tracking.sql
# 3. Execute the SQL
```

### 2. Add Checklist to Dashboard

The onboarding checklist has been created but needs to be added to your main dashboard page.

**File: `app/page.tsx`**

Add these imports at the top:
```typescript
import OnboardingChecklist from '@/components/onboarding/OnboardingChecklist'
import OnboardingModal from '@/components/onboarding/OnboardingModal'
```

Then add the components to your dashboard (before the KanbanBoard):
```typescript
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

      {/* Earl Status Indicator */}
      <div className="mb-6">
        <EarlStatus />
      </div>

      <KanbanBoard />
    </div>
  )
}
```

---

## 📍 Step Completion Triggers

You need to call `markOnboardingStepComplete()` at the appropriate points in your app.

### Step 1: Upload First Transcript

**When:** After a user successfully uploads a transcript or audio file

**Where to add:** In your transcript upload success handler

**Example:**
```typescript
// In your upload component or API route
import { markOnboardingStepComplete } from '@/lib/onboarding'

// After successful upload
async function handleUploadSuccess() {
  // ... existing upload logic ...
  
  // Mark onboarding step complete
  await markOnboardingStepComplete('has_uploaded_transcript')
}
```

**Possible locations:**
- `components/AudioUploader.tsx` - after transcription completes
- `app/api/transcribe/route.ts` - after file upload succeeds
- Any transcript paste/upload flow

---

### Step 2: Generate First Content

**When:** After a user successfully generates any content (blog post, case study, etc.)

**Where to add:** In your content generation success handler

**Example:**
```typescript
// In your content generation component or API route
import { markOnboardingStepComplete } from '@/lib/onboarding'

// After successful content generation
async function handleGenerationSuccess() {
  // ... existing generation logic ...
  
  // Mark onboarding step complete
  await markOnboardingStepComplete('has_generated_content')
}
```

**Possible locations:**
- Content generation component (wherever "Generate" button is)
- API route that handles content generation
- Any AI content creation flow

---

### Step 3: Export Content

**When:** After a user exports/downloads/copies content

**Where to add:** In your export/download/copy handlers

**Example:**
```typescript
// In your export component or handler
import { markOnboardingStepComplete } from '@/lib/onboarding'

// After successful export
async function handleExport() {
  // ... existing export logic ...
  
  // Mark onboarding step complete
  await markOnboardingStepComplete('has_exported_content')
}
```

**Possible locations:**
- Download button click handler
- Copy to clipboard handler
- Export to file handler
- Any content export flow

---

## 🎨 Customization

### Change Step URLs

By default, all steps link to `/documents`. You can customize these in:

**File: `components/onboarding/OnboardingChecklist.tsx`**

```typescript
const steps = [
  {
    id: 'upload',
    title: 'Upload your first transcript',
    description: 'Upload a transcript or audio file to get started',
    completed: onboarding.has_uploaded_transcript,
    icon: Upload,
    href: '/upload', // ← Change this
  },
  // ... other steps
]
```

### Add More Steps

To add a 4th step (e.g., "Invite team member"):

1. **Update database migration** (`supabase/migrations/20260131000000_add_onboarding_tracking.sql`):
```sql
ALTER TABLE public.user_onboarding
ADD COLUMN has_invited_team BOOLEAN DEFAULT false;

-- Update total_steps default
ALTER TABLE public.user_onboarding
ALTER COLUMN total_steps SET DEFAULT 4;

-- Update the completion trigger to include new step
CREATE OR REPLACE FUNCTION public.update_onboarding_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.steps_completed := (
    (CASE WHEN NEW.has_uploaded_transcript THEN 1 ELSE 0 END) +
    (CASE WHEN NEW.has_generated_content THEN 1 ELSE 0 END) +
    (CASE WHEN NEW.has_exported_content THEN 1 ELSE 0 END) +
    (CASE WHEN NEW.has_invited_team THEN 1 ELSE 0 END)
  );
  
  IF NEW.steps_completed >= NEW.total_steps AND NEW.is_completed = false THEN
    NEW.is_completed := true;
    NEW.completed_at := NOW();
    NEW.time_to_complete_seconds := EXTRACT(EPOCH FROM (NOW() - NEW.started_at))::INTEGER;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

2. **Update TypeScript types** (`lib/onboarding/types.ts`):
```typescript
export interface OnboardingStatus {
  // ... existing fields
  has_invited_team: boolean
}

export type OnboardingStep = 
  | 'has_uploaded_transcript'
  | 'has_generated_content'
  | 'has_exported_content'
  | 'has_invited_team' // ← Add this
```

3. **Update checklist component** (`components/onboarding/OnboardingChecklist.tsx`):
```typescript
import { Users } from 'lucide-react' // Import icon

const steps = [
  // ... existing steps
  {
    id: 'invite',
    title: 'Invite a team member',
    description: 'Collaborate with your team',
    completed: onboarding.has_invited_team,
    icon: Users,
    href: '/team',
  },
]
```

4. **Update API validation** (`app/api/onboarding/complete/route.ts`):
```typescript
const validSteps = [
  'has_uploaded_transcript', 
  'has_generated_content', 
  'has_exported_content',
  'has_invited_team' // ← Add this
]
```

### Change Colors/Styling

The checklist uses Tailwind classes. Main colors:
- Blue/Indigo gradient for progress bar and accents
- Green for completed steps
- Gray for incomplete steps

To change to a different color scheme, update:
- `OnboardingProgress.tsx` - progress bar gradient
- `OnboardingChecklistItem.tsx` - icon colors
- `OnboardingChecklist.tsx` - background gradient
- `OnboardingModal.tsx` - button gradient

---

## 📊 Analytics Setup

### Install PostHog (if not already installed)

```bash
npm install posthog-js posthog-node
```

### Add Environment Variables

```bash
# .env.local
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Initialize PostHog

The analytics tracking is already set up in `lib/onboarding/analytics.ts`, but you need PostHog initialized in your app.

**Create:** `app/providers/PostHogProvider.tsx`

```typescript
'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            posthog.opt_out_capturing()
          }
        },
      })
    }
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
```

**Update:** `app/layout.tsx`

```typescript
import { PostHogProvider } from './providers/PostHogProvider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
```

### Events Being Tracked

The following events are automatically tracked:
- `onboarding_modal_viewed` - Welcome modal shown
- `onboarding_modal_dismissed` - User closes modal
- `onboarding_modal_get_started_clicked` - User clicks "Get Started"
- `onboarding_checklist_viewed` - Checklist rendered
- `onboarding_step_clicked` - User clicks on a step
- `onboarding_step_completed` - Step marked complete
- `onboarding_completed` - All steps finished
- `onboarding_skipped` - User dismisses checklist

---

## 🧪 Testing

### Manual Testing Checklist

1. **Sign up as a new user**
   - [ ] Welcome modal appears
   - [ ] Checklist shows on dashboard
   - [ ] All 3 steps visible
   - [ ] Progress bar shows 0%

2. **Upload a transcript**
   - [ ] Step 1 changes to "completed" (green checkmark)
   - [ ] Progress bar updates to 33%

3. **Generate content**
   - [ ] Step 2 changes to "completed"
   - [ ] Progress bar updates to 67%

4. **Export content**
   - [ ] Step 3 changes to "completed"
   - [ ] Progress bar shows 100%
   - [ ] Completion message appears

5. **Dismiss checklist**
   - [ ] Clicking X dismisses checklist
   - [ ] Checklist doesn't reappear on refresh

6. **Analytics verification**
   - [ ] Check PostHog dashboard for events
   - [ ] Verify all events are being tracked

### Reset Onboarding for Testing

To reset onboarding status and test again:

**Option 1: Via Supabase Dashboard**
1. Go to Table Editor → `user_onboarding`
2. Find your user's row
3. Delete it or update fields to `false`

**Option 2: Via SQL**
```sql
-- Reset for specific user
UPDATE user_onboarding
SET 
  has_uploaded_transcript = false,
  has_generated_content = false,
  has_exported_content = false,
  is_completed = false,
  is_dismissed = false,
  steps_completed = 0
WHERE user_id = 'your-user-id-here';

-- Or delete and start fresh
DELETE FROM user_onboarding WHERE user_id = 'your-user-id-here';
```

**Option 3: Clear localStorage (for modal)**
```javascript
// In browser console
localStorage.removeItem('onboarding_modal_seen')
```

---

## 🐛 Troubleshooting

### Checklist Not Showing

**Check:**
1. User is authenticated (`useOnboarding` hook needs auth)
2. `user_onboarding` table exists in Supabase
3. RLS policies are set correctly
4. Component is imported in `app/page.tsx`

**Debug:**
```typescript
// Add to OnboardingChecklist.tsx
console.log('Onboarding data:', onboarding)
console.log('Should show:', shouldShowChecklist)
console.log('Loading:', loading)
```

### Steps Not Marking Complete

**Check:**
1. `markOnboardingStepComplete()` is being called
2. API route `/api/onboarding/complete` returns 200
3. Correct step name is used (e.g., `has_uploaded_transcript`)

**Debug:**
```typescript
// Add to your upload/generate/export handlers
console.log('Marking step complete...')
await markOnboardingStepComplete('has_uploaded_transcript')
console.log('Step marked complete!')
```

### Analytics Not Tracking

**Check:**
1. PostHog is initialized
2. `NEXT_PUBLIC_POSTHOG_KEY` is set
3. PostHog script is loaded (check browser console)

**Debug:**
```typescript
// Check if PostHog is loaded
if (typeof window !== 'undefined') {
  console.log('PostHog loaded:', window.posthog?.__loaded)
}
```

---

## 📚 API Reference

### `useOnboarding()` Hook

Returns:
```typescript
{
  onboarding: OnboardingStatus | null,
  loading: boolean,
  completeStep: (step: OnboardingStep) => Promise<void>,
  dismissOnboarding: () => Promise<void>,
  refetch: () => Promise<void>,
  shouldShowChecklist: boolean,
}
```

### `markOnboardingStepComplete(step)`

```typescript
await markOnboardingStepComplete('has_uploaded_transcript')
await markOnboardingStepComplete('has_generated_content')
await markOnboardingStepComplete('has_exported_content')
```

### `getOnboardingStatus()`

```typescript
const status = await getOnboardingStatus()
console.log(status.steps_completed) // 0, 1, 2, or 3
```

---

## 🎯 Success Metrics to Monitor

Once deployed, track these in PostHog:

1. **Onboarding view rate**
   - How many new users see the checklist?
   - Target: 80%+

2. **Step completion rates**
   - Step 1: Target 60%+
   - Step 2: Target 50%+
   - Step 3: Target 40%+

3. **Full completion rate**
   - How many complete all 3 steps?
   - Target: 40%+

4. **Time to activation**
   - Median time to complete onboarding
   - Target: < 10 minutes

5. **Conversion impact**
   - Trial-to-paid for activated users
   - Compare to non-activated users

---

## 🚀 Next Steps

1. ✅ Run database migration
2. ✅ Add components to dashboard
3. ✅ Add step completion triggers
4. ✅ Set up PostHog analytics
5. ✅ Test the full flow
6. ✅ Monitor metrics
7. ✅ Iterate based on data

---

**Questions?** Check the main spec at `onboarding-checklist-spec.md` for more details.

**Happy shipping! 🎉**
