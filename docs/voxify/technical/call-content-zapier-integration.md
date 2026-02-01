# Call-Content: Zapier Integration Guide
## Complete Implementation for Marketplace Launch

**Date:** January 31, 2026  
**Goal:** Build Zapier integration to export content to 6,000+ apps  
**Timeline:** Week 8-9 (pre-launch)  
**Priority:** HIGH

---

## Why Zapier Integration Matters

**Problem:** Users love Call-Content, but they work in other tools (WordPress, Notion, Google Docs, Mailchimp, HubSpot).

**Solution:** Zapier connects Call-Content to 6,000+ apps with zero code.

**Business Impact:**
- **Reduces churn** — Users can export content wherever they need it
- **Increases trial-to-paid conversion** — "Works with my existing stack" removes friction
- **Enables viral growth** — Listed in Zapier marketplace = free discovery
- **Unlocks new use cases** — Auto-publish to CMS, sync to CRM, trigger email campaigns

---

## Integration Architecture

### **Triggers** (Call-Content → Other Apps)

1. **New Content Generated**
   - Fires when transcript processing completes
   - Returns: Blog post, case study, social posts, email sequence, etc.
   
2. **New Transcript Uploaded**
   - Fires when user uploads a new transcript
   - Returns: Transcript ID, filename, upload timestamp

### **Actions** (Other Apps → Call-Content)

1. **Upload Transcript**
   - Send transcript text or file URL to Call-Content
   - Returns: Processing job ID

2. **Get Content**
   - Retrieve generated content by transcript ID
   - Returns: All content types in structured format

3. **Export to Format**
   - Convert content to specific format (Markdown, HTML, PDF)
   - Returns: Download URL

---

## Step-by-Step Implementation

### **Step 1: Set Up Zapier Developer Account**

1. Go to https://zapier.com/app/developer
2. Click "Create an Integration"
3. Fill in details:
   - **Name:** Call-Content
   - **Description:** "Turn customer calls into blog posts, case studies, and social media content automatically"
   - **Category:** Marketing Automation
   - **Logo:** Upload 256x256 PNG (brand-consistent)
   - **Intended Audience:** Public
   
4. Click "Create Integration"

---

### **Step 2: Install Zapier CLI**

```bash
npm install -g zapier-platform-cli
zapier login
```

**Initialize project:**
```bash
mkdir zapier-call-content
cd zapier-call-content
zapier init . --template=minimal
```

---

### **Step 3: Build Authentication (API Key)**

**File:** `authentication.js`

```javascript
const authentication = {
  type: 'custom',
  fields: [
    {
      key: 'apiKey',
      label: 'API Key',
      required: true,
      type: 'string',
      helpText: 'Find your API key at https://call-content.com/settings/api',
    },
  ],
  test: async (z, bundle) => {
    // Test authentication by fetching user info
    const response = await z.request({
      url: 'https://api.call-content.com/v1/user',
      headers: {
        Authorization: `Bearer ${bundle.authData.apiKey}`,
      },
    });
    
    if (response.status !== 200) {
      throw new Error('Invalid API key');
    }
    
    return response.json;
  },
  connectionLabel: '{{email}}', // Display user's email in Zapier UI
};

module.exports = authentication;
```

---

### **Step 4: Create Trigger - "New Content Generated"**

**File:** `triggers/new_content.js`

```javascript
const perform = async (z, bundle) => {
  const response = await z.request({
    url: 'https://api.call-content.com/v1/content',
    params: {
      limit: 100, // Zapier will dedupe
      since: bundle.meta.page ? bundle.meta.page : undefined,
    },
    headers: {
      Authorization: `Bearer ${bundle.authData.apiKey}`,
    },
  });

  return response.json.data; // Array of content items
};

module.exports = {
  key: 'new_content',
  noun: 'Content',
  display: {
    label: 'New Content Generated',
    description: 'Triggers when a new piece of content (blog post, case study, social post, etc.) is generated from a transcript.',
    important: true, // Featured in UI
  },
  operation: {
    perform,
    sample: {
      id: 'content_abc123',
      transcript_id: 'trans_xyz789',
      type: 'blog_post',
      title: 'How Acme Corp Saved 20 Hours/Week',
      content: 'Full blog post markdown here...',
      word_count: 1500,
      created_at: '2026-01-31T12:00:00Z',
    },
    outputFields: [
      { key: 'id', label: 'Content ID' },
      { key: 'transcript_id', label: 'Transcript ID' },
      { key: 'type', label: 'Content Type' },
      { key: 'title', label: 'Title' },
      { key: 'content', label: 'Content (Markdown)' },
      { key: 'word_count', label: 'Word Count' },
      { key: 'created_at', label: 'Created At' },
    ],
  },
};
```

---

### **Step 5: Create Action - "Upload Transcript"**

**File:** `creates/upload_transcript.js`

```javascript
const perform = async (z, bundle) => {
  const response = await z.request({
    method: 'POST',
    url: 'https://api.call-content.com/v1/transcripts',
    headers: {
      Authorization: `Bearer ${bundle.authData.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: {
      text: bundle.inputData.transcript_text,
      filename: bundle.inputData.filename || 'zapier-upload.txt',
      source: 'zapier',
      templates: bundle.inputData.templates || ['blog_post', 'case_study'], // Which content types to generate
    },
  });

  return response.json;
};

module.exports = {
  key: 'upload_transcript',
  noun: 'Transcript',
  display: {
    label: 'Upload Transcript',
    description: 'Upload a transcript to Call-Content and trigger content generation.',
    important: true,
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'transcript_text',
        label: 'Transcript Text',
        type: 'text',
        required: true,
        helpText: 'Paste the full transcript here.',
      },
      {
        key: 'filename',
        label: 'Filename',
        type: 'string',
        required: false,
        helpText: 'Optional filename (e.g., "customer-interview-jan-2026.txt")',
      },
      {
        key: 'templates',
        label: 'Content Templates',
        type: 'string',
        list: true,
        required: false,
        choices: [
          'blog_post',
          'case_study',
          'social_linkedin',
          'social_twitter',
          'email_sequence',
          'faq',
        ],
        helpText: 'Select which content types to generate (default: blog post + case study)',
      },
    ],
    sample: {
      id: 'trans_xyz789',
      status: 'processing',
      created_at: '2026-01-31T12:00:00Z',
      estimated_completion: '2026-01-31T12:10:00Z',
    },
    outputFields: [
      { key: 'id', label: 'Transcript ID' },
      { key: 'status', label: 'Status' },
      { key: 'created_at', label: 'Created At' },
      { key: 'estimated_completion', label: 'Est. Completion Time' },
    ],
  },
};
```

---

### **Step 6: Test Locally**

```bash
# Test authentication
zapier test

# Deploy to Zapier (private, for testing)
zapier push
```

**Create a test Zap:**
1. Go to https://zapier.com/app/editor
2. Trigger: "New Content Generated"
3. Action: "Create Google Doc" (or "Send Email", etc.)
4. Test it end-to-end

---

### **Step 7: Build API Endpoints (Call-Content Backend)**

You'll need to add these endpoints to your API:

**GET /v1/user**
- Returns user info (for auth test)
- Response: `{ "id": "user_123", "email": "user@example.com" }`

**GET /v1/content**
- Returns recent content (for polling trigger)
- Params: `limit`, `since` (cursor-based pagination)
- Response: `{ "data": [...], "next_cursor": "..." }`

**POST /v1/transcripts**
- Accepts transcript upload from Zapier
- Body: `{ "text": "...", "filename": "...", "templates": [...] }`
- Response: `{ "id": "trans_123", "status": "processing" }`

**POST /v1/webhooks** (Optional, for instant triggers)
- Zapier can subscribe to webhooks for real-time updates
- When content is generated, POST to Zapier webhook URL

---

### **Step 8: Add Webhook Support (Recommended)**

Instead of polling (Trigger checks every 15 minutes), use webhooks for instant delivery.

**File:** `triggers/new_content_instant.js`

```javascript
const subscribeHook = async (z, bundle) => {
  const response = await z.request({
    method: 'POST',
    url: 'https://api.call-content.com/v1/webhooks',
    headers: {
      Authorization: `Bearer ${bundle.authData.apiKey}`,
    },
    body: {
      url: bundle.targetUrl, // Zapier provides this
      event: 'content.generated',
    },
  });

  return response.json;
};

const unsubscribeHook = async (z, bundle) => {
  await z.request({
    method: 'DELETE',
    url: `https://api.call-content.com/v1/webhooks/${bundle.subscribeData.id}`,
    headers: {
      Authorization: `Bearer ${bundle.authData.apiKey}`,
    },
  });
};

const perform = async (z, bundle) => {
  return [bundle.cleanedRequest]; // Zapier will format the webhook payload
};

module.exports = {
  key: 'new_content_instant',
  noun: 'Content',
  display: {
    label: 'New Content Generated (Instant)',
    description: 'Triggers instantly when new content is generated (uses webhooks).',
    important: true,
  },
  operation: {
    type: 'hook',
    performSubscribe: subscribeHook,
    performUnsubscribe: unsubscribeHook,
    perform,
    sample: {
      id: 'content_abc123',
      type: 'blog_post',
      title: 'How Acme Corp Saved 20 Hours/Week',
      content: '...',
    },
  },
};
```

---

### **Step 9: Submit to Zapier Marketplace**

Once tested, submit for review:

1. Go to https://zapier.com/app/developer
2. Click your integration → "Submit to Marketplace"
3. Fill in:
   - **Category:** Marketing Automation
   - **Description:** 500-word explainer (what it does, who it's for)
   - **Use Cases:** 3-5 examples ("Send new blog posts to WordPress", "Create Google Docs from transcripts")
   - **Support Email:** support@call-content.com
   - **Privacy Policy:** https://call-content.com/privacy
   - **Terms of Service:** https://call-content.com/terms
4. Submit for review (takes 7-14 days)

---

## Popular Zap Templates to Promote

After approval, create public "Zap Templates" to drive adoption:

1. **Call-Content → WordPress**
   - Trigger: New blog post generated
   - Action: Create WordPress draft

2. **Call-Content → Notion**
   - Trigger: New case study generated
   - Action: Add to Notion database

3. **Call-Content → Mailchimp**
   - Trigger: New email sequence generated
   - Action: Create Mailchimp campaign

4. **Call-Content → HubSpot**
   - Trigger: New content generated
   - Action: Create HubSpot blog post

5. **Otter.ai → Call-Content → Google Docs**
   - Trigger: New Otter transcript
   - Action 1: Send to Call-Content
   - Action 2: Create Google Doc with generated blog post

---

## Success Metrics

Track these in your dashboard:

- **Zapier activations** (how many users connect to Zapier)
- **Most popular Zaps** (which integrations get the most use)
- **Content generated via Zapier** (volume)
- **Conversion lift** (trial→paid for users who use Zapier)

**Expected impact:**
- 20-30% of users will connect Zapier within first 30 days
- 10-15% lift in trial-to-paid conversion (less friction = more conversions)

---

## Testing Checklist

Before submitting to marketplace:

- [ ] Authentication works (API key test passes)
- [ ] "New Content Generated" trigger returns sample data
- [ ] "Upload Transcript" action successfully creates a job
- [ ] Webhooks fire correctly (if using instant triggers)
- [ ] Error handling works (invalid API key, rate limits, etc.)
- [ ] Sample data is realistic (not lorem ipsum)
- [ ] Output fields are clearly labeled
- [ ] Help text is beginner-friendly
- [ ] Logo is 256x256 PNG, high quality
- [ ] Description mentions "Call-Content" consistently (branding)

---

## Post-Launch Promotion

After marketplace approval:

1. **Announce on socials:**
   - "We just launched on Zapier! Connect Call-Content to 6,000+ apps."
   - Twitter, LinkedIn, ProductHunt update

2. **Add to homepage:**
   - "Integrates with Zapier" badge
   - Link to Zap templates

3. **Email existing users:**
   - Subject: "NEW: Connect Call-Content to Your Favorite Tools"
   - Show top 5 Zaps (WordPress, Notion, Google Docs, etc.)

4. **Blog post:**
   - "How to Auto-Publish Call-Content to WordPress (via Zapier)"
   - SEO keyword: "zapier wordpress integration"

---

## Next Steps

**Week 8:**
1. Set up Zapier developer account
2. Build authentication + 1 trigger + 1 action
3. Test locally

**Week 9:**
4. Add webhook support (instant triggers)
5. Build API endpoints in Call-Content backend
6. Submit to Zapier marketplace

**Week 10:**
7. While waiting for approval, create promotional materials
8. Draft blog post + email announcement
9. Set up analytics tracking

**Week 11:**
10. Launch! (assuming approval)
11. Promote on all channels
12. Monitor usage + iterate based on feedback

---

## Files to Create

1. **zapier-call-content/** (integration code)
   - `authentication.js`
   - `triggers/new_content.js`
   - `creates/upload_transcript.js`
   - `package.json`
   - `index.js`

2. **API endpoints** (backend)
   - `GET /v1/user`
   - `GET /v1/content`
   - `POST /v1/transcripts`
   - `POST /v1/webhooks`

3. **Documentation**
   - Zapier setup guide (for users)
   - API docs for Zapier integration

---

## Resources

- **Zapier Platform Docs:** https://platform.zapier.com/
- **Zapier CLI Docs:** https://github.com/zapier/zapier-platform/tree/main/packages/cli
- **Example Integrations:** https://github.com/zapier/zapier-platform/tree/main/example-apps

---

**Status:** Ready to implement (Week 8-9)  
**Effort:** ~16-20 hours (design, build, test, submit)  
**ROI:** High (unlocks 6,000+ integrations, reduces churn, increases conversion)
