import Link from 'next/link'
import { 
  Mic, 
  FileText, 
  Zap, 
  Clock,
  CheckCircle2,
  ArrowRight,
  Play,
  Star
} from 'lucide-react'

const features = [
  {
    icon: Mic,
    title: 'Upload Any Call',
    description: 'Drop in a recording or paste a transcript. We support Zoom, Teams, Google Meet, and more.',
  },
  {
    icon: Zap,
    title: 'AI-Powered Generation',
    description: 'Our AI extracts key quotes, insights, and stories to create authentic content that sounds like your customers.',
  },
  {
    icon: FileText,
    title: '8 Content Types',
    description: 'Blog posts, case studies, testimonials, social posts, email copy, executive summaries, and more.',
  },
  {
    icon: Clock,
    title: '10 Minutes, Not 10 Hours',
    description: 'What used to take a full day now takes minutes. Generate a week\'s worth of content from one call.',
  },
]

const contentTypes = [
  'Case Studies',
  'Blog Posts', 
  'LinkedIn Posts',
  'Twitter Threads',
  'Customer Testimonials',
  'Email Sequences',
  'Executive Summaries',
  'Key Quote Libraries',
]

const testimonials = [
  {
    quote: "We went from publishing 2 case studies a quarter to 2 a week. Game changer.",
    author: "Sarah Chen",
    role: "VP Marketing, TechScale",
    avatar: "SC"
  },
  {
    quote: "Finally, content that actually sounds like our customers, not like AI wrote it.",
    author: "Marcus Johnson",
    role: "Content Lead, GrowthHub",
    avatar: "MJ"
  },
  {
    quote: "ROI was obvious within the first week. We cancelled 3 other tools.",
    author: "Emily Rodriguez",
    role: "Head of Content, StartupCo",
    avatar: "ER"
  }
]

const pricingPlans = [
  {
    name: 'Starter',
    price: 29,
    description: 'Perfect for getting started',
    features: [
      '10 transcripts/month',
      'All 8 content types',
      'Export to Markdown/HTML',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: 79,
    description: 'For growing content teams',
    features: [
      '30 transcripts/month',
      'All 8 content types',
      'Priority AI processing',
      'Team collaboration',
      'API access',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Business',
    price: 199,
    description: 'For content-heavy organizations',
    features: [
      '100 transcripts/month',
      'All 8 content types',
      'Custom templates',
      'Dedicated success manager',
      'SSO & advanced security',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Call-Content</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                Log in
              </Link>
              <Link 
                href="/signup" 
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">AI-Powered Content Generation</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Turn Customer Calls into{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Marketing Gold
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Transform sales calls and customer interviews into blog posts, case studies, 
              testimonials, and social content in minutes—not hours.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link 
                href="/signup"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/demo"
                className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                See Demo
              </Link>
            </div>
            
            <p className="text-gray-500 text-sm">
              14-day free trial • No credit card required • Cancel anytime
            </p>
          </div>

          {/* Hero Image/Demo */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-4 shadow-2xl">
              <div className="bg-black rounded-xl p-6 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                      <Mic className="w-8 h-8 text-blue-400" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-600" />
                    <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                      <FileText className="w-8 h-8 text-purple-400" />
                    </div>
                  </div>
                  <p className="text-gray-400">Upload a call → Get 8 types of content</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Types Bar */}
      <section className="py-12 border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            {contentTypes.map((type) => (
              <div key={type} className="flex items-center gap-2 text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>{type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From raw customer conversation to polished marketing content in three simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-12">
            <div>
              <div className="text-4xl font-bold text-blue-400">10,000+</div>
              <div className="text-gray-400">Calls Processed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400">50,000+</div>
              <div className="text-gray-400">Content Pieces Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400">95%</div>
              <div className="text-gray-400">Time Saved</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-4xl font-bold text-yellow-400">
                4.9 <Star className="w-8 h-8 fill-yellow-400" />
              </div>
              <div className="text-gray-400">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Content Teams</h2>
            <p className="text-xl text-gray-400">See what our customers have to say</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.author}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-400">Start free, upgrade when you're ready</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div 
                key={plan.name}
                className={`relative bg-gray-900 border rounded-2xl p-8 ${
                  plan.popular 
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                    : 'border-gray-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold">${plan.price}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <p className="text-gray-400 mt-2">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.cta === 'Contact Sales' ? '/contact' : '/signup'}
                  className={`block w-full text-center py-3 rounded-xl font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-400 mt-8">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Transform Your Customer Calls?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join hundreds of content teams creating more with less effort.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/demo"
              className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Try Demo First
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Call-Content</span>
            </div>
            <div className="flex items-center gap-8 text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
              <a href="mailto:support@call-content.com" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="text-gray-400 text-sm">
              © 2026 Call-Content. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
