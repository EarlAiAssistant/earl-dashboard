# Dunning Email System

Automated payment failure recovery through email sequences.

## Overview

When a customer's payment fails, the dunning system:
1. Creates a tracking record
2. Sends progressive emails over 14 days
3. Suspends accounts that don't resolve
4. Reactivates accounts when payment succeeds

## Email Sequence

| Day | Stage | Email |
|-----|-------|-------|
| 0 | `initial` | "Your payment failed" - friendly, no urgency |
| 3 | `reminder` | "Update your payment method" - action required |
| 7 | `warning` | "Account suspension in 7 days" - urgent |
| 14 | `final` | "Final notice - cancellation tomorrow" - critical |
| 15 | `suspended` | Account suspended, access blocked |

## Setup

### 1. Run Database Migration

```sql
-- Run in Supabase SQL Editor
-- Migration: supabase/migrations/20260131020000_add_dunning_records.sql
```

### 2. Configure Vercel Cron

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/dunning",
      "schedule": "0 9 * * *"
    }
  ]
}
```

This runs daily at 9am UTC.

### 3. Set Environment Variables

```bash
# Required for cron security
CRON_SECRET=your-secret-key

# Already required
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
```

### 4. Stripe Webhooks

Ensure these events are enabled:
- `invoice.payment_failed`
- `invoice.payment_succeeded`

## How It Works

### Payment Fails
1. Stripe sends `invoice.payment_failed` webhook
2. Webhook handler creates dunning record
3. Initial email sent immediately
4. User marked as `past_due`

### Daily Cron
1. Runs at 9am UTC
2. Checks all active dunning records
3. Calculates days since failure
4. Sends appropriate email for stage
5. Suspends accounts at 15+ days

### Payment Succeeds
1. Stripe sends `invoice.payment_succeeded` webhook
2. Dunning record resolved
3. Account reactivated
4. Welcome back email sent

## API Endpoints

### `GET /api/cron/dunning`
Process all dunning records. Called by Vercel Cron.

**Headers:**
```
Authorization: Bearer <CRON_SECRET>
```

**Response:**
```json
{
  "success": true,
  "processed": 5,
  "emailsSent": 3,
  "accountsSuspended": 1,
  "errors": [],
  "timestamp": "2026-01-31T09:00:00Z"
}
```

## Email Templates

All templates in `lib/email.ts`:

- `paymentFailedEmail(name, amount, lastFour?)`
- `paymentReminderEmail(name, amount, daysOverdue)`
- `suspensionWarningEmail(name, amount)`
- `finalNoticeEmail(name, amount)`
- `accountReactivatedEmail(name)`

## Testing

1. **Trigger payment failure:**
   ```bash
   stripe trigger invoice.payment_failed
   ```

2. **Run cron manually:**
   ```bash
   curl -X POST https://yourapp.com/api/cron/dunning \
     -H "Authorization: Bearer $CRON_SECRET"
   ```

3. **Simulate different stages:**
   Update `failed_at` in database to test different day counts.

## Monitoring

Check Vercel logs for:
- `[Dunning Cron] Results:`
- `⚠️ Payment failed for user`
- `✅ Payment recovered, account reactivated`

## Recovery Rate Benchmarks

Industry averages:
- Initial email: 30-40% recovery
- Reminder (Day 3): 15-20% additional
- Warning (Day 7): 5-10% additional
- Final (Day 14): 2-5% additional

Total: 50-75% payment recovery with good dunning.
