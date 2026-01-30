'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ActivityLog } from '@/lib/types'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { 
  Activity, 
  Search, 
  Filter, 
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

const statusIcons = {
  completed: CheckCircle,
  failed: XCircle,
  running: Loader2,
  pending: Clock,
}

const statusColors = {
  completed: 'text-green-400',
  failed: 'text-red-400',
  running: 'text-blue-400',
  pending: 'text-yellow-400',
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const ITEMS_PER_PAGE = 50

  const supabase = createClient()

  const fetchActivities = async (pageNum: number = 1) => {
    setLoading(true)
    
    let query = supabase
      .from('activity_log')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((pageNum - 1) * ITEMS_PER_PAGE, pageNum * ITEMS_PER_PAGE - 1)

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      let startDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
      }
      
      query = query.gte('created_at', startDate.toISOString())
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching activities:', error)
    } else {
      if (pageNum === 1) {
        setActivities(data || [])
      } else {
        setActivities((prev) => [...prev, ...(data || [])])
      }
      setHasMore(count ? count > pageNum * ITEMS_PER_PAGE : false)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchActivities(1)
    setPage(1)
  }, [dateFilter])

  const filteredActivities = activities.filter((activity) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      activity.action_type.toLowerCase().includes(query) ||
      activity.details?.toLowerCase().includes(query) ||
      activity.status?.toLowerCase().includes(query)
    )
  })

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchActivities(nextPage)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Activity Log</h1>
        <p className="text-gray-400">Chronological history of all Earl's activities</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Activity List */}
      {loading && page === 1 ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No activities found</p>
          <p className="text-sm">Activities will appear here as Earl works</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filteredActivities.map((activity) => {
              const StatusIcon = activity.status 
                ? (statusIcons[activity.status as keyof typeof statusIcons] || AlertCircle)
                : Activity
              const statusColor = activity.status
                ? (statusColors[activity.status as keyof typeof statusColors] || 'text-gray-400')
                : 'text-gray-400'

              return (
                <div
                  key={activity.id}
                  className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <StatusIcon className={`w-5 h-5 mt-1 flex-shrink-0 ${statusColor}`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-white mb-1">
                            {activity.action_type}
                          </h3>
                          {activity.details && (
                            <p className="text-sm text-gray-400 whitespace-pre-wrap">
                              {activity.details}
                            </p>
                          )}
                        </div>
                        
                        {activity.status && (
                          <span className={`px-2 py-1 text-xs rounded-full bg-gray-700 ${statusColor}`}>
                            {activity.status}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        <span>{formatDate(activity.created_at)}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(activity.created_at)}</span>
                        
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <>
                            <span>•</span>
                            {activity.metadata.tool && (
                              <span className="px-2 py-0.5 bg-gray-700 rounded">
                                Tool: {activity.metadata.tool}
                              </span>
                            )}
                            {activity.metadata.session_key && (
                              <span className="px-2 py-0.5 bg-gray-700 rounded">
                                Session: {activity.metadata.session_key.substring(0, 8)}...
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
