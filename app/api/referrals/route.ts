/**
 * Referral API Routes
 * 
 * GET  /api/referrals - Get user's referral code and stats
 * POST /api/referrals/validate - Validate a referral code
 * POST /api/referrals/apply - Apply referral code to current user
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getOrCreateReferralCode,
  getReferralStats,
  getUserReferrals,
  getReferralUrl,
} from '@/lib/referrals'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user details
    const { data: userData } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single()
    
    // Get or create referral code
    const code = await getOrCreateReferralCode(user.id, userData?.name)
    
    if (!code) {
      return NextResponse.json(
        { error: 'Failed to get referral code' },
        { status: 500 }
      )
    }
    
    // Get stats and referrals
    const [stats, referrals] = await Promise.all([
      getReferralStats(user.id),
      getUserReferrals(user.id),
    ])
    
    return NextResponse.json({
      code: code.code,
      url: getReferralUrl(code.code),
      stats,
      referrals,
    })
  } catch (error) {
    console.error('[Referrals API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
