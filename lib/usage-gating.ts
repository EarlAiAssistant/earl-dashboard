import { createClient } from './supabase/server'

export interface UsageStatus {
  canProcess: boolean
  transcriptsUsed: number
  transcriptLimit: number
  remainingTranscripts: number
  tier: string
  status: string
  reason?: string
  inGracePeriod?: boolean
  graceRemaining?: number
}

/**
 * Check if user can process a transcript based on their subscription limits
 */
export async function checkUsageLimit(userId: string): Promise<UsageStatus> {
  const supabase = await createClient()

  const { data: user, error } = await supabase
    .from('users')
    .select('subscription_tier, subscription_status, monthly_transcript_limit, transcripts_used_this_month')
    .eq('id', userId)
    .single()

  if (error || !user) {
    return {
      canProcess: false,
      transcriptsUsed: 0,
      transcriptLimit: 0,
      remainingTranscripts: 0,
      tier: 'unknown',
      status: 'unknown',
      reason: 'User not found',
    }
  }

  const { subscription_tier, subscription_status, monthly_transcript_limit, transcripts_used_this_month } = user

  // Check if subscription is active or in trial
  if (subscription_status !== 'active' && subscription_status !== 'trial') {
    return {
      canProcess: false,
      transcriptsUsed: transcripts_used_this_month,
      transcriptLimit: monthly_transcript_limit,
      remainingTranscripts: 0,
      tier: subscription_tier,
      status: subscription_status,
      reason: `Subscription is ${subscription_status}. Please update your billing information.`,
    }
  }

  // Calculate 10% grace period (minimum 1 extra transcript)
  const graceAllowance = Math.max(1, Math.ceil(monthly_transcript_limit * 0.1))
  const hardLimit = monthly_transcript_limit + graceAllowance
  const inGracePeriod = transcripts_used_this_month >= monthly_transcript_limit && transcripts_used_this_month < hardLimit
  const graceRemaining = Math.max(0, hardLimit - transcripts_used_this_month)

  // Hard limit exceeded (even with grace period)
  if (transcripts_used_this_month >= hardLimit) {
    return {
      canProcess: false,
      transcriptsUsed: transcripts_used_this_month,
      transcriptLimit: monthly_transcript_limit,
      remainingTranscripts: 0,
      tier: subscription_tier,
      status: subscription_status,
      inGracePeriod: false,
      graceRemaining: 0,
      reason: `Monthly limit reached (${monthly_transcript_limit} transcripts + ${graceAllowance} grace). Upgrade your plan, purchase a booster pack, or wait until next billing cycle.`,
    }
  }

  // In grace period (show warning but allow processing)
  if (inGracePeriod) {
    return {
      canProcess: true,
      transcriptsUsed: transcripts_used_this_month,
      transcriptLimit: monthly_transcript_limit,
      remainingTranscripts: graceRemaining,
      tier: subscription_tier,
      status: subscription_status,
      inGracePeriod: true,
      graceRemaining,
      reason: `You've used ${transcripts_used_this_month}/${monthly_transcript_limit} transcripts. You have ${graceRemaining} grace transcript(s) remaining this month.`,
    }
  }

  return {
    canProcess: true,
    transcriptsUsed: transcripts_used_this_month,
    transcriptLimit: monthly_transcript_limit,
    remainingTranscripts: monthly_transcript_limit - transcripts_used_this_month,
    tier: subscription_tier,
    status: subscription_status,
  }
}

/**
 * Increment usage counter after successful transcript processing
 */
export async function incrementUsage(userId: string, transcriptId: string): Promise<void> {
  const supabase = await createClient()

  // Increment counter in users table
  await supabase.rpc('increment_usage', {
    p_user_id: userId,
    p_transcript_id: transcriptId,
  })
}

/**
 * Get current usage statistics for a user
 */
export async function getUsageStats(userId: string) {
  const supabase = await createClient()

  const { data: user } = await supabase
    .from('users')
    .select('subscription_tier, subscription_status, monthly_transcript_limit, transcripts_used_this_month, current_period_end, trial_ends_at')
    .eq('id', userId)
    .single()

  if (!user) {
    return null
  }

  const usagePercent = (user.transcripts_used_this_month / user.monthly_transcript_limit) * 100

  return {
    tier: user.subscription_tier,
    status: user.subscription_status,
    transcriptsUsed: user.transcripts_used_this_month,
    transcriptLimit: user.monthly_transcript_limit,
    remainingTranscripts: user.monthly_transcript_limit - user.transcripts_used_this_month,
    usagePercent: Math.round(usagePercent),
    currentPeriodEnd: user.current_period_end,
    trialEndsAt: user.trial_ends_at,
    isNearLimit: usagePercent >= 80,
    isAtLimit: usagePercent >= 100,
  }
}
