# Customer.io Email Automation Setup Guide (Call-Content)

**Purpose:** Configure Customer.io with 14-day trial sequence + 7 trigger emails  
**Status:** Production-ready implementation guide  
**Date:** January 31, 2026

---

## Overview

This guide shows you how to set up the complete email automation for Call-Content using Customer.io.

**What you'll configure:**
- 14-day trial nurture sequence (8 emails)
- 7 trigger-based emails
- Behavioral tracking
- A/B testing framework

**Time required:** 2-3 hours for complete setup

---

## Part 1: Customer.io Account Setup

### Step 1: Create Account

1. Go to https://customer.io
2. Sign up for free trial (14 days)
3. Choose "SaaS" as your industry
4. Select "Product-Led Growth" as use case

### Step 2: Install Tracking Code

**Add to your app's layout:**

```javascript
// app/layout.tsx or equivalent
<Script id="customerio-tracking">
{`
  var _cio = _cio || [];
  (function() {
    var a,b,c;a=function(f){return function(){_cio.push([f].
    concat(Array.prototype.slice.call(arguments,0)))}};b=["load","identify",
    "sidentify","track","page"];for(c=0;c<b.length;c++){_cio[b[c]]=a(b[c])};
    var t = document.createElement('script'),
        s = document.getElementsByTagName('script')[0];
    t.async = true;
    t.id    = 'cio-tracker';
    t.setAttribute('data-site-id', 'YOUR_SITE_ID');
    t.src = 'https://assets.customer.io/assets/track.js';
    s.parentNode.insertBefore(t, s);
  })();
`}
</Script>
```

**Get your Site ID:**
- Customer.io → Settings → API Credentials
- Copy Site ID and replace `YOUR_SITE_ID`

### Step 3: Identify Users

**When user signs up:**

```typescript
// app/api/auth/signup/route.ts
_cio.identify({
  id: user.id,
  email: user.email,
  created_at: Math.floor(Date.now() / 1000),
  plan: 'trial',
  trial_ends_at: trialEndDate,
  transcripts_processed: 0
});
```

### Step 4: Track Events

**Key events to track:**

```typescript
// When user processes first transcript
_cio.track('transcript_processed', {
  transcript_count: 1,
  content_types: ['blog_post', 'email_sequence']
});

// When user hits usage limits
_cio.track('usage_limit_reached', {
  limit_type: 'monthly',
  current_usage: 20,
  plan: 'starter'
});

// When user upgrades
_cio.track('upgraded', {
  from_plan: 'trial',
  to_plan: 'professional',
  mrr: 197
});
```

---

## Part 2: Email Templates Setup

### Template Design Guidelines

**Brand colors:**
- Primary: #3B82F6 (blue)
- Secondary: #10B981 (green)
- Background: #F9FAFB (light gray)
- Text: #111827 (dark gray)

**Email structure:**
```
Logo
---
Headline
Subheadline
---
Body copy (short paragraphs)
CTA button (blue, prominent)
---
Footer (unsubscribe, social links)
```

### Creating Templates in Customer.io

1. Go to **Content → Templates**
2. Click **New Template**
3. Choose **Drag & Drop Editor**
4. Use this base template:

**HTML template:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              <h1 style="margin: 0; color: #3B82F6; font-size: 24px;">Call-Content</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px;">
              {{ content }}
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 20px 40px 40px;">
              <a href="{{ cta_url }}" style="display: inline-block; background-color: #3B82F6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                {{ cta_text }}
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; text-align: center;">
              <p style="margin: 0 0 10px;">Call-Content | Turn transcripts into content in 10 minutes</p>
              <p style="margin: 0;"><a href="{{ unsubscribe_url }}" style="color: #3B82F6; text-decoration: none;">Unsubscribe</a></p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Part 3: 14-Day Trial Campaign Setup

### Campaign Structure

**Campaign Name:** Trial Nurture - 14 Days

**Trigger:** User signs up (event: `signed_up`)

**Entry conditions:**
- Plan = 'trial'
- Email is verified

### Email Schedule

| Day | Email | Send Time | Goal |
|-----|-------|-----------|------|
| 0 | Welcome | Immediately | First impression |
| 1 | Activation | 24 hours | Get first transcript |
| 3 | Education | 72 hours | Learn templates |
| 5 | Value | 120 hours | Show ROI |
| 7 | Social Proof | 168 hours | Build trust |
| 10 | Urgency | 240 hours | Create FOMO |
| 13 | Final Push | 312 hours | Last chance |
| 14 | Post-Trial | 336 hours | Win-back |

### Creating the Campaign

1. Go to **Campaigns → New Campaign**
2. Select **Workflow**
3. Name: "Trial Nurture - 14 Days"

**Workflow builder:**

```
Trigger: Event "signed_up"
  ↓
Filter: plan = 'trial'
  ↓
Wait: 0 minutes
  ↓
Send Email: Day 0 - Welcome
  ↓
Wait: 24 hours
  ↓
Branch: Has processed transcript?
  Yes → Skip Day 1 email
  No → Send Email: Day 1 - Activation
  ↓
Wait: 48 hours
  ↓
Send Email: Day 3 - Education
  ↓
... (continue pattern)
```

---

## Part 4: Email Content (From call-content-email-sequences.md)

### Email 1: Welcome (Day 0)

**Subject:** Welcome to Call-Content! Here's what to do first 👋

**Preview:** Your account is ready. Start with a demo transcript (no upload needed).

**Content:**

```
Hey {{customer.first_name}},

Welcome to Call-Content! 🎉

Your 14-day trial just started, and I want to make sure you get value from it—fast.

Here's what to do in the next 10 minutes:

1. Try a demo transcript (no upload required)
   [Try Demo Now →]
   
2. Upload your first transcript
   [Upload Transcript →]
   
3. Watch this 2-minute walkthrough
   [Watch Video →]

Questions? Just hit reply—I read every email.

Looking forward to seeing what you build,
Drew
Founder, Call-Content

P.S. Your trial includes 5 free transcripts. No credit card required, cancel anytime.
```

**CTA:** Try Demo Now  
**CTA URL:** `https://app.call-content.com/demo`

---

### Email 2: Activation (Day 1 - if no transcript uploaded)

**Subject:** Haven't uploaded yet? Start here 👇

**Preview:** 3 ways to get your first transcript into Call-Content

**Conditional send:** Only if `transcripts_processed = 0`

**Content:**

```
Hey {{customer.first_name}},

I noticed you haven't uploaded a transcript yet. No worries—here's how to get started:

Option 1: Try a Demo (Fastest)
We've pre-loaded 5 sample transcripts. Click one button, you'll see a full content pack in 30 seconds.
[Try Demo →]

Option 2: Upload Text
Got a transcript from Otter or Zoom? Just copy/paste it.
[Upload Text →]

Option 3: Upload Audio/Video
Have a recording but no transcript? We'll transcribe it for you ($0.10/minute).
[Upload File →]

Why this matters:
Most people who process their first transcript within 24 hours end up becoming customers.

Got 5 minutes? Upload a transcript right now.

Best,
Drew
```

**CTA:** Upload Your First Transcript  
**CTA URL:** `https://app.call-content.com/upload`

---

### Email 3: Education (Day 3)

**Subject:** 3 content templates you should try this week

**Content:**

```
Hey {{customer.first_name}},

You've got access to 15+ content templates in Call-Content. Here are the three most popular:

1. Blog Post (SEO-Optimized)
   Turn a customer interview into a 1,500-word blog post with H2/H3 structure, pull quotes, and meta description.
   
   Use case: Sarah used this to turn a user interview into a blog post that now ranks #3 for "SaaS pricing mistakes."
   [Try Blog Template →]

2. Email Sequence (5-7 emails)
   Extract insights from a sales call and turn them into a drip campaign.
   
   Use case: Marcus created a 7-email sequence that converts at 18%. He's made $40k from one transcript.
   [Try Email Template →]

3. Case Study
   Turn a client success call into a case study with company background, challenge, solution, and results.
   
   Use case: Jamie's case study closes 30% of her sales calls.
   [Try Case Study Template →]

Your challenge: Pick one template and try it this week.

Best,
Drew
```

---

### Email 4: Value (Day 5)

**Subject:** You've saved {{customer.hours_saved}} hours so far ⏰

**Conditional:** Only send if `transcripts_processed > 0`

**Content:**

```
Hey {{customer.first_name}},

Quick update: You've saved {{customer.hours_saved}} hours this week using Call-Content.

Here's the breakdown:
• {{customer.transcripts_processed}} transcripts processed
• {{customer.content_generated}} pieces of content generated
• Avg time saved per transcript: 8.5 hours

What you could do with those {{customer.hours_saved}} hours:
☕ Grab coffee with friends
📚 Read a book
💼 Close sales calls
😴 Actually sleep

Keep going—you've got {{customer.trial_days_left}} days left in your trial.

If you're loving it, you can subscribe early and lock in founding member pricing (30% off for life):
[Subscribe Now →]

Best,
Drew
```

---

## Part 5: Trigger Emails Setup

### Trigger 1: Uploaded 0 Transcripts After 3 Days

**Campaign:** Nudge - No Upload After 3 Days

**Trigger:** 
- Event: `signed_up`
- Wait: 72 hours
- Condition: `transcripts_processed = 0`

**Email:** (See Day 1 content, resend)

---

### Trigger 2: Processed 1 Transcript

**Campaign:** Celebration - First Transcript

**Trigger:** Event `transcript_processed` where `transcript_count = 1`

**Subject:** Nice! Here's what to do next 🎉

**Content:**

```
Awesome—you just processed your first transcript!

Here's what to do next:
1. Export your content (Google Docs, WordPress, Notion)
2. Try another template (you've got 15+ options)
3. Train your Brand Voice (upload 5-10 past blog posts)

Keep going—you've got {{customer.transcripts_remaining}} transcripts left in your trial.

Best,
Drew
```

---

### Trigger 3: At 80% Usage

**Trigger:** `usage_percentage >= 80`

**Subject:** Heads up: You're running low on transcripts

**Content:**

```
Quick heads-up: You've used {{customer.transcripts_used}} out of {{customer.transcripts_limit}} transcripts this month (80%).

What happens when you hit your limit?
You'll get a 10% grace buffer, but after that, you'll need to:
1. Upgrade to the next tier (instant, prorated)
2. Buy a Booster Pack (+10 transcripts for $97)

Want to avoid hitting the limit?
Upgrade now: [Upgrade to Professional →]
```

---

## Part 6: A/B Testing Setup

### Test 1: Subject Line

**Email:** Day 0 - Welcome

**Variant A:** "Welcome to Call-Content! Here's what to do first 👋"  
**Variant B:** "Your Call-Content account is ready (start here)"

**Winner metric:** Open rate  
**Sample size:** 50/50 split, minimum 100 sends

### Test 2: CTA Copy

**Email:** Day 10 - Urgency

**Variant A:** CTA = "Subscribe Now with 30% Off"  
**Variant B:** CTA = "Lock in Founding Member Pricing"

**Winner metric:** Click-through rate

---

## Part 7: Analytics & Optimization

### Key Metrics to Track

**Campaign-level:**
- Sequence completion rate (% who receive all emails)
- Overall trial-to-paid conversion (goal: 20%+)
- Email attributable conversions

**Email-level:**
- Open rate (target: 40%+)
- Click-through rate (target: 15%+)
- Reply rate (engagement signal)
- Unsubscribe rate (keep <1%)

### Customer.io Reporting

1. Go to **Reporting → Campaign Reports**
2. Select "Trial Nurture - 14 Days"
3. View:
   - Email performance by day
   - Conversion funnel
   - A/B test results

### Optimization Loop

**Every 2 weeks:**
1. Review email performance
2. Identify worst-performing email (lowest CTR)
3. Rewrite or A/B test new version
4. Deploy and measure

**Every month:**
1. Calculate trial-to-paid conversion rate
2. Interview customers who converted (what email resonated?)
3. Interview customers who churned (what was missing?)
4. Update email sequence based on feedback

---

## Part 8: Technical Implementation Checklist

- [ ] Customer.io account created
- [ ] Tracking code installed in app
- [ ] User identification implemented (`_cio.identify`)
- [ ] Event tracking implemented (`_cio.track`)
- [ ] Base email template created
- [ ] 14-day trial campaign built
- [ ] All 8 trial emails created
- [ ] 7 trigger campaigns created
- [ ] A/B tests configured
- [ ] Analytics dashboard set up
- [ ] Test sends completed (to your email)
- [ ] Launched to production

---

## Troubleshooting

**Users not receiving emails:**
- Check: Is user identified in Customer.io? (People → search by email)
- Check: Is email verified? (Unverified emails don't receive campaigns)
- Check: Campaign entry conditions met?

**Low open rates (<30%):**
- Test different subject lines
- Send from personal email (drew@call-content.com vs. no-reply@)
- Check spam folder (add "View in browser" link)

**High unsubscribe rate (>2%):**
- Emails too frequent? (Add wait time between sends)
- Content not relevant? (Review user feedback)
- Set expectations in welcome email

---

**Setup Time:** 2-3 hours total  
**Maintenance:** 1-2 hours/month for optimization

**Ready to launch!**
