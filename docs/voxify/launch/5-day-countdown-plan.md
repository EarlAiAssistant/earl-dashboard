# 🚀 Voxify 5-Day Launch Countdown Plan

**Launch Date:** February 10th, 2026  
**Current Date:** February 5th  
**Days Remaining:** 5

---

## 📋 Pre-Launch Checklist by Priority

### 🔴 CRITICAL (Must Do Before Launch)

- [ ] **Run waitlist migration** on production Supabase
- [ ] **Update Stripe branding** (see docs/stripe-branding.md)
- [ ] **Test full signup → subscribe → generate flow** on staging
- [ ] **Record product demo video** (30-60 sec for landing page)
- [ ] **Verify webhook URLs** in Stripe dashboard (www.getvoxify.com)
- [ ] **Test email delivery** (signup confirmation, support form)
- [ ] **AssemblyAI** - upgrade from free tier if using audio upload

### 🟡 HIGH PRIORITY (Should Do)

- [ ] **Set up basic analytics** (Vercel Analytics, or add Plausible/PostHog)
- [ ] **Create launch announcement** for social media
- [ ] **Prepare Product Hunt launch** (optional but good for visibility)
- [ ] **Set up status page** (optional - Instatus, Upptime)
- [ ] **Test on multiple devices** (iPhone, Android, tablet)
- [ ] **Proofread all copy** (landing page, emails, legal pages)

### 🟢 NICE TO HAVE

- [ ] **Social proof** - get 2-3 beta testers for testimonials
- [ ] **Launch blog post** - "Why we built Voxify"
- [ ] **Email sequence** for waitlist (launch announcement + tips)
- [ ] **Referral program** setup (post-launch)

---

## 📅 Day-by-Day Plan

### Day 1 (Feb 5 - Today/Tonight) ✓
- ✅ Staging environment setup
- ✅ Coming soon page with waitlist
- ✅ Maintenance mode enabled
- [ ] Run waitlist SQL migration
- [ ] Record demo video (if time)

### Day 2 (Feb 6 - Thursday)
**Focus: Technical Polish**
- [ ] Full end-to-end testing on staging
- [ ] Test Stripe subscription flow (use test cards)
- [ ] Test all email triggers
- [ ] Fix any bugs found
- [ ] Update Stripe branding

### Day 3 (Feb 7 - Friday)
**Focus: Content & Assets**
- [ ] Record product demo video
- [ ] Create social media launch posts
- [ ] Write waitlist launch email
- [ ] Review/update pricing page copy

### Day 4 (Feb 8 - Saturday)
**Focus: Final Prep**
- [ ] Final testing pass
- [ ] Set up analytics
- [ ] Prepare launch day social posts
- [ ] Draft Product Hunt listing (optional)
- [ ] Get 2-3 friends to test signup flow

### Day 5 (Feb 9 - Sunday)
**Focus: Pre-Launch**
- [ ] Final bug fixes only
- [ ] Schedule launch emails
- [ ] Prep social media posts
- [ ] Get good sleep 😴

### Launch Day (Feb 10 - Monday)
- [ ] Remove MAINTENANCE_MODE env var
- [ ] Redeploy to go live
- [ ] Send waitlist launch email
- [ ] Post on social media
- [ ] Submit to Product Hunt (optional)
- [ ] Monitor for issues
- [ ] Celebrate! 🎉

---

## 🎯 Launch Day Checklist

### Morning (Before Launch)
- [ ] Check disk space / server health
- [ ] Verify Stripe is in live mode
- [ ] Verify all env vars are production values
- [ ] Have support email open
- [ ] Open Vercel/Supabase dashboards for monitoring

### Go Live
- [ ] Delete MAINTENANCE_MODE env var in Vercel
- [ ] Trigger redeploy
- [ ] Test signup flow on production (use your email)
- [ ] Test one generation

### After Launch
- [ ] Send waitlist email
- [ ] Post on Twitter/LinkedIn
- [ ] Monitor error logs
- [ ] Respond to support requests quickly
- [ ] Share in relevant communities (IndieHackers, Reddit, etc.)

---

## 💡 Launch Amplification Ideas

### Free Promotion
1. **Twitter/X** - Share journey, demo GIF, launch announcement
2. **LinkedIn** - Professional launch post
3. **IndieHackers** - Post in relevant groups
4. **Reddit** - r/SaaS, r/Entrepreneur, r/marketing (follow rules)
5. **Product Hunt** - Good for early visibility
6. **Hacker News** - Show HN post (if comfortable)

### Content Ideas
- "Why I built Voxify" story post
- Demo video/GIF showing the magic moment
- Before/after comparison (raw transcript → polished content)
- Share your own generated content as social proof

### Outreach
- Tell friends/network
- Email any beta testers
- Reach out to marketing newsletters
- Connect with content marketing communities

---

## 📊 Success Metrics to Track

### Week 1 Goals (Suggested)
- [ ] 100+ waitlist signups
- [ ] 10+ free trial signups
- [ ] 1-3 paid conversions
- [ ] Zero critical bugs
- [ ] <5 support tickets

### Tracking Setup
- Vercel Analytics (built-in)
- Stripe dashboard for revenue
- Supabase for user counts
- Support inbox for feedback

---

## 🛟 Emergency Contacts

- **Stripe Issues:** dashboard.stripe.com/support
- **Supabase Issues:** supabase.com/dashboard (or Discord)
- **Vercel Issues:** vercel.com/support
- **Domain Issues:** Check registrar (Namecheap, etc.)

---

## Notes

_Add any notes or changes to the plan here_

---

*Created: Feb 5, 2026*
