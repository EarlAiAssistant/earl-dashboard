# Usage Grace Period (10%) Implementation Spec

**Last Updated:** February 1, 2026  
**Status:** Ready for Implementation  
**Priority:** Medium (Customer Satisfaction)

---

## 1. Overview

### Problem
Users who hit their monthly usage limit mid-month are blocked immediately. This creates friction and frustration.

**Example scenarios:**
- User on Starter plan (20 transcripts/month) uploads 20 transcripts
- On transcript #21, they're blocked with "Upgrade now" message
- But they're only 1 transcript over (5% overage)
- Feels punitive, especially if they're mid-workflow

---

### Solution: 10% Grace Period

Instead of hard-blocking at 100% usage, allow a 10% grace buffer.

**Example with grace period:**
- User plan: 20 transcripts/month
- Hard limit with grace: 22 transcripts (20 × 1.10)
- User uploads 21 transcripts → **Allowed** (soft warning shown)
- User uploads 22 transcripts → **Allowed** (final warning shown)
- User uploads 23 transcripts → **Blocked** (must upgrade)

**Benefits:**
- ✅ Better UX (less frustrating)
- ✅ Reduces support tickets ("I'm only 1 over!")
- ✅ Increases goodwill (customers feel respected)
- ✅ Still encourages upgrades (warnings + hard limit at 110%)

---

## 2. Business Logic

### 2.1 Grace Period Rules

| Usage % | Status | UX |
|---------|--------|-----|
| **0-100%** | Normal | No warnings |
| **100-105%** | Soft warning | "You've used 100% of your plan. Upgrade to continue after this month." |
| **105-110%** | Final warning | "You're in grace period (105%). Upgrade to avoid interruption." |
| **>110%** | Hard block | "You've exceeded your limit. Upgrade to continue." |

---

### 2.2 Grace Period Calculation

```typescript
const plan = {
  limit: 20, // transcripts/month
  used: 21,
};

const graceLimit = Math.floor(plan.limit * 1.10); // 22
const isWithinGrace = plan.used <= graceLimit; // true (21 <= 22)
const isOverGrace = plan.used > graceLimit; // false

if (isOverGrace) {
  // Block upload
} else if (plan.used > plan.limit) {
  // Allow, but show warning
} else {
  // Normal usage
}
```

---

### 2.3 Monthly Reset

Grace period resets at the start of each billing cycle.

**Example:**
- User on Starter plan (20 limit)
- January: Used 22 (within grace)
- February 1: Usage resets to 0
- Grace limit resets to 22

---

## 3. Database Schema Changes

### 3.1 Update `subscriptions` Table

```sql
ALTER TABLE subscriptions
ADD COLUMN usage_grace_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN usage_grace_percentage INTEGER DEFAULT 10; -- 10% grace
```

**Why make it configurable:**
- Future flexibility (change grace % if needed)
- Per-plan grace periods (e.g., Enterprise gets 20% grace)
- Can disable for specific users (abuse prevention)

---

### 3.2 Query Example

```typescript
// Get user's usage and limits
const { data: subscription } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', userId)
  .single();

const limit = subscription.transcript_limit; // 20
const used = subscription.transcripts_used_this_month; // 21
const graceEnabled = subscription.usage_grace_enabled; // true
const gracePercentage = subscription.usage_grace_percentage; // 10

const graceLimit = graceEnabled
  ? Math.floor(limit * (1 + gracePercentage / 100))
  : limit; // 22

const isBlocked = used >= graceLimit; // false (21 < 22)
const isInGrace = used > limit && used < graceLimit; // true
```

---

## 4. Implementation (Backend)

### 4.1 Usage Check Function

Create a reusable function to check usage limits.

```typescript
// lib/usage.ts

export interface UsageCheck {
  allowed: boolean;
  status: 'normal' | 'soft_warning' | 'final_warning' | 'blocked';
  limit: number;
  used: number;
  graceLimit: number;
  percentUsed: number;
  message: string;
}

export async function checkUsageLimit(userId: string): Promise<UsageCheck> {
  const supabase = createClient();

  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!subscription) {
    throw new Error('No subscription found');
  }

  const limit = subscription.transcript_limit;
  const used = subscription.transcripts_used_this_month;
  const graceEnabled = subscription.usage_grace_enabled ?? true;
  const gracePercentage = subscription.usage_grace_percentage ?? 10;

  const graceLimit = graceEnabled
    ? Math.floor(limit * (1 + gracePercentage / 100))
    : limit;

  const percentUsed = (used / limit) * 100;

  // Determine status
  let status: UsageCheck['status'];
  let allowed: boolean;
  let message: string;

  if (used >= graceLimit) {
    status = 'blocked';
    allowed = false;
    message = `You've exceeded your monthly limit (${used}/${limit}). Upgrade to continue.`;
  } else if (used > limit * 1.05) {
    status = 'final_warning';
    allowed = true;
    message = `You're in grace period (${Math.round(percentUsed)}% used). Upgrade to avoid interruption.`;
  } else if (used > limit) {
    status = 'soft_warning';
    allowed = true;
    message = `You've reached your plan limit (${used}/${limit}). Upgrade for unlimited access.`;
  } else {
    status = 'normal';
    allowed = true;
    message = '';
  }

  return {
    allowed,
    status,
    limit,
    used,
    graceLimit,
    percentUsed,
    message,
  };
}
```

---

### 4.2 Use in Upload Endpoint

```typescript
// app/api/transcribe/route.ts

export async function POST(request: Request) {
  const user = await getUser();

  // Check usage limit
  const usageCheck = await checkUsageLimit(user.id);

  if (!usageCheck.allowed) {
    return Response.json({
      error: usageCheck.message,
      upgrade_url: '/billing/upgrade'
    }, { status: 403 }); // Forbidden
  }

  // If in warning zone, include warning in response
  const warnings = usageCheck.status !== 'normal'
    ? [usageCheck.message]
    : [];

  // ... proceed with upload ...

  return Response.json({
    success: true,
    warnings, // Frontend can display these
  });
}
```

---

## 5. Implementation (Frontend)

### 5.1 Usage Banner Component

```typescript
// components/UsageBanner.tsx
'use client';

import { useEffect, useState } from 'react';

interface UsageStatus {
  allowed: boolean;
  status: 'normal' | 'soft_warning' | 'final_warning' | 'blocked';
  limit: number;
  used: number;
  graceLimit: number;
  percentUsed: number;
  message: string;
}

export function UsageBanner() {
  const [usage, setUsage] = useState<UsageStatus | null>(null);

  useEffect(() => {
    fetch('/api/usage').then(res => res.json()).then(setUsage);
  }, []);

  if (!usage || usage.status === 'normal') return null;

  const getColor = () => {
    switch (usage.status) {
      case 'soft_warning': return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'final_warning': return 'bg-orange-100 border-orange-500 text-orange-900';
      case 'blocked': return 'bg-red-100 border-red-500 text-red-900';
      default: return '';
    }
  };

  return (
    <div className={`border-l-4 p-4 mb-4 ${getColor()}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{usage.message}</p>
          <p className="text-sm mt-1">
            Used: {usage.used}/{usage.limit} transcripts
            {usage.status !== 'blocked' && (
              <span className="ml-2">
                (Grace limit: {usage.graceLimit})
              </span>
            )}
          </p>
        </div>
        <a
          href="/billing/upgrade"
          className="btn btn-primary"
        >
          Upgrade Plan
        </a>
      </div>
    </div>
  );
}
```

---

### 5.2 Usage Progress Bar

```typescript
// components/UsageProgress.tsx
'use client';

export function UsageProgress({ used, limit, graceLimit }: {
  used: number;
  limit: number;
  graceLimit: number;
}) {
  const percentUsed = (used / limit) * 100;
  const percentGrace = (used / graceLimit) * 100;

  const getColor = () => {
    if (percentUsed <= 80) return 'bg-green-500';
    if (percentUsed <= 100) return 'bg-yellow-500';
    if (percentUsed <= 110) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span>{used} / {limit} used</span>
        {percentUsed > 100 && (
          <span className="text-orange-600">
            Grace: {graceLimit}
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${getColor()}`}
          style={{ width: `${Math.min(percentGrace, 100)}%` }}
        />
      </div>
      {percentUsed > 100 && (
        <p className="text-xs text-gray-600 mt-1">
          You're in grace period. Upgrade to avoid interruption.
        </p>
      )}
    </div>
  );
}
```

---

## 6. UX Flow

### 6.1 Normal Usage (0-100%)

**UI:**
- No warnings
- Green progress bar
- Normal upload flow

---

### 6.2 Soft Warning (100-105%)

**UI:**
- Yellow banner: "You've reached your plan limit. Upgrade for unlimited access."
- Yellow progress bar
- Upload still works
- "Upgrade" button in banner

**Email (optional):**
- Subject: "You've reached your monthly limit"
- Body: "You're at 100% usage. Upgrade to continue beyond your limit."

---

### 6.3 Final Warning (105-110%)

**UI:**
- Orange banner: "You're in grace period (108% used). Upgrade to avoid interruption."
- Orange progress bar
- Upload still works
- More prominent "Upgrade" button

**Email:**
- Subject: "Grace period: Upgrade to avoid interruption"
- Body: "You're using 108% of your plan (grace period). Upgrade before hitting the hard limit."

---

### 6.4 Blocked (>110%)

**UI:**
- Red banner: "You've exceeded your limit. Upgrade to continue."
- Red progress bar (full)
- Upload button disabled
- Modal: "Upgrade Required"

**Modal content:**
> **You've reached your limit**
>
> You've used 23/20 transcripts this month (115%).
>
> Upgrade to continue uploading and generating content.
>
> [View Plans] [Upgrade Now]

---

## 7. Analytics Events

Track these events for product intelligence:

| Event | When | Properties |
|-------|------|------------|
| **usage_warning_shown** | User enters 100-110% zone | `percent_used`, `limit`, `used` |
| **grace_period_used** | User uploads in grace period | `percent_used` |
| **usage_blocked** | User hits hard limit (>110%) | `limit`, `used` |
| **upgrade_from_limit** | User upgrades after hitting limit | `trigger` (soft_warning, final_warning, blocked) |

**Why track:**
- Measure how many users hit limits (grace period effectiveness)
- A/B test grace percentage (10% vs. 15%)
- Measure upgrade conversion from limits

---

## 8. Edge Cases

### 8.1 What if user deletes transcripts?

**Scenario:**
- User uploads 22 transcripts (in grace period)
- User deletes 3 transcripts
- Used count: 19 (below limit)

**Behavior:**
- `transcripts_used_this_month` doesn't decrease on deletion
- Usage counts uploads, not current count
- Rationale: Prevents abuse (upload → delete → upload → delete loop)

**Alternative (if you want deletion to free up quota):**
- Track "net usage" (uploads - deletions)
- More complex, but fairer

---

### 8.2 What if user upgrades mid-month?

**Scenario:**
- User on Starter (20 limit), used 22 (in grace)
- User upgrades to Pro (50 limit)
- Should warnings disappear?

**Behavior:**
- Yes, warnings clear immediately
- New limit: 50
- Used: 22 (now well below limit)

**Implementation:**
- Check usage after plan change
- Clear warning state if usage < new limit

---

### 8.3 What if usage resets at wrong time?

**Problem:**
- User billing date: 15th of month
- Usage resets: 1st of month
- Mismatch causes confusion

**Solution:**
- Reset usage on billing date (not calendar month)
- Store `billing_cycle_start` in subscriptions table
- Reset when `NOW() > billing_cycle_start + 1 month`

```typescript
// Cron job: Reset usage daily
const subscriptions = await supabase
  .from('subscriptions')
  .select('*')
  .lte('billing_cycle_start', sql`NOW() - INTERVAL '1 month'`);

for (const sub of subscriptions) {
  await supabase
    .from('subscriptions')
    .update({
      transcripts_used_this_month: 0,
      billing_cycle_start: sql`billing_cycle_start + INTERVAL '1 month'`
    })
    .eq('id', sub.id);
}
```

---

## 9. Testing Plan

### 9.1 Unit Tests

- ✅ User at 50% usage → Allowed, no warning
- ✅ User at 100% usage → Allowed, soft warning
- ✅ User at 105% usage → Allowed, final warning
- ✅ User at 110% usage → Allowed, final warning (exactly at grace limit)
- ✅ User at 111% usage → Blocked
- ✅ User with grace disabled → Hard block at 100%

---

### 9.2 Integration Tests

**Test flow:**
1. Create test user with 20-transcript limit
2. Upload 20 transcripts → No warnings
3. Upload 21st transcript → Soft warning shown
4. Upload 22nd transcript → Final warning shown
5. Attempt 23rd transcript → Blocked
6. Upgrade plan → Warnings cleared, upload works

---

## 10. Implementation Checklist

### Phase 1: Database (1 day)
- [ ] Add `usage_grace_enabled` column
- [ ] Add `usage_grace_percentage` column
- [ ] Set defaults (enabled: true, percentage: 10)

### Phase 2: Backend (1 day)
- [ ] Create `checkUsageLimit()` function
- [ ] Update `/api/transcribe` to check limits
- [ ] Add `/api/usage` endpoint (for frontend)
- [ ] Handle grace period in billing logic

### Phase 3: Frontend (1 day)
- [ ] Build `UsageBanner` component
- [ ] Build `UsageProgress` component
- [ ] Show banner on dashboard
- [ ] Show progress in settings
- [ ] Handle blocked state (disable upload button, show modal)

### Phase 4: Testing (1 day)
- [ ] Unit tests for `checkUsageLimit()`
- [ ] Integration tests for full flow
- [ ] Test edge cases (deletion, upgrade, reset)

### Phase 5: Monitoring (1 day)
- [ ] Add analytics events
- [ ] Set up dashboard (usage warnings, blocks, upgrades)
- [ ] Monitor for abuse (users gaming the system)

**Total time:** 5 days

---

## 11. Rollout Plan

### Phase 1: Beta (1 week)
- Enable grace period for 10% of users
- Monitor:
  - How many enter grace period
  - How many hit hard limit
  - Upgrade conversion from warnings
- Adjust grace percentage if needed

### Phase 2: General Release
- Enable for all users
- Announce in:
  - In-app banner
  - Email newsletter
  - Twitter/LinkedIn
- Monitor support tickets (should decrease)

---

## 12. Success Metrics

**Goal:** Reduce friction without reducing revenue.

**Metrics to track:**
- **Users entering grace period:** ~10-15% of active users (expected)
- **Users hitting hard limit:** <5% of active users
- **Support tickets about limits:** -30% reduction
- **Upgrade conversion:** Measure if grace increases or decreases upgrades
  - **Hypothesis:** Grace increases goodwill → higher long-term conversion

**If upgrades decrease:**
- Reduce grace to 5%
- Or require payment method on file to use grace period

---

## 13. Cost Analysis

### 13.1 Revenue Impact

**Scenario 1: Grace reduces upgrades**
- 100 users hit limit per month
- Without grace: 20 upgrade immediately (20% conversion)
- With grace: 15 upgrade immediately (15% conversion)
- **Revenue loss:** 5 upgrades × $40 = -$200/month

**Scenario 2: Grace increases long-term retention**
- Users appreciate grace period → higher retention
- Churn decreases by 5%
- **Revenue gain:** More long-term customers

**Net effect:** Likely neutral to positive (goodwill > short-term revenue)

---

### 13.2 Cost of Grace Period

**Additional resources used:**
- 10% extra transcriptions
- AssemblyAI cost: $0.90/hour
- If 100 users use grace (1 extra transcript each): 100 × $0.45 = $45/month
- **Negligible cost.**

---

## 14. Future Enhancements

### 14.1 Booster Packs (Alternative to Upgrade)

Instead of forcing upgrade, offer one-time purchases:
- "Buy 10 extra transcripts for $15"
- User stays on current plan
- Avoids commitment

**Implementation:**
- Add `booster_pack_credits` to subscriptions
- Deduct from booster before regular quota

---

### 14.2 Rollover Credits

Unused quota rolls over to next month (up to 50% of limit).

**Example:**
- Starter plan: 20/month
- User uses 10 in January
- February limit: 20 + 5 rollover = 25

**Why:** Encourages annual plans (users feel safer with rollover)

---

### 14.3 Per-Plan Grace Percentages

- **Starter:** 10% grace (2 extra transcripts)
- **Professional:** 15% grace (more generous)
- **Enterprise:** 20% grace (VIP treatment)

**Why:** Enterprise expects flexibility

---

## 15. Summary

### What This Adds
- **Better UX:** Soft limits instead of hard blocks
- **Fewer support tickets:** Users aren't blocked at 100.1%
- **Goodwill:** Users feel respected, not punished
- **Still encourages upgrades:** Warnings + eventual hard limit

### Implementation Effort
- **Time:** 5 days
- **Complexity:** Low (simple logic)
- **Risk:** Low (easy to rollback if issues)

### Next Steps
1. Run database migration
2. Implement `checkUsageLimit()` function
3. Update upload endpoint
4. Build frontend components
5. Test and deploy
6. Monitor metrics

---

**Ready to implement?** All the code examples and logic are above. Let me know if you need clarification.

---

*Last updated: February 1, 2026*
