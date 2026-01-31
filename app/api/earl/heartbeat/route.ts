import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export const dynamic = 'force-dynamic'

const STATUS_KEY = 'earl:status'

interface EarlStatus {
  status: 'active' | 'idle' | 'offline'
  task: string
  model: string
  lastPing: string
  sessionStart?: string
  workspace?: string
}

async function getStatus(): Promise<EarlStatus> {
  try {
    const status = await kv.get<EarlStatus>(STATUS_KEY)
    
    if (status) {
      // Auto-mark as idle if no ping in 5 minutes
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
      const lastPingTime = new Date(status.lastPing).getTime()
      
      if (lastPingTime < fiveMinutesAgo) {
        status.status = 'idle'
      }
      
      // Auto-mark as offline if no ping in 60 minutes
      const sixtyMinutesAgo = Date.now() - 60 * 60 * 1000
      if (lastPingTime < sixtyMinutesAgo) {
        status.status = 'offline'
      }
      
      return status
    }
  } catch (error) {
    console.error('Error reading status from KV:', error)
  }
  
  // Default status
  return {
    status: 'offline',
    task: 'No recent activity',
    model: 'unknown',
    lastPing: new Date().toISOString(),
  }
}

async function saveStatus(status: EarlStatus) {
  try {
    await kv.set(STATUS_KEY, status)
  } catch (error) {
    console.error('Error writing status to KV:', error)
  }
}

/**
 * GET /api/earl/heartbeat
 * Returns Earl's current status (public read)
 */
export async function GET() {
  const status = await getStatus()
  
  // Calculate session uptime if available
  let sessionUptime = null
  if (status.sessionStart) {
    const start = new Date(status.sessionStart).getTime()
    const now = Date.now()
    const uptimeMs = now - start
    
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60))
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60))
    sessionUptime = `${hours}h ${minutes}m`
  }
  
  return NextResponse.json({
    ...status,
    sessionUptime,
    serverTime: new Date().toISOString(),
  })
}

/**
 * POST /api/earl/heartbeat
 * Updates Earl's status (requires API key)
 * 
 * Headers:
 *   x-api-key: <EARL_HEARTBEAT_KEY>
 * 
 * Body:
 * {
 *   "task": "Current task description",
 *   "model": "claude-sonnet-4-5",
 *   "workspace": "/path/to/workspace",
 *   "sessionStart": "2026-01-31T05:00:00Z" (optional, only on first ping)
 * }
 */
export async function POST(request: Request) {
  // Check API key
  const apiKey = request.headers.get('x-api-key')
  const expectedKey = process.env.EARL_HEARTBEAT_KEY
  
  if (!expectedKey) {
    return NextResponse.json(
      { success: false, error: 'Server misconfigured - no API key set' },
      { status: 500 }
    )
  }
  
  if (apiKey !== expectedKey) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - invalid API key' },
      { status: 401 }
    )
  }
  
  try {
    const body = await request.json()
    
    const currentStatus = await getStatus()
    
    const newStatus: EarlStatus = {
      status: 'active',
      task: body.task || 'Working',
      model: body.model || currentStatus.model,
      lastPing: new Date().toISOString(),
      sessionStart: body.sessionStart || currentStatus.sessionStart,
      workspace: body.workspace || currentStatus.workspace,
    }
    
    await saveStatus(newStatus)
    
    return NextResponse.json({
      success: true,
      status: newStatus,
    })
  } catch (error) {
    console.error('Heartbeat update error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
