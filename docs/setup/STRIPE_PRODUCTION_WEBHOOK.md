# Stripe Production Webhook Setup

## Quick Start Guide

**Goal:** Configure Stripe to send live webhook events to your production app

**Time:** 5-10 minutes

---

## Step 1: Deploy Your App to Production

Make sure these API routes are deployed:
- ✅ `/api/stripe/checkout` (checkout session creation)
- ✅ `/api/stripe/webhook` (webhook handler)

**Verify deployment:**
```bash
curl https://your-domain.com/api/stripe/webhook
# Should return 405 Method Not Allowed (GET not supported)
```

---

## Step 2: Add Webhook Endpoint in Stripe

1. Go to https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Fill in details:

**Endpoint URL:**
```
https://your-domain.com/api/stripe/webhook
```

**Description:**
```
Call-Content Production Webhook
```

**Events to send:**
Select these 6 events:
- ☑️ `checkout.session.completed`
- ☑️ `customer.subscription.created`
- ☑️ `customer.subscription.updated`
- ☑️ `customer.subscription.deleted`
- ☑️ `invoice.payment_succeeded`
- ☑️ `invoice.payment_failed`

4. Click **"Add endpoint"**

---

## Step 3: Get Webhook Signing Secret

After creating the endpoint, Stripe shows a **signing secret** (starts with `whsec_...`)

**Example:**
```
whsec_1a2b3c4d5e6f7g8h9i0j
```

**Copy this value** — you'll need it in the next step.

---

## Step 4: Add to Vercel Environment Variables

1. Go to https://vercel.com/your-project/settings/environment-variables
2. Click **"Add New"**
3. Fill in:

**Name:**
```
STRIPE_WEBHOOK_SECRET
```

**Value:**
```
whsec_1a2b3c4d5e6f7g8h9i0j
```
(paste your actual secret)

**Environments:**
- ☑️ Production
- ☑️ Preview
- ☑️ Development

4. Click **"Save"**

---

## Step 5: Redeploy (Important!)

After adding the environment variable, you **must redeploy** for it to take effect.

**Option A: Auto-redeploy**
- Make a small change (add a comment to any file)
- Commit and push to GitHub
- Vercel auto-deploys

**Option B: Manual redeploy**
- Go to https://vercel.com/your-project/deployments
- Click the three dots on latest deployment
- Click **"Redeploy"**

---

## Step 6: Test the Webhook

### Send a Test Event from Stripe

1. Go to https://dashboard.stripe.com/webhooks
2. Click your webhook endpoint
3. Click **"Send test webhook"**
4. Select event: `checkout.session.completed`
5. Click **"Send test webhook"**

**Expected result:**
- ✅ Status: `200 OK`
- ✅ Response time: < 500ms

**If it fails:**
- Check Vercel deployment logs
- Verify `STRIPE_WEBHOOK_SECRET` is set
- Check API route is deployed (`/api/stripe/webhook`)

---

### Test with Real Checkout (Recommended)

1. Create a test checkout session (use test mode)
2. Complete payment with test card `4242 4242 4242 4242`
3. Check webhook was received:
   - Go to https://dashboard.stripe.com/webhooks
   - Click your endpoint
   - Check "Recent deliveries" tab
   - Should see `checkout.session.completed` with status `200 OK`

---

## Step 7: Switch to Live Mode

Once testing passes, switch from test mode to live mode.

### Update Stripe Keys

**In Vercel environment variables:**

1. Update `STRIPE_SECRET_KEY`:
   - **Old:** `sk_test_...`
   - **New:** `sk_live_...` (from https://dashboard.stripe.com/apikeys)

2. Update price IDs:
   - `STRIPE_PRICE_STARTER` → Live price ID
   - `STRIPE_PRICE_PROFESSIONAL` → Live price ID
   - `STRIPE_PRICE_AGENCY` → Live price ID

3. Webhook secret stays the same (already using live secret)

### Redeploy After Switching Keys

1. Commit a change
2. Push to GitHub
3. Vercel auto-deploys

---

## Monitoring Webhooks

### Check Webhook Logs in Stripe

1. Go to https://dashboard.stripe.com/webhooks
2. Click your endpoint
3. Check **"Recent deliveries"** tab

**What to look for:**
- ✅ All events showing `200 OK`
- ✅ Response times < 1 second
- ❌ Any `500 Internal Server Error` (investigate immediately)
- ❌ Any `400 Bad Request` (signature verification failed)

---

### Common Errors

**Error: "No signatures found matching the expected signature"**
- **Cause:** Webhook secret is wrong
- **Fix:** Double-check `STRIPE_WEBHOOK_SECRET` in Vercel matches Stripe

**Error: "Webhook handler failed"**
- **Cause:** Database error (Supabase connection issue)
- **Fix:** Check Supabase logs, verify user exists

**Error: "Invalid signature"**
- **Cause:** Request body was modified (middleware issue)
- **Fix:** Ensure `/api/stripe/webhook` route doesn't parse body as JSON first

---

## Security Best Practices

### ✅ Always Verify Webhook Signatures

The `/api/stripe/webhook` route already does this:

```typescript
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
)
```

**Never skip this step.** It prevents attackers from sending fake webhook events.

---

### ✅ Use HTTPS Only

Stripe will only send webhooks to HTTPS URLs (not HTTP).

Vercel handles this automatically.

---

### ✅ Keep Webhook Secret Private

**Never:**
- ❌ Commit `STRIPE_WEBHOOK_SECRET` to Git
- ❌ Share it publicly
- ❌ Use the same secret for test + live mode

**Always:**
- ✅ Store in environment variables only
- ✅ Use different secrets for test vs live
- ✅ Rotate secrets if compromised

---

## Debugging Checklist

**If webhooks aren't firing:**
- [ ] Endpoint URL is correct (`https://your-domain.com/api/stripe/webhook`)
- [ ] Events are selected in Stripe dashboard (all 6 events)
- [ ] Webhook secret is set in Vercel environment variables
- [ ] App was redeployed after adding env var
- [ ] API route is deployed (`curl https://your-domain.com/api/stripe/webhook` returns 405)

**If webhooks return errors:**
- [ ] Check Vercel deployment logs
- [ ] Check Stripe webhook logs (Recent deliveries tab)
- [ ] Verify database schema (Supabase migration ran)
- [ ] Test manually: Send test webhook from Stripe dashboard

---

## Success Criteria

Before marking this task "done":

- [ ] Webhook endpoint added in Stripe dashboard
- [ ] Webhook secret added to Vercel environment variables
- [ ] Test webhook sent successfully (200 OK)
- [ ] Real checkout tested (webhook fires, database updates)
- [ ] All 6 event types working correctly
- [ ] No errors in Stripe webhook logs

---

## Next Steps After Setup

1. ✅ Webhook is live in production
2. Monitor webhook logs daily (first week)
3. Set up alerts for webhook failures (Stripe → Email notifications)
4. Test subscription lifecycle:
   - Trial → Paid conversion
   - Payment failure
   - Subscription cancellation

---

**Status:** Ready to configure (requires Drew to add webhook in Stripe dashboard + Vercel env vars)
