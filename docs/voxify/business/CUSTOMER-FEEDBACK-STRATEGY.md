# Voxify Customer Feedback Pipeline Strategy

*How to rapidly collect, analyze, and act on customer feedback.*

---

## Why This Matters

Voxify's core functionality (transcript → AI content) is relatively simple to replicate. Any competitor with decent prompt engineering could build something similar.

**Our edge must come from:**
1. Speed of iteration
2. Quality of output
3. UX polish
4. Understanding customers better than anyone

Fast feedback → fast improvements → harder to catch.

---

## Feedback Collection: The Stack

### Tier 1: Passive/Automatic (Always On)

These run in the background with no user effort required.

#### 1.1 Content Quality Signals (In-App)

**Implementation:**
- Add thumbs up/down buttons on each generated content section
- Track which sections get copied vs ignored
- Track which sections get edited heavily (low quality signal)

**Data collected:**
- Content type with most positive feedback
- Content type with most negative feedback
- Sections users consistently edit (need improvement)

**Priority:** HIGH — Do this first

---

#### 1.2 Behavioral Analytics (PostHog)

Already set up. Key events to watch:

**Positive signals:**
- Content copied → user liked it
- Content exported → user using it
- Multiple generations in session → engaged user

**Negative signals:**
- Generation started but results not viewed → confused/disappointed
- Content viewed but not copied → didn't meet expectations
- Single generation then churn → didn't deliver value

**Dashboard to build:**
- Weekly active users (WAU)
- Average generations per user
- Copy rate by content type
- Churn correlation with usage patterns

**Priority:** MEDIUM — PostHog is in, just need dashboards

---

### Tier 2: Triggered Feedback (Event-Based)

These appear at key moments in the user journey.

#### 2.1 Post-Generation Micro-Survey

**Trigger:** After 3rd generation

**Question:** "How useful was the content Voxify generated?"
- Very useful
- Somewhat useful
- Not useful

**If "Not useful":** "What would have made it better?" (free text)

**Implementation:** Modal or slide-in, dismiss-able

**Priority:** HIGH

---

#### 2.2 NPS Survey

**Trigger:** 30 days after signup (for active users only)

**Question:** "How likely are you to recommend Voxify to a colleague? (0-10)"

**Follow-up:**
- Promoters (9-10): "What do you love most about Voxify?"
- Passives (7-8): "What's one thing that would make Voxify a 10?"
- Detractors (0-6): "What's not working for you?"

**Implementation:** Email or in-app modal

**Priority:** MEDIUM

---

#### 2.3 Churn Survey

**Trigger:** When user cancels subscription

**Question:** "Why are you canceling?"

**Options:**
- Too expensive
- Not using it enough
- Content quality wasn't good enough
- Found an alternative
- Missing features I need
- Other (free text)

**Implementation:** Required step in cancellation flow (but don't make it annoying)

**Priority:** HIGH — Critical for understanding why people leave

---

### Tier 3: Active Outreach (Manual)

These require effort but provide the deepest insights.

#### 3.1 Customer Interviews

**Target:** 2-4 per month minimum

**Who to talk to:**
- Power users (5+ generations/month) — What do they love?
- Churned users — Why did they leave?
- Trial-didn't-convert — What stopped them?
- Recent signups — What are they hoping to achieve?

**Questions to ask:**
(Use the 50 Questions guide I created!)

**Process:**
1. Reach out via email: "Would love 15 minutes of your feedback"
2. Offer incentive: Free month, feature input, etc.
3. Record the call
4. **Use Voxify to extract content from the call** (dogfooding!)

**Priority:** HIGH — Do this consistently

---

#### 3.2 Email Check-ins

**Trigger:** Day 3, Day 7, Day 14 of trial

**Day 3 email:**
```
Subject: How's it going?

Hey [Name],

You signed up for Voxify a few days ago. How's it going?

If you haven't uploaded a transcript yet, here's a quick win: paste in any customer conversation and see what comes out.

If you have—what did you think? Reply and let me know.

Drew
```

**Day 7 email:**
```
Subject: Quick question

Hey [Name],

One question: What's the #1 thing you're hoping Voxify helps you accomplish?

I ask everyone this—helps me build what people actually need.

Drew
```

**Day 14 email:**
```
Subject: Trial ending soon

Hey [Name],

Your Voxify trial ends in a few days.

Quick question: Is there anything that would make your decision easier?

I'm happy to hop on a quick call or answer any questions.

Drew
```

**Priority:** MEDIUM — Automate these

---

### Tier 4: Community & Public Feedback

#### 4.1 Public Roadmap

**Tool:** Canny, ProductBoard, or Notion (public page)

**Benefits:**
- Users can suggest features
- Users can vote on priorities
- Transparency builds trust
- Shows you're actively developing

**Priority:** LOW (for now) — More valuable at scale

---

#### 4.2 Twitter/LinkedIn Engagement

**Process:**
- Monitor mentions of Voxify
- Respond to all feedback (positive and negative)
- Ask follow-up questions publicly
- Screenshot and share positive feedback (social proof)

**Priority:** MEDIUM — Do this as you grow

---

## Analyzing Feedback

### Weekly Review (15-30 min)

Every week, review:
- [ ] PostHog dashboards (usage patterns)
- [ ] Content feedback (thumbs up/down if implemented)
- [ ] New survey responses
- [ ] Customer interview notes
- [ ] Support tickets/emails

**Output:** 1-3 key insights or action items

---

### Monthly Synthesis (1-2 hours)

Once a month:
- Compile all feedback sources
- Identify patterns
- Prioritize improvements
- Update roadmap
- Share insights with stakeholders (even if it's just you)

**Template:**
```
## [Month] Feedback Summary

### What's Working
- [Positive pattern 1]
- [Positive pattern 2]

### What Needs Improvement
- [Issue 1 + proposed fix]
- [Issue 2 + proposed fix]

### Feature Requests
- [Request 1] — X users asked
- [Request 2] — X users asked

### Actions for Next Month
- [ ] [Action 1]
- [ ] [Action 2]
```

---

## Acting on Feedback

### The 1-Week Rule

For any feedback that appears 3+ times:
- Decide within 1 week: fix, roadmap, or won't do
- Communicate decision to requesters

### Quick Wins vs. Big Projects

**Quick wins (do immediately):**
- Copy changes
- Small UX fixes
- Bug fixes
- Confusing UI elements

**Roadmap items (schedule):**
- New features
- Major changes
- Infrastructure work

**Won't do (be honest):**
- Out of scope requests
- Low-impact ideas
- Things that conflict with vision

---

## Tool Recommendations

### Must Have
| Need | Tool | Cost | Notes |
|------|------|------|-------|
| Analytics | PostHog | Free tier | Already set up |
| Surveys | Typeform or Google Forms | Free | Simple, clean |
| Email automation | Loops or Customer.io | Free-$49/mo | Triggered emails |

### Nice to Have
| Need | Tool | Cost | Notes |
|------|------|------|-------|
| Roadmap | Canny | $79/mo | Public voting |
| Support | Intercom or Crisp | $0-39/mo | Live chat |
| Session recording | PostHog | Included | See user sessions |

### Can Wait
- Dedicated feedback platforms (Uservoice, etc.)
- Enterprise survey tools
- Community platforms

---

## Implementation Priority

### Phase 1 (This Week)
- [ ] Add content feedback (thumbs up/down) to results page
- [ ] Set up churn survey in cancellation flow
- [ ] Create PostHog dashboard for key metrics

### Phase 2 (Next 2 Weeks)
- [ ] Implement post-generation micro-survey
- [ ] Set up automated email check-ins (Day 3, 7, 14)
- [ ] Schedule first customer interview

### Phase 3 (Month 2)
- [ ] Add NPS survey (30-day trigger)
- [ ] Create monthly feedback review template
- [ ] Consider public roadmap

---

## Feedback → Content Loop

Here's the magic: customer feedback becomes marketing content.

**Positive feedback →**
- Testimonials
- Case studies
- Social proof

**Feature requests →**
- Blog posts ("We listened: Here's [feature]")
- Launch announcements
- Roadmap transparency posts

**Problems solved →**
- "How we fixed [issue]" content
- Build-in-public updates

Use Voxify on your own customer calls to extract this content!

---

## Metrics to Track

### Leading Indicators (Weekly)
- NPS score
- Content copy rate
- Thumbs up/down ratio
- Trial-to-paid conversion

### Lagging Indicators (Monthly)
- Monthly churn rate
- Customer lifetime value
- Feature adoption rates
- Support ticket volume

### Target Benchmarks
- NPS: 40+ (good for SaaS)
- Churn: <5% monthly
- Trial conversion: >20%
- Content copy rate: >50%

---

## Summary

**The feedback stack:**
1. **Passive:** Analytics, content quality signals
2. **Triggered:** Micro-surveys, NPS, churn surveys
3. **Active:** Customer interviews, email check-ins
4. **Public:** Roadmap, social engagement

**The cadence:**
- Daily: Check support/mentions
- Weekly: Review analytics, respond to surveys
- Monthly: Synthesize, prioritize, plan
- Quarterly: Deep analysis, roadmap review

**The mindset:**
- Every piece of feedback is a gift
- Patterns matter more than individuals
- Speed of response = competitive advantage
- Customers who complain care enough to tell you

---

*Start with Phase 1. Get feedback flowing. Iterate from there.*
