// ============================================================
// Task detail panel with enhanced activity timeline
// ============================================================

'use client';

import { useState } from 'react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { Textarea } from '@/src/components/ui/textarea';
import { ActivityTimeline } from '@/src/components/activity-timeline';
import {
  useTask,
  useUpdateTask,
  useDeleteTask,
  useAddToMyDay,
  useRemoveFromMyDay,
} from '@/src/lib/hooks/use-tasks';
import { toastSuccess, toastError } from '@/src/lib/hooks/use-toast';
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  STATUS_LABELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  STATUS_COLORS,
} from '@/src/lib/types';
import type { TaskStatus, TaskPriority } from '@/src/lib/types';
import { formatDateTime } from '@/src/lib/utils';
import {
  X,
  Pencil,
  Check,
  Trash2,
  Loader2,
  Clock,
  User,
  Sun,
  SunDim,
  Archive,
  Bot,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface TaskDetailPanelProps {
  taskId: string;
  onClose: () => void;
}

export function TaskDetailPanel({ taskId, onClose }: TaskDetailPanelProps) {
  const { data: task, isLoading, isError } = useTask(taskId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const addToMyDay = useAddToMyDay();
  const removeFromMyDay = useRemoveFromMyDay();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="h-full flex items-center justify-center text-destructive">
        Failed to load task
      </div>
    );
  }

  const startEdit = (field: string) => {
    if (field === 'title') setEditTitle(task.title);
    if (field === 'description') setEditDescription(task.description || '');
    setEditingField(field);
  };

  const saveEdit = async (field: string) => {
    if (field === 'title' && editTitle.trim()) {
      await updateTask.mutateAsync({ id: taskId, title: editTitle.trim() });
      toastSuccess('Title updated');
    }
    if (field === 'description') {
      await updateTask.mutateAsync({ id: taskId, description: editDescription.trim() || null });
      toastSuccess('Description updated');
    }
    setEditingField(null);
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateTask.mutate({ id: taskId, status: newStatus });
    toastSuccess('Status updated', `→ ${STATUS_LABELS[newStatus]}`);
  };

  const handlePriorityChange = (newPriority: TaskPriority) => {
    updateTask.mutate({ id: taskId, priority: newPriority });
    toastSuccess('Priority updated', `→ ${PRIORITY_LABELS[newPriority]}`);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task? This cannot be undone.')) return;
    await deleteTask.mutateAsync(taskId);
    toastSuccess('Task deleted');
    onClose();
  };

  const handleArchive = () => {
    updateTask.mutate({ id: taskId, archived: true } as never);
    toastSuccess('Task archived');
    onClose();
  };

  const handleToggleMyDay = () => {
    if (task.myDay) {
      removeFromMyDay.mutate(taskId);
      toastSuccess('Removed from My Day');
    } else {
      addToMyDay.mutate(taskId);
      toastSuccess('Added to My Day', '☀️');
    }
  };

  return (
    <div className="h-full flex flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground uppercase">{task.id}</span>
          {task.createdBy === 'earl' && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
              <Bot className="h-3 w-3" />
              Earl
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleMyDay}
            title={task.myDay ? 'Remove from My Day' : 'Add to My Day (A)'}
            className={cn(task.myDay && 'text-yellow-500')}
          >
            {task.myDay ? <Sun className="h-4 w-4" /> : <SunDim className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleArchive} title="Archive task">
            <Archive className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDelete} title="Delete task">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} title="Close (Esc)">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Title */}
        <div>
          {editingField === 'title' ? (
            <div className="flex gap-2">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit('title');
                  if (e.key === 'Escape') setEditingField(null);
                }}
              />
              <Button size="icon" variant="ghost" onClick={() => saveEdit('title')}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <h2
              className="text-xl font-semibold cursor-pointer hover:text-primary group flex items-center gap-2"
              onClick={() => startEdit('title')}
            >
              {task.title}
              <Pencil className="h-3.5 w-3.5 opacity-0 group-hover:opacity-50" />
            </h2>
          )}
        </div>

        {/* Status & Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase mb-2 flex items-center gap-2">
              Status
              <kbd className="px-1 py-0.5 text-[9px] bg-muted rounded border border-border">1-5</kbd>
            </label>
            <Select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase mb-2 flex items-center gap-2">
              Priority
              <kbd className="px-1 py-0.5 text-[9px] bg-muted rounded border border-border">P</kbd>
            </label>
            <Select
              value={task.priority}
              onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
            >
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </Select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase mb-2 block">Description</label>
          {editingField === 'description' ? (
            <div className="space-y-2">
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => saveEdit('description')}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingField(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div
              className="min-h-[60px] p-3 rounded-md border border-border cursor-pointer hover:border-ring transition-colors text-sm whitespace-pre-wrap"
              onClick={() => startEdit('description')}
            >
              {task.description || (
                <span className="text-muted-foreground italic">Click to add description...</span>
              )}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            <span>
              Created by{' '}
              <strong className="text-foreground">
                {task.createdBy === 'earl' ? '🤖 Earl' : task.createdBy}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            <span>Created {formatDateTime(task.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            <span>Updated {formatDateTime(task.updatedAt)}</span>
          </div>
          {task.completedAt && (
            <div className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span>Completed {formatDateTime(task.completedAt)}</span>
            </div>
          )}
          {task.myDay && (
            <div className="flex items-center gap-2">
              <Sun className="h-3.5 w-3.5 text-yellow-500" />
              <span>In My Day since {formatDateTime(task.myDay)}</span>
            </div>
          )}
        </div>

        {/* Quick action hints */}
        <div className="flex flex-wrap gap-2 pt-2">
          <kbd className="px-2 py-1 text-[10px] bg-muted rounded border border-border text-muted-foreground">D = Done</kbd>
          <kbd className="px-2 py-1 text-[10px] bg-muted rounded border border-border text-muted-foreground">A = My Day</kbd>
          <kbd className="px-2 py-1 text-[10px] bg-muted rounded border border-border text-muted-foreground">P = Priority</kbd>
        </div>

        {/* Activity Timeline */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase mb-3 block">
            Activity Log
          </label>
          <ActivityTimeline taskId={taskId} compact />
        </div>
      </div>
    </div>
  );
}
