# PostHog Analytics Setup Guide

## Quick Start (5 minutes)

### Step 1: Create PostHog Account

1. Go to [posthog.com](https://posthog.com) and sign up
2. Create a new project for Call-Content
3. Copy your Project API Key from Settings → Project API Key

### Step 2: Add Environment Variables

Add to your `.env.local` file:

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your-project-key-here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

For EU hosting, use:
```bash
NEXT_PUBLIC_POSTHOG_HOST=https://eu.posthog.com
```

### Step 3: Install Dependencies

```bash
npm install
# or
pnpm install
```

The `posthog-js` package is already in `package.json`.

### Step 4: Deploy

Deploy to Vercel or your hosting provider. Make sure to add the environment variables to your production environment.

---

## How It Works

### Automatic Tracking

PostHog is initialized in `components/providers/PostHogProvider.tsx` which wraps the entire app in `app/layout.tsx`. This enables:

- **Page views** - Tracked automatically
- **Page leaves** - Tracked automatically
- **Session recording** - Disabled by default (enable in PostHog dashboard)
- **User identification** - Call `identifyUser()` after login

### Manual Event Tracking

Import the analytics modules and track events:

```typescript
import { 
  AuthAnalytics,
  ContentAnalytics,
  BillingAnalytics,
  TranscriptAnalytics 
} from '@/lib/analytics'

// Track login
AuthAnalytics.login('email')

// Track content generation
ContentAnalytics.generationStarted('blog-post', 'transcript-123')
ContentAnalytics.generationCompleted('blog-post', 1500, 45)

// Track billing events
BillingAnalytics.boosterPackPurchased(5, 47)
BillingAnalytics.trialStarted('professional')
```

### User Identification

After a user logs in, identify them in PostHog:

```typescript
import { identifyUser } from '@/components/providers/PostHogProvider'

// After successful login
identifyUser(user.id, {
  email: user.email,
  tier: user.subscription_tier,
  signup_date: user.created_at,
})
```

### On Logout

Reset the user identity:

```typescript
import { resetUser } from '@/components/providers/PostHogProvider'

// On logout
resetUser()
```

---

## Available Analytics Modules

### AuthAnalytics
- `signupStarted(source?)`
- `signupCompleted(method, plan)`
- `login(method)`
- `logout()`
- `passwordResetRequested()`
- `passwordResetCompleted()`

### OnboardingAnalytics
- `started()`
- `stepViewed(step)`
- `stepCompleted(step, timeSeconds?)`
- `completed(totalTimeSeconds)`
- `skipped(fromStep)`
- `modalViewed()`
- `modalDismissed()`
- `getStartedClicked()`

### TranscriptAnalytics
- `uploadStarted(source)`
- `uploadCompleted(source, wordCount, durationSeconds?)`
- `uploadFailed(source, error)`
- `transcriptionStarted(fileType, durationSeconds)`
- `transcriptionCompleted(durationSeconds, costUsd)`
- `transcriptionFailed(error)`
- `viewed(transcriptId)`
- `deleted(transcriptId)`

### ContentAnalytics
- `generationStarted(template, transcriptId)`
- `generationCompleted(template, wordCount, generationTimeSeconds)`
- `generationFailed(template, error)`
- `contentViewed(contentId, template)`
- `contentEdited(contentId, template)`
- `contentExported(contentId, format)`
- `contentCopied(contentId)`
- `contentDeleted(contentId)`

### BillingAnalytics
- `pricingViewed()`
- `planSelected(tier, billingPeriod)`
- `checkoutStarted(tier, amount)`
- `checkoutCompleted(tier, amount)`
- `checkoutAbandoned(tier, step)`
- `trialStarted(tier)`
- `trialEnding(daysRemaining)`
- `trialConverted(tier)`
- `trialExpired(tier)`
- `boosterPackViewed(usagePercent)`
- `boosterPackPurchased(credits, amount)`
- `limitReached(currentUsage, limit)`
- `gracePeriodEntered(usagePercent)`
- `upgraded(fromTier, toTier)`
- `downgraded(fromTier, toTier)`
- `cancelled(tier, reason?)`

### FeatureAnalytics
- `used(feature, properties?)`
- `searchUsed(query, resultsCount)`
- `filterUsed(filterType, filterValue)`
- `sortUsed(sortField, sortDirection)`
- `exportUsed(format, itemCount)`

### ErrorAnalytics
- `occurred(errorType, errorMessage, context?)`
- `pageNotFound(path)`
- `apiError(endpoint, statusCode, errorMessage)`

### PageAnalytics
- `viewed(pageName, properties?)`
- `timeSpent(pageName, durationSeconds)`
- `scrollDepth(pageName, depthPercent)`

---

## PostHog Dashboard Tips

### Key Dashboards to Create

1. **Activation Funnel**
   - signup_completed → onboarding_completed → transcript_upload_completed → content_generation_completed

2. **Trial Conversion**
   - trial_started → checkout_started → checkout_completed

3. **Feature Adoption**
   - Group by template type to see most popular content types

4. **Churn Signals**
   - Users who stopped using features before canceling

### Cohorts to Define

- **Power Users**: Generated 5+ pieces of content this month
- **At Risk**: No login in 7+ days with active subscription
- **Trial Ending Soon**: Trial expires in 3 days

### Session Recording

Enable session recording in PostHog to watch user sessions:
1. Go to PostHog dashboard
2. Settings → Session Recording
3. Enable "Record user sessions"

---

## Privacy Compliance

The PostHog provider respects:
- **Do Not Track (DNT)** - Automatically respects browser DNT setting
- **Cookie consent** - You can gate `posthog.init()` behind consent
- **GDPR** - Use EU hosting for EU users
- **Data deletion** - Use `posthog.reset()` on account deletion

To gate behind consent:

```typescript
// In PostHogProvider.tsx
if (hasConsented && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, { ... })
}
```

---

## Troubleshooting

### Events not appearing

1. Check browser console for errors
2. Verify `NEXT_PUBLIC_POSTHOG_KEY` is set
3. Enable debug mode: `debug: true` in init config
4. Check PostHog dashboard Live Events

### User identity not persisting

Make sure you're calling `identifyUser()` after login with a consistent user ID.

### High event volume

Disable autocapture if you're getting too many events:
```typescript
posthog.init(key, { autocapture: false })
```

---

## Summary

✅ PostHog provider configured  
✅ All analytics modules created  
✅ Environment variables documented  
✅ Privacy compliance considered  
✅ Ready for production  

Just add your PostHog key and deploy! 🚀
