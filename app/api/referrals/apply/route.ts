/**
 * Apply Referral Code
 * 
 * POST /api/referrals/apply
 * Body: { code: string }
 * 
 * Applies a referral code to the current authenticated user.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { applyReferralCode } from '@/lib/referrals'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { code } = await request.json()
    
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Code is required' },
        { status: 400 }
      )
    }
    
    const result = await applyReferralCode(user.id, code)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('[Referrals Apply] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to apply code' },
      { status: 500 }
    )
  }
}
