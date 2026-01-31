'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Activity,
  UserPlus,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Mail,
  Clock,
  Zap,
} from 'lucide-react'

interface HealthMetrics {
  trialsToday: number
  trialsThisWeek: number
  trialsThisMonth: number
  trialToPaidRate: number
  activeTrials: number
  activeSubscriptions: number
  subscriptionsByTier: Record<string, number>
  mrr: number
  churnThisMonth: number
  churnRate: number
  avgTranscriptsPerUser: number
  totalTranscriptsThisMonth: number
  heavyUsers: number
  atRiskUsers: AtRiskUser[]
  dailySignups: DailyMetric[]
  dailyConversions: DailyMetric[]
}

interface AtRiskUser {
  id: string
  email: string
  tier: string
  lastLogin: string | null
  transcriptsUsed: number
  transcriptLimit: number
  daysInactive: number
  riskLevel: 'low' | 'medium' | 'high'
  riskReason: string
}

interface DailyMetric {
  date: string
  value: number
}

interface CustomerHealthDashboardProps {
  adminKey?: string
}

export default function CustomerHealthDashboard({ adminKey }: CustomerHealthDashboardProps) {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllAtRisk, setShowAllAtRisk] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchMetrics = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/health', {
        headers: adminKey ? { 'x-admin-key': adminKey } : {},
      })

      if (!response.ok) {
        throw new Error('Failed to fetch metrics')
      }

      const data = await response.json()
      setMetrics(data)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [adminKey])

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchMetrics}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!metrics) return null

  const displayedAtRisk = showAllAtRisk 
    ? metrics.atRiskUsers 
    : metrics.atRiskUsers.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Health Dashboard</h1>
          <p className="text-sm text-gray-500">
            Internal metrics for Call-Content
            {lastRefresh && (
              <span className="ml-2">
                • Updated {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monthly Recurring Revenue"
          value={`$${metrics.mrr.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          subtitle={`${metrics.activeSubscriptions} active subscriptions`}
        />
        <MetricCard
          title="Trial → Paid Rate"
          value={`${metrics.trialToPaidRate}%`}
          icon={TrendingUp}
          color="blue"
          subtitle={`${metrics.activeTrials} active trials`}
        />
        <MetricCard
          title="Churn Rate"
          value={`${metrics.churnRate}%`}
          icon={metrics.churnRate > 5 ? TrendingDown : Activity}
          color={metrics.churnRate > 5 ? 'red' : 'gray'}
          subtitle={`${metrics.churnThisMonth} churned this month`}
        />
        <MetricCard
          title="At-Risk Users"
          value={metrics.atRiskUsers.length.toString()}
          icon={AlertTriangle}
          color={metrics.atRiskUsers.length > 10 ? 'red' : 'yellow'}
          subtitle={`${metrics.atRiskUsers.filter(u => u.riskLevel === 'high').length} high risk`}
        />
      </div>

      {/* Trial & Signups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-500" />
            Trial Signups
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{metrics.trialsToday}</div>
              <div className="text-xs text-blue-700">Today</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{metrics.trialsThisWeek}</div>
              <div className="text-xs text-blue-700">This Week</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{metrics.trialsThisMonth}</div>
              <div className="text-xs text-blue-700">This Month</div>
            </div>
          </div>
          
          {/* Mini sparkline */}
          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-2">Last 30 days</div>
            <div className="flex items-end gap-0.5 h-16">
              {metrics.dailySignups.map((day, i) => {
                const maxValue = Math.max(...metrics.dailySignups.map(d => d.value), 1)
                const height = (day.value / maxValue) * 100
                return (
                  <div
                    key={i}
                    className="flex-1 bg-blue-400 rounded-t hover:bg-blue-500 transition-colors"
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${day.date}: ${day.value}`}
                  />
                )
              })}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Usage Metrics
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{metrics.avgTranscriptsPerUser}</div>
              <div className="text-xs text-amber-700">Avg/User</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{metrics.totalTranscriptsThisMonth}</div>
              <div className="text-xs text-amber-700">Total This Month</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{metrics.heavyUsers}</div>
              <div className="text-xs text-amber-700">Heavy Users (80%+)</div>
            </div>
          </div>

          {/* Subscriptions by tier */}
          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-2">Subscriptions by Tier</div>
            <div className="space-y-2">
              {Object.entries(metrics.subscriptionsByTier).map(([tier, count]) => (
                <div key={tier} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-gray-700">{tier}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* At-Risk Users */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          At-Risk Users
          <span className="text-sm font-normal text-gray-500">
            ({metrics.atRiskUsers.length} total)
          </span>
        </h2>

        {metrics.atRiskUsers.length === 0 ? (
          <p className="text-gray-500 text-sm">No at-risk users detected! 🎉</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-500">User</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Tier</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Usage</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Last Login</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Risk</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedAtRisk.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <div className="font-medium text-gray-900">{user.email}</div>
                      </td>
                      <td className="py-3 px-3 capitalize text-gray-700">{user.tier}</td>
                      <td className="py-3 px-3 text-gray-700">
                        {user.transcriptsUsed}/{user.transcriptLimit}
                      </td>
                      <td className="py-3 px-3 text-gray-700">
                        {user.lastLogin ? (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {user.daysInactive}d ago
                          </span>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            user.riskLevel === 'high'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {user.riskLevel}
                        </span>
                        <div className="text-xs text-gray-500 mt-0.5">{user.riskReason}</div>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => window.open(`mailto:${user.email}?subject=We miss you at Call-Content!`)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                        >
                          <Mail className="h-3 w-3" />
                          Email
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {metrics.atRiskUsers.length > 5 && (
              <button
                onClick={() => setShowAllAtRisk(!showAllAtRisk)}
                className="mt-4 flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
              >
                {showAllAtRisk ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show all {metrics.atRiskUsers.length} at-risk users
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  color: 'green' | 'blue' | 'red' | 'yellow' | 'gray'
  subtitle?: string
}

function MetricCard({ title, value, icon: Icon, color, subtitle }: MetricCardProps) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
  }

  const iconColorClasses = {
    green: 'text-green-500',
    blue: 'text-blue-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    gray: 'text-gray-500',
  }

  return (
    <div className={`rounded-xl border p-5 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-80">{title}</span>
        <Icon className={`h-5 w-5 ${iconColorClasses[color]}`} />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && <div className="text-xs mt-1 opacity-70">{subtitle}</div>}
    </div>
  )
}
