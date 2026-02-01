# Stripe Environment Variables Setup

## Required Environment Variables

Add these to your `.env.local` (local development) and Vercel (production):

```bash
# Stripe Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...  # Use sk_live_... in production
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (get from https://dashboard.stripe.com/products)
STRIPE_PRICE_STARTER=price_...  # Starter tier ($27/mo, 10 calls)
STRIPE_PRICE_PROFESSIONAL=price_...  # Professional tier ($67/mo, 30 calls)
STRIPE_PRICE_AGENCY=price_...  # Agency tier ($197/mo, 100 calls)

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Use https://call-content.com in production
```

## How to Get These Values

### 1. Stripe Secret Key
1. Go to https://dashboard.stripe.com/apikeys
2. Click "Create secret key" (or use existing test key)
3. Copy the key starting with `sk_test_...`

### 2. Stripe Webhook Secret
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
6. Copy the webhook signing secret (starts with `whsec_...`)

### 3. Stripe Price IDs
1. Go to https://dashboard.stripe.com/products
2. Create 3 products (if not already created):
   - **Starter:** $27/month (10 transcripts/month)
   - **Professional:** $67/month (30 transcripts/month)
   - **Agency:** $197/month (100 transcripts/month)
3. Click each product → Copy the price ID (starts with `price_...`)

## Testing Locally

Use Stripe CLI to test webhooks locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will give you a webhook secret starting with `whsec_...` — add it to `.env.local`.

## Production Setup

1. Add all environment variables to Vercel:
   - Go to https://vercel.com/your-project/settings/environment-variables
   - Add each variable listed above
   - Select "Production", "Preview", and "Development"

2. Update webhook endpoint in Stripe:
   - Go to https://dashboard.stripe.com/webhooks
   - Update endpoint URL to `https://your-production-domain.com/api/stripe/webhook`

3. Switch to live keys:
   - Replace `sk_test_...` with `sk_live_...`
   - Use production price IDs

---

**Next Steps:**
1. Add these environment variables to `.env.local` and Vercel
2. Test checkout flow end-to-end
3. Set up production webhook endpoint
