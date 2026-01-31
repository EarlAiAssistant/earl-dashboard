/**
 * Demo Account System for Call-Content
 * 
 * Allows prospects to explore the product with pre-populated sample data
 * without needing to create an account or upload their own content.
 */

// Demo account credentials (for display purposes)
export const DEMO_CREDENTIALS = {
  email: 'demo@call-content.com',
  password: 'demo2026',
}

// Demo user profile
export const DEMO_USER = {
  id: 'demo-user-id',
  email: DEMO_CREDENTIALS.email,
  name: 'Demo User',
  subscription_tier: 'professional',
  subscription_status: 'active',
  monthly_transcript_limit: 30,
  transcripts_used_this_month: 12,
  booster_credits: 0,
  trial_ends_at: null,
  created_at: '2026-01-15T00:00:00Z',
}

// Sample transcripts for demo
export const DEMO_TRANSCRIPTS = [
  {
    id: 'demo-transcript-1',
    title: 'SaaS Customer Success Interview - Acme Corp',
    industry: 'SaaS / Technology',
    duration: 2400, // 40 minutes
    word_count: 4500,
    created_at: '2026-01-28T10:00:00Z',
    excerpt: 'Before Call-Content, we were spending 4-5 hours per customer interview just to create a single blog post. Now we get 8 different pieces of content in about 10 minutes...',
    speakers: ['Interviewer (Sarah)', 'Customer (Mike, VP of Marketing)'],
  },
  {
    id: 'demo-transcript-2',
    title: 'Healthcare Platform Demo Call',
    industry: 'Healthcare',
    duration: 1800, // 30 minutes
    word_count: 3200,
    created_at: '2026-01-25T14:30:00Z',
    excerpt: 'The ROI we've seen since implementing this solution has been remarkable. We reduced patient wait times by 40% and our staff satisfaction scores went up significantly...',
    speakers: ['Sales Rep (John)', 'Prospect (Dr. Chen, Hospital Administrator)'],
  },
  {
    id: 'demo-transcript-3',
    title: 'E-commerce Case Study Interview',
    industry: 'E-commerce / Retail',
    duration: 2100, // 35 minutes
    word_count: 3800,
    created_at: '2026-01-22T09:15:00Z',
    excerpt: 'We tried three other solutions before finding this one. The difference was night and day. Our conversion rate improved by 25% in the first month alone...',
    speakers: ['Interviewer (Lisa)', 'Customer (Tom, E-commerce Director)'],
  },
  {
    id: 'demo-transcript-4',
    title: 'Financial Services Testimonial',
    industry: 'Finance / Banking',
    duration: 1500, // 25 minutes
    word_count: 2800,
    created_at: '2026-01-20T11:00:00Z',
    excerpt: 'Compliance was our biggest concern. We needed a solution that could handle sensitive financial data securely. This exceeded our expectations...',
    speakers: ['Product Manager (Alex)', 'Customer (Jennifer, CTO)'],
  },
]

// Sample generated content for demo
export const DEMO_CONTENT = [
  {
    id: 'demo-content-1',
    transcript_id: 'demo-transcript-1',
    template: 'Blog Post',
    title: 'How Acme Corp Cut Content Creation Time by 80% With AI',
    word_count: 1200,
    created_at: '2026-01-28T10:15:00Z',
    preview: 'When Mike, VP of Marketing at Acme Corp, first heard about AI-powered content creation, he was skeptical. "We tried ChatGPT," he admits, "but the output never felt authentic to our customers\' voices..."',
  },
  {
    id: 'demo-content-2',
    transcript_id: 'demo-transcript-1',
    template: 'Case Study',
    title: 'Acme Corp Case Study: 10x Content Output Without Hiring',
    word_count: 2500,
    created_at: '2026-01-28T10:20:00Z',
    preview: 'Challenge: Acme Corp\'s marketing team was drowning in content requests. With only two content writers supporting a sales team of 20, they couldn\'t keep up with demand for customer stories...',
  },
  {
    id: 'demo-content-3',
    transcript_id: 'demo-transcript-1',
    template: 'LinkedIn Post',
    title: 'LinkedIn: Acme Corp Success Story',
    word_count: 280,
    created_at: '2026-01-28T10:25:00Z',
    preview: '🚀 Just had an incredible conversation with Mike from Acme Corp about their marketing transformation...',
  },
  {
    id: 'demo-content-4',
    transcript_id: 'demo-transcript-2',
    template: 'Customer Testimonial',
    title: 'Dr. Chen Testimonial - HealthTech Platform',
    word_count: 350,
    created_at: '2026-01-25T14:45:00Z',
    preview: '"The ROI we\'ve seen since implementing this solution has been remarkable. We reduced patient wait times by 40%..." - Dr. Chen, Hospital Administrator',
  },
  {
    id: 'demo-content-5',
    transcript_id: 'demo-transcript-3',
    template: 'Twitter Thread',
    title: 'Twitter: E-commerce Success Story',
    word_count: 420,
    created_at: '2026-01-22T09:30:00Z',
    preview: '🧵 Thread: How one e-commerce brand increased conversions by 25% in 30 days (their story is wild)\n\n1/ First, some context...',
  },
]

// Demo onboarding progress
export const DEMO_ONBOARDING = {
  has_uploaded_transcript: true,
  has_generated_content: true,
  has_exported_content: false,
  completed_at: null,
}

// Demo usage stats
export const DEMO_USAGE = {
  transcriptsUsed: 12,
  transcriptLimit: 30,
  boosterCredits: 0,
  effectiveLimit: 30,
  usagePercent: 40,
  remainingTranscripts: 18,
  showBoosterUpsell: false,
}

/**
 * Check if current session is a demo session
 */
export function isDemoSession(userId?: string): boolean {
  return userId === DEMO_USER.id
}

/**
 * Get demo data for API responses
 */
export function getDemoData(resource: string) {
  switch (resource) {
    case 'user':
      return DEMO_USER
    case 'transcripts':
      return DEMO_TRANSCRIPTS
    case 'content':
      return DEMO_CONTENT
    case 'onboarding':
      return DEMO_ONBOARDING
    case 'usage':
      return DEMO_USAGE
    default:
      return null
  }
}

/**
 * Demo banner message
 */
export const DEMO_BANNER = {
  message: "You're exploring Call-Content in demo mode. Sign up to create your own content!",
  ctaText: 'Start Free Trial',
  ctaUrl: '/signup',
}
