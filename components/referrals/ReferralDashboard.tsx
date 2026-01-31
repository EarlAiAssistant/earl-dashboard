'use client'

import { useState, useEffect } from 'react'
import { Gift, Copy, Check, Users, DollarSign, Clock, Share2 } from 'lucide-react'
import { toast } from '@/components/ui/Toast'

interface ReferralStats {
  totalReferrals: number
  qualifiedReferrals: number
  creditsEarned: number
  pendingCredits: number
}

interface Referral {
  id: string
  status: 'pending' | 'qualified' | 'rewarded' | 'expired'
  referee_subscribed_at: string | null
  reward_issued_at: string | null
  created_at: string
}

interface ReferralData {
  code: string
  url: string
  stats: ReferralStats
  referrals: Referral[]
}

export default function ReferralDashboard() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchReferralData()
  }, [])

  async function fetchReferralData() {
    try {
      const res = await fetch('/api/referrals')
      if (res.ok) {
        const data = await res.json()
        setData(data)
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  async function shareReferral() {
    if (!data) return
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Get $20 off Call-Content',
          text: "I've been using Call-Content to turn customer calls into content. Use my link to get $20 off!",
          url: data.url,
        })
      } catch {
        // User cancelled or share failed
      }
    } else {
      copyToClipboard(data.url)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-800 rounded-lg"></div>
        <div className="h-48 bg-gray-800 rounded-lg"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-400">
        Failed to load referral data
      </div>
    )
  }

  const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    qualified: 'bg-blue-500/10 text-blue-400',
    rewarded: 'bg-green-500/10 text-green-400',
    expired: 'bg-gray-500/10 text-gray-400',
  }

  const statusLabels = {
    pending: 'Pending',
    qualified: 'Qualified',
    rewarded: 'Rewarded',
    expired: 'Expired',
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Give $20, Get $20</h2>
            <p className="text-white/80 text-sm">Share Call-Content with friends</p>
          </div>
        </div>
        
        <p className="mb-4 text-white/90">
          When your friends subscribe, you both get $20. It's a win-win!
        </p>
        
        {/* Referral Link */}
        <div className="bg-white/10 rounded-lg p-4">
          <label className="block text-sm text-white/60 mb-2">Your referral link</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={data.url}
              readOnly
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
            />
            <button
              onClick={() => copyToClipboard(data.url)}
              className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={shareReferral}
              className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          
          {/* Code Display */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-white/60 text-sm">Code:</span>
            <code className="px-2 py-1 bg-white/10 rounded text-sm font-mono">
              {data.code}
            </code>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-sm">Total Referrals</span>
          </div>
          <p className="text-2xl font-bold text-white">{data.stats.totalReferrals}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Check className="w-4 h-4" />
            <span className="text-sm">Qualified</span>
          </div>
          <p className="text-2xl font-bold text-white">{data.stats.qualifiedReferrals}</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Earned</span>
          </div>
          <p className="text-2xl font-bold text-green-400">
            ${(data.stats.creditsEarned / 100).toFixed(0)}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Pending</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400">
            ${(data.stats.pendingCredits / 100).toFixed(0)}
          </p>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="font-semibold text-white">Referral History</h3>
        </div>
        
        {data.referrals.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No referrals yet</p>
            <p className="text-sm mt-1">Share your link to start earning!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {data.referrals.map((referral) => (
              <div key={referral.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">
                    Referral #{referral.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(referral.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[referral.status]}`}>
                  {statusLabels[referral.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="font-semibold text-white mb-4">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold">
              1
            </div>
            <div>
              <p className="text-white font-medium">Share your link</p>
              <p className="text-sm text-gray-400">Send your unique referral link to friends</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold">
              2
            </div>
            <div>
              <p className="text-white font-medium">They subscribe</p>
              <p className="text-sm text-gray-400">They get $20 off their first month</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold">
              3
            </div>
            <div>
              <p className="text-white font-medium">You get $20</p>
              <p className="text-sm text-gray-400">After they stay subscribed for 30 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
