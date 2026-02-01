import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import LandingPage from '@/components/marketing/LandingPage'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Call-Content | Turn Customer Calls into Marketing Gold',
  description: 'Transform customer interviews and sales calls into blog posts, case studies, testimonials, and social content in minutes. AI-powered content generation.',
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Authenticated users go to dashboard
  if (user) {
    redirect('/dashboard')
  }

  // Non-authenticated users see marketing page
  return <LandingPage />
}
