# Booster Pack Purchase System - Implementation Spec

**Status:** ✅ Complete and Ready for Deployment  
**Date:** January 31, 2026  
**Price:** $47 for +5 transcript credits

---

## 1. Overview

Allow users to purchase one-time "booster packs" that add transcript credits to their monthly allowance. This provides a middle ground between using all their credits and upgrading to a higher tier.

### Business Value
- **Reduces churn:** Users don't feel forced to upgrade or cancel
- **Increases revenue:** Additional $47 purchases per user
- **Better UX:** Flexibility for occasional high-usage months
- **Increases ARPU:** Supplement subscription revenue

### Pricing
| Item | Price | Credits |
|------|-------|---------|
| Booster Pack | $47 | +5 transcripts |

---

## 2. Files Created/Modified

### New Files

```
components/billing/BoosterPackCard.tsx      (7.4 KB) - React UI component
supabase/migrations/20260131010000_add_booster_credits.sql (2.6 KB) - Database migration
```

### Modified Files

```
app/api/stripe/webhook/route.ts     (7.0 KB) - Fixed duplicate case bug, added booster handling
lib/usage-gating.ts                 (6.3 KB) - Added booster credits to effective limit
app/api/booster-pack/route.ts       (existing) - Already complete
```

---

## 3. Technical Implementation

### 3.1 Database Schema

**New column on `users` table:**
```sql
booster_credits INTEGER DEFAULT 0
```

**New `usage_log` table:**
```sql
CREATE TABLE usage_log (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action_type TEXT,           -- 'booster_pack_purchased'
  credits_added INTEGER,      -- 5
  amount_paid DECIMAL(10,2),  -- 47.00
  metadata JSONB,             -- {session_id, payment_intent}
  created_at TIMESTAMPTZ
);
```

**Helper functions:**
- `get_effective_transcript_limit(user_id)` - Returns base + booster
- `can_process_transcript(user_id)` - Checks against effective limit

### 3.2 API Flow

```
User clicks "Buy Booster Pack"
        ↓
POST /api/booster-pack
        ↓
Create Stripe checkout session (one-time payment)
        ↓
Redirect to Stripe checkout
        ↓
User completes payment
        ↓
Stripe sends checkout.session.completed webhook
        ↓
POST /api/stripe/webhook
        ↓
Webhook handler detects type='booster_pack'
        ↓
Add 5 to user's booster_credits
        ↓
Log purchase in usage_log
        ↓
User redirected to /dashboard?booster=success
```

### 3.3 Usage Gating Logic

```typescript
// Effective limit = base plan limit + booster credits
const effectiveLimit = monthly_transcript_limit + booster_credits;

// 10% grace on effective limit
const graceAllowance = Math.ceil(effectiveLimit * 0.1);
const hardLimit = effectiveLimit + graceAllowance;

// Can process if under hard limit
const canProcess = transcripts_used < hardLimit;
```

### 3.4 Credit Reset

Booster credits reset to 0 at:
1. Start of new billing cycle (invoice.payment_succeeded)
2. Subscription cancellation (customer.subscription.deleted)

---

## 4. UI Component

### BoosterPackCard

Two variants:
- **`variant="full"`** - Full card for billing page (default)
- **`variant="compact"`** - Inline banner for upload page

**Props:**
```typescript
interface BoosterPackCardProps {
  userId: string
  email: string
  currentUsage: number
  limit: number
  boosterCredits?: number
  showWhenNearLimit?: boolean  // Only show at 80%+ usage
  variant?: 'compact' | 'full'
}
```

**Usage:**
```tsx
// Full card on billing page
<BoosterPackCard
  userId={user.id}
  email={user.email}
  currentUsage={usage.transcriptsUsed}
  limit={usage.transcriptLimit}
  boosterCredits={usage.boosterCredits}
/>

// Compact banner on dashboard (only shows at 80%+)
<BoosterPackCard
  userId={user.id}
  email={user.email}
  currentUsage={usage.transcriptsUsed}
  limit={usage.transcriptLimit}
  showWhenNearLimit={true}
  variant="compact"
/>
```

---

## 5. Deployment Steps

### Step 1: Run Database Migration (5 min)

```bash
# Via Supabase CLI
supabase migration up

# Or copy SQL from:
# supabase/migrations/20260131010000_add_booster_credits.sql
# And run in Supabase SQL Editor
```

### Step 2: Deploy Updated Files (5 min)

Files to deploy:
- `app/api/stripe/webhook/route.ts`
- `lib/usage-gating.ts`
- `components/billing/BoosterPackCard.tsx`

### Step 3: Add to Billing Page (10 min)

```tsx
// app/billing/page.tsx
import BoosterPackCard from '@/components/billing/BoosterPackCard'

// Add to the page:
<BoosterPackCard
  userId={user.id}
  email={user.email}
  currentUsage={stats.transcriptsUsed}
  limit={stats.transcriptLimit}
  boosterCredits={stats.boosterCredits}
/>
```

### Step 4: Add Compact Banner to Dashboard (10 min)

```tsx
// app/dashboard/page.tsx or wherever uploads happen
import BoosterPackCard from '@/components/billing/BoosterPackCard'

// Show inline when user is near limit
{usageStats?.showBoosterUpsell && (
  <BoosterPackCard
    userId={user.id}
    email={user.email}
    currentUsage={usageStats.transcriptsUsed}
    limit={usageStats.transcriptLimit}
    boosterCredits={usageStats.boosterCredits}
    showWhenNearLimit={true}
    variant="compact"
  />
)}
```

### Step 5: Test End-to-End (15 min)

1. Create test user at 80%+ usage
2. Click "Buy Booster Pack"
3. Complete Stripe test checkout (use 4242...)
4. Verify:
   - User redirected to dashboard
   - `booster_credits` increased by 5
   - Entry in `usage_log` table
   - Can now process 5 more transcripts

---

## 6. Stripe Configuration

### Required Environment Variables

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=https://call-content.com
```

### Webhook Events Required

Make sure your Stripe webhook endpoint handles:
- `checkout.session.completed` (already configured)

---

## 7. Analytics Events

Track with PostHog:
```typescript
posthog.capture('booster_pack_viewed', {
  userId,
  currentUsage,
  limit,
})

posthog.capture('booster_pack_clicked', {
  userId,
})

posthog.capture('booster_pack_purchased', {
  userId,
  credits: 5,
  price: 47,
})
```

---

## 8. Success Metrics

### Week 1 Targets
- **5%** of users at limit purchase a booster pack
- **< 2 min** checkout completion time
- **0** webhook failures

### Month 1 Targets
- **$500+** in booster pack revenue
- **< 3%** refund rate
- **Positive correlation** with retention (users who buy boosters churn less)

---

## 9. Future Enhancements

Consider for v2:
1. **Volume discounts:** 10 credits for $79, 20 credits for $129
2. **Auto-buy:** Automatically purchase booster when limit reached
3. **Rollover:** Unused booster credits roll to next month
4. **Gifting:** Let users gift booster packs to teammates
5. **Bundles:** Combine booster + premium template packs

---

## 10. Troubleshooting

### "Payment succeeded but credits not added"

1. Check webhook logs in Stripe Dashboard
2. Verify `STRIPE_WEBHOOK_SECRET` is correct
3. Check for errors in `/api/stripe/webhook` logs
4. Manually add credits via Supabase if needed

### "User can't see the booster card"

1. Check `showWhenNearLimit` prop
2. Verify usage data is being fetched
3. Check browser console for errors

### "Booster credits didn't reset"

1. Check `invoice.payment_succeeded` webhook is firing
2. Verify webhook handler resets `booster_credits` to 0
3. Check billing cycle dates

---

## 11. Summary

✅ **API Route:** `/api/booster-pack` - Creates Stripe checkout  
✅ **Webhook:** `/api/stripe/webhook` - Handles payment completion  
✅ **Database:** `booster_credits` column + `usage_log` table  
✅ **UI Component:** `BoosterPackCard` (full + compact variants)  
✅ **Usage Gating:** Updated to include booster credits in limit  
✅ **Documentation:** This spec file  

**Total Implementation:** ~22 KB of code  
**Deployment Time:** ~45 minutes  

**Ready to ship! 🚀**
