# Call-Content: Stripe Integration Plan

## Status
- ✅ Test keys configured
- ⏳ Waiting on pricing research
- ⏳ Implementation pending

## Next Steps (After Pricing Research)

### 1. Create Stripe Products
Based on research recommendations, create:
- Product tiers in Stripe dashboard
- Recurring subscription prices
- Usage limits metadata

### 2. Database Updates
Add to Supabase schema:
```sql
-- Add subscription tracking
alter table public.profiles add column stripe_customer_id text;
alter table public.profiles add column subscription_status text;
alter table public.profiles add column subscription_tier text;
alter table public.profiles add column transcripts_used_this_month integer default 0;
alter table public.profiles add column subscription_period_end timestamp with time zone;
```

### 3. Build APIs
- `/api/create-checkout-session` - Start subscription
- `/api/stripe-webhook` - Handle events (subscription created, canceled, etc.)
- `/api/check-usage` - Verify user hasn't hit limit

### 4. Gate Processing
Update `/api/process-transcript/route.ts`:
- Check user's subscription tier
- Verify they haven't exceeded monthly limit
- Increment usage counter
- Show upgrade prompt if limit reached

### 5. Billing Dashboard
Add to dashboard:
- Current plan display
- Usage meter (X/20 transcripts used)
- Upgrade/downgrade buttons
- Billing history

### 6. Webhook Setup
- Deploy webhook endpoint
- Configure in Stripe dashboard
- Add STRIPE_WEBHOOK_SECRET to env

## Test Mode Notes
- Using test keys for development
- Can use test cards (4242 4242 4242 4242)
- Switch to live keys only after full testing

---

*Waiting on pricing research to determine exact tiers and limits*
