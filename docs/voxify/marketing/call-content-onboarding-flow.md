# Call-Content: Onboarding Flow & UI Specs
## First-Time User Experience (Activation-Optimized)

**Goal:** Get users to "aha moment" in <5 minutes  
**Success Metric:** 80%+ complete onboarding checklist  
**Key Outcome:** User processes at least 1 transcript (demo or real)

---

## User Journey Map

### Stage 1: Signup → Dashboard (30 seconds)
**User Mental State:** "Okay, I signed up. Now what?"  
**Goal:** Orient them immediately

**Screen:** Dashboard (First Visit)

**UI Elements:**
1. **Welcome Modal** (center screen, semi-transparent overlay)
2. **Onboarding Checklist** (persistent sidebar, right side)
3. **Empty State** (main content area)
4. **Action Buttons** (CTA to start)

---

### Stage 2: First Action (2-3 minutes)
**User Mental State:** "Show me this actually works"  
**Goal:** Instant value (no upload friction)

**Screen:** Demo Transcript Selection

**UI Elements:**
1. **5 Demo Transcripts** (pre-loaded, one-click try)
2. **"Skip to Upload"** (for power users)

---

### Stage 3: Results Page (1-2 minutes)
**User Mental State:** "Whoa, this is actually good"  
**Goal:** Demonstrate value, encourage exploration

**Screen:** Generated Content Dashboard

**UI Elements:**
1. **12 Asset Cards** (preview + expand)
2. **Export Options** (copy, download, send to...)
3. **Next Step CTA** ("Try Your Own Transcript")

---

### Stage 4: Real Upload (2-3 minutes)
**User Mental State:** "Okay, I'm convinced. Let me try my own"  
**Goal:** Convert demo user to real user

**Screen:** Upload Interface

**UI Elements:**
1. **Drag-and-drop zone**
2. **File browser**
3. **Paste transcript** option
4. **Audio/video upload** (with progress bar)

---

### Stage 5: Brand Voice Setup (1-2 minutes)
**User Mental State:** "I want this to sound like ME"  
**Goal:** Personalization = ownership

**Screen:** Brand Voice Settings

**UI Elements:**
1. **Tone selector** (dropdown: Professional, Casual, Friendly, etc.)
2. **Industry selector** (SaaS, Consulting, Agency, etc.)
3. **Sample output preview** (live update as they change settings)

---

### Stage 6: Habit Formation (Ongoing)
**User Mental State:** "I should use this for every customer call"  
**Goal:** Weekly active usage

**Triggers:**
1. **Email nudges** (Day 3, Day 7, Day 10)
2. **In-app tips** (feature discovery)
3. **Usage stats** ("You've saved X hours this month!")

---

## Onboarding Checklist (Persistent UI Component)

### Visual Design:
- **Location:** Right sidebar (sticky, always visible)
- **Size:** 280px wide, auto height
- **Style:** Card with progress bar

### Checklist Items:

```
┌─────────────────────────────────┐
│  🎯 Get Started (3/5 complete)  │
│  ████████████░░░░░░░░░ 60%      │
├─────────────────────────────────┤
│  ✅ Create account               │
│  ✅ Try a demo transcript        │
│  ✅ Set your brand voice         │
│  ☐ Upload your own transcript   │
│  ☐ Export content                │
├─────────────────────────────────┤
│  [Finish Setup →]                │
└─────────────────────────────────┘
```

### Checklist Logic:
- **Step 1: Create account** → Auto-checked on signup
- **Step 2: Try demo** → Checked when user clicks "Generate" on any demo
- **Step 3: Set brand voice** → Checked when user saves settings
- **Step 4: Upload transcript** → Checked when user uploads first real file
- **Step 5: Export content** → Checked when user clicks Copy/Download/Export

### Gamification:
- **Progress bar** animates on completion
- **Confetti animation** when 5/5 complete
- **Badge unlock** ("Onboarding Complete!" badge in profile)
- **Email celebration** ("You did it! Here's what's next...")

---

## Screen-by-Screen UI Specs

### Screen 1: Welcome Modal (First Visit Only)

**Layout:**
```
┌───────────────────────────────────────────┐
│                                           │
│       👋 Welcome to Call-Content!         │
│                                           │
│   Turn customer calls into complete       │
│   marketing campaigns in 10 minutes.      │
│                                           │
│   ┌─────────────────────────────┐         │
│   │  Try a Demo (No Upload!)    │         │
│   └─────────────────────────────┘         │
│                                           │
│   Or skip to upload your own transcript   │
│                                           │
└───────────────────────────────────────────┘
```

**Copy:**
- **Headline:** "Welcome to Call-Content!"
- **Subheadline:** "Turn customer calls into complete marketing campaigns in 10 minutes."
- **Primary CTA:** "Try a Demo (No Upload!)" [Blue button]
- **Secondary CTA:** "Or skip to upload your own transcript" [Text link]

**Behavior:**
- Appears on first login only
- Dismissible (X in top-right)
- Never shows again once dismissed
- Clicking "Try a Demo" → Demo Selection Screen
- Clicking "skip to upload" → Upload Screen

---

### Screen 2: Demo Selection

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Select a Demo Transcript                                   │
│  See Call-Content in action with pre-loaded customer calls  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 📊 SaaS      │  │ 💼 Consultant│  │ 🎨 Agency    │      │
│  │ Interview    │  │ Success Call │  │ Discovery    │      │
│  │              │  │              │  │              │      │
│  │ 1,200 words  │  │ 1,500 words  │  │ 1,800 words  │      │
│  │ [Try This →] │  │ [Try This →] │  │ [Try This →] │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ 🧑‍💼 Coach    │  │ 🛠️ Product   │                        │
│  │ Strategy     │  │ Feedback     │                        │
│  │              │  │              │                        │
│  │ 1,400 words  │  │ 1,300 words  │                        │
│  │ [Try This →] │  │ [Try This →] │                        │
│  └──────────────┘  └──────────────┘                        │
│                                                             │
│  ← Back to Dashboard                                        │
└─────────────────────────────────────────────────────────────┘
```

**Copy:**
- **Headline:** "Select a Demo Transcript"
- **Subheadline:** "See Call-Content in action with pre-loaded customer calls"
- **Card Titles:** "SaaS Interview," "Consultant Success Call," etc.
- **Card Details:** Word count, icon
- **CTA:** "Try This →" on each card

**Behavior:**
- Clicking "Try This" → Auto-generates content (no config needed)
- Progress spinner: "Analyzing transcript..." (5-10 seconds)
- Redirect to Results Screen

---

### Screen 3: Generating Content (Progress State)

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│         🔄 Generating Your Content      │
│                                         │
│   ████████████░░░░░░░░░░░ 65%          │
│                                         │
│   Analyzing transcript...               │
│   Extracting key insights...            │
│   ✓ Generating case study...            │
│   ✓ Writing testimonials...             │
│   → Creating social posts...            │
│                                         │
│   This usually takes 10-15 seconds.     │
│                                         │
└─────────────────────────────────────────┘
```

**Copy:**
- **Headline:** "Generating Your Content"
- **Progress Bar:** Animated, 0-100%
- **Steps:** Show current step (✓ = done, → = in progress)
- **Subtext:** "This usually takes 10-15 seconds."

**Behavior:**
- Auto-advances (no user input)
- Real-time progress updates (or simulated if instant)
- Redirects to Results Screen when complete

---

### Screen 4: Results Dashboard (The "Aha!" Moment)

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  🎉 Your Content is Ready!                                      │
│                                                                 │
│  Generated 12 assets from "SaaS Customer Interview"             │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ 📄 Case      │  │ 💬 Testimon.│  │ 📱 LinkedIn │             │
│  │ Study        │  │ (3 versions)│  │ Post        │             │
│  │              │  │              │  │              │             │
│  │ 847 words    │  │ Short/Med/  │  │ 280 chars    │             │
│  │ [View →]     │  │ Long         │  │ [View →]     │             │
│  └─────────────┘  │ [View →]     │  └─────────────┘             │
│                   └─────────────┘                               │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ 🐦 Twitter   │  │ ✉️ Email    │  │ 📊 Sales    │             │
│  │ Thread       │  │ Sequence    │  │ One-Pager   │             │
│  │              │  │              │  │              │             │
│  │ 5 tweets     │  │ 3 emails     │  │ 1 page       │             │
│  │ [View →]     │  │ [View →]     │  │ [View →]     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ ❓ FAQ       │  │ 📝 Blog     │  │ 🎯 Pain     │             │
│  │ Section      │  │ Outline     │  │ Points      │             │
│  │              │  │              │  │              │             │
│  │ 8 Q&As       │  │ 5 sections   │  │ 6 insights   │             │
│  │ [View →]     │  │ [View →]     │  │ [View →]     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ 🚫 Objection│  │ 🔥 Feature  │  │ 💡 Pull     │             │
│  │ Handling     │  │ Requests    │  │ Quotes      │             │
│  │              │  │              │  │              │             │
│  │ 5 objections │  │ 4 requests   │  │ 3 quotes     │             │
│  │ [View →]     │  │ [View →]     │  │ [View →]     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  [↻ Regenerate All]  [📥 Export All]  [➕ Upload Another]       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Copy:**
- **Headline:** "🎉 Your Content is Ready!"
- **Subheadline:** "Generated 12 assets from 'SaaS Customer Interview'"
- **Card Titles:** Asset type (Case Study, Testimonials, etc.)
- **Card Details:** Word count, item count
- **Bottom CTAs:** Regenerate, Export All, Upload Another

**Behavior:**
- Each card is clickable → Opens asset detail modal
- "Export All" → ZIP file download (12 files)
- "Upload Another" → Upload Screen (encourage repeat usage)

---

### Screen 5: Asset Detail Modal (Expanded View)

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  📄 Case Study                          [✕ Close]    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [Title]                                             │
│  How [Customer] Saved 200 Hours with [Product]      │
│                                                      │
│  [Body Preview - 847 words]                          │
│  When Sarah started her consulting business...       │
│  (scrollable content area)                           │
│                                                      │
│  ─────────────────────────────────────────────       │
│                                                      │
│  [📋 Copy to Clipboard]  [⬇️ Download as .docx]      │
│  [📤 Send to Google Docs]  [🔗 Send to Notion]       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Copy:**
- **Headline:** Asset type (e.g., "Case Study")
- **Content:** Full generated text (scrollable)
- **Export Options:** Copy, Download, Integrations

**Behavior:**
- Click "Copy" → Copies to clipboard, shows toast "Copied!"
- Click "Download" → .docx file download
- Click "Send to..." → OAuth flow for integrations

---

### Screen 6: Upload Your Own Transcript

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Upload Your Transcript                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────┐      │
│  │                                          │      │
│  │         📁 Drag & Drop Here              │      │
│  │                                          │      │
│  │    or click to browse files              │      │
│  │                                          │      │
│  │  Supports: .txt, .docx, .pdf             │      │
│  │  Max size: 10 MB                         │      │
│  │                                          │      │
│  └──────────────────────────────────────────┘      │
│                                                     │
│  ────────── OR ──────────                          │
│                                                     │
│  ┌──────────────────────────────────────────┐      │
│  │  Paste your transcript here...           │      │
│  │                                          │      │
│  │  (textarea, expandable)                  │      │
│  │                                          │      │
│  └──────────────────────────────────────────┘      │
│                                                     │
│  ────────── OR ──────────                          │
│                                                     │
│  ┌──────────────────────────────────────────┐      │
│  │  🎙️ Upload Audio/Video File              │      │
│  │  We'll transcribe it for you (+$0.10/min)│      │
│  │                                          │      │
│  │  [Select File]                           │      │
│  └──────────────────────────────────────────┘      │
│                                                     │
│  [← Back]                    [Generate Content →]  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Copy:**
- **Headline:** "Upload Your Transcript"
- **Option 1:** Drag & drop (file types, size limit)
- **Option 2:** Paste text (textarea)
- **Option 3:** Audio/video upload (transcription fee noted)
- **CTA:** "Generate Content →"

**Behavior:**
- File upload → Shows progress bar → Redirect to Brand Voice Settings
- Paste text → Validates (min 200 words) → Redirect to Brand Voice Settings
- Audio/video → Transcription progress → Redirect to Brand Voice Settings

---

### Screen 7: Brand Voice Settings

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Customize Your Brand Voice                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Tone                                               │
│  ┌─────────────────────────────────────────┐       │
│  │ [Professional ▼]                        │       │
│  └─────────────────────────────────────────┘       │
│  Options: Professional, Casual, Friendly, etc.     │
│                                                     │
│  Industry                                           │
│  ┌─────────────────────────────────────────┐       │
│  │ [SaaS ▼]                                │       │
│  └─────────────────────────────────────────┘       │
│  Options: SaaS, Consulting, Agency, etc.           │
│                                                     │
│  Target Audience                                    │
│  ┌─────────────────────────────────────────┐       │
│  │ [B2B Decision Makers ▼]                 │       │
│  └─────────────────────────────────────────┘       │
│                                                     │
│  ───────────────────────────────────────            │
│                                                     │
│  Preview                                            │
│  ┌─────────────────────────────────────────┐       │
│  │ Here's how your content will sound:     │       │
│  │                                         │       │
│  │ "When Sarah started her consulting      │       │
│  │  business, she struggled with..."       │       │
│  │                                         │       │
│  └─────────────────────────────────────────┘       │
│                                                     │
│  [Save & Continue →]                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Copy:**
- **Headline:** "Customize Your Brand Voice"
- **Fields:** Tone, Industry, Target Audience (dropdowns)
- **Preview:** Live-updating sample text
- **CTA:** "Save & Continue →"

**Behavior:**
- Dropdowns update preview in real-time
- Save → Redirect to Generating Content screen
- Settings persist for all future uploads (editable in Settings)

---

## Empty States (When User Has No Data)

### Empty Dashboard (No Transcripts Processed Yet)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              📭 No Content Yet                      │
│                                                     │
│     Upload a transcript to generate your            │
│     first marketing campaign.                       │
│                                                     │
│     ┌─────────────────────────────┐                 │
│     │  Try a Demo First           │                 │
│     └─────────────────────────────┘                 │
│                                                     │
│     Or upload your own transcript →                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Onboarding Emails (Automated Sequence)

### Email 1: Welcome (Triggered on Signup)

**Subject:** "Welcome to Call-Content! Start here 👇"

**Body:**
```
Hi [First Name],

Welcome to Call-Content! 🎉

You're 5 minutes away from turning customer calls into complete marketing campaigns.

Here's how to get started:

1. Try a demo transcript (no upload needed)
2. See what we generate (12 assets in 10 minutes)
3. Upload your own transcript
4. Export and use your content

Start here: [Dashboard link]

Questions? Just reply to this email.

Best,
[Your Name]
Founder, Call-Content
```

---

### Email 2: Nudge (Triggered Day 3 if No Demo/Upload)

**Subject:** "Still there? Try Call-Content in 2 minutes"

**Body:**
```
Hi [First Name],

I noticed you haven't tried Call-Content yet. No worries—life gets busy!

If you have 2 minutes today, try one of our demo transcripts. You'll see exactly what Call-Content can do without uploading anything.

Try a demo: [Demo link]

Still not sure? Reply and I'll answer any questions.

Best,
[Your Name]
```

---

### Email 3: Tip (Triggered Day 7)

**Subject:** "Pro tip: Upload audio files directly"

**Body:**
```
Hi [First Name],

Quick tip: You don't need to transcribe calls before uploading them.

Call-Content can transcribe audio/video files for you (just $0.10/minute). Upload a Zoom recording, podcast episode, or phone call—we'll handle the rest.

Try it: [Upload link]

Best,
[Your Name]
```

---

## Success Metrics (Onboarding)

### Activation Rate (Key Metric):
- **Goal:** 70%+ of signups complete onboarding
- **Benchmark:** 40-50% is typical for SaaS

### Time to Value:
- **Goal:** <5 minutes to first generated asset
- **Benchmark:** <10 minutes is strong

### Demo Usage:
- **Goal:** 80%+ of new users try a demo first
- **Why:** Reduces friction, builds confidence

### Real Upload Rate:
- **Goal:** 50%+ of demo users upload their own transcript
- **Why:** Indicates product-market fit

---

*Last Updated: January 31, 2026*  
*A/B test onboarding flow quarterly*
