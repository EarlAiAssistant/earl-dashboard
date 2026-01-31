import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * Simple status update endpoint
 * POST /api/status with { task: "Current task description" }
 */
export async function POST(request: Request) {
  try {
    const { task, status } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Log activity
    await supabase.from('activity_log').insert({
      type: 'status_update',
      content: task || 'Working',
      session_key: 'agent:main',
      metadata: { status: status || 'active' }
    })

    // Update or create in-progress task
    if (task) {
      // Find existing in-progress task
      const { data: existing } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'in_progress')
        .eq('session_key', 'agent:main')
        .single()

      if (existing) {
        await supabase
          .from('tasks')
          .update({ 
            title: task,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
      } else {
        await supabase.from('tasks').insert({
          title: task,
          status: 'in_progress',
          session_key: 'agent:main',
          started_at: new Date().toISOString()
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * GET current status
 */
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: activity } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const { data: task } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'in_progress')
      .limit(1)
      .single()

    return NextResponse.json({
      lastActivity: activity?.created_at,
      currentTask: task?.title,
      isActive: activity ? (Date.now() - new Date(activity.created_at).getTime()) < 5 * 60 * 1000 : false
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
