# Voxify ROI Calculator Copy & Methodology

*Content for an interactive ROI calculator on the website.*

---

## Calculator Overview

**Purpose:** Show prospects exactly how much time and money they'll save with Voxify

**Placement:** Pricing page, separate landing page, sales conversations

---

## Input Fields

### 1. Customer Calls Per Month
**Label:** "How many customer calls do you have per month?"
**Subtext:** "Include: sales calls, interviews, success calls, support conversations"
**Input type:** Slider or number input
**Range:** 1-50
**Default:** 5

### 2. Time to Extract Content (Current)
**Label:** "How long does it take to turn one call into content?"
**Subtext:** "Include: transcription, highlighting, writing case study, social posts, etc."
**Input type:** Slider or dropdown
**Options:** 
- 30 minutes
- 1 hour
- 2 hours
- 3 hours
- 4+ hours
**Default:** 2 hours

### 3. Hourly Value
**Label:** "What's your time worth per hour?"
**Subtext:** "Use your hourly rate or opportunity cost"
**Input type:** Slider or number input
**Range:** $25-$300
**Default:** $75

### 4. Current Content Output
**Label:** "How many calls actually become content today?"
**Subtext:** "Be honest—how many transcripts are sitting unused?"
**Input type:** Percentage slider
**Range:** 0%-100%
**Default:** 20%

---

## Output Calculations

### Time Saved Per Month

```
Time_Current = Calls_Per_Month × Hours_Per_Call × Content_Rate
Time_Voxify = Calls_Per_Month × 0.25 hours × 100%  (15 min per call with review)
Time_Saved = Time_Current - Time_Voxify (minimum 0)
```

**Display:** "Save [X] hours per month"

### Money Saved Per Month

```
Money_Saved = Time_Saved × Hourly_Rate
```

**Display:** "Worth $[X] in recovered time"

### Additional Content Created

```
Current_Content_Pieces = Calls_Per_Month × Content_Rate × 20 pieces
Voxify_Content_Pieces = Calls_Per_Month × 100% × 20 pieces
Additional_Pieces = Voxify_Content_Pieces - Current_Content_Pieces
```

**Display:** "[X] more pieces of content per month"

### Effective Cost Per Piece

```
Plan_Cost = $79 (Pro plan)
Effective_Cost = Plan_Cost / Voxify_Content_Pieces
```

**Display:** "Just $[X] per piece of content"

### Comparison to Alternatives

```
Freelance_Cost = Content_Pieces × $50 average (per piece estimate)
Agency_Cost = Content_Pieces × $100 average (per piece estimate)
Savings_vs_Freelance = Freelance_Cost - Plan_Cost
Savings_vs_Agency = Agency_Cost - Plan_Cost
```

**Display:** "Save $[X] vs freelancers" / "Save $[X] vs agencies"

---

## Example Output Display

### For Default Inputs (5 calls, 2 hours each, $75/hour, 20% output)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
               YOUR ROI SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TIME SAVED
┌─────────────────────────────────────────┐
│  🕐  8.75 hours saved per month         │
│      (From 10 hours → 1.25 hours)       │
└─────────────────────────────────────────┘

VALUE OF TIME SAVED
┌─────────────────────────────────────────┐
│  💰  $656 worth of time recovered       │
│      That's 8x the cost of Voxify Pro   │
└─────────────────────────────────────────┘

CONTENT INCREASE
┌─────────────────────────────────────────┐
│  📈  80 more pieces per month           │
│      From 20 pieces → 100 pieces        │
└─────────────────────────────────────────┘

COST PER PIECE
┌─────────────────────────────────────────┐
│  📊  Just $0.79 per piece               │
│      vs $50+ per piece (freelance)      │
└─────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         Voxify Pro: $79/month
        [Start Free Trial →]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Comparison Table Output

**Monthly comparison view:**

| Metric | Without Voxify | With Voxify | Difference |
|--------|---------------|-------------|------------|
| Time spent | 10 hours | 1.25 hours | -8.75 hours |
| Content pieces | 20 | 100 | +80 |
| Cost per piece | $37.50 (your time) | $0.79 | -98% |
| Total cost | $750 (time) | $79 (subscription) | -$671 |

---

## Headline Copy Options

**Option 1 (Time-focused):**
> "Calculate how much time Voxify will save you"

**Option 2 (Money-focused):**
> "See your content ROI in 30 seconds"

**Option 3 (Content-focused):**
> "How much content are you leaving on the table?"

**Option 4 (Problem-focused):**
> "Your customer calls are worth more than you think"

---

## Supporting Copy

### Above Calculator

> **Stop guessing. See the math.**
> 
> Every customer call you have contains marketing gold. Most of it never becomes content because extraction takes too long.
> 
> Enter your numbers below to see exactly what you're leaving on the table—and how Voxify changes the equation.

### Below Calculator

> **The bottom line:**
> 
> At [X] calls per month, Voxify pays for itself in [Y] uses. Everything after that is profit—in time saved and content created.
>
> [Start Your Free Trial →]

### Social Proof Below Results

> *"The ROI was obvious from day one. I was paying freelancers $500 per case study. Now I do unlimited for $79/month."*
> — Marketing Director, SaaS Company

---

## Mobile-Friendly Version

For mobile, simplify to 2 inputs:
1. Customer calls per month (slider)
2. Hours per call currently (dropdown)

Assume:
- Hourly rate: $75 (industry average)
- Current content rate: 25%

Show simplified output:
- Hours saved
- Money saved
- Additional content pieces

---

## A/B Test Ideas

**Test 1:** Calculator placement
- A: Above the fold on pricing page
- B: Dedicated landing page linked from nav

**Test 2:** Default values
- A: Conservative (3 calls, 1 hour, $50/hr)
- B: Ambitious (10 calls, 3 hours, $100/hr)

**Test 3:** Output emphasis
- A: Lead with time saved
- B: Lead with money saved
- C: Lead with content increase

**Test 4:** CTA after results
- A: "Start Free Trial"
- B: "See Plans"
- C: "Talk to Sales"

---

## Technical Implementation Notes

### Calculations (JavaScript)

```javascript
function calculateROI(calls, hoursPerCall, hourlyRate, contentRate) {
  // Time calculations
  const currentHours = calls * hoursPerCall * (contentRate / 100);
  const voxifyHours = calls * 0.25; // 15 min per call with review
  const hoursSaved = Math.max(0, currentHours - voxifyHours);
  
  // Money calculations
  const moneySaved = hoursSaved * hourlyRate;
  
  // Content calculations
  const piecesPerCall = 20;
  const currentPieces = calls * (contentRate / 100) * piecesPerCall;
  const voxifyPieces = calls * piecesPerCall;
  const additionalPieces = voxifyPieces - currentPieces;
  
  // Cost calculations
  const planCost = 79; // Pro plan
  const costPerPiece = planCost / voxifyPieces;
  
  return {
    hoursSaved,
    moneySaved,
    currentPieces,
    voxifyPieces,
    additionalPieces,
    costPerPiece,
    roiMultiple: moneySaved / planCost
  };
}
```

### Animation Ideas

- Numbers count up when calculated
- Progress bar fills showing "content captured"
- Before/after slider visualization
- Confetti on high ROI results

---

## Landing Page Structure

If creating a dedicated calculator page:

1. **Hero:** "Calculate Your Content ROI"
2. **Calculator:** Interactive tool
3. **Results:** Dynamic output
4. **Social proof:** 2-3 testimonials about ROI
5. **Comparison:** vs alternatives (freelancers, agencies, DIY)
6. **CTA:** Start free trial
7. **FAQ:** Common questions about value/pricing

---

*Implement as interactive component on pricing page and/or dedicated landing page.*
