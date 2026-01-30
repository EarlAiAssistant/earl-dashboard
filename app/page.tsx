import KanbanBoard from '@/components/KanbanBoard'
import { RefreshCw } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Task Dashboard</h1>
            <p className="text-sm md:text-base text-gray-400">
              Track Earl's tasks and activities in real-time
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="hidden sm:inline">Auto-refreshing every 30s</span>
            <span className="sm:hidden">Auto-refresh</span>
          </div>
        </div>
      </div>

      <KanbanBoard />
    </div>
  )
}
