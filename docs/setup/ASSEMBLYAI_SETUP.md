# AssemblyAI Transcription API Setup

## Overview

AssemblyAI provides high-quality speech-to-text transcription with features like:
- Speaker diarization (who said what)
- Automatic punctuation and capitalization
- Multiple language support
- 99%+ accuracy
- Fast processing (typically 10-30% of audio duration)

**Cost:** $0.00025/second (~$0.90/hour of audio)

---

## Step 1: Create AssemblyAI Account

1. Go to https://www.assemblyai.com/
2. Click **"Get API Key"** (free tier: 3 hours/month)
3. Sign up with email or GitHub
4. Verify your email

---

## Step 2: Get API Key

1. Go to https://www.assemblyai.com/app
2. Click **"API Keys"** in sidebar
3. Copy your API key (starts with `aai_...`)

---

## Step 3: Add to Environment Variables

### Local Development (.env.local)

```bash
ASSEMBLYAI_API_KEY=aai_your_key_here
```

### Production (Vercel)

1. Go to https://vercel.com/your-project/settings/environment-variables
2. Add new variable:
   - **Name:** `ASSEMBLYAI_API_KEY`
   - **Value:** `aai_your_key_here`
   - **Environments:** Production, Preview, Development
3. Redeploy

---

## Step 4: Install AssemblyAI SDK

```bash
npm install assemblyai
```

---

## Step 5: Test the Integration

### Test Upload (cURL)

```bash
curl -X POST http://localhost:3000/api/transcribe \
  -F "file=@test-audio.mp3" \
  -F "speaker_labels=true"
```

**Expected Response:**

```json
{
  "transcriptId": "abc123...",
  "status": "processing",
  "text": null,
  "duration": 120,
  "cost": 0.03,
  "language": "en",
  "speakerLabels": true
}
```

### Poll for Completion

```bash
curl http://localhost:3000/api/transcribe?id=abc123...
```

**Expected Response (when complete):**

```json
{
  "transcriptId": "abc123...",
  "status": "completed",
  "text": "This is the transcribed text...",
  "duration": 120,
  "language": "en",
  "utterances": [
    {
      "speaker": "A",
      "text": "Hello, how are you?",
      "start": 0,
      "end": 2000
    },
    {
      "speaker": "B",
      "text": "I'm doing well, thanks!",
      "start": 2100,
      "end": 4000
    }
  ]
}
```

---

## Features Enabled

### 1. Speaker Diarization
- Identifies who said what (Speaker A, Speaker B, etc.)
- Useful for interviews, meetings
- Adds ~40% to cost ($0.0001/second extra)

### 2. Automatic Language Detection
- Supports 90+ languages
- Auto-detects if not specified
- Specify with `language` parameter

### 3. Supported File Formats
- **Audio:** MP3, WAV, M4A, FLAC, OGG, WEBM
- **Video:** MP4, MOV, AVI (extracts audio)
- **Max size:** 500MB per file

---

## Pricing

### Free Tier
- **3 hours/month** free transcription
- All features included (speaker labels, timestamps, etc.)
- No credit card required

### Pay-As-You-Go
- **$0.00025/second** ($0.90/hour)
- **+40% for speaker labels** ($0.0001/second)
- **+10% for sentiment analysis** (optional)

### Example Costs

| Audio Length | Base Cost | With Speaker Labels |
|--------------|-----------|---------------------|
| 1 minute | $0.015 | $0.021 |
| 10 minutes | $0.15 | $0.21 |
| 1 hour | $0.90 | $1.26 |
| 10 hours | $9.00 | $12.60 |

**Your pricing:** Add $0.10/min to transcript processing fee  
- Starter plan: 10 transcripts/mo = ~$1.50/mo transcription cost
- Professional: 30 transcripts/mo = ~$4.50/mo transcription cost
- Agency: 100 transcripts/mo = ~$15/mo transcription cost

**Profit margin:** You charge users the same as you charge for transcript processing (transcription is a free value-add)

---

## Error Handling

### Common Errors

**Error: "Invalid API key"**
- Check `ASSEMBLYAI_API_KEY` is set correctly
- Verify key is active at https://www.assemblyai.com/app

**Error: "File too large"**
- Max 500MB per file
- Compress audio/video before uploading
- Or split into chunks

**Error: "Unsupported file format"**
- Use MP3, WAV, MP4, M4A, or WEBM
- Convert with ffmpeg: `ffmpeg -i input.mov -c:a libmp3lame output.mp3`

**Error: "Transcription timeout"**
- AssemblyAI typically processes in 10-30% of audio duration
- If stuck "processing" for >10 min, check status at https://www.assemblyai.com/app

---

## Advanced Features (Optional)

### 1. Custom Vocabulary
Improve accuracy for industry-specific terms:

```typescript
const transcript = await client.transcripts.transcribe({
  audio: uploadUrl,
  word_boost: ['SaaS', 'API', 'webhook'],
  boost_param: 'high',
})
```

### 2. Content Moderation
Flag sensitive content:

```typescript
const transcript = await client.transcripts.transcribe({
  audio: uploadUrl,
  content_safety: true,
})
```

### 3. Sentiment Analysis
Detect positive/negative/neutral sentiment:

```typescript
const transcript = await client.transcripts.transcribe({
  audio: uploadUrl,
  sentiment_analysis: true,
})
```

### 4. Entity Detection
Extract names, dates, locations:

```typescript
const transcript = await client.transcripts.transcribe({
  audio: uploadUrl,
  entity_detection: true,
})
```

---

## Usage Tracking

To track AssemblyAI costs and prevent abuse:

### 1. Log Transcription Costs

Add to `usage_log` table:

```sql
INSERT INTO usage_log (user_id, action_type, metadata)
VALUES (
  '[user-id]',
  'transcription_requested',
  '{"duration": 120, "cost": 0.03, "file_size_mb": 5.2}'::jsonb
);
```

### 2. Set Monthly Limits

Add to user settings:

```typescript
const MAX_TRANSCRIPTION_MINUTES_PER_MONTH = {
  starter: 100,      // ~$1.50/mo cost
  professional: 300, // ~$4.50/mo cost
  agency: 1000,      // ~$15/mo cost
}
```

### 3. Alert High Usage

Email when user exceeds 80% of limit:

```typescript
if (minutesUsed / monthlyLimit > 0.8) {
  sendEmail({
    to: user.email,
    subject: 'You're at 80% of your transcription limit',
    body: 'You've used 80% of your monthly transcription minutes...'
  })
}
```

---

## Migration Path (If Switching Providers)

If AssemblyAI becomes too expensive, alternatives:

1. **Deepgram:** Faster, similar price ($0.0043/min = $0.26/hour)
2. **Rev.ai:** Higher accuracy, more expensive ($0.02/min = $1.20/hour)
3. **Whisper (OpenAI):** $0.006/min ($0.36/hour), lower accuracy
4. **Self-hosted Whisper:** Free, slower, requires GPU

**Recommendation:** Start with AssemblyAI (best balance of quality/price/speed)

---

## Next Steps

1. ✅ Sign up for AssemblyAI
2. ✅ Add API key to `.env.local` and Vercel
3. ✅ Install `assemblyai` package
4. ✅ Test with sample audio file
5. Add usage tracking (log costs per user)
6. Enable AudioUploader component in UI
7. Monitor free tier usage (upgrade to paid when needed)

---

**Status:** Ready to test (API routes created, need API key)

**Priority:** HIGH (removes onboarding friction - users can upload audio directly)
