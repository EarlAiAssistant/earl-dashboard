# Stripe Checkout Flow: End-to-End Testing Guide

## Prerequisites

Before testing, ensure you have:
- [ ] Added Stripe environment variables to `.env.local`
- [ ] Run SQL migration in Supabase (added subscription columns)
- [ ] Stripe CLI installed (for local webhook testing)
- [ ] Test mode enabled in Stripe dashboard

---

## Test Scenarios

### Scenario 1: New User Trial Signup (Happy Path)

**Steps:**
1. Go to `/pricing`
2. Click "Start Free Trial" on Professional plan
3. Fill in payment details (use Stripe test card: `4242 4242 4242 4242`)
4. Click "Subscribe"
5. Verify redirect to `/dashboard?session_id=...`
6. Check database:
   ```sql
   SELECT stripe_customer_id, subscription_tier, subscription_status, trial_ends_at
   FROM users WHERE id = '[user-id]';
   ```

**Expected Results:**
- ✅ Checkout session created successfully
- ✅ User redirected to dashboard
- ✅ Database shows:
  - `stripe_customer_id` populated
  - `subscription_tier` = "professional"
  - `subscription_status` = "trial"
  - `trial_ends_at` = 14 days from now
  - `monthly_transcript_limit` = 30
  - `transcripts_used_this_month` = 0

---

### Scenario 2: Trial → Paid Conversion

**Steps:**
1. Fast-forward time in Stripe (or wait 14 days in production)
2. Stripe should charge the card automatically
3. Webhook `invoice.payment_succeeded` fires
4. Check database:
   ```sql
   SELECT subscription_status, current_period_end
   FROM users WHERE stripe_customer_id = '[customer-id]';
   ```

**Expected Results:**
- ✅ `subscription_status` = "active"
- ✅ `current_period_end` updated to next month
- ✅ User can still process transcripts

---

### Scenario 3: Monthly Usage Limit Hit

**Steps:**
1. Create test user with:
   - `monthly_transcript_limit` = 10
   - `transcripts_used_this_month` = 10
2. Try to process a transcript via `/api/transcripts/process`
3. Verify error response

**Expected Results:**
- ✅ API returns `403 Forbidden`
- ✅ Error message: "Monthly limit reached (10 transcripts). Upgrade your plan or wait until next billing cycle."
- ✅ Response includes usage stats:
  ```json
  {
    "error": "Usage limit exceeded",
    "usage": {
      "used": 10,
      "limit": 10,
      "remaining": 0,
      "tier": "starter"
    }
  }
  ```

---

### Scenario 4: Payment Failed (Card Declined)

**Steps:**
1. Use Stripe test card `4000 0000 0000 0341` (decline)
2. Try to subscribe
3. Webhook `invoice.payment_failed` fires
4. Check database

**Expected Results:**
- ✅ `subscription_status` = "past_due"
- ✅ User sees error message in dashboard
- ✅ Cannot process transcripts (usage gating blocks them)

---

### Scenario 5: Subscription Canceled

**Steps:**
1. Go to Stripe dashboard → Customers → [customer] → Cancel subscription
2. Webhook `customer.subscription.deleted` fires
3. Check database

**Expected Results:**
- ✅ `subscription_status` = "canceled"
- ✅ `monthly_transcript_limit` = 0
- ✅ User cannot process transcripts
- ✅ Dashboard shows "Subscription canceled" banner

---

### Scenario 6: Upgrade Mid-Month (Starter → Professional)

**Steps:**
1. User on Starter plan (10 transcripts/month)
2. Click "Upgrade" to Professional
3. Stripe prorates the charge
4. Webhook `customer.subscription.updated` fires
5. Check database

**Expected Results:**
- ✅ `subscription_tier` = "professional"
- ✅ `monthly_transcript_limit` = 30 (not 10)
- ✅ `transcripts_used_this_month` preserved (doesn't reset)
- ✅ User can immediately process more transcripts

---

### Scenario 7: Monthly Usage Reset

**Steps:**
1. Set user's `usage_reset_date` to 30 days ago
2. Call function:
   ```sql
   SELECT reset_monthly_usage();
   ```
3. Check database

**Expected Results:**
- ✅ `transcripts_used_this_month` = 0
- ✅ `usage_reset_date` = NOW()

---

## Stripe Test Cards

Use these cards in test mode:

| Card Number | Type | Behavior |
|-------------|------|----------|
| `4242 4242 4242 4242` | Visa | Success |
| `4000 0000 0000 0341` | Visa | Card declined |
| `4000 0000 0000 9995` | Visa | Insufficient funds |
| `4000 0000 0000 3220` | Visa | 3D Secure required |

**CVV:** Any 3 digits  
**Expiry:** Any future date  
**ZIP:** Any 5 digits

---

## Local Webhook Testing

### Step 1: Start Stripe CLI

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret (starts with `whsec_...`) and add to `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Step 2: Trigger Test Events

```bash
# Test checkout session completed
stripe trigger checkout.session.completed

# Test subscription created
stripe trigger customer.subscription.created

# Test payment succeeded
stripe trigger invoice.payment_succeeded

# Test payment failed
stripe trigger invoice.payment_failed
```

### Step 3: Verify Webhooks Received

Check your terminal (where `stripe listen` is running) for:
```
✔ Received event checkout.session.completed [evt_...]
✔ Forwarded to localhost:3000/api/stripe/webhook [200 OK]
```

---

## Production Webhook Setup

After local testing passes:

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy webhook signing secret → Add to Vercel environment variables

---

## Debugging Checklist

**If checkout doesn't work:**
- [ ] Check Stripe secret key is correct (starts with `sk_test_...`)
- [ ] Verify price IDs match Stripe products
- [ ] Check browser console for errors
- [ ] Verify environment variables are set

**If webhooks don't fire:**
- [ ] Check Stripe CLI is running (`stripe listen`)
- [ ] Verify webhook secret matches (`.env.local` vs Stripe CLI output)
- [ ] Check API route logs (`console.log` in `/api/stripe/webhook`)
- [ ] Verify Stripe event is selected in webhook settings

**If database doesn't update:**
- [ ] Check Supabase SQL migration ran successfully
- [ ] Verify user exists in `users` table
- [ ] Check Supabase logs for errors
- [ ] Test helper functions manually:
  ```sql
  SELECT can_process_transcript('[user-id]');
  ```

---

## Success Criteria

Before marking this task "done", verify:

- [ ] User can complete checkout (test card)
- [ ] Webhook receives `checkout.session.completed`
- [ ] Database updates correctly (subscription status, tier, limits)
- [ ] Usage gating works (blocks at limit, allows below limit)
- [ ] Trial → Paid conversion works (webhook fires, status updates)
- [ ] Payment failure handled gracefully (status = "past_due")
- [ ] Subscription cancellation works (status = "canceled", limit = 0)
- [ ] Monthly usage reset function works

---

## Next Steps After Testing

1. ✅ All test scenarios pass
2. Set up production webhook endpoint
3. Switch to live Stripe keys
4. Test once in production with real card (then refund)
5. Monitor Stripe dashboard for errors

---

**Status:** Ready to test (requires Drew to run through scenarios)
