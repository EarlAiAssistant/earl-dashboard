import CustomerHealthDashboard from '@/components/admin/CustomerHealthDashboard'

export const metadata = {
  title: 'Customer Health Dashboard | Call-Content Admin',
  description: 'Internal metrics dashboard for monitoring customer health',
}

export default function AdminHealthPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CustomerHealthDashboard />
      </div>
    </div>
  )
}
