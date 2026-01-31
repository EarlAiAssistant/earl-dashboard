import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { step } = body

    if (!step) {
      return NextResponse.json({ error: 'Step is required' }, { status: 400 })
    }

    // Validate step
    const validSteps = ['has_uploaded_transcript', 'has_generated_content', 'has_exported_content']
    if (!validSteps.includes(step)) {
      return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
    }

    // First, ensure user has an onboarding record
    const { data: existing } = await supabase
      .from('user_onboarding')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      // Create record if it doesn't exist
      await supabase
        .from('user_onboarding')
        .insert({ user_id: user.id })
    }

    // Update the step
    const { data, error } = await supabase
      .from('user_onboarding')
      .update({ [step]: true })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Note: PostHog tracking is handled client-side in the analytics.ts file
    // Server-side tracking can be added here if needed

    return NextResponse.json(data)
  } catch (err) {
    console.error('Onboarding complete error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
