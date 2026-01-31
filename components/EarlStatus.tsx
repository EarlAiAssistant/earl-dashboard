'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

interface EarlStatusData {
  status: 'active' | 'idle' | 'offline'
  task: string
  model: string
  lastPing: string
  sessionUptime?: string
  workspace?: string
}

export default function EarlStatus() {
  const [statusData, setStatusData] = useState<EarlStatusData | null>(null)

  useEffect(() => {
    // Fetch status from Earl's heartbeat API
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/earl/heartbeat')
        if (response.ok) {
          const data = await response.json()
          setStatusData(data)
        }
      } catch (error) {
        console.error('Failed to fetch Earl status:', error)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 15000) // Poll every 15 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    if (!statusData) return 'bg-gray-500'
    
    switch (statusData.status) {
      case 'active':
        return 'bg-green-500'
      case 'idle':
        return 'bg-yellow-500'
      case 'offline':
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    if (!statusData) return 'Offline'
    
    return statusData.status.charAt(0).toUpperCase() + statusData.status.slice(1)
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
            statusData?.status === 'active' ? 'animate-pulse' : ''
          }`} />
        </div>

        {/* Status Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold">Earl</h3>
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              statusData?.status === 'active' ? 'bg-green-500/20 text-green-400' :
              statusData?.status === 'idle' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {getStatusText()}
            </span>
          </div>
          
          {statusData ? (
            <>
              <p className="text-sm text-gray-400 mt-1">
                {statusData.task}
              </p>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                <span>
                  Model: <span className="text-gray-400 font-mono">{statusData.model}</span>
                </span>
                {statusData.sessionUptime && (
                  <span>
                    Uptime: <span className="text-gray-400">{statusData.sessionUptime}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Last ping: {formatDistanceToNow(new Date(statusData.lastPing), { addSuffix: true })}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400 mt-1">
              Connecting...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
