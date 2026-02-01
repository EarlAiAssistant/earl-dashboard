# Call-Content: Pricing Page Implementation Guide
## Developer-Ready Component Specs & Layout

**File:** Implementation blueprint for `/pricing` page  
**Framework:** Next.js + TypeScript + Tailwind CSS  
**Goal:** High-converting pricing page with interactive elements

---

## Page Structure Overview

```
/pricing
├── Hero Section
├── ROI Calculator (Interactive)
├── Pricing Table (3 Tiers)
├── Feature Comparison Table
├── FAQ Section
├── Social Proof / Testimonials
├── Guarantee Badge
├── Exit-Intent Popup
└── CTA Footer
```

---

## Component 1: Hero Section

### Visual Layout:
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]                                     [Login] [Signup]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│           Turn Every Customer Call Into                      │
│           a Complete Marketing Campaign                     │
│                                                             │
│   Upload once. Get 12 ready-to-use assets. In 10 minutes.  │
│                                                             │
│           [Start Free Trial →]                              │
│           14 days free • No credit card required            │
│                                                             │
│    ✓ Case studies    ✓ Social posts    ✓ Email sequences   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Code Structure:
```typescript
// components/PricingHero.tsx
export default function PricingHero() {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-20">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Turn Every Customer Call Into a Complete Marketing Campaign
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Upload once. Get 12 ready-to-use assets. In 10 minutes.
        </p>
        <Button 
          size="lg" 
          className="mb-4"
          onClick={() => router.push('/signup')}
        >
          Start Free Trial →
        </Button>
        <p className="text-sm text-gray-500">
          14 days free • No credit card required
        </p>
        <div className="flex justify-center gap-8 mt-8 text-sm text-gray-700">
          <span>✓ Case studies</span>
          <span>✓ Social posts</span>
          <span>✓ Email sequences</span>
        </div>
      </div>
    </section>
  );
}
```

---

## Component 2: ROI Calculator (Interactive)

### Visual Layout:
```
┌─────────────────────────────────────────────────────────────┐
│  💰 How Much Time (and Money) Will You Save?                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  I do [____5____] customer interviews per month             │
│       (slider: 1-20)                                        │
│                                                             │
│  Creating content manually takes [___3___] hours per call   │
│       (slider: 1-5)                                         │
│                                                             │
│  My hourly rate is $[___100___]                             │
│       (input field)                                         │
│                                                             │
│  ─────────────────────────────────────────────────          │
│                                                             │
│  📊 Your Savings:                                           │
│                                                             │
│  ⏱️  Time Saved: 14 hours/month                             │
│  💵  Money Saved: $1,400/month ($16,800/year)               │
│  🚀  ROI: 2,900% ($27/mo → $1,400 value)                    │
│                                                             │
│  [Start Saving Time →]                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Code Structure:
```typescript
// components/ROICalculator.tsx
'use client';

import { useState } from 'react';

export default function ROICalculator() {
  const [interviews, setInterviews] = useState(5);
  const [hoursPerCall, setHoursPerCall] = useState(3);
  const [hourlyRate, setHourlyRate] = useState(100);

  // Call-Content saves ~90% of time (3 hours → 10 min = 2.83 hours saved)
  const timeSavedPerCall = hoursPerCall * 0.95; // 95% time savings
  const totalTimeSaved = interviews * timeSavedPerCall;
  const moneySaved = totalTimeSaved * hourlyRate;
  const roi = Math.round((moneySaved / 27) * 100); // $27/mo plan

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          💰 How Much Time (and Money) Will You Save?
        </h2>
        
        <div className="bg-white p-8 rounded-lg shadow-sm">
          {/* Interviews Slider */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              I do <strong>{interviews}</strong> customer interviews per month
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={interviews}
              onChange={(e) => setInterviews(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Hours Slider */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Creating content manually takes <strong>{hoursPerCall}</strong> hours per call
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={hoursPerCall}
              onChange={(e) => setHoursPerCall(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Hourly Rate Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-2">
              My hourly rate is $
            </label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="border rounded px-4 py-2 w-32"
              min="0"
            />
          </div>

          {/* Results */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">📊 Your Savings:</h3>
            <div className="space-y-3 text-lg">
              <div>
                ⏱️  Time Saved: <strong>{totalTimeSaved.toFixed(1)} hours/month</strong>
              </div>
              <div>
                💵  Money Saved: <strong>${moneySaved.toLocaleString()}/month</strong>
                <span className="text-gray-600 text-sm ml-2">
                  (${(moneySaved * 12).toLocaleString()}/year)
                </span>
              </div>
              <div>
                🚀  ROI: <strong>{roi.toLocaleString()}%</strong>
                <span className="text-gray-600 text-sm ml-2">
                  ($27/mo → ${moneySaved.toLocaleString()} value)
                </span>
              </div>
            </div>
            <Button className="w-full mt-6" size="lg">
              Start Saving Time →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## Component 3: Pricing Table

### Visual Layout:
```
┌──────────────────────────────────────────────────────────────────────────┐
│  Choose Your Plan                                                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │  Starter     │  │ Professional │  │  Agency      │                   │
│  │              │  │  ⭐ POPULAR  │  │              │                   │
│  │  $27/month   │  │  $47/month   │  │  $97/month   │                   │
│  │              │  │              │  │              │                   │
│  │ 20 trans/mo  │  │ 50 trans/mo  │  │ 200 trans/mo │                   │
│  │ 12 assets ea.│  │ 12 assets ea.│  │ 12 assets ea.│                   │
│  │ Email support│  │ Priority sup.│  │ Team collab  │                   │
│  │              │  │ Custom temps │  │ Custom temps │                   │
│  │              │  │              │  │ White-label  │                   │
│  │              │  │              │  │ API access   │                   │
│  │              │  │              │  │              │                   │
│  │ [Try Free]   │  │ [Try Free]   │  │ [Try Free]   │                   │
│  │              │  │              │  │              │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
│                                                                          │
│  All plans include: 14-day free trial • Cancel anytime • No commitments │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Code Structure:
```typescript
// components/PricingTable.tsx
const plans = [
  {
    name: 'Starter',
    price: 27,
    popular: false,
    features: [
      '20 transcripts/month',
      '12 assets per transcript',
      'All content types',
      'Brand voice settings',
      'Export to docs/PDF',
      'Email support',
    ],
    cta: 'Start Free Trial',
    priceId: 'price_starter_monthly',
  },
  {
    name: 'Professional',
    price: 47,
    popular: true,
    features: [
      '50 transcripts/month',
      '12 assets per transcript',
      'All content types',
      'Brand voice settings',
      'Export to docs/PDF',
      'Priority support (24h)',
      'Custom templates',
      'Google Docs integration',
      'Notion integration',
    ],
    cta: 'Start Free Trial',
    priceId: 'price_pro_monthly',
  },
  {
    name: 'Agency',
    price: 97,
    popular: false,
    features: [
      '200 transcripts/month',
      '12 assets per transcript',
      'All content types',
      'Brand voice settings',
      'Export to docs/PDF',
      'Priority support (12h)',
      'Custom templates',
      'All integrations',
      'Team collaboration (5 seats)',
      'White-label exports',
      'API access',
    ],
    cta: 'Start Free Trial',
    priceId: 'price_agency_monthly',
  },
];

export default function PricingTable() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          Choose Your Plan
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`
                relative rounded-lg p-8 border-2
                ${plan.popular 
                  ? 'border-blue-500 shadow-xl' 
                  : 'border-gray-200'
                }
              `}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    ⭐ MOST POPULAR
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-gray-600">/month</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => {
                  // Track analytics
                  analytics.track('Pricing CTA Clicked', {
                    plan: plan.name,
                    price: plan.price,
                  });
                  // Redirect to signup with plan pre-selected
                  router.push(`/signup?plan=${plan.priceId}`);
                }}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-600 mt-8">
          All plans include: 14-day free trial • Cancel anytime • No commitments
        </p>
      </div>
    </section>
  );
}
```

---

## Component 4: Feature Comparison Table

### Visual Layout:
```
┌─────────────────────────────────────────────────────────────────┐
│  Feature Comparison                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Feature                    | Starter | Pro | Agency            │
│  ───────────────────────────┼─────────┼─────┼─────────          │
│  Transcripts/month          │   20    │ 50  │  200              │
│  Assets per transcript      │   12    │ 12  │  12               │
│  Case studies               │   ✓     │  ✓  │  ✓                │
│  Social posts               │   ✓     │  ✓  │  ✓                │
│  Email sequences            │   ✓     │  ✓  │  ✓                │
│  Brand voice                │   ✓     │  ✓  │  ✓                │
│  Export to docs/PDF         │   ✓     │  ✓  │  ✓                │
│  Custom templates           │   ✗     │  ✓  │  ✓                │
│  Priority support           │   ✗     │  ✓  │  ✓                │
│  Integrations (GDocs/Notion)│   ✗     │  ✓  │  ✓                │
│  Team collaboration         │   ✗     │  ✗  │  ✓ (5 seats)      │
│  White-label                │   ✗     │  ✗  │  ✓                │
│  API access                 │   ✗     │  ✗  │  ✓                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Code Structure:
```typescript
// components/FeatureComparison.tsx
const features = [
  { name: 'Transcripts/month', starter: '20', pro: '50', agency: '200' },
  { name: 'Assets per transcript', starter: '12', pro: '12', agency: '12' },
  { name: 'Case studies', starter: true, pro: true, agency: true },
  { name: 'Social posts', starter: true, pro: true, agency: true },
  { name: 'Email sequences', starter: true, pro: true, agency: true },
  { name: 'Brand voice', starter: true, pro: true, agency: true },
  { name: 'Export to docs/PDF', starter: true, pro: true, agency: true },
  { name: 'Custom templates', starter: false, pro: true, agency: true },
  { name: 'Priority support', starter: false, pro: true, agency: true },
  { name: 'Integrations (GDocs/Notion)', starter: false, pro: true, agency: true },
  { name: 'Team collaboration', starter: false, pro: false, agency: '5 seats' },
  { name: 'White-label', starter: false, pro: false, agency: true },
  { name: 'API access', starter: false, pro: false, agency: true },
];

export default function FeatureComparison() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Feature Comparison
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left py-4 px-6">Feature</th>
                <th className="text-center py-4 px-6">Starter</th>
                <th className="text-center py-4 px-6">Professional</th>
                <th className="text-center py-4 px-6">Agency</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, idx) => (
                <tr key={feature.name} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="py-3 px-6 font-medium">{feature.name}</td>
                  <td className="py-3 px-6 text-center">
                    {typeof feature.starter === 'boolean' 
                      ? feature.starter ? '✓' : '✗'
                      : feature.starter
                    }
                  </td>
                  <td className="py-3 px-6 text-center">
                    {typeof feature.pro === 'boolean' 
                      ? feature.pro ? '✓' : '✗'
                      : feature.pro
                    }
                  </td>
                  <td className="py-3 px-6 text-center">
                    {typeof feature.agency === 'boolean' 
                      ? feature.agency ? '✓' : '✗'
                      : feature.agency
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
```

---

## Component 5: FAQ Section

### Code Structure:
```typescript
// components/PricingFAQ.tsx
'use client';

import { useState } from 'react';

const faqs = [
  {
    q: 'Do I need a credit card for the free trial?',
    a: 'Nope! Start your 14-day trial with just an email. No credit card required until you decide to upgrade.',
  },
  {
    q: 'What happens after my trial ends?',
    a: 'You can choose a paid plan or continue with our free tier (2 transcripts/month). Your data stays safe either way.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. Cancel with one click—no fees, no questions asked. We'll even send you an export of your content.',
  },
  {
    q: 'What if I need more than 200 transcripts/month?',
    a: 'Contact us for Enterprise pricing. We offer custom plans for high-volume users with dedicated support and SLAs.',
  },
  {
    q: 'Do you offer annual plans?',
    a: 'Yes! Save 20% with annual billing. Starter: $260/year, Professional: $450/year, Agency: $930/year.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Yes. Upgrade or downgrade anytime. Changes take effect immediately (prorated billing).',
  },
  {
    q: 'What file formats do you support?',
    a: 'Text (.txt, .docx, .pdf), audio (.mp3, .wav, .m4a), and video (.mp4, .mov). We auto-transcribe audio/video.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. We use bank-level encryption (AES-256), SOC 2 compliant hosting, and never train AI models on your data.',
  },
  {
    q: 'Can I get a refund?',
    a: 'Yes! 14-day money-back guarantee. If you're not happy, we'll refund you—no questions asked.',
  },
  {
    q: 'Do you offer discounts for nonprofits/students?',
    a: 'Yes! Email us at hello@call-content.com with proof and we'll set you up with 50% off any plan.',
  },
];

export default function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border rounded-lg">
              <button
                className="w-full text-left px-6 py-4 font-medium flex justify-between items-center hover:bg-gray-50"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <span>{faq.q}</span>
                <span className="text-2xl">{openIndex === idx ? '−' : '+'}</span>
              </button>
              {openIndex === idx && (
                <div className="px-6 pb-4 text-gray-700">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## Component 6: Exit-Intent Popup

### Code Structure:
```typescript
// components/ExitIntentPopup.tsx
'use client';

import { useEffect, useState } from 'react';

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger only if mouse leaves from top of page
      if (e.clientY <= 0 && !dismissed) {
        setShow(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [dismissed]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={() => { setShow(false); setDismissed(true); }}
        >
          ✕
        </button>

        <h3 className="text-2xl font-bold mb-4">
          Wait! Don't Miss This Deal
        </h3>
        <p className="text-gray-700 mb-6">
          Get <strong>30% off</strong> your first 3 months with code{' '}
          <span className="bg-yellow-100 px-2 py-1 rounded font-mono">
            SAVE30
          </span>
        </p>
        <p className="text-sm text-gray-600 mb-6">
          Offer expires in <strong>10 minutes</strong>.
        </p>

        <Button
          className="w-full mb-2"
          onClick={() => {
            navigator.clipboard.writeText('SAVE30');
            router.push('/signup');
          }}
        >
          Copy Code & Start Trial
        </Button>
        <button
          className="w-full text-gray-600 text-sm hover:text-gray-800"
          onClick={() => { setShow(false); setDismissed(true); }}
        >
          No thanks, I'll pay full price
        </button>
      </div>
    </div>
  );
}
```

---

## Analytics Tracking

### Events to Track:
```typescript
// Track pricing page views
analytics.page('Pricing Page Viewed');

// Track scroll depth
analytics.track('Pricing Page Scrolled', {
  depth: '75%', // 25%, 50%, 75%, 100%
});

// Track plan selection
analytics.track('Pricing Plan Selected', {
  plan: 'Professional',
  price: 47,
  billing: 'monthly',
});

// Track ROI calculator interaction
analytics.track('ROI Calculator Used', {
  interviews: 5,
  hoursPerCall: 3,
  hourlyRate: 100,
  calculatedSavings: 1400,
});

// Track FAQ expansion
analytics.track('FAQ Question Opened', {
  question: 'Do I need a credit card?',
});

// Track exit intent popup
analytics.track('Exit Intent Popup Shown');
analytics.track('Exit Intent Popup Converted');
analytics.track('Exit Intent Popup Dismissed');
```

---

## A/B Test Ideas

### Test 1: Pricing Display
- **Variant A:** Monthly pricing only
- **Variant B:** Monthly + Annual (show savings)
- **Hypothesis:** Annual pricing increases LTV

### Test 2: CTA Copy
- **Variant A:** "Start Free Trial"
- **Variant B:** "Try Free for 14 Days"
- **Variant C:** "Get Started Free"
- **Hypothesis:** Explicit "free" messaging increases conversions

### Test 3: Social Proof
- **Variant A:** No testimonials
- **Variant B:** 3 testimonials above pricing table
- **Hypothesis:** Social proof increases trust + conversions

### Test 4: Guarantee Placement
- **Variant A:** 14-day guarantee below pricing table
- **Variant B:** 14-day guarantee badge on each plan card
- **Hypothesis:** Visible guarantee reduces friction

---

## Mobile Responsive Breakpoints

### Tailwind CSS Breakpoints:
```css
/* Mobile: <768px */
- Stack pricing cards vertically
- Full-width CTAs
- Hide feature comparison table (show simplified list)
- Compress ROI calculator (vertical layout)

/* Tablet: 768px-1024px */
- 2-column pricing grid (Agency tier on second row)
- Horizontal scroll for feature comparison
- Side-by-side ROI calculator inputs

/* Desktop: >1024px */
- 3-column pricing grid
- Full feature comparison table
- Two-column ROI calculator layout
```

---

## Page Load Performance

### Optimization Checklist:
- [ ] Lazy load images (hero illustration, testimonial avatars)
- [ ] Defer non-critical JS (exit-intent popup)
- [ ] Inline critical CSS (above-the-fold styles)
- [ ] Preload fonts (reduce layout shift)
- [ ] Compress pricing table data (use JSON, not hardcoded)

### Target Metrics:
- **LCP:** <2.5s (Largest Contentful Paint)
- **FID:** <100ms (First Input Delay)
- **CLS:** <0.1 (Cumulative Layout Shift)

---

*Last Updated: January 31, 2026*  
*Review After: First 1,000 pricing page visitors*
