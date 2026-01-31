import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface HealthMetrics {
  // Trial & Conversion
  trialsToday: number
  trialsThisWeek: number
  trialsThisMonth: number
  trialToPaidRate: number
  activeTrials: number
  
  // Revenue & Subscriptions
  activeSubscriptions: number
  subscriptionsByTier: Record<string, number>
  mrr: number
  churnThisMonth: number
  churnRate: number
  
  // Usage
  avgTranscriptsPerUser: number
  totalTranscriptsThisMonth: number
  heavyUsers: number // >80% usage
  
  // At-Risk Users
  atRiskUsers: AtRiskUser[]
  
  // Time-series (last 30 days)
  dailySignups: DailyMetric[]
  dailyConversions: DailyMetric[]
}

interface AtRiskUser {
  id: string
  email: string
  tier: string
  lastLogin: string | null
  transcriptsUsed: number
  transcriptLimit: number
  daysInactive: number
  riskLevel: 'low' | 'medium' | 'high'
  riskReason: string
}

interface DailyMetric {
  date: string
  value: number
}

/**
 * GET /api/admin/health
 * Returns customer health dashboard metrics
 * 
 * Requires admin authentication (check user role)
 */
export async function GET(request: Request) {
  const supabase = await createClient()

  // Verify admin access (you'd normally check auth here)
  // For now, we'll use a simple API key check
  const apiKey = request.headers.get('x-admin-key')
  if (apiKey !== process.env.ADMIN_API_KEY && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Fetch all users for metrics calculation
    const { data: users } = await supabase
      .from('users')
      .select('id, email, subscription_tier, subscription_status, monthly_transcript_limit, transcripts_used_this_month, created_at, last_login_at, trial_ends_at, current_period_end')

    if (!users) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Calculate metrics
    const metrics: HealthMetrics = calculateMetrics(users, {
      todayStart,
      weekAgo,
      monthAgo,
      now,
    })

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Health dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate metrics' },
      { status: 500 }
    )
  }
}

function calculateMetrics(
  users: any[],
  dates: { todayStart: Date; weekAgo: Date; monthAgo: Date; now: Date }
): HealthMetrics {
  const { todayStart, weekAgo, monthAgo, now } = dates

  // Trial signups
  const trialsToday = users.filter(u => 
    new Date(u.created_at) >= todayStart && 
    u.subscription_status === 'trial'
  ).length

  const trialsThisWeek = users.filter(u => 
    new Date(u.created_at) >= weekAgo && 
    u.subscription_status === 'trial'
  ).length

  const trialsThisMonth = users.filter(u => 
    new Date(u.created_at) >= monthAgo && 
    u.subscription_status === 'trial'
  ).length

  // Active trials (not expired)
  const activeTrials = users.filter(u => 
    u.subscription_status === 'trial' &&
    (!u.trial_ends_at || new Date(u.trial_ends_at) > now)
  ).length

  // Trial to paid conversion
  const completedTrials = users.filter(u => 
    u.trial_ends_at && new Date(u.trial_ends_at) <= now
  )
  const convertedTrials = completedTrials.filter(u => 
    u.subscription_status === 'active'
  )
  const trialToPaidRate = completedTrials.length > 0 
    ? Math.round((convertedTrials.length / completedTrials.length) * 100) 
    : 0

  // Active subscriptions
  const activeSubscriptions = users.filter(u => 
    u.subscription_status === 'active'
  ).length

  // Subscriptions by tier
  const subscriptionsByTier: Record<string, number> = {}
  users
    .filter(u => u.subscription_status === 'active')
    .forEach(u => {
      const tier = u.subscription_tier || 'unknown'
      subscriptionsByTier[tier] = (subscriptionsByTier[tier] || 0) + 1
    })

  // MRR calculation (rough estimate based on tier counts)
  const tierPrices: Record<string, number> = {
    starter: 97,
    professional: 197,
    agency: 497,
    enterprise: 1200,
  }
  const mrr = Object.entries(subscriptionsByTier).reduce((sum, [tier, count]) => {
    return sum + (tierPrices[tier] || 0) * count
  }, 0)

  // Churn (users who canceled this month)
  const churnThisMonth = users.filter(u => 
    u.subscription_status === 'canceled' &&
    u.current_period_end &&
    new Date(u.current_period_end) >= monthAgo
  ).length

  const churnRate = activeSubscriptions > 0 
    ? Math.round((churnThisMonth / (activeSubscriptions + churnThisMonth)) * 100)
    : 0

  // Usage metrics
  const activeUsers = users.filter(u => 
    u.subscription_status === 'active' || u.subscription_status === 'trial'
  )
  const totalTranscripts = activeUsers.reduce((sum, u) => 
    sum + (u.transcripts_used_this_month || 0), 0
  )
  const avgTranscriptsPerUser = activeUsers.length > 0 
    ? Math.round(totalTranscripts / activeUsers.length * 10) / 10
    : 0

  const heavyUsers = activeUsers.filter(u => {
    if (!u.monthly_transcript_limit) return false
    const usage = (u.transcripts_used_this_month || 0) / u.monthly_transcript_limit
    return usage >= 0.8
  }).length

  // At-risk users
  const atRiskUsers = identifyAtRiskUsers(users, now)

  // Daily signups (last 30 days)
  const dailySignups: DailyMetric[] = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const count = users.filter(u => {
      const created = new Date(u.created_at)
      return created.toISOString().split('T')[0] === dateStr
    }).length
    dailySignups.push({ date: dateStr, value: count })
  }

  // Daily conversions (simplified - just active subscriptions created each day)
  const dailyConversions: DailyMetric[] = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const count = users.filter(u => {
      if (u.subscription_status !== 'active') return false
      const created = new Date(u.created_at)
      return created.toISOString().split('T')[0] === dateStr
    }).length
    dailyConversions.push({ date: dateStr, value: count })
  }

  return {
    trialsToday,
    trialsThisWeek,
    trialsThisMonth,
    trialToPaidRate,
    activeTrials,
    activeSubscriptions,
    subscriptionsByTier,
    mrr,
    churnThisMonth,
    churnRate,
    avgTranscriptsPerUser,
    totalTranscriptsThisMonth: totalTranscripts,
    heavyUsers,
    atRiskUsers,
    dailySignups,
    dailyConversions,
  }
}

function identifyAtRiskUsers(users: any[], now: Date): AtRiskUser[] {
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  return users
    .filter(u => u.subscription_status === 'active' || u.subscription_status === 'trial')
    .map(u => {
      const lastLogin = u.last_login_at ? new Date(u.last_login_at) : null
      const daysInactive = lastLogin 
        ? Math.floor((now.getTime() - lastLogin.getTime()) / (24 * 60 * 60 * 1000))
        : 999 // Never logged in

      const usagePercent = u.monthly_transcript_limit 
        ? (u.transcripts_used_this_month || 0) / u.monthly_transcript_limit
        : 0

      // Determine risk level and reason
      let riskLevel: 'low' | 'medium' | 'high' = 'low'
      let riskReason = ''

      if (daysInactive >= 14) {
        riskLevel = 'high'
        riskReason = `No login in ${daysInactive} days`
      } else if (daysInactive >= 7) {
        riskLevel = 'medium'
        riskReason = `No login in ${daysInactive} days`
      } else if (usagePercent === 0 && u.subscription_status === 'active') {
        riskLevel = 'high'
        riskReason = 'Paying but zero usage this month'
      } else if (usagePercent < 0.1 && u.subscription_status === 'active') {
        riskLevel = 'medium'
        riskReason = 'Very low usage (<10%)'
      }

      return {
        id: u.id,
        email: u.email,
        tier: u.subscription_tier || 'unknown',
        lastLogin: u.last_login_at,
        transcriptsUsed: u.transcripts_used_this_month || 0,
        transcriptLimit: u.monthly_transcript_limit || 0,
        daysInactive,
        riskLevel,
        riskReason,
      }
    })
    .filter(u => u.riskLevel !== 'low')
    .sort((a, b) => {
      // Sort by risk level (high first) then by days inactive
      const levelOrder = { high: 0, medium: 1, low: 2 }
      if (levelOrder[a.riskLevel] !== levelOrder[b.riskLevel]) {
        return levelOrder[a.riskLevel] - levelOrder[b.riskLevel]
      }
      return b.daysInactive - a.daysInactive
    })
    .slice(0, 20) // Top 20 at-risk users
}
