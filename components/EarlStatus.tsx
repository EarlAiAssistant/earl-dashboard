'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

export default function EarlStatus() {
  const [lastActivity, setLastActivity] = useState<Date | null>(null)
  const [currentTask, setCurrentTask] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Fetch latest activity from multiple sources
    const fetchStatus = async () => {
      let mostRecentActivity: Date | null = null
      
      // Source 1: Check activity_log table
      const { data: activity } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (activity) {
        mostRecentActivity = new Date(activity.created_at)
      }

      // Source 2: Check tasks table for recent updates
      const { data: recentTask } = await supabase
        .from('tasks')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (recentTask) {
        const taskTime = new Date(recentTask.updated_at)
        if (!mostRecentActivity || taskTime > mostRecentActivity) {
          mostRecentActivity = taskTime
        }
      }

      // Source 3: Fetch ACTIVITY_LOG.md from GitHub and parse timestamp
      try {
        const response = await fetch('/ACTIVITY_LOG.md')
        if (response.ok) {
          const content = await response.text()
          const match = content.match(/\*\*Last Updated:\*\* (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) UTC/)
          if (match) {
            const logTime = new Date(match[1] + 'Z') // Add Z for UTC
            if (!mostRecentActivity || logTime > mostRecentActivity) {
              mostRecentActivity = logTime
            }
          }
        }
      } catch (error) {
        console.log('Could not fetch ACTIVITY_LOG.md:', error)
      }

      if (mostRecentActivity) {
        setLastActivity(mostRecentActivity)
        
        // Consider active if activity within last 5 minutes (increased from 2)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
        setIsActive(mostRecentActivity > fiveMinutesAgo)
      }

      // Get current in-progress task or latest backlog work
      const { data: inProgressTask } = await supabase
        .from('tasks')
        .select('title')
        .eq('status', 'in_progress')
        .limit(1)
        .single()

      if (inProgressTask) {
        setCurrentTask(inProgressTask.title)
      } else {
        // Fallback: parse ACTIVITY_LOG.md for current task
        try {
          const response = await fetch('/ACTIVITY_LOG.md')
          if (response.ok) {
            const content = await response.text()
            const taskMatch = content.match(/\*\*Current Task:\*\* (.+)/)
            if (taskMatch) {
              setCurrentTask(taskMatch[1])
            } else {
              setCurrentTask('Working on backlog')
            }
          }
        } catch {
          setCurrentTask(null)
        }
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 15000) // Update every 15 seconds (faster)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    if (!lastActivity) return 'bg-gray-500'
    
    const now = Date.now()
    const activityTime = lastActivity.getTime()
    const minutesAgo = (now - activityTime) / 1000 / 60

    if (minutesAgo < 5) return 'bg-green-500' // Active (within 5 minutes)
    if (minutesAgo < 60) return 'bg-yellow-500' // Idle (within 1 hour)
    return 'bg-gray-500' // Offline (>1 hour)
  }

  const getStatusText = () => {
    if (!lastActivity) return 'Offline'
    
    const now = Date.now()
    const activityTime = lastActivity.getTime()
    const minutesAgo = (now - activityTime) / 1000 / 60

    if (minutesAgo < 5) return 'Active'
    if (minutesAgo < 60) return 'Idle'
    return 'Offline'
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-3">
        {/* Earl Avatar */}
        <div className="relative">
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-2xl">
            🦬
          </div>
          {/* Status dot with pulse animation if active */}
          <div className={`absolute bottom-0 right-0 w-4 h-4 ${getStatusColor()} rounded-full border-2 border-gray-900 ${
            isActive ? 'animate-pulse' : ''
          }`} />
        </div>

        {/* Status Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold">Earl</h3>
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              isActive ? 'bg-green-500/20 text-green-400' :
              getStatusText() === 'Idle' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {getStatusText()}
            </span>
          </div>
          
          {currentTask ? (
            <>
              <p className="text-sm text-gray-400 mt-1">
                Working on: <span className="text-blue-400">{currentTask}</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Model: <span className="text-gray-400 font-mono">claude-sonnet-4-5</span>
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400 mt-1">
              {lastActivity ? `Last active ${formatDistanceToNow(lastActivity, { addSuffix: true })}` : 'No recent activity'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
