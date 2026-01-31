/**
 * Dunning Cron Job API
 * 
 * Process all active dunning records daily:
 * - Send appropriate emails based on days overdue
 * - Suspend accounts after 15 days
 * 
 * Should be called daily by Vercel Cron or similar:
 * ```
 * vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/dunning",
 *     "schedule": "0 9 * * *"  // Daily at 9am UTC
 *   }]
 * }
 * ```
 */

import { NextResponse } from 'next/server'
import { processDunningQueue } from '@/lib/dunning'

// Verify cron secret for security
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: Request) {
  // Verify request is from Vercel Cron
  const authHeader = request.headers.get('authorization')
  
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const results = await processDunningQueue()
    
    console.log('[Dunning Cron] Results:', results)
    
    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Dunning Cron] Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggering
export async function POST(request: Request) {
  return GET(request)
}
