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
    // Fetch latest activity
    const fetchStatus = async () => {
      // Get most recent activity
      const { data: activity } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (activity) {
        const activityTime = new Date(activity.created_at)
        setLastActivity(activityTime)
        
        // Consider active if activity within last 2 minutes
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
        setIsActive(activityTime > twoMinutesAgo)
      }

      // Get current in-progress task
      const { data: tasks } = await supabase
        .from('tasks')
        .select('title')
        .eq('status', 'in_progress')
        .limit(1)
        .single()

      if (tasks) {
        setCurrentTask(tasks.title)
      } else {
        setCurrentTask(null)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    if (!lastActivity) return 'bg-gray-500'
    
    const now = Date.now()
    const activityTime = lastActivity.getTime()
    const minutesAgo = (now - activityTime) / 1000 / 60

    if (minutesAgo < 2) return 'bg-green-500' // Active
    if (minutesAgo < 30) return 'bg-yellow-500' // Idle
    return 'bg-gray-500' // Offline
  }

  const getStatusText = () => {
    if (!lastActivity) return 'Offline'
    
    const now = Date.now()
    const activityTime = lastActivity.getTime()
    const minutesAgo = (now - activityTime) / 1000 / 60

    if (minutesAgo < 2) return 'Active'
    if (minutesAgo < 30) return 'Idle'
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
            <p className="text-sm text-gray-400 mt-1">
              Working on: <span className="text-blue-400">{currentTask}</span>
            </p>
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
