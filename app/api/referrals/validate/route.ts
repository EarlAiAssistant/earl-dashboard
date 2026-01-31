/**
 * Validate Referral Code
 * 
 * POST /api/referrals/validate
 * Body: { code: string }
 */

import { NextResponse } from 'next/server'
import { validateReferralCode } from '@/lib/referrals'

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Code is required' },
        { status: 400 }
      )
    }
    
    const result = await validateReferralCode(code)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('[Referrals Validate] Error:', error)
    return NextResponse.json(
      { valid: false, error: 'Failed to validate code' },
      { status: 500 }
    )
  }
}
