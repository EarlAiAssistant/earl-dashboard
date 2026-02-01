# AssemblyAI Transcription API Integration Specification

**Last Updated:** February 1, 2026  
**Status:** Ready for Implementation  
**Priority:** High (Core Feature)

---

## 1. Overview

### Purpose
Add audio/video transcription capability to Call-Content so users can upload media files directly instead of manually transcribing first.

### Current Flow (Manual)
1. User records call (Zoom, Google Meet)
2. User transcribes via Otter/Zoom/Fireflies
3. User downloads transcript
4. User uploads transcript to Call-Content
5. Call-Content generates content

### New Flow (Automated)
1. User records call
2. User uploads audio/video file to Call-Content
3. **Call-Content transcribes via AssemblyAI**
4. Call-Content generates content

**Time saved:** 5-10 minutes per upload (user doesn't need external transcription tool)

---

## 2. Why AssemblyAI?

### Pros
✅ **Best accuracy:** 90-95% accuracy (beats Whisper, Google Speech)  
✅ **Speaker labels:** Identifies who said what (critical for interviews)  
✅ **Fast:** Real-time processing (1 hour audio = ~5 min processing)  
✅ **Flexible pricing:** Pay-per-use ($0.00025/second = $0.90/hour)  
✅ **Rich features:** Summarization, entity detection, sentiment analysis  
✅ **Well-documented API:** Easy integration  
✅ **No vendor lock-in:** Can switch to Deepgram/Whisper later if needed

### Cons
❌ **Cost:** $0.90/hour of audio (vs. Whisper API at $0.006/minute = $0.36/hour)  
❌ **Third-party dependency:** Adds external service to stack

### Decision
**Use AssemblyAI for now.** Better accuracy and speaker labels are worth the cost. Can optimize pricing later if needed.

---

## 3. Technical Architecture

### 3.1 Data Flow

```
User uploads file (audio/video)
    ↓
Next.js API route (/api/transcribe)
    ↓
Upload file to Supabase Storage
    ↓
Send file URL to AssemblyAI
    ↓
AssemblyAI processes (async)
    ↓
Webhook callback to /api/webhooks/assemblyai
    ↓
Store transcript in Supabase DB
    ↓
Update UI (transcript ready)
    ↓
User generates content
```

---

### 3.2 Database Schema

**New table: `transcriptions`**

```sql
CREATE TABLE transcriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- File info
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  
  -- AssemblyAI info
  assemblyai_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'queued', -- queued | processing | completed | error
  
  -- Transcript data
  transcript_text TEXT,
  speaker_labels JSONB, -- [{speaker: 'A', text: '...', start: 0, end: 10}]
  confidence FLOAT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX idx_transcriptions_user_id ON transcriptions(user_id);
CREATE INDEX idx_transcriptions_project_id ON transcriptions(project_id);
CREATE INDEX idx_transcriptions_status ON transcriptions(status);
CREATE INDEX idx_transcriptions_assemblyai_id ON transcriptions(assemblyai_id);
```

---

### 3.3 Supabase Storage Setup

**Bucket:** `audio-uploads`

**Settings:**
- **Public:** No (files are private)
- **File size limit:** 500MB (AssemblyAI limit: 5GB, but 500MB is reasonable)
- **Allowed MIME types:** 
  - `audio/*` (mp3, wav, m4a, etc.)
  - `video/*` (mp4, mov, webm, etc.)

**RLS (Row Level Security):**
```sql
-- Users can only upload their own files
CREATE POLICY "Users can upload their own audio files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can only read their own files
CREATE POLICY "Users can read their own audio files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'audio-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 4. API Implementation

### 4.1 Upload Endpoint

**Route:** `/api/transcribe`  
**Method:** `POST`  
**Auth:** Required (JWT)

**Request:**
```typescript
// multipart/form-data
{
  file: File, // audio or video file
  projectId: string, // optional, link to existing project
  speakerLabels: boolean // default: true
}
```

**Response:**
```typescript
{
  transcriptionId: string,
  status: 'queued' | 'processing',
  estimatedTime: number // seconds
}
```

**Implementation:**

```typescript
// app/api/transcribe/route.ts
import { createClient } from '@supabase/supabase-js';
import { AssemblyAI } from 'assemblyai';

export async function POST(request: Request) {
  // 1. Verify auth
  const supabase = createClient(/* ... */);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  // 2. Parse form data
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const projectId = formData.get('projectId') as string;
  const speakerLabels = formData.get('speakerLabels') === 'true';

  // 3. Validate file
  if (!file) return new Response('No file provided', { status: 400 });
  if (file.size > 500 * 1024 * 1024) {
    return new Response('File too large (max 500MB)', { status: 413 });
  }

  // 4. Upload to Supabase Storage
  const fileName = `${user.id}/${Date.now()}_${file.name}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('audio-uploads')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  // 5. Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('audio-uploads')
    .getPublicUrl(fileName);

  // 6. Create transcription record
  const { data: transcription, error: dbError } = await supabase
    .from('transcriptions')
    .insert({
      user_id: user.id,
      project_id: projectId,
      file_name: file.name,
      file_url: publicUrl,
      file_size_bytes: file.size,
      status: 'queued'
    })
    .select()
    .single();

  if (dbError) throw dbError;

  // 7. Send to AssemblyAI
  const assemblyai = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY!
  });

  const params = {
    audio_url: publicUrl,
    speaker_labels: speakerLabels,
    webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/assemblyai`,
    webhook_auth_header_name: 'X-Webhook-Secret',
    webhook_auth_header_value: process.env.ASSEMBLYAI_WEBHOOK_SECRET!
  };

  const transcript = await assemblyai.transcripts.create(params);

  // 8. Update record with AssemblyAI ID
  await supabase
    .from('transcriptions')
    .update({
      assemblyai_id: transcript.id,
      status: 'processing'
    })
    .eq('id', transcription.id);

  // 9. Return response
  return Response.json({
    transcriptionId: transcription.id,
    status: 'processing',
    estimatedTime: Math.ceil(file.size / 1000000) * 2 // rough estimate
  });
}
```

---

### 4.2 Webhook Endpoint

**Route:** `/api/webhooks/assemblyai`  
**Method:** `POST`  
**Auth:** Webhook secret (X-Webhook-Secret header)

**Request (from AssemblyAI):**
```json
{
  "transcript_id": "abc123",
  "status": "completed",
  "text": "Full transcript text...",
  "utterances": [
    {
      "speaker": "A",
      "text": "Hello, how are you?",
      "start": 0,
      "end": 2000
    }
  ],
  "confidence": 0.92
}
```

**Implementation:**

```typescript
// app/api/webhooks/assemblyai/route.ts
export async function POST(request: Request) {
  // 1. Verify webhook secret
  const secret = request.headers.get('X-Webhook-Secret');
  if (secret !== process.env.ASSEMBLYAI_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Parse webhook data
  const data = await request.json();
  const { transcript_id, status, text, utterances, confidence } = data;

  // 3. Find transcription record
  const supabase = createClient(/* service role key */);
  const { data: transcription } = await supabase
    .from('transcriptions')
    .select('*')
    .eq('assemblyai_id', transcript_id)
    .single();

  if (!transcription) {
    return new Response('Transcription not found', { status: 404 });
  }

  // 4. Update record
  if (status === 'completed') {
    await supabase
      .from('transcriptions')
      .update({
        status: 'completed',
        transcript_text: text,
        speaker_labels: utterances,
        confidence: confidence,
        completed_at: new Date().toISOString()
      })
      .eq('id', transcription.id);

    // 5. Notify user (optional: send email or in-app notification)
    // await sendNotification(transcription.user_id, 'Transcription ready!');
  } else if (status === 'error') {
    await supabase
      .from('transcriptions')
      .update({
        status: 'error',
        error_message: data.error
      })
      .eq('id', transcription.id);
  }

  return Response.json({ success: true });
}
```

---

### 4.3 Status Check Endpoint

**Route:** `/api/transcriptions/[id]`  
**Method:** `GET`  
**Auth:** Required

**Response:**
```typescript
{
  id: string,
  status: 'queued' | 'processing' | 'completed' | 'error',
  transcript: string | null,
  speakerLabels: Array<{speaker: string, text: string}> | null,
  confidence: number | null,
  error: string | null
}
```

---

## 5. Frontend Implementation

### 5.1 Upload UI Component

```typescript
// components/TranscriptionUpload.tsx
'use client';

import { useState } from 'react';

export function TranscriptionUpload({ projectId }: { projectId?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [transcriptionId, setTranscriptionId] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (projectId) formData.append('projectId', projectId);
    formData.append('speakerLabels', 'true');

    const res = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    setTranscriptionId(data.transcriptionId);
    setUploading(false);

    // Poll for completion
    pollStatus(data.transcriptionId);
  };

  const pollStatus = async (id: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/transcriptions/${id}`);
      const data = await res.json();

      if (data.status === 'completed') {
        clearInterval(interval);
        // Redirect to transcript view
        window.location.href = `/projects/${projectId}?transcript=${id}`;
      } else if (data.status === 'error') {
        clearInterval(interval);
        alert('Transcription failed: ' + data.error);
      }
    }, 5000); // Poll every 5 seconds
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="audio/*,video/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="btn btn-primary"
      >
        {uploading ? 'Uploading...' : 'Upload and Transcribe'}
      </button>
      {transcriptionId && (
        <p className="text-sm text-gray-600">
          Transcribing... This may take a few minutes.
        </p>
      )}
    </div>
  );
}
```

---

## 6. Pricing & Usage Tracking

### 6.1 AssemblyAI Pricing

**Pay-per-use:**
- **$0.00025 per second** of audio
- **$0.015 per minute** = **$0.90 per hour**

**Example costs:**
- 30-minute call: $0.45
- 1-hour podcast: $0.90
- 2-hour interview: $1.80

---

### 6.2 Pass Cost to Users

**Option 1: Include in subscription**
- Starter ($27/month): 20 hours of transcription (~$18 cost)
- Professional ($67/month): 50 hours (~$45 cost)
- Agency ($147/month): Unlimited

**Option 2: Per-transcription pricing**
- Charge $1 per hour of audio (markup: $0.10 profit)
- Bill monthly based on usage

**Recommendation:** Include in subscription with soft limits. Easier billing, predictable cost for users.

---

### 6.3 Usage Tracking

Add to `subscriptions` table:
```sql
ALTER TABLE subscriptions
ADD COLUMN transcription_minutes_used INTEGER DEFAULT 0,
ADD COLUMN transcription_minutes_limit INTEGER; -- based on plan
```

Update after each transcription:
```typescript
await supabase
  .from('subscriptions')
  .update({
    transcription_minutes_used: sql`transcription_minutes_used + ${durationMinutes}`
  })
  .eq('user_id', userId);
```

---

## 7. Error Handling

### 7.1 Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| File too large | > 500MB | Ask user to compress or trim file |
| Unsupported format | .avi, .flac, etc. | Convert to .mp3, .wav, .m4a |
| AssemblyAI API error | Rate limit, API down | Retry with exponential backoff |
| Transcription failed | Poor audio quality | Notify user, offer refund/retry |
| Webhook timeout | Didn't receive callback | Poll AssemblyAI API directly |

---

### 7.2 Retry Logic

```typescript
async function transcribeWithRetry(audioUrl: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await assemblyai.transcripts.create({ audio_url: audioUrl });
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(2 ** i * 1000); // Exponential backoff: 1s, 2s, 4s
    }
  }
}
```

---

## 8. Testing Plan

### 8.1 Unit Tests

**Test cases:**
- ✅ Upload valid audio file (.mp3)
- ✅ Upload valid video file (.mp4)
- ✅ Reject file > 500MB
- ✅ Reject unsupported format (.txt)
- ✅ Handle missing API key
- ✅ Handle AssemblyAI API error
- ✅ Webhook with valid secret
- ✅ Webhook with invalid secret
- ✅ Completed transcription updates DB
- ✅ Failed transcription updates DB

---

### 8.2 Integration Tests

**Test flow:**
1. Upload 1-minute test audio file
2. Wait for transcription (poll every 5s)
3. Verify transcript text is accurate
4. Verify speaker labels (if multi-speaker)
5. Verify duration calculation
6. Verify usage tracking updated

**Test files:**
- Short audio (30 seconds)
- Medium audio (5 minutes)
- Long audio (30 minutes)
- Multi-speaker (2-3 speakers)
- Poor quality audio (background noise)

---

## 9. Implementation Checklist

### Phase 1: Setup (1 day)
- [ ] Sign up for AssemblyAI account
- [ ] Get API key (store in .env as `ASSEMBLYAI_API_KEY`)
- [ ] Generate webhook secret (store as `ASSEMBLYAI_WEBHOOK_SECRET`)
- [ ] Install AssemblyAI SDK: `npm install assemblyai`
- [ ] Create Supabase Storage bucket (`audio-uploads`)
- [ ] Run database migration (create `transcriptions` table)

---

### Phase 2: Backend (2-3 days)
- [ ] Create `/api/transcribe` route
- [ ] Create `/api/webhooks/assemblyai` route
- [ ] Create `/api/transcriptions/[id]` route
- [ ] Add error handling
- [ ] Add retry logic
- [ ] Add usage tracking
- [ ] Test with sample files

---

### Phase 3: Frontend (1-2 days)
- [ ] Build TranscriptionUpload component
- [ ] Add file validation (size, type)
- [ ] Add progress indicator
- [ ] Add polling for status updates
- [ ] Show transcript when ready
- [ ] Handle errors gracefully

---

### Phase 4: Testing (1 day)
- [ ] Unit tests for API routes
- [ ] Integration tests for full flow
- [ ] Test with various file types
- [ ] Test error scenarios
- [ ] Test webhook delivery

---

### Phase 5: Deployment (1 day)
- [ ] Deploy to staging
- [ ] Test on staging with real files
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Update documentation

**Total time estimate:** 5-7 days

---

## 10. Future Enhancements

### 10.1 Advanced Features (Post-Launch)

**AssemblyAI offers:**
- **Auto-chapters:** Divide long audio into chapters
- **Summarization:** Generate summary of transcript
- **Entity detection:** Extract names, companies, dates
- **Sentiment analysis:** Detect positive/negative sentiment
- **PII redaction:** Remove sensitive info (SSN, credit cards)

**Use cases:**
- Auto-generate blog post outline from chapters
- Use entity detection to auto-tag content
- Sentiment analysis for testimonials (filter for positive quotes)

---

### 10.2 Alternative Providers

**If AssemblyAI becomes too expensive:**
- **Deepgram:** Similar accuracy, ~$0.43/hour (50% cheaper)
- **OpenAI Whisper API:** $0.006/minute = $0.36/hour (60% cheaper, but lower accuracy)
- **Google Speech-to-Text:** $0.024/minute = $1.44/hour (more expensive, but multi-language)

**Easy to swap:** Just replace AssemblyAI SDK calls with another provider.

---

## 11. Security Considerations

### 11.1 File Upload Security

**Threats:**
- Malicious files (viruses, malware)
- Large files (DoS attack)
- Unauthorized access to files

**Mitigations:**
- ✅ Validate file type (whitelist: audio/*, video/*)
- ✅ Limit file size (500MB max)
- ✅ Store files in private bucket (Supabase RLS)
- ✅ Scan files with antivirus (optional, via ClamAV)
- ✅ Delete files after transcription (optional, to save storage costs)

---

### 11.2 Webhook Security

**Threats:**
- Replay attacks
- Forged webhooks

**Mitigations:**
- ✅ Verify webhook secret header
- ✅ Use HTTPS only
- ✅ Rate limit webhook endpoint (max 100/min)

---

## 12. Monitoring & Alerts

### 12.1 What to Monitor

**Key metrics:**
- Transcriptions per hour
- Average processing time
- Error rate (%)
- AssemblyAI API latency
- Storage usage (GB)

**Alerts:**
- Error rate > 5%
- Processing time > 10 minutes
- AssemblyAI API down
- Storage > 80% full

**Tools:**
- **Sentry:** Error tracking
- **Vercel Analytics:** API performance
- **Supabase Dashboard:** Storage usage

---

## 13. Documentation

### 13.1 User-Facing Docs

Add to Getting Started Guide:

**"How to Transcribe Audio Files"**

1. Click "Upload Audio/Video"
2. Select file (up to 500MB)
3. Click "Upload and Transcribe"
4. Wait 2-5 minutes (depends on file size)
5. Transcript appears automatically
6. Click "Generate Content" to create blog posts, case studies, etc.

**Supported formats:** .mp3, .wav, .m4a, .mp4, .mov, .webm

---

### 13.2 FAQ

**Q: How long does transcription take?**  
A: Usually 2-5 minutes for a 30-minute file. Longer files take proportionally longer.

**Q: What file formats are supported?**  
A: Audio (.mp3, .wav, .m4a) and video (.mp4, .mov, .webm).

**Q: What's the maximum file size?**  
A: 500MB. If your file is larger, compress it or trim it.

**Q: How accurate is the transcription?**  
A: 90-95% accurate. You may need to edit for names, jargon, or accents.

**Q: Can I upload files in other languages?**  
A: Currently English only. Multi-language support coming soon.

---

## 14. Cost Estimate

### 14.1 Monthly Costs (Production)

**Assumptions:**
- 100 users
- 4 transcriptions per user per month
- Average duration: 30 minutes

**Calculations:**
- Total hours: 100 × 4 × 0.5 = 200 hours/month
- AssemblyAI cost: 200 × $0.90 = **$180/month**

**With 10x growth (1,000 users):**
- 2,000 hours/month
- AssemblyAI cost: **$1,800/month**

**Revenue (to cover costs):**
- If avg plan is $67/month → 1,000 users = $67,000/month revenue
- Transcription cost = 2.7% of revenue (affordable)

---

## 15. Summary

### What This Adds
- **Users can upload audio/video files** directly
- **No need for external transcription tool** (Otter, Fireflies)
- **Faster workflow:** Upload → Transcribe → Generate content
- **Better UX:** All-in-one platform

### Implementation Effort
- **Time:** 5-7 days
- **Complexity:** Medium
- **Risk:** Low (well-documented API)

### Next Steps
1. Sign up for AssemblyAI
2. Run database migration
3. Implement `/api/transcribe` endpoint
4. Implement webhook handler
5. Build upload UI
6. Test and deploy

---

**Ready to implement?** All the code examples and specs are above. Let me know if you need clarification on any part.

---

*Last updated: February 1, 2026*
