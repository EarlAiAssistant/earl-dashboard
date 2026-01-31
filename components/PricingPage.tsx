'use client'

import { useState } from 'react'
import { Check, X, ArrowRight, Calculator, Zap, Shield } from 'lucide-react'

export default function PricingPage() {
  const [interviews, setInterviews] = useState(5)
  const [hoursPerCall, setHoursPerCall] = useState(3)
  const [hourlyRate, setHourlyRate] = useState(100)
  const [showExitPopup, setShowExitPopup] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  // ROI calculations
  const monthlyHoursSaved = interviews * (hoursPerCall - 0.5) // 0.5 hours with Call-Content
  const monthlySavings = monthlyHoursSaved * hourlyRate
  const yearlySavings = monthlySavings * 12

  const plans = [
    {
      name: 'Starter',
      price: 27,
      callLimit: 10,
      features: [
        '10 customer calls per month',
        'All content templates',
        'Blog posts & case studies',
        'Social media posts',
        'Email sequences',
        'Basic analytics',
        'Email support',
      ],
      notIncluded: ['Custom templates', 'API access', 'Priority support'],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Professional',
      price: 67,
      callLimit: 30,
      features: [
        '30 customer calls per month',
        'Everything in Starter',
        'Custom templates',
        'Advanced analytics',
        'Zapier integration',
        'Video testimonial clips',
        'Priority email support',
      ],
      notIncluded: ['API access', 'White-label exports'],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Agency',
      price: 197,
      callLimit: 100,
      features: [
        '100 customer calls per month',
        'Everything in Professional',
        'API access',
        'White-label exports',
        'Team collaboration (5 seats)',
        'Dedicated account manager',
        'Phone + chat support',
        'Custom integrations',
      ],
      notIncluded: [],
      cta: 'Start Free Trial',
      popular: false,
    },
  ]

  const faqs = [
    {
      q: 'Can I cancel anytime?',
      a: 'Yes! Cancel with one click in your dashboard. No questions asked. If you cancel within 14 days, you get a full refund.',
    },
    {
      q: 'What happens after my 14-day trial?',
      a: "Nothing, unless you add a payment method. Your trial doesn't auto-convert to paid. When you're ready to upgrade, just add a card.",
    },
    {
      q: 'What file formats do you support?',
      a: 'We support .mp3, .mp4, .wav, .m4a (audio/video), and .txt, .docx, .pdf (text transcripts). Max file size: 500MB.',
    },
    {
      q: 'How accurate is the AI-generated content?',
      a: "We use GPT-4 fine-tuned on 10,000+ customer interviews. Accuracy is ~90-95% out of the box. You'll spend 10-15 minutes editing, not 3 hours writing from scratch.",
    },
    {
      q: 'Can I use this for non-English calls?',
      a: 'Currently we support English, Spanish, French, German, and Portuguese. More languages coming soon. Contact us if you need a specific language.',
    },
    {
      q: 'Do you offer refunds?',
      a: 'Yes. 14-day money-back guarantee, no questions asked. If you process fewer than 3 calls and decide it's not for you, we'll refund you in full.',
    },
    {
      q: 'What if I go over my monthly limit?',
      a: 'You'll get a notification at 80% and 100% usage. You can either upgrade your plan mid-month (prorated) or purchase a booster pack ($10 for 5 extra calls).',
    },
    {
      q: 'Is my data secure?',
      a: 'Yes. All uploads are encrypted in transit (TLS 1.3) and at rest (AES-256). We're SOC 2 Type II compliant. We never train our AI on your data without explicit permission.',
    },
    {
      q: 'Can I export content to other tools?',
      a: 'Yes! Export to Google Docs, Notion, WordPress, HubSpot, Mailchimp, and more via Zapier. Agency plan includes API access for custom integrations.',
    },
    {
      q: 'Do you offer discounts for annual plans?',
      a: 'Yes! Pay annually and save 20% (2 months free). Starter: $259/year, Professional: $643/year, Agency: $1,891/year.',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Turn Every Customer Call Into a Complete Marketing Campaign
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Upload once. Get 12 ready-to-use assets. In 10 minutes.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold mb-4 transition-colors inline-flex items-center gap-2">
            Start Free Trial <ArrowRight size={20} />
          </button>
          <p className="text-sm text-gray-500">
            14 days free • No credit card required
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-700">
            <span className="flex items-center gap-1">
              <Check size={16} className="text-green-600" /> Case studies
            </span>
            <span className="flex items-center gap-1">
              <Check size={16} className="text-green-600" /> Social posts
            </span>
            <span className="flex items-center gap-1">
              <Check size={16} className="text-green-600" /> Email sequences
            </span>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-2">
              <Calculator className="text-blue-600" />
              How Much Time (and Money) Will You Save?
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I do <span className="font-bold text-blue-600">{interviews}</span> customer interviews per month
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={interviews}
                  onChange={(e) => setInterviews(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Creating content manually takes <span className="font-bold text-blue-600">{hoursPerCall}</span> hours per call
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={hoursPerCall}
                  onChange={(e) => setHoursPerCall(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  My hourly rate is
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-blue-200">
              <p className="text-center text-lg mb-4">
                💰 <strong>You'll save:</strong>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-blue-600">{monthlyHoursSaved.toFixed(1)}h</p>
                  <p className="text-sm text-gray-600">per month</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-600">${monthlySavings.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">per month</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-600">${yearlySavings.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">per year</p>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-4">
                That's <strong>{(monthlyHoursSaved * 12).toFixed(0)} hours</strong> you can spend on strategy instead of copy-pasting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-gray-600 mb-12">
            All plans include a 14-day free trial. No credit card required.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative rounded-xl border-2 p-8 ${
                  plan.popular
                    ? 'border-blue-600 shadow-xl scale-105'
                    : 'border-gray-200 shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold">${plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  {plan.callLimit} calls/month • ${(plan.price / plan.callLimit).toFixed(2)} per call
                </p>

                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold mb-6 transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {plan.cta}
                </button>

                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 opacity-50">
                      <X size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-500 line-through">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center mt-8 text-gray-600">
            Need more than 100 calls/month?{' '}
            <a href="/contact" className="text-blue-600 hover:underline font-semibold">
              Contact us
            </a>{' '}
            for Enterprise pricing.
          </p>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Zap className="text-blue-600" size={32} />
              <h3 className="font-semibold">Lightning Fast</h3>
              <p className="text-sm text-gray-600">Content ready in 10 minutes, not 3 hours</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Shield className="text-green-600" size={32} />
              <h3 className="font-semibold">14-Day Guarantee</h3>
              <p className="text-sm text-gray-600">Full refund if you're not satisfied</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Check className="text-purple-600" size={32} />
              <h3 className="font-semibold">Cancel Anytime</h3>
              <p className="text-sm text-gray-600">No contracts, no commitments</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <span className="text-2xl text-gray-400">
                    {expandedFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {expandedFaq === idx && (
                  <div className="px-4 pb-4 text-gray-700">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4">
            Ready to 10x Your Content Output?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join 500+ companies turning customer calls into marketing gold.
          </p>
          <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center gap-2">
            Start Free Trial <ArrowRight size={20} />
          </button>
          <p className="mt-4 text-sm text-blue-200">
            No credit card required • 14-day money-back guarantee
          </p>
        </div>
      </section>

      {/* Exit Intent Popup */}
      {showExitPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md relative">
            <button
              onClick={() => setShowExitPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold mb-4">Wait! Before You Go...</h3>
            <p className="text-gray-600 mb-6">
              Get <strong>30% off</strong> your first month. This offer expires in 10 minutes.
            </p>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">
                Claim 30% Off Now
              </button>
              <button
                onClick={() => setShowExitPopup(false)}
                className="w-full text-gray-600 hover:text-gray-900"
              >
                No thanks, I'll pay full price
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
