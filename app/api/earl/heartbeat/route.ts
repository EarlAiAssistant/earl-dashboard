import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

// Simple file-based cache for status
const STATUS_FILE = path.join(process.cwd(), '.earl-status.json')

interface EarlStatus {
  status: 'active' | 'idle' | 'offline'
  task: string
  model: string
  lastPing: string
  sessionStart?: string
  workspace?: string
}

function getStatus(): EarlStatus {
  try {
    if (fs.existsSync(STATUS_FILE)) {
      const data = fs.readFileSync(STATUS_FILE, 'utf-8')
      const status = JSON.parse(data) as EarlStatus
      
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
    console.error('Error reading status file:', error)
  }
  
  // Default status
  return {
    status: 'offline',
    task: 'No recent activity',
    model: 'unknown',
    lastPing: new Date().toISOString(),
  }
}

function saveStatus(status: EarlStatus) {
  try {
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2))
  } catch (error) {
    console.error('Error writing status file:', error)
  }
}

/**
 * GET /api/earl/heartbeat
 * Returns Earl's current status
 */
export async function GET() {
  const status = getStatus()
  
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
 * Updates Earl's status
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
  try {
    const body = await request.json()
    
    const currentStatus = getStatus()
    
    const newStatus: EarlStatus = {
      status: 'active',
      task: body.task || 'Working',
      model: body.model || currentStatus.model,
      lastPing: new Date().toISOString(),
      sessionStart: body.sessionStart || currentStatus.sessionStart,
      workspace: body.workspace || currentStatus.workspace,
    }
    
    saveStatus(newStatus)
    
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
