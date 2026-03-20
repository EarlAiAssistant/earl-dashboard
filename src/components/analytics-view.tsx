// ============================================================
// Analytics dashboard — stats, charts, trends
// ============================================================

'use client';

import { useMemo } from 'react';
import {
  useAnalyticsOverview,
  useAnalyticsTrends,
  useAnalyticsHourly,
} from '@/src/lib/hooks/use-analytics';
import { STATUS_LABELS, PRIORITY_LABELS, STATUS_COLORS, PRIORITY_COLORS } from '@/src/lib/types';
import type { TaskStatus, TaskPriority } from '@/src/lib/types';
import { cn } from '@/src/lib/utils';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  ListTodo,
  Calendar,
  Download,
  Loader2,
} from 'lucide-react';

// Simple chart components using divs (no recharts dependency issues)
function BarChart({ data, maxValue }: { data: { label: string; value: number; color?: string }[]; maxValue?: number }) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-20 truncate">{item.label}</span>
          <div className="flex-1 h-6 bg-muted/30 rounded overflow-hidden">
            <div
              className={cn('h-full rounded transition-all duration-500', item.color || 'bg-blue-500')}
              style={{ width: `${Math.max((item.value / max) * 100, item.value > 0 ? 2 : 0)}%` }}
            />
          </div>
          <span className="text-xs font-mono w-8 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function MiniTrendChart({ data }: { data: { value: number }[] }) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const points = data.map((d, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * 100,
    y: 100 - (d.value / max) * 80,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-16" preserveAspectRatio="none">
      <path d={pathD} fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400" />
      <path
        d={`${pathD} L 100 100 L 0 100 Z`}
        fill="currentColor"
        className="text-blue-400/10"
      />
    </svg>
  );
}

function HeatmapRow({ data }: { data: { hour: number; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="space-y-1">
      <div className="flex gap-0.5">
        {data.map((d) => (
          <div
            key={d.hour}
            className="flex-1 h-8 rounded-sm transition-colors"
            style={{
              backgroundColor:
                d.count === 0
                  ? 'var(--muted)'
                  : `rgba(59, 130, 246, ${Math.max(d.count / max, 0.15)})`,
            }}
            title={`${d.hour}:00 — ${d.count} tasks`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground">
        <span>12am</span>
        <span>6am</span>
        <span>12pm</span>
        <span>6pm</span>
        <span>11pm</span>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof ListTodo;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="p-4 bg-card border border-border rounded-lg">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

export function AnalyticsView() {
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview();
  const { data: trendsData, isLoading: trendsLoading } = useAnalyticsTrends();
  const { data: hourlyData, isLoading: hourlyLoading } = useAnalyticsHourly();

  const isLoading = overviewLoading || trendsLoading || hourlyLoading;

  const statusData = useMemo(() => {
    if (!overview?.byStatus) return [];
    const colors: Record<string, string> = {
      triage: 'bg-gray-400',
      backlog: 'bg-slate-400',
      in_progress: 'bg-blue-400',
      in_review: 'bg-purple-400',
      done: 'bg-green-400',
    };
    return Object.entries(overview.byStatus).map(([status, count]) => ({
      label: STATUS_LABELS[status as TaskStatus] || status,
      value: count,
      color: colors[status] || 'bg-gray-400',
    }));
  }, [overview]);

  const priorityData = useMemo(() => {
    if (!overview?.byPriority) return [];
    const colors: Record<string, string> = {
      urgent: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-400',
    };
    return Object.entries(overview.byPriority).map(([priority, count]) => ({
      label: PRIORITY_LABELS[priority as TaskPriority] || priority,
      value: count,
      color: colors[priority] || 'bg-gray-400',
    }));
  }, [overview]);

  const trendChartData = useMemo(() => {
    if (!trendsData?.trends) return [];
    return trendsData.trends.map((t) => ({ value: t.created + t.completed }));
  }, [trendsData]);

  const handleExport = (format: 'json' | 'csv') => {
    window.open(`/api/analytics?type=export&export=${format}`);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Task insights and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={ListTodo}
          label="Total Tasks"
          value={overview?.totalTasks ?? 0}
          sub={`${overview?.tasksThisWeek ?? 0} this week`}
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={overview?.completedTasks ?? 0}
          sub={`${overview?.completedThisWeek ?? 0} this week`}
        />
        <StatCard
          icon={Clock}
          label="Avg Completion"
          value={
            overview?.averageCompletionHours
              ? `${overview.averageCompletionHours}h`
              : '—'
          }
          sub="hours to complete"
        />
        <StatCard
          icon={Calendar}
          label="This Month"
          value={overview?.tasksThisMonth ?? 0}
          sub={`${overview?.completedThisMonth ?? 0} completed`}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status distribution */}
        <div className="p-4 bg-card border border-border rounded-lg">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            Status Distribution
          </h3>
          <BarChart data={statusData} />
        </div>

        {/* Priority breakdown */}
        <div className="p-4 bg-card border border-border rounded-lg">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            Priority Breakdown
          </h3>
          <BarChart data={priorityData} />
        </div>
      </div>

      {/* Trend + Heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activity trend */}
        <div className="p-4 bg-card border border-border rounded-lg">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            30-Day Activity Trend
          </h3>
          <MiniTrendChart data={trendChartData} />
          {trendsData?.trends && (
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>{trendsData.trends[0]?.date}</span>
              <span>{trendsData.trends[trendsData.trends.length - 1]?.date}</span>
            </div>
          )}
        </div>

        {/* Activity heatmap */}
        <div className="p-4 bg-card border border-border rounded-lg">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Most Active Hours
          </h3>
          {hourlyData?.hourly && <HeatmapRow data={hourlyData.hourly} />}
        </div>
      </div>

      {/* Completion trend table */}
      {trendsData?.trends && (
        <div className="p-4 bg-card border border-border rounded-lg">
          <h3 className="text-sm font-semibold mb-3">Daily Breakdown (Last 7 Days)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">Date</th>
                  <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">Created</th>
                  <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">Completed</th>
                  <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">Net</th>
                </tr>
              </thead>
              <tbody>
                {trendsData.trends.slice(-7).reverse().map((day) => (
                  <tr key={day.date} className="border-b border-border/50">
                    <td className="py-2 px-3 font-mono text-xs">{day.date}</td>
                    <td className="py-2 px-3 text-right text-green-400">{day.created}</td>
                    <td className="py-2 px-3 text-right text-blue-400">{day.completed}</td>
                    <td className={cn(
                      'py-2 px-3 text-right font-medium',
                      day.created - day.completed > 0 ? 'text-orange-400' : 'text-green-400'
                    )}>
                      {day.created - day.completed > 0 ? '+' : ''}{day.created - day.completed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
