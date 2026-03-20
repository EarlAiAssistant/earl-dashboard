'use client';

import { useState } from 'react';
import { Badge } from '@/src/components/ui/badge';
import { Select } from '@/src/components/ui/select';
import { Input } from '@/src/components/ui/input';
import { useTasks } from '@/src/lib/hooks/use-tasks';
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  STATUS_LABELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  STATUS_COLORS,
} from '@/src/lib/types';
import type { Task, TaskStatus, TaskPriority, TaskFilters } from '@/src/lib/types';
import { formatDate } from '@/src/lib/utils';
import { ArrowUpDown, Search, Loader2 } from 'lucide-react';

interface TaskListProps {
  onSelectTask: (task: Task) => void;
  selectedTaskId?: string | null;
}

export function TaskList({ onSelectTask, selectedTaskId }: TaskListProps) {
  const [filters, setFilters] = useState<TaskFilters>({
    status: 'all',
    priority: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
    search: '',
  });

  const { data, isLoading, isError } = useTasks(filters);

  const toggleSort = (field: TaskFilters['sortBy']) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filters bar */}
      <div className="flex flex-wrap gap-2 p-4 border-b border-border">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={filters.search || ''}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="Search tasks..."
            className="pl-8"
          />
        </div>
        <Select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as TaskStatus | 'all' }))}
          className="w-[140px]"
        >
          <option value="all">All Status</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </Select>
        <Select
          value={filters.priority}
          onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value as TaskPriority | 'all' }))}
          className="w-[140px]"
        >
          <option value="all">All Priority</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
          ))}
        </Select>
      </div>

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
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            No tasks found. Create one to get started!
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
            <tbody>
              {data.data.map((task) => (
                <tr
                  key={task.id}
                  className={`border-b border-border cursor-pointer transition-colors hover:bg-accent/50
                    ${selectedTaskId === task.id ? 'bg-accent/70' : ''}`}
                  onClick={() => onSelectTask(task)}
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
      {data && data.totalPages > 1 && (
        <div className="px-4 py-2 border-t border-border text-sm text-muted-foreground flex items-center justify-between">
          <span>
            {data.total} task{data.total !== 1 ? 's' : ''} total
          </span>
          <span>
            Page {data.page} of {data.totalPages}
          </span>
        </div>
      )}
    </div>
  );
}
