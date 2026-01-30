import { createClient } from './supabase/client'
import type { Task, ActivityLog } from './types'

export interface OpenClawActivity {
  timestamp: string
  type: string
  tool?: string
  content?: string
  status?: string
  session_key?: string
}

/**
 * Parse OpenClaw session data and sync to database
 * This can be adapted to:
 * - Poll OpenClaw API endpoint
 * - Read session transcript files
 * - Receive webhook updates
 */
export async function syncOpenClawData() {
  const supabase = createClient()
  
  try {
    // TODO: Implement actual OpenClaw data fetching
    // Example approaches:
    
    // Approach 1: Poll API endpoint
    // const response = await fetch('http://localhost:8080/api/sessions')
    // const sessions = await response.json()
    
    // Approach 2: Read transcript files
    // const transcriptPath = process.env.OPENCLAW_TRANSCRIPT_DIR
    // const files = await readTranscriptFiles(transcriptPath)
    
    // Approach 3: Webhook (set up in OpenClaw config)
    // This function would be called by webhook handler
    
    // For now, return placeholder data structure
    return {
      success: true,
      message: 'OpenClaw integration pending - configure data source',
    }
  } catch (error) {
    console.error('Error syncing OpenClaw data:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Map OpenClaw activity to Task
 */
export function mapActivityToTask(activity: OpenClawActivity): Partial<Task> {
  const status = activity.status === 'completed' ? 'done' 
    : activity.status === 'running' ? 'in_progress' 
    : 'backlog'
  
  return {
    title: activity.content?.substring(0, 100) || 'Untitled Task',
    description: activity.content,
    status,
    session_key: activity.session_key,
    started_at: activity.timestamp,
    completed_at: activity.status === 'completed' ? activity.timestamp : null,
    metadata: {
      type: activity.type,
      tool: activity.tool,
    },
  }
}

/**
 * Create activity log entry from OpenClaw data
 */
export async function logActivity(activity: OpenClawActivity) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('activity_log')
    .insert({
      action_type: activity.type,
      details: activity.content,
      status: activity.status,
      metadata: {
        tool: activity.tool,
        session_key: activity.session_key,
      },
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error logging activity:', error)
    return null
  }
  
  return data
}

/**
 * Poll OpenClaw sessions and update tasks
 * Call this from API route with setInterval or cron
 */
export async function pollAndUpdateTasks() {
  const supabase = createClient()
  
  // TODO: Fetch real OpenClaw session data
  // Example: Read from session files or API
  const activities: OpenClawActivity[] = []
  
  // Process each activity
  for (const activity of activities) {
    // Check if task already exists
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
      await supabase
        .from('tasks')
        .insert(taskData)
    }
    
    // Log the activity
    await logActivity(activity)
  }
  
  return { processed: activities.length }
}

/**
 * Watch a directory for session transcript files
 * This is a placeholder - implement based on your OpenClaw setup
 */
export async function watchSessionFiles(directory: string) {
  // TODO: Implement file watcher
  // Use fs.watch or chokidar to monitor OpenClaw session files
  // Parse files and call pollAndUpdateTasks when changes detected
  console.log('Watching directory:', directory)
}
