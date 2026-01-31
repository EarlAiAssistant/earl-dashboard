# 🚀 Call-Content Pre-Launch Checklist

**Last Updated:** January 31, 2026  
**Target Launch:** TBD  
**Status:** IN PROGRESS

---

## 1. ✅ Code & Build

- [x] TypeScript compilation passes (`npm run type-check`)
- [x] Production build succeeds (`npm run build`)
- [x] No console errors in browser
- [x] All API routes functional
- [x] Lazy initialization for external services (Stripe, AssemblyAI)

---

## 2. 🔐 Environment Variables

### Vercel/Production

| Variable | Set? | Notes |
|----------|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ⬜ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ⬜ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ⬜ | For server-side operations |
| `STRIPE_SECRET_KEY` | ⬜ | Live key (sk_live_...) |
| `STRIPE_WEBHOOK_SECRET` | ⬜ | Webhook signing secret |
| `STRIPE_PRICE_STARTER` | ⬜ | Price ID for Starter plan |
| `STRIPE_PRICE_PROFESSIONAL` | ⬜ | Price ID for Professional plan |
| `STRIPE_PRICE_AGENCY` | ⬜ | Price ID for Agency plan |
| `NEXT_PUBLIC_BASE_URL` | ⬜ | https://call-content.com |
| `ASSEMBLYAI_API_KEY` | ⬜ | AssemblyAI API key |
| `NEXT_PUBLIC_POSTHOG_KEY` | ⬜ | PostHog project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | ⬜ | PostHog host URL |
| `ADMIN_API_KEY` | ⬜ | For /admin/health access |

### How to Set in Vercel
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add each variable with Production scope
3. Redeploy after adding

---

## 3. 🗄️ Database

### Migrations to Run

| Migration | Status | SQL File |
|-----------|--------|----------|
| Onboarding tracking | ⬜ | `supabase/migrations/20260131000000_add_onboarding_tracking.sql` |
| Booster credits | ⬜ | `supabase/migrations/20260131010000_add_booster_credits.sql` |

### How to Run Migrations
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of each migration file
3. Execute in order
4. Verify tables created

### Tables to Verify
- [ ] `users` - Has all required columns
- [ ] `user_onboarding` - Exists with correct schema
- [ ] `usage_log` - Exists for booster tracking
- [ ] `activity_log` - Exists for Earl activity

---

## 4. 💳 Stripe Configuration

### Products & Prices
| Plan | Price | Created? |
|------|-------|----------|
| Starter | $27/month | ⬜ |
| Professional | $67/month | ⬜ |
| Agency | $197/month | ⬜ |
| Booster Pack | $47 one-time | ⬜ |

### Webhook Setup
1. ⬜ Go to Stripe Dashboard → Webhooks
2. ⬜ Add endpoint: `https://call-content.com/api/stripe/webhook`
3. ⬜ Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. ⬜ Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### Test Mode Verification
- [ ] Can create test checkout session
- [ ] Webhook receives events
- [ ] Subscription updates in database
- [ ] Booster pack adds credits

---

## 5. 🌐 Domain & SSL

- [ ] Domain registered (call-content.com)
- [ ] DNS pointed to Vercel
- [ ] SSL certificate active (automatic with Vercel)
- [ ] www redirect configured
- [ ] Custom domain verified in Vercel

---

## 6. 📊 Analytics & Monitoring

### PostHog
- [ ] Project created in PostHog
- [ ] API key added to env vars
- [ ] Events being tracked
- [ ] Dashboard configured

### Error Tracking (Optional)
- [ ] Sentry configured (optional)
- [ ] Error alerts set up

### Uptime Monitoring (Optional)
- [ ] UptimeRobot or similar
- [ ] Alert channels configured

---

## 7. 📧 Email Configuration

### Transactional Emails
- [ ] Email provider selected (Resend/SendGrid)
- [ ] API key configured
- [ ] Welcome email template
- [ ] Trial ending warning
- [ ] Payment receipt
- [ ] Usage limit warning

### Domain Verification
- [ ] SPF record added
- [ ] DKIM configured
- [ ] DMARC policy set

---

## 8. 🔒 Security

- [ ] RLS policies enabled on all Supabase tables
- [ ] API rate limiting (consider adding)
- [ ] Admin routes protected
- [ ] No secrets in client code
- [ ] CORS configured correctly
- [ ] CSP headers (optional)

---

## 9. 📱 SEO & Social

### Meta Tags
- [ ] Title tags on all pages
- [ ] Meta descriptions
- [ ] OG tags for social sharing
- [ ] Twitter card tags

### Technical SEO
- [ ] `robots.txt` created
- [ ] `sitemap.xml` generated
- [ ] Canonical URLs set
- [ ] Structured data (optional)

### Social Accounts
- [ ] Twitter/X account created
- [ ] LinkedIn page (optional)
- [ ] Product Hunt listing prepared

---

## 10. 📄 Legal

- [x] Privacy Policy created (`/public/privacy-policy.md`)
- [x] Terms of Service created (`/public/terms-of-service.md`)
- [ ] Cookie consent banner (if needed for EU)
- [ ] GDPR compliance verified
- [ ] CCPA compliance verified

---

## 11. 📚 Documentation

- [x] Getting Started Guide
- [x] API Documentation (if public)
- [x] FAQ section
- [ ] Help/Support email configured
- [ ] Contact form working

---

## 12. 🧪 Final Testing

### User Flows
- [ ] New user signup → onboarding → first transcript
- [ ] Trial user → checkout → subscription active
- [ ] Existing user → upload → generate → export
- [ ] User at limit → booster pack → continue
- [ ] User → billing page → manage subscription

### Edge Cases
- [ ] Invalid file upload handling
- [ ] Payment failure handling
- [ ] API timeout handling
- [ ] Rate limit messaging

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari
- [ ] Mobile Chrome

---

## 13. 🚀 Launch Day

### Pre-Launch (Day Before)
- [ ] Final production deploy
- [ ] Verify all env vars
- [ ] Test checkout flow (live mode)
- [ ] Test webhook processing
- [ ] Prepare announcement posts

### Launch
- [ ] Enable domain (if hidden)
- [ ] Post on Product Hunt
- [ ] Post on Twitter/X
- [ ] Post on LinkedIn
- [ ] Send to email list
- [ ] Monitor error logs

### Post-Launch (First 24 Hours)
- [ ] Monitor signups
- [ ] Watch for errors in PostHog/logs
- [ ] Respond to user feedback
- [ ] Fix any critical issues immediately

---

## Quick Commands

```bash
# Run type check
npm run type-check

# Build production
npm run build

# Run locally
npm run dev

# Deploy to Vercel
vercel --prod

# View Vercel logs
vercel logs
```

---

## Notes

_Add any launch-specific notes here:_

- 
- 
- 

---

**Ready to Launch?**

When all items above are checked, you're ready to go live! 🎉

Remember: It's better to launch with 80% perfection than to wait for 100%.

---

*Created by Earl for Call-Content launch preparation*
