'use client';

import { useState } from 'react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { Textarea } from '@/src/components/ui/textarea';
import { useTask, useUpdateTask, useDeleteTask } from '@/src/lib/hooks/use-tasks';
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
import { X, Pencil, Check, Trash2, Loader2, Clock, User } from 'lucide-react';

interface TaskDetailPanelProps {
  taskId: string;
  onClose: () => void;
}

export function TaskDetailPanel({ taskId, onClose }: TaskDetailPanelProps) {
  const { data: task, isLoading, isError } = useTask(taskId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  // Edit state
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
    }
    if (field === 'description') {
      await updateTask.mutateAsync({ id: taskId, description: editDescription.trim() || null });
    }
    setEditingField(null);
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateTask.mutate({ id: taskId, status: newStatus });
  };

  const handlePriorityChange = (newPriority: TaskPriority) => {
    updateTask.mutate({ id: taskId, priority: newPriority });
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task? This cannot be undone.')) return;
    await deleteTask.mutateAsync(taskId);
    onClose();
  };

  return (
    <div className="h-full flex flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <span className="text-xs font-mono text-muted-foreground uppercase">{task.id}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleDelete} title="Delete task">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
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
                onKeyDown={(e) => e.key === 'Enter' && saveEdit('title')}
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
            <label className="text-xs font-medium text-muted-foreground uppercase mb-2 block">Status</label>
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
            <label className="text-xs font-medium text-muted-foreground uppercase mb-2 block">Priority</label>
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
              className="min-h-[60px] p-3 rounded-md border border-border cursor-pointer hover:border-ring transition-colors text-sm"
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
            <span>Created by <strong className="text-foreground">{task.createdBy}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            <span>Created {formatDateTime(task.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            <span>Updated {formatDateTime(task.updatedAt)}</span>
          </div>
        </div>

        {/* Activity Log */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase mb-3 block">
            Activity Log
          </label>
          {task.activities && task.activities.length > 0 ? (
            <div className="space-y-3">
              {task.activities.map((activity) => {
                let details = '';
                try {
                  const parsed = JSON.parse(activity.details || '{}');
                  if (parsed.changes) {
                    details = parsed.changes.join(', ');
                  } else {
                    details = activity.details || '';
                  }
                } catch {
                  details = activity.details || '';
                }

                return (
                  <div
                    key={activity.id}
                    className="flex gap-3 text-sm border-l-2 border-border pl-3 py-1"
                  >
                    <div className="flex-1">
                      <span className="font-medium capitalize">{activity.action}</span>
                      {details && (
                        <span className="text-muted-foreground"> — {details}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(activity.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No activity yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
