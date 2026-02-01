# Analytics Event Tracking Plan - Call-Content

**Last Updated:** February 1, 2026  
**Status:** Ready for Implementation  
**Priority:** High (Product Intelligence)

---

## 1. Overview

### Purpose
Track user behavior in Call-Content to:
- **Understand product usage** (what features are used, what's ignored)
- **Optimize conversion funnel** (trial → paid, free → upgrade)
- **Identify churn signals** (inactive users, feature drop-off)
- **Measure feature success** (new features, A/B tests)
- **Support data-driven decisions** (what to build next)

### Tool Recommendation: **PostHog**

**Why PostHog:**
✅ **Open-source** (self-hostable, no vendor lock-in)  
✅ **All-in-one** (events, session replay, feature flags, A/B tests)  
✅ **Privacy-friendly** (GDPR compliant, EU hosting available)  
✅ **Free tier:** 1M events/month (enough for early stage)  
✅ **Easy setup:** Drop-in JS snippet + backend SDK  
✅ **Great for product analytics** (funnels, cohorts, retention)

**Alternatives:**
- **Mixpanel:** Better for SaaS, but expensive ($89/month)
- **Amplitude:** Enterprise-focused, overkill for early stage
- **Plausible:** Privacy-first, but limited features (page views only)

**Decision: PostHog** (switch to Mixpanel later if needed)

---

## 2. Events to Track

### 2.1 Account & Auth Events

| Event Name | Description | Properties |
|-----------|-------------|------------|
| **signup_started** | User lands on signup page | `source` (organic, ad, referral) |
| **signup_completed** | User completes registration | `method` (email, google), `plan` (trial, paid) |
| **login** | User logs in | `method` (email, google) |
| **logout** | User logs out | — |
| **password_reset_requested** | User requests password reset | — |
| **password_reset_completed** | User resets password | — |

---

### 2.2 Onboarding Events

| Event Name | Description | Properties |
|-----------|-------------|------------|
| **onboarding_started** | User sees onboarding checklist | — |
| **onboarding_step_completed** | User completes a step | `step` (upload_transcript, generate_content, etc.) |
| **onboarding_completed** | User completes all steps | `time_to_complete` (seconds) |
| **onboarding_skipped** | User skips onboarding | `step` (which step they skipped from) |
| **demo_transcript_viewed** | User clicks "Try a Demo" | `transcript_type` (SaaS, consultant, etc.) |

---

### 2.3 Transcript Events

| Event Name | Description | Properties |
|-----------|-------------|------------|
| **transcript_upload_started** | User clicks "Upload Transcript" | — |
| **transcript_uploaded** | Transcript successfully uploaded | `file_size` (bytes), `file_type` (txt, docx, srt) |
| **transcript_upload_failed** | Upload fails | `error` (file too large, unsupported format) |
| **transcript_pasted** | User pastes text instead of uploading | `text_length` (characters) |
| **transcript_deleted** | User deletes a transcript | — |

---

### 2.4 Content Generation Events

| Event Name | Description | Properties |
|-----------|-------------|------------|
| **content_generation_started** | User clicks "Generate Content" | `template` (blog, case_study, social, etc.) |
| **content_generated** | Content generation completes | `template`, `word_count`, `generation_time` (seconds) |
| **content_generation_failed** | Generation fails | `template`, `error` |
| **content_regenerated** | User clicks "Regenerate" | `template` |
| **content_edited** | User edits generated content | `template`, `changes_made` (boolean) |
| **content_exported** | User exports content | `template`, `format` (markdown, pdf, docx) |

---

### 2.5 Project Management Events

| Event Name | Description | Properties |
|-----------|-------------|------------|
| **project_created** | User creates a new project | — |
| **project_opened** | User opens an existing project | — |
| **project_renamed** | User renames a project | — |
| **project_deleted** | User deletes a project | — |
| **project_archived** | User archives a project | — |

---

### 2.6 Billing & Subscription Events

| Event Name | Description | Properties |
|-----------|-------------|------------|
| **upgrade_modal_viewed** | User sees upgrade prompt | `trigger` (usage_limit, paywall, banner) |
| **upgrade_clicked** | User clicks "Upgrade" | `plan` (starter, pro, agency) |
| **checkout_started** | User starts Stripe checkout | `plan` |
| **checkout_completed** | User completes payment | `plan`, `amount` |
| **subscription_upgraded** | User upgrades plan | `from_plan`, `to_plan` |
| **subscription_downgraded** | User downgrades plan | `from_plan`, `to_plan` |
| **subscription_canceled** | User cancels subscription | `plan`, `reason` (optional) |
| **subscription_reactivated** | User reactivates after canceling | `plan` |
| **usage_limit_reached** | User hits monthly quota | `limit_type` (transcripts, minutes) |

---

### 2.7 Feature Usage Events

| Event Name | Description | Properties |
|-----------|-------------|------------|
| **search_used** | User searches transcripts/projects | `query` |
| **filter_applied** | User filters content | `filter_type` (date, status, template) |
| **sort_changed** | User changes sort order | `sort_by` (date, name, status) |
| **team_member_invited** | User invites a team member | `role` (admin, editor, viewer) |
| **help_center_viewed** | User visits help docs | `page` |
| **support_message_sent** | User sends support message | `category` (bug, feature, question) |

---

### 2.8 Engagement Events

| Event Name | Description | Properties |
|-----------|-------------|------------|
| **page_viewed** | User views a page | `page_name`, `url` |
| **session_started** | User starts a session | — |
| **session_ended** | User ends a session | `duration` (seconds) |
| **feature_discovered** | User clicks on a new feature | `feature_name` |
| **tooltip_viewed** | User hovers over a tooltip | `tooltip_id` |
| **notification_clicked** | User clicks an in-app notification | `notification_type` |

---

## 3. User Properties

Track these properties on every event for segmentation:

| Property | Description | Example |
|----------|-------------|---------|
| **user_id** | Unique user ID | `550e8400-e29b-41d4-a716-446655440000` |
| **email** | User email | `drew@example.com` |
| **plan** | Current subscription plan | `starter`, `pro`, `agency`, `trial` |
| **signup_date** | When they signed up | `2026-01-15` |
| **trial_end_date** | When trial expires | `2026-01-29` |
| **usage_this_month** | Transcripts used this month | `12` |
| **usage_limit** | Monthly transcript limit | `20` |
| **team_size** | Number of team members | `3` |
| **country** | User country (from IP) | `US`, `CA`, `GB` |
| **referrer** | How they found you | `google`, `product_hunt`, `twitter` |

---

## 4. Conversion Funnels to Track

### 4.1 Signup → Activation Funnel

**Steps:**
1. `signup_completed` → User registers
2. `transcript_uploaded` → User uploads first transcript
3. `content_generated` → User generates first content
4. **Activated:** User exports or uses content

**Goal:** Maximize activation rate (% of signups who generate content)

**Current hypothesis:** 70% activation rate (aggressive, but achievable with good onboarding)

---

### 4.2 Trial → Paid Funnel

**Steps:**
1. `signup_completed` (trial) → User starts trial
2. `content_generated` (3+) → User generates at least 3 pieces
3. `checkout_started` → User clicks upgrade
4. `checkout_completed` → User pays

**Goal:** 20-25% trial-to-paid conversion

**Drop-off points to monitor:**
- Users who never generate content (inactive trials)
- Users who generate 1-2 pieces but don't continue (low engagement)
- Users who start checkout but don't complete (pricing objection)

---

### 4.3 Free → Upgrade Funnel (Future)

**Steps:**
1. `usage_limit_reached` → User hits free tier limit
2. `upgrade_modal_viewed` → User sees upgrade prompt
3. `upgrade_clicked` → User clicks "Upgrade"
4. `checkout_completed` → User pays

---

## 5. Dashboards to Build

### 5.1 Product Health Dashboard

**Metrics:**
- Daily/weekly/monthly active users (DAU/WAU/MAU)
- New signups (daily, weekly)
- Activation rate (% who generate content)
- Retention rate (7-day, 30-day)
- Churn rate (monthly)

**Charts:**
- Signups over time (line chart)
- Active users over time (line chart)
- Activation funnel (funnel chart)
- Retention cohorts (cohort table)

---

### 5.2 Feature Usage Dashboard

**Metrics:**
- Most-used templates (blog, case study, social, etc.)
- Export formats (markdown, pdf, docx)
- Average content pieces per user
- Power users (top 10% by usage)

**Charts:**
- Template usage (bar chart)
- Export format breakdown (pie chart)
- Usage distribution (histogram)

---

### 5.3 Conversion Dashboard

**Metrics:**
- Trial-to-paid conversion rate
- Upgrade rate (by plan)
- Average revenue per user (ARPU)
- Customer lifetime value (LTV)
- Churn rate

**Charts:**
- Trial-to-paid funnel (funnel chart)
- Revenue over time (line chart)
- Churn cohorts (cohort table)

---

### 5.4 Engagement Dashboard

**Metrics:**
- Session duration (avg)
- Pages per session (avg)
- Time to first content generation
- Time to activation

**Charts:**
- Session duration distribution (histogram)
- Time to activation (box plot)

---

## 6. Implementation Guide

### 6.1 Install PostHog

**1. Sign up:**
- Go to [posthog.com](https://posthog.com)
- Create account (free tier: 1M events/month)

**2. Get API key:**
- Copy your Project API Key from PostHog dashboard

**3. Install SDK:**

```bash
npm install posthog-js posthog-node
```

**4. Add to environment:**

```env
# .env.local
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

### 6.2 Frontend Tracking (Next.js App)

**Create PostHog provider:**

```typescript
// app/providers/PostHogProvider.tsx
'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.opt_out_capturing();
      },
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
```

**Add to root layout:**

```typescript
// app/layout.tsx
import { PostHogProvider } from './providers/PostHogProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
```

---

### 6.3 Track Events (Frontend)

**Example: Track signup:**

```typescript
// app/signup/page.tsx
'use client';

import { usePostHog } from 'posthog-js/react';

export default function SignupPage() {
  const posthog = usePostHog();

  const handleSignup = async (email: string) => {
    // ... signup logic ...

    posthog.capture('signup_completed', {
      method: 'email',
      plan: 'trial',
    });

    posthog.identify(userId, {
      email: email,
      plan: 'trial',
      signup_date: new Date().toISOString(),
    });
  };

  return <form onSubmit={handleSignup}>...</form>;
}
```

---

**Example: Track content generation:**

```typescript
// components/GenerateContentButton.tsx
'use client';

import { usePostHog } from 'posthog-js/react';

export function GenerateContentButton({ template }: { template: string }) {
  const posthog = usePostHog();

  const handleGenerate = async () => {
    posthog.capture('content_generation_started', { template });

    const startTime = Date.now();
    const content = await generateContent(template);
    const endTime = Date.now();

    posthog.capture('content_generated', {
      template,
      word_count: content.split(' ').length,
      generation_time: (endTime - startTime) / 1000,
    });
  };

  return <button onClick={handleGenerate}>Generate</button>;
}
```

---

### 6.4 Track Events (Backend)

**Install PostHog Node SDK:**

```typescript
// lib/posthog.ts
import { PostHog } from 'posthog-node';

export const posthog = new PostHog(
  process.env.POSTHOG_API_KEY!,
  { host: process.env.POSTHOG_HOST }
);
```

**Example: Track subscription change:**

```typescript
// app/api/webhooks/stripe/route.ts
import { posthog } from '@/lib/posthog';

export async function POST(request: Request) {
  const event = await stripe.webhooks.constructEvent(/* ... */);

  if (event.type === 'customer.subscription.created') {
    const subscription = event.data.object;

    posthog.capture({
      distinctId: subscription.metadata.user_id,
      event: 'checkout_completed',
      properties: {
        plan: subscription.items.data[0].price.lookup_key,
        amount: subscription.items.data[0].price.unit_amount / 100,
      },
    });
  }

  return Response.json({ received: true });
}
```

---

## 7. Privacy & GDPR Compliance

### 7.1 Cookie Consent

**Required:** Ask for consent before tracking (GDPR)

**Implementation:**

```typescript
// components/CookieConsent.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const posthog = usePostHog();

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    posthog.opt_in_capturing();
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    posthog.opt_out_capturing();
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4">
      <p>We use cookies to improve your experience. <a href="/privacy">Privacy Policy</a></p>
      <button onClick={accept}>Accept</button>
      <button onClick={decline}>Decline</button>
    </div>
  );
}
```

---

### 7.2 Data Retention

**PostHog default:** 90 days

**Configure retention:**
- Go to PostHog → Project Settings → Data Retention
- Set to 90 days (GDPR compliant)
- Delete user data on account deletion

---

### 7.3 Anonymize IP Addresses

**PostHog setting:**
- Go to PostHog → Project Settings → Anonymize IPs
- Enable (GDPR best practice)

---

## 8. Key Metrics to Monitor (Week 1)

### Activation Metrics
- **Signup-to-first-content time:** How long until users generate their first content?
  - **Goal:** < 10 minutes
- **Activation rate:** % of signups who generate content
  - **Goal:** 70%

### Engagement Metrics
- **DAU/MAU ratio:** Daily active / monthly active
  - **Goal:** 20% (sticky product)
- **Content pieces per user per week:** How much are people using it?
  - **Goal:** 3+ pieces/week

### Conversion Metrics
- **Trial-to-paid conversion:** % of trials that convert
  - **Goal:** 20-25%
- **Time to upgrade:** How long from signup to paid?
  - **Goal:** < 14 days (before trial ends)

---

## 9. A/B Tests to Run (Future)

Once you have enough traffic, test:

### Onboarding Tests
- **Test:** Show demo transcript vs. force upload
- **Metric:** Activation rate

### Pricing Tests
- **Test:** $27 vs. $37 for Starter plan
- **Metric:** Conversion rate

### Feature Tests
- **Test:** 8 templates vs. 5 templates
- **Metric:** Engagement

---

## 10. Implementation Checklist

### Phase 1: Setup (1 day)
- [ ] Sign up for PostHog
- [ ] Install posthog-js and posthog-node
- [ ] Add PostHogProvider to app
- [ ] Test event tracking (console.log)

### Phase 2: Core Events (2 days)
- [ ] Track signup/login events
- [ ] Track transcript upload events
- [ ] Track content generation events
- [ ] Track billing events (Stripe webhooks)

### Phase 3: User Properties (1 day)
- [ ] Set user properties on signup
- [ ] Update properties on plan change
- [ ] Update properties on usage

### Phase 4: Dashboards (1 day)
- [ ] Build Product Health dashboard
- [ ] Build Feature Usage dashboard
- [ ] Build Conversion dashboard

### Phase 5: Privacy (1 day)
- [ ] Add cookie consent banner
- [ ] Anonymize IPs
- [ ] Set data retention to 90 days
- [ ] Update Privacy Policy

**Total time:** 5-6 days

---

## 11. Cost Estimate

**PostHog Pricing:**
- **Free:** 1M events/month
- **Paid:** $0.000248 per event after 1M

**Estimated usage:**
- 100 users × 50 events/user/month = 5,000 events/month
- **Cost:** Free (well under 1M limit)

**With 10x growth (1,000 users):**
- 50,000 events/month
- **Cost:** Still free

**Break-even point:** ~20,000 users (1M events/month)

**Conclusion:** Free tier is sufficient for years.

---

## 12. Next Steps

1. Sign up for PostHog
2. Install SDK
3. Add PostHogProvider
4. Start tracking core events (signup, upload, generate)
5. Build first dashboard (Product Health)
6. Monitor activation rate

**Questions?** Let me know if you need help with implementation.

---

*Last updated: February 1, 2026*
