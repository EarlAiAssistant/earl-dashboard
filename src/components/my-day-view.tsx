// ============================================================
// "My Day" view — focused daily task management
// ============================================================

'use client';

import { useMemo } from 'react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import {
  useTasks,
  useUpdateTask,
  useRemoveFromMyDay,
  useAddToMyDay,
} from '@/src/lib/hooks/use-tasks';
import { toastSuccess } from '@/src/lib/hooks/use-toast';
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  STATUS_COLORS,
} from '@/src/lib/types';
import type { Task } from '@/src/lib/types';
import {
  Sun,
  CheckCircle2,
  X,
  Plus,
  Loader2,
  Inbox,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface MyDayViewProps {
  onSelectTask: (task: Task) => void;
  selectedTaskId?: string | null;
}

export function MyDayView({ onSelectTask, selectedTaskId }: MyDayViewProps) {
  // Fetch all tasks — we'll filter client-side for My Day
  const { data: allTasks, isLoading } = useTasks({ pageSize: 200 });
  const updateTask = useUpdateTask();
  const removeFromMyDay = useRemoveFromMyDay();
  const addToMyDay = useAddToMyDay();

  const { myDayTasks, suggestedTasks } = useMemo(() => {
    if (!allTasks?.data) return { myDayTasks: [], suggestedTasks: [] };

    const myDay = allTasks.data
      .filter((t) => t.myDay !== null)
      .sort((a, b) => (a.myDayOrder ?? 0) - (b.myDayOrder ?? 0));

    // Suggest tasks that are in_progress or in_review but not already in My Day
    const suggested = allTasks.data
      .filter(
        (t) =>
          !t.myDay &&
          t.status !== 'done' &&
          (t.status === 'in_progress' || t.status === 'in_review')
      )
      .slice(0, 5);

    return { myDayTasks: myDay, suggestedTasks: suggested };
  }, [allTasks]);

  const handleMarkDone = (task: Task) => {
    updateTask.mutate({ id: task.id, status: 'done' });
    toastSuccess(`"${task.title}" done!`, '✅ Great work!');
  };

  const handleRemove = (taskId: string) => {
    removeFromMyDay.mutate(taskId);
  };

  const handleAddSuggested = (taskId: string) => {
    addToMyDay.mutate(taskId);
    toastSuccess('Added to My Day');
  };

  const completedCount = myDayTasks.filter((t) => t.status === 'done').length;
  const totalCount = myDayTasks.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <Sun className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-bold">My Day</h2>
          {totalCount > 0 && (
            <Badge className="bg-primary/10 text-primary border-primary/20">
              {completedCount}/{totalCount}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        {totalCount > 0 && (
          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        )}
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-auto">
        {myDayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">No tasks for today</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Add tasks to your day to stay focused. Press <kbd className="px-1 py-0.5 bg-muted rounded border border-border text-xs">A</kbd> on any task, or add from suggestions below.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {myDayTasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  'flex items-center gap-3 px-6 py-3 hover:bg-accent/50 cursor-pointer transition-colors group',
                  selectedTaskId === task.id && 'bg-accent/70',
                  task.status === 'done' && 'opacity-60'
                )}
                onClick={() => onSelectTask(task)}
              >
                {/* Complete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkDone(task);
                  }}
                  className={cn(
                    'shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors',
                    task.status === 'done'
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-muted-foreground/30 hover:border-green-500'
                  )}
                >
                  {task.status === 'done' && <CheckCircle2 className="h-3 w-3" />}
                </button>

                {/* Task info */}
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium truncate', task.status === 'done' && 'line-through')}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge className={cn('text-[10px]', STATUS_COLORS[task.status])}>
                      {STATUS_LABELS[task.status]}
                    </Badge>
                    <Badge className={cn('text-[10px]', PRIORITY_COLORS[task.priority])}>
                      {PRIORITY_LABELS[task.priority]}
                    </Badge>
                  </div>
                </div>

                {/* Remove from My Day */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(task.id);
                  }}
                  className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                  title="Remove from My Day"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Suggestions */}
        {suggestedTasks.length > 0 && (
          <div className="px-6 py-4 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Suggested
              </span>
            </div>
            <div className="space-y-2">
              {suggestedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg border border-dashed border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{task.title}</p>
                    <span className="text-xs text-muted-foreground">
                      {STATUS_LABELS[task.status]}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddSuggested(task.id)}
                    className="shrink-0 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
