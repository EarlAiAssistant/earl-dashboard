# 📧 Transactional Email Setup Guide

## Quick Start (10 minutes)

### Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email
3. Create an API key from the dashboard
4. Copy the API key

### Step 2: Add Environment Variable

```bash
RESEND_API_KEY=re_your-api-key-here
```

Add to:
- `.env.local` for local development
- Vercel Environment Variables for production

### Step 3: Verify Your Domain

1. In Resend dashboard, go to Domains
2. Add `call-content.com`
3. Add the DNS records Resend provides:
   - SPF record
   - DKIM record
   - (Optional) DMARC record
4. Wait for verification (usually 5-10 minutes)

### Step 4: Install Resend Package

```bash
npm install resend
```

---

## Usage

### Import the Email Module

```typescript
import { 
  sendEmail, 
  welcomeEmail, 
  trialEndingEmail,
  usageLimitWarningEmail,
  paymentReceiptEmail,
  boosterPackEmail
} from '@/lib/email'
```

### Send Welcome Email

```typescript
const { subject, html } = welcomeEmail(user.name)
await sendEmail({
  to: user.email,
  subject,
  html,
})
```

### Send Trial Ending Warning

```typescript
const { subject, html } = trialEndingEmail(user.name, 3) // 3 days left
await sendEmail({
  to: user.email,
  subject,
  html,
})
```

### Send Usage Limit Warning

```typescript
const { subject, html } = usageLimitWarningEmail(user.name, 8, 10) // 8 of 10 used
await sendEmail({
  to: user.email,
  subject,
  html,
})
```

### Send Payment Receipt

```typescript
const { subject, html } = paymentReceiptEmail(
  user.name, 
  67.00, 
  'Professional', 
  new Date()
)
await sendEmail({
  to: user.email,
  subject,
  html,
})
```

### Send Booster Pack Confirmation

```typescript
const { subject, html } = boosterPackEmail(user.name, 5)
await sendEmail({
  to: user.email,
  subject,
  html,
})
```

---

## Email Templates Included

| Template | Trigger | Purpose |
|----------|---------|---------|
| `welcomeEmail` | After signup | Onboard new user |
| `trialEndingEmail` | 3 days before trial ends | Prompt upgrade |
| `usageLimitWarningEmail` | At 80% usage | Upsell booster/upgrade |
| `paymentReceiptEmail` | After payment | Receipt confirmation |
| `boosterPackEmail` | After booster purchase | Confirm credits added |

---

## Integration Points

### 1. Signup (Welcome Email)

In your signup handler:

```typescript
// After user is created
const { subject, html } = welcomeEmail(user.name || 'there')
await sendEmail({ to: user.email, subject, html })
```

### 2. Stripe Webhook (Payment Receipts)

In `/api/stripe/webhook`:

```typescript
case 'invoice.payment_succeeded':
  // ... existing logic ...
  
  // Send receipt email
  const { subject, html } = paymentReceiptEmail(
    user.name,
    invoice.amount_paid / 100,
    user.subscription_tier,
    new Date()
  )
  await sendEmail({ to: user.email, subject, html })
  break
```

### 3. Booster Pack Webhook

In `/api/stripe/webhook` (booster pack section):

```typescript
// After adding credits
const { subject, html } = boosterPackEmail(user.name, credits)
await sendEmail({ to: user.email, subject, html })
```

### 4. Usage Check (Limit Warning)

In your usage gating logic or a cron job:

```typescript
if (usagePercent >= 80 && !hasBeenWarned) {
  const { subject, html } = usageLimitWarningEmail(user.name, used, limit)
  await sendEmail({ to: user.email, subject, html })
  // Mark as warned to avoid spam
}
```

### 5. Trial Ending (Cron Job)

Create a cron job that runs daily:

```typescript
// Find users with trial ending in 3 days
const usersEndingSoon = await db.query(`
  SELECT * FROM users 
  WHERE subscription_status = 'trial' 
  AND trial_ends_at BETWEEN NOW() AND NOW() + INTERVAL '3 days'
  AND trial_warning_sent = false
`)

for (const user of usersEndingSoon) {
  const daysLeft = Math.ceil((user.trial_ends_at - Date.now()) / (1000 * 60 * 60 * 24))
  const { subject, html } = trialEndingEmail(user.name, daysLeft)
  await sendEmail({ to: user.email, subject, html })
  
  // Mark as sent
  await db.query(`UPDATE users SET trial_warning_sent = true WHERE id = $1`, [user.id])
}
```

---

## Testing

### Local Development

Without `RESEND_API_KEY` set, emails will log to console instead of sending:

```
[Email] Would send: Welcome to Call-Content! 🎉 to test@example.com
```

### Test Mode

Resend provides a test mode - use the test API key to send emails without actually delivering them.

### Verify Delivery

1. Check Resend dashboard for sent emails
2. Look for delivery status
3. Check spam folders if not received

---

## Customization

### Change From Address

```typescript
await sendEmail({
  to: user.email,
  from: 'support@call-content.com', // Custom from address
  subject,
  html,
})
```

### Add Plain Text Version

```typescript
await sendEmail({
  to: user.email,
  subject,
  html,
  text: 'Welcome to Call-Content! Get started at call-content.com/dashboard',
})
```

---

## Troubleshooting

### Emails not sending

1. Check `RESEND_API_KEY` is set correctly
2. Verify domain is verified in Resend
3. Check Resend dashboard for errors
4. Look for console logs

### Emails going to spam

1. Verify SPF/DKIM/DMARC records
2. Add custom from address with verified domain
3. Avoid spam trigger words
4. Include unsubscribe link (for marketing emails)

### Rate limits

Resend free tier: 100 emails/day, 3000/month
Upgrade for higher limits.

---

## Summary

✅ Email service created at `lib/email.ts`  
✅ 5 email templates ready  
✅ Lazy initialization (won't break build without API key)  
✅ Fallback logging for development  

**Ready to send! 📨**
