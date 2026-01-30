import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { pollAndUpdateTasks } from '@/lib/openclaw'

export const dynamic = 'force-dynamic'

/**
 * API route to manually trigger OpenClaw data sync
 * Can be called:
 * - Manually from frontend
 * - Via cron job (e.g., Vercel Cron)
 * - From external scheduler
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Poll and update tasks from OpenClaw
    const result = await pollAndUpdateTasks()

    return NextResponse.json({
      success: true,
      message: 'Sync completed',
      processed: result.processed,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Sync error:', error)
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
 * GET endpoint to check sync status
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get latest task and activity timestamps
    const { data: latestTask } = await supabase
      .from('tasks')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    const { data: latestActivity } = await supabase
      .from('activity_log')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      status: 'ok',
      last_task_update: latestTask?.updated_at || null,
      last_activity: latestActivity?.created_at || null,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
