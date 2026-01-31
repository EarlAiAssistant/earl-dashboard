import { createClient } from './supabase/server'

export interface UsageStatus {
  canProcess: boolean
  transcriptsUsed: number
  transcriptLimit: number
  effectiveLimit: number // base + booster credits
  boosterCredits: number
  remainingTranscripts: number
  tier: string
  status: string
  reason?: string
  inGracePeriod?: boolean
  graceRemaining?: number
  showBoosterUpsell?: boolean
}

/**
 * Check if user can process a transcript based on their subscription limits
 * Includes booster credits in the effective limit
 */
export async function checkUsageLimit(userId: string): Promise<UsageStatus> {
  const supabase = await createClient()

  const { data: user, error } = await supabase
    .from('users')
    .select('subscription_tier, subscription_status, monthly_transcript_limit, transcripts_used_this_month, booster_credits')
    .eq('id', userId)
    .single()

  if (error || !user) {
    return {
      canProcess: false,
      transcriptsUsed: 0,
      transcriptLimit: 0,
      effectiveLimit: 0,
      boosterCredits: 0,
      remainingTranscripts: 0,
      tier: 'unknown',
      status: 'unknown',
      reason: 'User not found',
    }
  }

  const { 
    subscription_tier, 
    subscription_status, 
    monthly_transcript_limit, 
    transcripts_used_this_month,
    booster_credits = 0 
  } = user

  // Effective limit = base plan limit + any booster credits purchased
  const effectiveLimit = monthly_transcript_limit + booster_credits

  // Check if subscription is active or in trial
  if (subscription_status !== 'active' && subscription_status !== 'trial') {
    return {
      canProcess: false,
      transcriptsUsed: transcripts_used_this_month,
      transcriptLimit: monthly_transcript_limit,
      effectiveLimit,
      boosterCredits: booster_credits,
      remainingTranscripts: 0,
      tier: subscription_tier,
      status: subscription_status,
      reason: `Subscription is ${subscription_status}. Please update your billing information.`,
      showBoosterUpsell: false,
    }
  }

  // Calculate 10% grace period on effective limit (minimum 1 extra transcript)
  const graceAllowance = Math.max(1, Math.ceil(effectiveLimit * 0.1))
  const hardLimit = effectiveLimit + graceAllowance
  const inGracePeriod = transcripts_used_this_month >= effectiveLimit && transcripts_used_this_month < hardLimit
  const graceRemaining = Math.max(0, hardLimit - transcripts_used_this_month)
  const remaining = Math.max(0, effectiveLimit - transcripts_used_this_month)

  // Hard limit exceeded (even with grace period)
  if (transcripts_used_this_month >= hardLimit) {
    return {
      canProcess: false,
      transcriptsUsed: transcripts_used_this_month,
      transcriptLimit: monthly_transcript_limit,
      effectiveLimit,
      boosterCredits: booster_credits,
      remainingTranscripts: 0,
      tier: subscription_tier,
      status: subscription_status,
      inGracePeriod: false,
      graceRemaining: 0,
      showBoosterUpsell: true,
      reason: `Monthly limit reached (${effectiveLimit} transcripts + ${graceAllowance} grace). Purchase a booster pack (+5 for $47) or upgrade your plan.`,
    }
  }

  // In grace period (show warning but allow processing)
  if (inGracePeriod) {
    return {
      canProcess: true,
      transcriptsUsed: transcripts_used_this_month,
      transcriptLimit: monthly_transcript_limit,
      effectiveLimit,
      boosterCredits: booster_credits,
      remainingTranscripts: graceRemaining,
      tier: subscription_tier,
      status: subscription_status,
      inGracePeriod: true,
      graceRemaining,
      showBoosterUpsell: true,
      reason: `You've used all ${effectiveLimit} transcripts. ${graceRemaining} grace transcript(s) remaining. Consider buying a booster pack.`,
    }
  }

  // Normal usage - show booster upsell if at 80%+ usage
  const usagePercent = (transcripts_used_this_month / effectiveLimit) * 100
  const showBoosterUpsell = usagePercent >= 80

  return {
    canProcess: true,
    transcriptsUsed: transcripts_used_this_month,
    transcriptLimit: monthly_transcript_limit,
    effectiveLimit,
    boosterCredits: booster_credits,
    remainingTranscripts: remaining,
    tier: subscription_tier,
    status: subscription_status,
    showBoosterUpsell,
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
 * Get current usage statistics for a user (includes booster credits)
 */
export async function getUsageStats(userId: string) {
  const supabase = await createClient()

  const { data: user } = await supabase
    .from('users')
    .select('subscription_tier, subscription_status, monthly_transcript_limit, transcripts_used_this_month, booster_credits, current_period_end, trial_ends_at')
    .eq('id', userId)
    .single()

  if (!user) {
    return null
  }

  const boosterCredits = user.booster_credits || 0
  const effectiveLimit = user.monthly_transcript_limit + boosterCredits
  const usagePercent = (user.transcripts_used_this_month / effectiveLimit) * 100
  const remaining = Math.max(0, effectiveLimit - user.transcripts_used_this_month)

  return {
    tier: user.subscription_tier,
    status: user.subscription_status,
    transcriptsUsed: user.transcripts_used_this_month,
    transcriptLimit: user.monthly_transcript_limit,
    boosterCredits,
    effectiveLimit,
    remainingTranscripts: remaining,
    usagePercent: Math.round(usagePercent),
    currentPeriodEnd: user.current_period_end,
    trialEndsAt: user.trial_ends_at,
    isNearLimit: usagePercent >= 80,
    isAtLimit: usagePercent >= 100,
    showBoosterUpsell: usagePercent >= 80,
  }
}

/**
 * Get booster pack purchase history for a user
 */
export async function getBoosterHistory(userId: string) {
  const supabase = await createClient()

  const { data: purchases } = await supabase
    .from('usage_log')
    .select('*')
    .eq('user_id', userId)
    .eq('action_type', 'booster_pack_purchased')
    .order('created_at', { ascending: false })
    .limit(10)

  return purchases || []
}
