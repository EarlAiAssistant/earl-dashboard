'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { OnboardingStatus } from './types'

export function useOnboarding() {
  const [onboarding, setOnboarding] = useState<OnboardingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Fetch onboarding status
  const fetchOnboarding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        // If no record exists, create one
        if (error.code === 'PGRST116') {
          const { data: newRecord } = await supabase
            .from('user_onboarding')
            .insert({ user_id: user.id })
            .select()
            .single()
          
          setOnboarding(newRecord)
        }
      } else {
        setOnboarding(data)
      }
    } catch (err) {
      console.error('Error fetching onboarding:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOnboarding()
  }, [])

  // Mark step as complete
  const completeStep = async (step: keyof OnboardingStatus) => {
    if (!onboarding) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('user_onboarding')
      .update({ [step]: true })
      .eq('user_id', user.id)
      .select()
      .single()

    if (!error && data) {
      setOnboarding(data)
    }
  }

  // Dismiss onboarding
  const dismissOnboarding = async () => {
    if (!onboarding) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('user_onboarding')
      .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single()

    if (!error && data) {
      setOnboarding(data)
    }
  }

  // Should show checklist
  const shouldShowChecklist = onboarding && !onboarding.is_completed && !onboarding.is_dismissed

  return {
    onboarding,
    loading,
    completeStep,
    dismissOnboarding,
    refetch: fetchOnboarding,
    shouldShowChecklist,
  }
}
