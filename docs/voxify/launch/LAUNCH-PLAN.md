# Voxify Launch Plan

*Go-to-market strategy for turning Voxify into a profitable SaaS business*

---

## 🎯 Target Audience (Priority Order)

### Tier 1: Highest Intent (Start Here)
1. **Freelance Copywriters & Content Writers**
   - Pain: Struggle to extract client voice, spend hours on research calls
   - Where to find: Twitter/X, LinkedIn, copywriting communities, Superpath, Peak Freelance
   - Hook: "Stop charging for research time. Start charging for results."

2. **Marketing Agencies (5-20 employees)**
   - Pain: Onboarding new clients takes weeks, voice extraction is manual
   - Where to find: LinkedIn, Agency Hackers, DigitalMarketer, local business groups
   - Hook: "Onboard new clients in hours, not weeks."

3. **Business Coaches & Consultants**
   - Pain: Have dozens of coaching calls, no system to repurpose them
   - Where to find: LinkedIn, coaching communities, Kajabi/Teachable user groups
   - Hook: "Turn every coaching call into a week of content."

### Tier 2: Secondary Targets
4. **SaaS Founders (early-stage)**
   - Pain: Know they should use customer language, don't have time to extract it
   - Where to find: Indie Hackers, Twitter, Product Hunt, SaaS communities

5. **Course Creators**
   - Pain: Sales calls contain testimonials and objection-handling gold
   - Where to find: YouTube, Twitter, creator economy communities

---

## 📣 Distribution Channels

### Week 1-2: Foundation
| Channel | Action | Time Investment |
|---------|--------|-----------------|
| **Product Hunt** | Prep launch (screenshots, copy, hunter outreach) | 3-4 hours |
| **LinkedIn** | Daily posts about VoC marketing | 30 min/day |
| **Twitter/X** | Thread on "voice of customer" wins | 30 min/day |
| **Cold Email** | 10 personalized emails to agencies | 1 hour/day |

### Week 3-4: Amplification
| Channel | Action | Time Investment |
|---------|--------|-----------------|
| **Product Hunt Launch** | Coordinate launch day, engage comments | Full day |
| **Podcast Outreach** | Pitch 10 marketing podcasts | 2 hours |
| **Community Posts** | Indie Hackers, Reddit (r/entrepreneur, r/marketing) | 1 hour |
| **Affiliate Setup** | Reach out to 5 copywriters with audiences | 2 hours |

---

## 📅 First 30 Days: Day-by-Day Plan

### Pre-Launch (Days -7 to 0)

#### ⚠️ CRITICAL: Infrastructure Setup
- [ ] **Upgrade Supabase to Pro ($25/mo)** - Prevents database pausing after 1 week inactive
- [ ] Run 6 SQL migrations in Supabase (20260131000000 through 20260131050000)
- [ ] Add Vercel env vars (RESEND_API_KEY, ASSEMBLYAI_API_KEY, POSTHOG keys, CRON_SECRET)
- [ ] Create 4 Stripe products (Starter, Professional, Business, Booster Pack)
- [ ] Configure DNS: getvoxify.com + voxify.run → Vercel

#### Marketing Prep
- [ ] **Day -7**: Finalize Product Hunt assets (logo, tagline, 6 screenshots, maker comment)
- [ ] **Day -6**: Reach out to 3 potential hunters with large followings
- [ ] **Day -5**: Write 5 LinkedIn posts, schedule for launch week
- [ ] **Day -4**: Write cold email templates (3 versions for A/B testing)
- [ ] **Day -3**: Build list of 50 target agencies/freelancers
- [ ] **Day -2**: Create launch-day Twitter thread (10+ tweets)
- [ ] **Day -1**: Email friends/network asking for PH upvotes, test everything

### Launch Week (Days 1-7)
- [ ] **Day 1 (Launch)**: Product Hunt goes live at 12:01 AM PT
  - Post Twitter thread
  - LinkedIn announcement
  - Email personal network
  - Engage every PH comment within 30 min
  - Track signups hourly
  
- [ ] **Day 2-3**: Follow up with early signups
  - Personal email to first 20 users
  - Ask for feedback, offer extended trial for testimonials
  
- [ ] **Day 4-5**: Cold outreach begins
  - Send 20 personalized emails to agencies
  - DM 10 copywriters on Twitter
  
- [ ] **Day 6-7**: Content creation
  - Write case study from early user feedback
  - Create comparison post (Voxify vs manual extraction)

### Week 2 (Days 8-14)
- [ ] Publish 3 blog posts (SEO play)
- [ ] Guest post pitch to 5 marketing blogs
- [ ] Launch on Indie Hackers with revenue milestone post
- [ ] First podcast appearance (if booked)
- [ ] Analyze which channels drove signups, double down

### Week 3-4 (Days 15-30)
- [ ] Hit 10 paying customers milestone
- [ ] Launch affiliate/referral program publicly
- [ ] Create video demo for YouTube
- [ ] Reddit AMAs in relevant subreddits
- [ ] Review metrics, adjust strategy

---

## ✉️ Cold Outreach Templates

### Template 1: Agency Owner (Direct Value)
```
Subject: Quick question about client onboarding

Hi [Name],

Noticed [Agency] does [type of work] - impressive client list.

Quick question: how long does it typically take your team to extract a new client's voice and messaging from discovery calls?

We built Voxify specifically for this - upload a call transcript, get website copy, emails, and social posts in 60 seconds using the client's actual language.

Would a 5-minute demo be worth your time this week?

[Your name]
```

### Template 2: Freelance Copywriter (Pain-Focused)
```
Subject: The "client voice" problem

Hey [Name],

Love your work on [specific project if visible]. Quick thought:

The hardest part of copywriting isn't writing - it's extracting how clients' customers actually talk. Hours of calls, notes, trying to capture the right phrases.

We built a tool that does this automatically. Paste a transcript → get ready-to-use copy in their customers' exact words.

Free trial, no pitch. Just want feedback from working copywriters.

Interested?
```

### Template 3: SaaS Founder (Results-Focused)
```
Subject: Your sales calls are a content goldmine

[Name],

Your customers are already telling you exactly how to market [Product].

Every discovery call contains:
- Pain points in their words (headlines)
- Objections (FAQ content)  
- Success language (testimonials)

Voxify extracts all of this automatically. One call → 20+ pieces of content.

Worth a look? Free trial at getvoxify.com

[Your name]
```

---

## 📊 Metrics to Track

### Week 1
| Metric | Target | How to Track |
|--------|--------|--------------|
| Website visitors | 500+ | PostHog |
| Signups | 50+ | Supabase |
| Trial→Paid conversion | 10%+ | Stripe |
| Product Hunt rank | Top 5 of day | PH dashboard |

### Month 1
| Metric | Target | How to Track |
|--------|--------|--------------|
| Paying customers | 10+ | Stripe |
| MRR | $500+ | Stripe |
| Trial→Paid rate | 15%+ | Calculate |
| Churn | <5% | Stripe |

### Month 3
| Metric | Target | How to Track |
|--------|--------|--------------|
| Paying customers | 50+ | Stripe |
| MRR | $2,500+ | Stripe |
| CAC payback | <2 months | Calculate |

---

## 💰 Budget Considerations

### Zero-Cost Channels (Focus Here First)
- LinkedIn organic posts
- Twitter/X threads and engagement
- Cold email (use personal email or free tier of Resend)
- Product Hunt (free to launch)
- Indie Hackers, Reddit (free)
- Personal network outreach

### Low-Cost Experiments ($100-500)
- LinkedIn Sales Navigator ($99/mo) - for finding targets
- Podcast booking service (one-time)
- Small influencer shoutouts
- Twitter ads test ($5-10/day)

### Later (Once PMF Confirmed)
- Google Ads for "call transcript software"
- Sponsor marketing newsletters
- Affiliate payouts

---

## 🚀 Launch Day Checklist

### Morning (Before Launch)
- [ ] Product Hunt listing live and looking good
- [ ] Twitter thread scheduled/ready
- [ ] LinkedIn post scheduled
- [ ] Email to personal network drafted
- [ ] Slack/Discord communities notified
- [ ] All links tested and working

### During Launch
- [ ] Respond to every PH comment within 30 min
- [ ] Retweet/reshare mentions
- [ ] Post updates throughout the day
- [ ] Track signups in real-time
- [ ] Send personal thanks to upvoters with large followings

### End of Day
- [ ] Thank you post on PH
- [ ] Share results on Twitter/LinkedIn
- [ ] Email early signups with personal note
- [ ] Document what worked/didn't for next time

---

## 🔄 Weekly Rhythm (Post-Launch)

**Monday**: Review last week's metrics, plan outreach targets
**Tuesday-Thursday**: Content creation + cold outreach (10 emails/day minimum)
**Friday**: Community engagement, podcast/guest post pitches
**Weekend**: Optional - prep content for next week, big-picture strategy

---

## 📝 Content Calendar (Month 1)

### Blog Posts (SEO)
1. "How to Extract Customer Language from Sales Calls" (how-to)
2. "Voice of Customer: The Missing Ingredient in Your Marketing" (thought leadership)
3. "From 60-Minute Call to 20 Content Pieces: A Case Study" (proof)
4. "5 Signs Your Copy Isn't Using Customer Language" (problem-aware)

### LinkedIn Posts (Daily)
- Monday: Tip/tactic post
- Tuesday: Mini case study or before/after
- Wednesday: Contrarian take on marketing
- Thursday: Tool/process share
- Friday: Personal story or lesson learned

### Twitter Threads (2x/week)
- "How we built Voxify" (founder journey)
- "The $6,000 copywriter vs. Voxify" (comparison)
- "47 content ideas from one sales call" (tactical)
- "Why your marketing sounds like everyone else's" (problem)

---

## 🎯 Success Criteria

### "We Have Something" (Month 1)
- 10+ paying customers
- 2+ unsolicited testimonials
- Retention: first cohort renews

### "We Have PMF" (Month 3)
- 50+ paying customers
- Word of mouth accounts for 20%+ of signups
- Users actively requesting features (pull, not push)
- NPS > 40

### "We Have a Business" (Month 6)
- $5K+ MRR
- Sustainable growth (10%+ MoM)
- Clear path to $10K MRR

---

*Created: February 2026*
*Last updated: [auto-update on changes]*

---

## Next Steps for Drew

1. **Today**: Review this plan, adjust anything that doesn't fit your schedule
2. **This week**: Start Product Hunt prep (screenshots, copy)
3. **Build in public**: Document the journey on Twitter/LinkedIn - this itself is marketing
4. **Set a launch date**: Pick a Tuesday or Wednesday 2 weeks out

The product is ready. Now it's about putting it in front of people. Let's go! 🚀
