// ============================================================
// Task list view with keyboard navigation & advanced filters
// ============================================================

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Badge } from '@/src/components/ui/badge';
import { AdvancedFilters } from '@/src/components/advanced-filters';
import { useTasks } from '@/src/lib/hooks/use-tasks';
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  STATUS_COLORS,
} from '@/src/lib/types';
import type { Task, TaskFilters } from '@/src/lib/types';
import { formatDate } from '@/src/lib/utils';
import { ArrowUpDown, Loader2, Sun } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface TaskListProps {
  onSelectTask: (task: Task) => void;
  selectedTaskId?: string | null;
  /** External filter overrides from command palette */
  externalFilters?: Partial<TaskFilters>;
  /** Keyboard-driven focused index */
  focusedIndex?: number;
  onFocusedIndexChange?: (index: number) => void;
}

export function TaskList({
  onSelectTask,
  selectedTaskId,
  externalFilters,
  focusedIndex = -1,
  onFocusedIndexChange,
}: TaskListProps) {
  const [filters, setFilters] = useState<TaskFilters>({
    status: 'all',
    priority: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
    search: '',
  });

  // Merge external filters
  const mergedFilters = { ...filters, ...externalFilters };
  const { data, isLoading, isError } = useTasks(mergedFilters);
  const tableRef = useRef<HTMLTableSectionElement>(null);

  // Sync URL params on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl: Partial<TaskFilters> = {};
    if (params.get('status')) fromUrl.status = params.get('status') as TaskFilters['status'];
    if (params.get('priority')) fromUrl.priority = params.get('priority') as TaskFilters['priority'];
    if (params.get('search')) fromUrl.search = params.get('search')!;
    if (Object.keys(fromUrl).length > 0) {
      setFilters((f) => ({ ...f, ...fromUrl }));
    }
  }, []);

  // Update URL when filters change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (mergedFilters.status && mergedFilters.status !== 'all') params.set('status', mergedFilters.status);
    if (mergedFilters.priority && mergedFilters.priority !== 'all') params.set('priority', mergedFilters.priority);
    if (mergedFilters.search) params.set('search', mergedFilters.search);
    if (mergedFilters.createdBy) params.set('createdBy', mergedFilters.createdBy);
    if (mergedFilters.dateFrom) params.set('dateFrom', mergedFilters.dateFrom);
    if (mergedFilters.dateTo) params.set('dateTo', mergedFilters.dateTo);
    const qs = params.toString();
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [mergedFilters]);

  // Scroll focused row into view
  useEffect(() => {
    if (focusedIndex >= 0 && tableRef.current) {
      const row = tableRef.current.children[focusedIndex] as HTMLElement;
      row?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex]);

  const toggleSort = (field: TaskFilters['sortBy']) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handleFiltersChange = useCallback((newFilters: TaskFilters) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Advanced filters */}
      <AdvancedFilters filters={mergedFilters} onFiltersChange={handleFiltersChange} />

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-12 text-destructive">
            Failed to load tasks. Try refreshing.
          </div>
        ) : !data?.data.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="mb-2">No tasks found.</p>
            <p className="text-xs">
              Press <kbd className="px-1 py-0.5 bg-muted rounded border border-border">⌘N</kbd> to create one
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-background border-b border-border">
              <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                <th
                  className="px-4 py-3 cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort('title')}
                >
                  <span className="inline-flex items-center gap-1">
                    Title <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="px-4 py-3 w-[120px]">Status</th>
                <th
                  className="px-4 py-3 w-[100px] cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort('priority')}
                >
                  <span className="inline-flex items-center gap-1">
                    Priority <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="px-4 py-3 w-[50px]" title="My Day">
                  <Sun className="h-3.5 w-3.5" />
                </th>
                <th
                  className="px-4 py-3 w-[120px] cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort('created_at')}
                >
                  <span className="inline-flex items-center gap-1">
                    Created <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody ref={tableRef}>
              {data.data.map((task, index) => (
                <tr
                  key={task.id}
                  className={cn(
                    'border-b border-border cursor-pointer transition-colors hover:bg-accent/50',
                    selectedTaskId === task.id && 'bg-accent/70',
                    focusedIndex === index && 'ring-2 ring-inset ring-primary/50 bg-accent/30'
                  )}
                  onClick={() => {
                    onSelectTask(task);
                    onFocusedIndexChange?.(index);
                  }}
                >
                  <td className="px-4 py-3 font-medium">{task.title}</td>
                  <td className="px-4 py-3">
                    <Badge className={STATUS_COLORS[task.status]}>
                      {STATUS_LABELS[task.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={PRIORITY_COLORS[task.priority]}>
                      {PRIORITY_LABELS[task.priority]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {task.myDay && (
                      <Sun className="h-4 w-4 text-yellow-500" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(task.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination info */}
      {data && (
        <div className="px-4 py-2 border-t border-border text-sm text-muted-foreground flex items-center justify-between">
          <span>
            {data.total} task{data.total !== 1 ? 's' : ''} total
          </span>
          {data.totalPages > 1 && (
            <span>
              Page {data.page} of {data.totalPages}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
