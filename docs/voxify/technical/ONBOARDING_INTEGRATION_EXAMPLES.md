# Onboarding Integration Examples

Practical code examples showing exactly where to add onboarding step completion triggers.

---

## Example 1: Upload Transcript (Client-Side)

If you have a client-side upload component:

**File: `components/TranscriptUpload.tsx` (example)**

```typescript
'use client'

import { useState } from 'react'
import { markOnboardingStepComplete } from '@/lib/onboarding'

export default function TranscriptUpload() {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (file: File) => {
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-transcript', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        // ✅ SUCCESS: Mark onboarding step complete
        await markOnboardingStepComplete('has_uploaded_transcript')
        
        // Show success message
        alert('Transcript uploaded successfully!')
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <input
      type="file"
      onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
      disabled={uploading}
    />
  )
}
```

---

## Example 2: Upload Transcript (Server-Side)

If you handle uploads server-side:

**File: `app/api/upload-transcript/route.ts` (example)**

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File

  // Upload logic here...
  // const { data, error } = await supabase.storage...

  // ✅ SUCCESS: Mark onboarding step complete (server-side)
  try {
    await supabase
      .from('user_onboarding')
      .upsert({
        user_id: user.id,
        has_uploaded_transcript: true,
      })
  } catch (err) {
    console.error('Failed to update onboarding:', err)
  }

  return NextResponse.json({ success: true })
}
```

---

## Example 3: Audio Transcription Complete

If using the AudioUploader component:

**File: `components/AudioUploader.tsx` (modify existing)**

Find the `pollTranscript` function and add after successful completion:

```typescript
const pollTranscript = async (id: string) => {
  const poll = async () => {
    try {
      const response = await fetch(`/api/transcribe?id=${id}`)
      const data = await response.json()

      if (data.status === 'completed') {
        setTranscribing(false)
        setProgress(100)
        onTranscriptComplete(data.text)
        
        // ✅ ADD THIS: Mark onboarding step complete
        await markOnboardingStepComplete('has_uploaded_transcript')
        
        return
      }

      // ... rest of polling logic
    } catch (err) {
      // ... error handling
    }
  }

  poll()
}
```

Don't forget to import at the top:
```typescript
import { markOnboardingStepComplete } from '@/lib/onboarding'
```

---

## Example 4: Generate Content (Client-Side)

**File: `components/ContentGenerator.tsx` (example)**

```typescript
'use client'

import { useState } from 'react'
import { markOnboardingStepComplete } from '@/lib/onboarding'

export default function ContentGenerator({ transcriptId }: { transcriptId: string }) {
  const [generating, setGenerating] = useState(false)
  const [content, setContent] = useState('')

  const generateContent = async (template: string) => {
    setGenerating(true)

    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcriptId, template }),
      })

      const data = await response.json()

      if (response.ok) {
        setContent(data.content)
        
        // ✅ SUCCESS: Mark onboarding step complete
        await markOnboardingStepComplete('has_generated_content')
        
        // Show success message
        alert('Content generated successfully!')
      }
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      <button onClick={() => generateContent('blog-post')}>
        Generate Blog Post
      </button>
      {content && <div>{content}</div>}
    </div>
  )
}
```

---

## Example 5: Generate Content (Server-Side with OpenAI)

**File: `app/api/generate-content/route.ts` (example)**

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { transcriptId, template } = await request.json()

  // Get transcript from database
  const { data: transcript } = await supabase
    .from('transcripts')
    .select('*')
    .eq('id', transcriptId)
    .single()

  // Generate content with OpenAI
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a content writer...' },
      { role: 'user', content: `Transform this transcript into a ${template}: ${transcript.text}` },
    ],
  })

  const generatedContent = completion.choices[0].message.content

  // ✅ SUCCESS: Mark onboarding step complete (server-side)
  try {
    await supabase
      .from('user_onboarding')
      .upsert({
        user_id: user.id,
        has_generated_content: true,
      })
  } catch (err) {
    console.error('Failed to update onboarding:', err)
  }

  return NextResponse.json({ content: generatedContent })
}
```

---

## Example 6: Export Content (Download Button)

**File: `components/ExportButton.tsx` (example)**

```typescript
'use client'

import { markOnboardingStepComplete } from '@/lib/onboarding'

export default function ExportButton({ content, filename }: { content: string, filename: string }) {
  const handleDownload = async () => {
    // Create downloadable file
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)

    // ✅ SUCCESS: Mark onboarding step complete
    await markOnboardingStepComplete('has_exported_content')
  }

  return (
    <button onClick={handleDownload}>
      Download
    </button>
  )
}
```

---

## Example 7: Export Content (Copy to Clipboard)

**File: `components/CopyButton.tsx` (example)**

```typescript
'use client'

import { markOnboardingStepComplete } from '@/lib/onboarding'

export default function CopyButton({ content }: { content: string }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      
      // ✅ SUCCESS: Mark onboarding step complete
      await markOnboardingStepComplete('has_exported_content')
      
      alert('Copied to clipboard!')
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  return (
    <button onClick={handleCopy}>
      Copy to Clipboard
    </button>
  )
}
```

---

## Example 8: Export Content (Email/Share)

**File: `components/ShareButton.tsx` (example)**

```typescript
'use client'

import { markOnboardingStepComplete } from '@/lib/onboarding'

export default function ShareButton({ content }: { content: string }) {
  const handleShare = async () => {
    try {
      await fetch('/api/share-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, method: 'email' }),
      })

      // ✅ SUCCESS: Mark onboarding step complete
      await markOnboardingStepComplete('has_exported_content')
      
      alert('Content shared!')
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  return (
    <button onClick={handleShare}>
      Share via Email
    </button>
  )
}
```

---

## Example 9: Integration with Existing Dashboard

**File: `app/page.tsx` (modify existing)**

```typescript
import KanbanBoard from '@/components/KanbanBoard'
import EarlStatus from '@/components/EarlStatus'
import { RefreshCw } from 'lucide-react'

// ✅ ADD THESE IMPORTS
import OnboardingChecklist from '@/components/onboarding/OnboardingChecklist'
import OnboardingModal from '@/components/onboarding/OnboardingModal'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-8">
      {/* ✅ ADD THIS: Onboarding Modal (shows once on first visit) */}
      <OnboardingModal onClose={() => {}} />

      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Task Dashboard</h1>
            <p className="text-sm md:text-base text-gray-400">
              Track Earl's tasks and activities in real-time
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="hidden sm:inline">Auto-refreshing every 30s</span>
            <span className="sm:hidden">Auto-refresh</span>
          </div>
        </div>
      </div>

      {/* ✅ ADD THIS: Onboarding Checklist */}
      <div className="mb-6">
        <OnboardingChecklist />
      </div>

      {/* Existing components */}
      <div className="mb-6">
        <EarlStatus />
      </div>

      <KanbanBoard />
    </div>
  )
}
```

---

## Example 10: Bulk Actions (Mark Multiple Steps)

If a single action completes multiple steps:

```typescript
import { markOnboardingStepComplete } from '@/lib/onboarding'

async function handleBulkAction() {
  // User uploads AND generates content in one flow
  
  // Upload
  await uploadTranscript()
  await markOnboardingStepComplete('has_uploaded_transcript')
  
  // Generate
  await generateContent()
  await markOnboardingStepComplete('has_generated_content')
  
  // You could even auto-export
  await exportContent()
  await markOnboardingStepComplete('has_exported_content')
  
  // All 3 steps completed in one action!
}
```

---

## Example 11: Conditional Step Completion

Only mark complete if it's their FIRST time:

```typescript
import { getOnboardingStatus, markOnboardingStepComplete } from '@/lib/onboarding'

async function handleUpload() {
  const status = await getOnboardingStatus()
  
  // Only mark step complete if not already done
  if (status && !status.has_uploaded_transcript) {
    await markOnboardingStepComplete('has_uploaded_transcript')
    
    // Show special first-time message
    showToast('🎉 First transcript uploaded! 2 more steps to go.')
  }
}
```

---

## Example 12: Error Handling

Proper error handling for step completion:

```typescript
import { markOnboardingStepComplete } from '@/lib/onboarding'

async function handleContentGeneration() {
  try {
    // Generate content
    const content = await generateContent()
    
    // Try to mark step complete (don't block on failure)
    try {
      await markOnboardingStepComplete('has_generated_content')
    } catch (onboardingError) {
      // Log error but don't fail the whole operation
      console.error('Failed to update onboarding:', onboardingError)
    }
    
    // Continue with success flow
    showSuccessMessage()
  } catch (error) {
    // Handle main operation error
    showErrorMessage()
  }
}
```

---

## Example 13: Using the Hook Directly

If you prefer using the hook instead of the utility function:

```typescript
'use client'

import { useOnboarding } from '@/lib/onboarding/hooks'

export default function MyComponent() {
  const { completeStep, onboarding } = useOnboarding()

  const handleAction = async () => {
    // Do your action
    await doSomething()
    
    // Mark step complete using the hook
    await completeStep('has_uploaded_transcript')
    
    // Check current progress
    console.log(`Progress: ${onboarding?.steps_completed}/${onboarding?.total_steps}`)
  }

  return <button onClick={handleAction}>Do Action</button>
}
```

---

## Example 14: Real-Time Progress Tracking

Show progress indicator while user is working:

```typescript
'use client'

import { useOnboarding } from '@/lib/onboarding/hooks'

export default function ProgressIndicator() {
  const { onboarding, loading } = useOnboarding()

  if (loading || !onboarding || onboarding.is_completed) return null

  const progress = (onboarding.steps_completed / onboarding.total_steps) * 100

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
      <p className="text-sm font-medium mb-2">
        Getting Started: {onboarding.steps_completed}/{onboarding.total_steps}
      </p>
      <div className="w-48 bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
```

---

## Quick Reference

**Import:**
```typescript
import { markOnboardingStepComplete } from '@/lib/onboarding'
```

**Usage:**
```typescript
// Step 1: Upload transcript
await markOnboardingStepComplete('has_uploaded_transcript')

// Step 2: Generate content
await markOnboardingStepComplete('has_generated_content')

// Step 3: Export content
await markOnboardingStepComplete('has_exported_content')
```

**Step Names (must match exactly):**
- `has_uploaded_transcript`
- `has_generated_content`
- `has_exported_content`

---

**That's it! Pick the pattern that matches your codebase structure. 🚀**
