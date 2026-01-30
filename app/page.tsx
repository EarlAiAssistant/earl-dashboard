import KanbanBoard from '@/components/KanbanBoard'
import { RefreshCw } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Task Dashboard</h1>
            <p className="text-gray-400">
              Track Earl's tasks and activities in real-time
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Auto-refreshing every 30s</span>
          </div>
        </div>
      </div>

      <KanbanBoard />
    </div>
  )
}
