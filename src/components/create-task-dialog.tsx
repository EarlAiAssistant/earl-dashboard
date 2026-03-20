// ============================================================
// Create task dialog with template support
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { Textarea } from '@/src/components/ui/textarea';
import { useCreateTask } from '@/src/lib/hooks/use-tasks';
import { toastSuccess, toastError } from '@/src/lib/hooks/use-toast';
import { TASK_STATUSES, TASK_PRIORITIES, STATUS_LABELS, PRIORITY_LABELS } from '@/src/lib/types';
import type { TaskStatus, TaskPriority, TaskTemplate } from '@/src/lib/types';
import { Plus, X, FileText } from 'lucide-react';
import { TemplatePicker } from '@/src/components/template-picker';

interface CreateTaskDialogProps {
  /** Controlled open state */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateTaskDialog({ open: controlledOpen, onOpenChange }: CreateTaskDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('triage');
  const [priority, setPriority] = useState<TaskPriority>('medium');

  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const createTask = useCreateTask();

  // Reset form when closing
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setStatus('triage');
      setPriority('medium');
    }
  }, [isOpen]);

  const handleTemplateSelect = (template: TaskTemplate) => {
    setTitle(template.titleTemplate || '');
    setDescription(template.descriptionTemplate || '');
    setStatus(template.defaultStatus);
    setPriority(template.defaultPriority);
    setShowTemplatePicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createTask.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
      });

      toastSuccess('Task created', title.trim());
      setOpen(false);
    } catch (err) {
      toastError('Failed to create task', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Button to open (only when uncontrolled)
  if (!controlledOpen && !isOpen) {
    return (
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="h-4 w-4 mr-1" />
        New Task
      </Button>
    );
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Create Task</h2>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTemplatePicker(true)}
                className="text-xs"
              >
                <FileText className="h-3.5 w-3.5 mr-1" />
                Template
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title..."
                autoFocus
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the task..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Status</label>
                <Select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
                  {TASK_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Priority</label>
                <Select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
                  {TASK_PRIORITIES.map((p) => (
                    <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTask.isPending || !title.trim()}>
                {createTask.isPending ? 'Creating...' : 'Create Task'}
              </Button>
            </div>

            {createTask.isError && (
              <p className="text-sm text-destructive">
                {createTask.error.message}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Template picker overlay */}
      {showTemplatePicker && (
        <TemplatePicker
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}
    </>
  );
}
