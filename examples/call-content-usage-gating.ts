// lib/subscription-gate.ts
// Usage gating logic for call-content transcript processing

import { createClient } from '@/lib/supabase/server'

export type SubscriptionTier = 'starter' | 'professional' | 'agency' | 'enterprise' | null

export interface UsageCheck {
  allowed: boolean
  tier: SubscriptionTier
  used: number
  limit: number
  remaining: number
  message?: string
}

const TIER_LIMITS: Record<Exclude<SubscriptionTier, null>, number> = {
  starter: 20,
  professional: 50,
  agency: 150,
  enterprise: 999999, // Effectively unlimited
}

/**
 * Check if user can process a transcript based on their subscription
 */
export async function checkUsageLimit(userId: string): Promise<UsageCheck> {
  const supabase = await createClient()

  // Get user's subscription info
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status, transcripts_used_this_month')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    return {
      allowed: false,
      tier: null,
      used: 0,
      limit: 0,
      remaining: 0,
      message: 'Unable to verify subscription status',
    }
  }

  // Check if subscription is active
  if (!profile.subscription_status || profile.subscription_status !== 'active') {
    return {
      allowed: false,
      tier: profile.subscription_tier,
      used: profile.transcripts_used_this_month || 0,
      limit: 0,
      remaining: 0,
      message: 'No active subscription. Please subscribe to process transcripts.',
    }
  }

  const tier = profile.subscription_tier as SubscriptionTier
  const limit = tier ? TIER_LIMITS[tier] : 0
  const used = profile.transcripts_used_this_month || 0
  const remaining = Math.max(0, limit - used)

  // Check if under limit
  if (used >= limit) {
    return {
      allowed: false,
      tier,
      used,
      limit,
      remaining: 0,
      message: `Monthly limit reached (${used}/${limit} transcripts). Upgrade your plan or wait for next billing cycle.`,
    }
  }

  return {
    allowed: true,
    tier,
    used,
    limit,
    remaining,
  }
}

/**
 * Increment usage counter after successful processing
 */
export async function incrementUsage(userId: string): Promise<void> {
  const supabase = await createClient()

  // Use the database function we created in the migration
  const { error } = await supabase.rpc('increment_transcript_usage', {
    p_user_id: userId,
  })

  if (error) {
    console.error('Failed to increment usage:', error)
    throw new Error('Failed to update usage counter')
  }
}

/**
 * Get usage stats for display
 */
export async function getUsageStats(userId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, transcripts_used_this_month, subscription_period_end')
    .eq('id', userId)
    .single()

  if (!profile) return null

  const tier = profile.subscription_tier as SubscriptionTier
  const limit = tier ? TIER_LIMITS[tier] : 0
  const used = profile.transcripts_used_this_month || 0
  const remaining = Math.max(0, limit - used)
  const percentUsed = limit > 0 ? (used / limit) * 100 : 0

  return {
    tier,
    used,
    limit,
    remaining,
    percentUsed,
    renewalDate: profile.subscription_period_end,
  }
}

// ----------------------------
// Updated Process Transcript Route
// ----------------------------

// app/api/process-transcript/route.ts (UPDATED)

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkUsageLimit, incrementUsage } from '@/lib/subscription-gate'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ✅ CHECK USAGE LIMIT BEFORE PROCESSING
    const usageCheck = await checkUsageLimit(user.id)

    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: usageCheck.message,
          usage: {
            tier: usageCheck.tier,
            used: usageCheck.used,
            limit: usageCheck.limit,
            remaining: usageCheck.remaining,
          },
          upgradeUrl: '/pricing',
        },
        { status: 403 } // Forbidden
      )
    }

    // Get request body
    const { transcript, fileName } = await request.json()

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript content required' },
        { status: 400 }
      )
    }

    // TODO: Process transcript with AI
    // const contentPack = await generateContentPack(transcript)

    // ✅ INCREMENT USAGE COUNTER AFTER SUCCESSFUL PROCESSING
    await incrementUsage(user.id)

    // Return success with remaining quota
    return NextResponse.json({
      success: true,
      // contentPack,
      usage: {
        tier: usageCheck.tier,
        used: usageCheck.used + 1, // Show updated count
        limit: usageCheck.limit,
        remaining: usageCheck.remaining - 1,
      },
    })
  } catch (error: any) {
    console.error('Process transcript error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process transcript' },
      { status: 500 }
    )
  }
}
