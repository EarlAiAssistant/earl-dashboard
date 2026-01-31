import { Metadata } from 'next'
import ReferralDashboard from '@/components/referrals/ReferralDashboard'

export const metadata: Metadata = {
  title: 'Referrals | Call-Content',
  description: 'Share Call-Content and earn $20 for every friend who subscribes.',
}

export default function ReferralsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Referral Program</h1>
        <p className="text-gray-400">Earn rewards for sharing Call-Content</p>
      </div>
      
      <ReferralDashboard />
    </div>
  )
}
