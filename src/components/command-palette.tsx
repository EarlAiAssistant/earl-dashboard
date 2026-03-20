// ============================================================
// Command Palette — Cmd+K powered by cmdk
// ============================================================

'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { Command } from 'cmdk';
import { useTasks, useUpdateTask } from '@/src/lib/hooks/use-tasks';
import { toastSuccess } from '@/src/lib/hooks/use-toast';
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  STATUS_LABELS,
  PRIORITY_LABELS,
} from '@/src/lib/types';
import type { TaskStatus, TaskPriority, Task } from '@/src/lib/types';
import {
  Plus,
  Search,
  Filter,
  LayoutList,
  Columns3,
  Sun,
  Keyboard,
  CheckCircle2,
  ArrowRight,
  Zap,
  Tag,
  CircleDot,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask: () => void;
  onToggleView: () => void;
  onNavigateMyDay: () => void;
  onShowShortcuts: () => void;
  onFilterStatus: (status: TaskStatus | 'all') => void;
  onFilterPriority: (priority: TaskPriority | 'all') => void;
  onSelectTask: (task: Task) => void;
  currentView: string;
}

export function CommandPalette({
  open,
  onOpenChange,
  onCreateTask,
  onToggleView,
  onNavigateMyDay,
  onShowShortcuts,
  onFilterStatus,
  onFilterPriority,
  onSelectTask,
  currentView,
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [pages, setPages] = useState<string[]>([]);
  const page = pages[pages.length - 1];

  const { data: tasksData } = useTasks({ pageSize: 200, search: search || undefined });
  const updateTask = useUpdateTask();

  // Reset search when opening
  useEffect(() => {
    if (open) {
      setSearch('');
      setPages([]);
    }
  }, [open]);

  const runAction = useCallback(
    (fn: () => void) => {
      fn();
      onOpenChange(false);
    },
    [onOpenChange]
  );

  const handleStatusUpdate = useCallback(
    (taskId: string, taskTitle: string, status: TaskStatus) => {
      updateTask.mutate({ id: taskId, status });
      toastSuccess(`Updated "${taskTitle}"`, `Status → ${STATUS_LABELS[status]}`);
      onOpenChange(false);
    },
    [updateTask, onOpenChange]
  );

  // Filtered task results for search
  const searchResults = useMemo(() => {
    if (!search || search.length < 2) return [];
    return tasksData?.data?.slice(0, 8) || [];
  }, [search, tasksData]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Command dialog */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl">
        <Command
          className="rounded-xl border border-border bg-popover shadow-2xl overflow-hidden"
          onKeyDown={(e) => {
            // Go back with backspace on empty search
            if (e.key === 'Backspace' && !search && pages.length > 0) {
              e.preventDefault();
              setPages((p) => p.slice(0, -1));
            }
            if (e.key === 'Escape') {
              if (pages.length > 0) {
                setPages((p) => p.slice(0, -1));
              } else {
                onOpenChange(false);
              }
            }
          }}
        >
          {/* Input */}
          <div className="flex items-center border-b border-border px-4">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder={
                page === 'status'
                  ? 'Filter by status...'
                  : page === 'priority'
                  ? 'Filter by priority...'
                  : page === 'quick-status'
                  ? 'Select task to update...'
                  : 'Type a command or search...'
              }
              className="flex-1 h-12 px-3 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            {!page && (
              <>
                {/* Search results */}
                {searchResults.length > 0 && (
                  <Command.Group heading="Tasks">
                    {searchResults.map((task) => (
                      <Command.Item
                        key={task.id}
                        value={`task-${task.title}`}
                        onSelect={() => runAction(() => onSelectTask(task))}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm aria-selected:bg-accent"
                      >
                        <CircleDot className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="truncate">{task.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {STATUS_LABELS[task.status]}
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {/* Actions */}
                <Command.Group heading="Actions">
                  <CommandItem
                    icon={<Plus className="h-4 w-4" />}
                    label="Create new task"
                    shortcut="⌘N"
                    onSelect={() => runAction(onCreateTask)}
                  />
                  <CommandItem
                    icon={currentView === 'list' ? <Columns3 className="h-4 w-4" /> : <LayoutList className="h-4 w-4" />}
                    label={`Switch to ${currentView === 'list' ? 'Board' : currentView === 'kanban' ? 'List' : 'List'} view`}
                    onSelect={() => runAction(onToggleView)}
                  />
                  <CommandItem
                    icon={<Sun className="h-4 w-4" />}
                    label="Go to My Day"
                    shortcut="⌘D"
                    onSelect={() => runAction(onNavigateMyDay)}
                  />
                  <CommandItem
                    icon={<Zap className="h-4 w-4" />}
                    label="Quick status update"
                    onSelect={() => setPages([...pages, 'quick-status'])}
                  />
                </Command.Group>

                {/* Filters */}
                <Command.Group heading="Filters">
                  <CommandItem
                    icon={<Filter className="h-4 w-4" />}
                    label="Filter by status"
                    onSelect={() => setPages([...pages, 'status'])}
                  />
                  <CommandItem
                    icon={<Tag className="h-4 w-4" />}
                    label="Filter by priority"
                    onSelect={() => setPages([...pages, 'priority'])}
                  />
                </Command.Group>

                {/* Help */}
                <Command.Group heading="Help">
                  <CommandItem
                    icon={<Keyboard className="h-4 w-4" />}
                    label="Keyboard shortcuts"
                    shortcut="⌘/"
                    onSelect={() => runAction(onShowShortcuts)}
                  />
                </Command.Group>
              </>
            )}

            {/* Status sub-page */}
            {page === 'status' && (
              <Command.Group heading="Filter by Status">
                <CommandItem
                  icon={<ArrowRight className="h-4 w-4" />}
                  label="All statuses"
                  onSelect={() => runAction(() => onFilterStatus('all'))}
                />
                {TASK_STATUSES.map((s) => (
                  <CommandItem
                    key={s}
                    icon={<ArrowRight className="h-4 w-4" />}
                    label={STATUS_LABELS[s]}
                    onSelect={() => runAction(() => onFilterStatus(s))}
                  />
                ))}
              </Command.Group>
            )}

            {/* Priority sub-page */}
            {page === 'priority' && (
              <Command.Group heading="Filter by Priority">
                <CommandItem
                  icon={<ArrowRight className="h-4 w-4" />}
                  label="All priorities"
                  onSelect={() => runAction(() => onFilterPriority('all'))}
                />
                {TASK_PRIORITIES.map((p) => (
                  <CommandItem
                    key={p}
                    icon={<ArrowRight className="h-4 w-4" />}
                    label={PRIORITY_LABELS[p]}
                    onSelect={() => runAction(() => onFilterPriority(p))}
                  />
                ))}
              </Command.Group>
            )}

            {/* Quick status update sub-page */}
            {page === 'quick-status' && tasksData?.data && (
              <Command.Group heading="Select task to update status">
                {tasksData.data
                  .filter((t) => t.status !== 'done')
                  .slice(0, 15)
                  .map((task) => (
                    <CommandItem
                      key={task.id}
                      icon={<CheckCircle2 className="h-4 w-4" />}
                      label={task.title}
                      sublabel={`${STATUS_LABELS[task.status]} → Done`}
                      onSelect={() => handleStatusUpdate(task.id, task.title, 'done')}
                    />
                  ))}
              </Command.Group>
            )}
          </Command.List>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border text-[10px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-muted rounded border border-border">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-muted rounded border border-border">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-muted rounded border border-border">esc</kbd>
                Close
              </span>
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
}

// ---- Reusable command item ----

function CommandItem({
  icon,
  label,
  sublabel,
  shortcut,
  onSelect,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  shortcut?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      value={label}
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm aria-selected:bg-accent"
    >
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <span>{label}</span>
        {sublabel && (
          <span className="ml-2 text-xs text-muted-foreground">{sublabel}</span>
        )}
      </div>
      {shortcut && (
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  );
}
