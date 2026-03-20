// ============================================================
// Quick stats badges — task count overview
// ============================================================

'use client';

import { useMemo } from 'react';
import { useTasks } from '@/src/lib/hooks/use-tasks';
import { TASK_STATUSES, STATUS_LABELS, STATUS_COLORS } from '@/src/lib/types';
import { Badge } from '@/src/components/ui/badge';
import { cn } from '@/src/lib/utils';
import { AlertTriangle, CheckCircle2, Clock, Inbox, ListTodo } from 'lucide-react';

export function QuickStats() {
  const { data } = useTasks({ pageSize: 500 });

  const stats = useMemo(() => {
    if (!data?.data) return null;

    const byStatus: Record<string, number> = {};
    let urgentCount = 0;
    let myDayCount = 0;

    for (const task of data.data) {
      byStatus[task.status] = (byStatus[task.status] || 0) + 1;
      if (task.priority === 'urgent') urgentCount++;
      if (task.myDay) myDayCount++;
    }

    return {
      total: data.total,
      byStatus,
      urgentCount,
      myDayCount,
    };
  }, [data]);

  if (!stats) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Total */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ListTodo className="h-3.5 w-3.5" />
        <span>{stats.total} tasks</span>
      </div>

      <span className="text-border">·</span>

      {/* Status breakdown - compact */}
      {TASK_STATUSES.filter((s) => stats.byStatus[s]).map((s) => (
        <Badge key={s} className={cn('text-[10px]', STATUS_COLORS[s])}>
          {STATUS_LABELS[s]}: {stats.byStatus[s]}
        </Badge>
      ))}

      {/* Urgent count */}
      {stats.urgentCount > 0 && (
        <>
          <span className="text-border">·</span>
          <div className="flex items-center gap-1 text-xs text-red-400">
            <AlertTriangle className="h-3 w-3" />
            {stats.urgentCount} urgent
          </div>
        </>
      )}

      {/* My Day count */}
      {stats.myDayCount > 0 && (
        <>
          <span className="text-border">·</span>
          <div className="flex items-center gap-1 text-xs text-yellow-500">
            ☀️ {stats.myDayCount} today
          </div>
        </>
      )}
    </div>
  );
}
