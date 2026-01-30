import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { mapActivityToTask, logActivity } from '@/lib/openclaw'
import type { OpenClawActivity } from '@/lib/openclaw'

export const dynamic = 'force-dynamic'

/**
 * Webhook endpoint for OpenClaw to push updates
 * 
 * Configure OpenClaw to send POST requests to this endpoint:
 * POST /api/webhook
 * 
 * Expected payload:
 * {
 *   "timestamp": "2024-01-01T12:00:00Z",
 *   "type": "tool_call" | "session_start" | "session_end",
 *   "tool": "exec" | "web_search" | etc,
 *   "content": "Description of activity",
 *   "status": "running" | "completed" | "failed",
 *   "session_key": "session-abc123"
 * }
 */
export async function POST(request: Request) {
  try {
    // Optional: Verify webhook signature/secret
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.OPENCLAW_WEBHOOK_SECRET
    
    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const activity: OpenClawActivity = await request.json()

    // Validate payload
    if (!activity.timestamp || !activity.type) {
      return NextResponse.json(
        { error: 'Invalid payload - missing required fields' },
        { status: 400 }
      )
    }

    // Create Supabase client with service role for webhook
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Log the activity
    await logActivity(activity)

    // If this is a task-worthy activity, create/update task
    if (activity.session_key && ['tool_call', 'session_start', 'session_end'].includes(activity.type)) {
      // Check if task already exists for this session
      const { data: existingTask } = await supabase
        .from('tasks')
        .select('*')
        .eq('session_key', activity.session_key)
        .single()

      const taskData = mapActivityToTask(activity)

      if (existingTask) {
        // Update existing task
        await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', existingTask.id)
      } else {
        // Create new task
        await supabase.from('tasks').insert(taskData)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Activity received and processed',
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to verify webhook is accessible
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'OpenClaw webhook endpoint is ready',
    timestamp: new Date().toISOString(),
  })
}
