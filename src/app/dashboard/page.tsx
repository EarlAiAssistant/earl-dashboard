// ============================================================
// Dashboard page — orchestrates views, command palette, shortcuts
// Phase 3: Added analytics, activity log, notifications, settings
// ============================================================

'use client';

import { useState, useCallback, useMemo } from 'react';
import { TaskList } from '@/src/components/task-list';
import { KanbanBoard } from '@/src/components/kanban-board';
import { MyDayView } from '@/src/components/my-day-view';
import { TaskDetailPanel } from '@/src/components/task-detail-panel';
import { CreateTaskDialog } from '@/src/components/create-task-dialog';
import { CommandPalette } from '@/src/components/command-palette';
import { ShortcutsModal } from '@/src/components/shortcuts-modal';
import { ToastContainer } from '@/src/components/toast-container';
import { QuickStats } from '@/src/components/quick-stats';
import { NotificationCenter } from '@/src/components/notification-center';
import { AnalyticsView } from '@/src/components/analytics-view';
import { ActivityTimeline } from '@/src/components/activity-timeline';
import { SettingsPanel } from '@/src/components/settings-panel';
import { Button } from '@/src/components/ui/button';
import { useKeyboardShortcuts, type ShortcutAction } from '@/src/lib/hooks/use-keyboard-shortcuts';
import { useTasks, useUpdateTask, useAddToMyDay, useRemoveFromMyDay } from '@/src/lib/hooks/use-tasks';
import { toastSuccess } from '@/src/lib/hooks/use-toast';
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  STATUS_LABELS,
  PRIORITY_LABELS,
} from '@/src/lib/types';
import type { Task, TaskStatus, TaskPriority, TaskFilters } from '@/src/lib/types';
import {
  LayoutList,
  Columns3,
  Sun,
  Command,
  Keyboard,
  BarChart3,
  History,
  Settings,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

type ViewMode = 'list' | 'kanban' | 'myday' | 'analytics' | 'activity';

export default function DashboardPage() {
  const [view, setView] = useState<ViewMode>('list');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [externalFilters, setExternalFilters] = useState<Partial<TaskFilters>>({});

  const { data: tasksData } = useTasks({ pageSize: 200 });
  const updateTask = useUpdateTask();
  const addToMyDay = useAddToMyDay();
  const removeFromMyDay = useRemoveFromMyDay();

  const taskList = useMemo(() => tasksData?.data || [], [tasksData]);

  const handleSelectTask = useCallback((task: Task) => {
    setSelectedTask(task);
    const idx = taskList.findIndex((t) => t.id === task.id);
    if (idx >= 0) setFocusedIndex(idx);
  }, [taskList]);

  const handleSelectTaskById = useCallback((taskId: string) => {
    const task = taskList.find((t) => t.id === taskId);
    if (task) handleSelectTask(task);
  }, [taskList, handleSelectTask]);

  const handleCloseDetail = useCallback(() => {
    setSelectedTask(null);
  }, []);

  const toggleView = useCallback(() => {
    setView((v) => {
      if (v === 'list') return 'kanban';
      if (v === 'kanban') return 'list';
      return 'list';
    });
  }, []);

  const navigateMyDay = useCallback(() => {
    setView('myday');
  }, []);

  // ---- Keyboard shortcuts ----
  const shortcuts: ShortcutAction[] = useMemo(
    () => [
      { key: 'k', meta: true, handler: () => setCommandPaletteOpen((o) => !o) },
      { key: 'n', meta: true, handler: () => setCreateDialogOpen(true) },
      { key: '/', meta: true, handler: () => setShortcutsOpen((o) => !o) },
      {
        key: 'Escape',
        handler: () => {
          if (commandPaletteOpen) setCommandPaletteOpen(false);
          else if (shortcutsOpen) setShortcutsOpen(false);
          else if (settingsOpen) setSettingsOpen(false);
          else if (createDialogOpen) setCreateDialogOpen(false);
          else if (selectedTask) setSelectedTask(null);
        },
      },
      {
        key: 'j',
        requireNoFocus: true,
        handler: () => {
          if (view !== 'list' || commandPaletteOpen || createDialogOpen) return;
          const next = Math.min(focusedIndex + 1, taskList.length - 1);
          setFocusedIndex(next);
          if (taskList[next]) setSelectedTask(taskList[next]);
        },
      },
      {
        key: 'k',
        requireNoFocus: true,
        handler: () => {
          if (view !== 'list' || commandPaletteOpen || createDialogOpen) return;
          const prev = Math.max(focusedIndex - 1, 0);
          setFocusedIndex(prev);
          if (taskList[prev]) setSelectedTask(taskList[prev]);
        },
      },
      {
        key: 'Enter',
        requireNoFocus: true,
        handler: () => {
          if (focusedIndex >= 0 && taskList[focusedIndex]) {
            setSelectedTask(taskList[focusedIndex]);
          }
        },
      },
      ...TASK_STATUSES.map((status, i) => ({
        key: String(i + 1),
        requireNoFocus: true,
        handler: () => {
          if (!selectedTask || commandPaletteOpen) return;
          updateTask.mutate({ id: selectedTask.id, status });
          toastSuccess('Status updated', `→ ${STATUS_LABELS[status]}`);
        },
      })),
      {
        key: 'd',
        requireNoFocus: true,
        handler: () => {
          if (!selectedTask || commandPaletteOpen) return;
          updateTask.mutate({ id: selectedTask.id, status: 'done' });
          toastSuccess('Marked done!', '✅');
        },
      },
      {
        key: 'p',
        requireNoFocus: true,
        handler: () => {
          if (!selectedTask || commandPaletteOpen) return;
          const currentIdx = TASK_PRIORITIES.indexOf(selectedTask.priority);
          const nextPriority = TASK_PRIORITIES[(currentIdx + 1) % TASK_PRIORITIES.length];
          updateTask.mutate({ id: selectedTask.id, priority: nextPriority });
          toastSuccess('Priority updated', `→ ${PRIORITY_LABELS[nextPriority]}`);
          setSelectedTask({ ...selectedTask, priority: nextPriority });
        },
      },
      {
        key: 'a',
        requireNoFocus: true,
        handler: () => {
          if (!selectedTask || commandPaletteOpen) return;
          if (selectedTask.myDay) {
            removeFromMyDay.mutate(selectedTask.id);
            toastSuccess('Removed from My Day');
            setSelectedTask({ ...selectedTask, myDay: null, myDayOrder: null });
          } else {
            addToMyDay.mutate(selectedTask.id);
            toastSuccess('Added to My Day', '☀️');
            setSelectedTask({ ...selectedTask, myDay: new Date().toISOString(), myDayOrder: 999 });
          }
        },
      },
      { key: 's', meta: true, handler: () => { /* Prevent default browser save */ } },
    ],
    [
      commandPaletteOpen,
      shortcutsOpen,
      settingsOpen,
      createDialogOpen,
      selectedTask,
      focusedIndex,
      taskList,
      view,
      updateTask,
      addToMyDay,
      removeFromMyDay,
    ]
  );

  useKeyboardShortcuts(shortcuts);

  const handleFilterStatus = useCallback((status: TaskStatus | 'all') => {
    setView('list');
    setExternalFilters((f) => ({ ...f, status }));
  }, []);

  const handleFilterPriority = useCallback((priority: TaskPriority | 'all') => {
    setView('list');
    setExternalFilters((f) => ({ ...f, priority }));
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold tracking-tight">Earl Dashboard</h1>

          {/* View tabs */}
          <div className="flex items-center border border-border rounded-md overflow-hidden">
            {[
              { id: 'list' as const, icon: LayoutList, label: 'List' },
              { id: 'kanban' as const, icon: Columns3, label: 'Board' },
              { id: 'myday' as const, icon: Sun, label: 'My Day' },
              { id: 'activity' as const, icon: History, label: 'Activity' },
              { id: 'analytics' as const, icon: BarChart3, label: 'Analytics' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5',
                  view === id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent text-muted-foreground'
                )}
                onClick={() => setView(id)}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick stats */}
          <div className="hidden lg:block">
            <QuickStats />
          </div>

          {/* Notifications */}
          <NotificationCenter onSelectTask={handleSelectTaskById} />

          {/* Command palette trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground border border-border rounded-md hover:bg-accent transition-colors"
          >
            <Command className="h-3.5 w-3.5" />
            <span>Command</span>
            <kbd className="px-1 py-0.5 text-[10px] font-mono bg-muted rounded border border-border">⌘K</kbd>
          </button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            title="Settings"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
          </Button>

          {/* Shortcuts help */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShortcutsOpen(true)}
            title="Keyboard shortcuts (⌘/)"
            className="hidden sm:flex"
          >
            <Keyboard className="h-4 w-4 text-muted-foreground" />
          </Button>

          <CreateTaskDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main view */}
        <div className="flex-1 overflow-hidden">
          {view === 'list' ? (
            <TaskList
              onSelectTask={handleSelectTask}
              selectedTaskId={selectedTask?.id}
              externalFilters={externalFilters}
              focusedIndex={focusedIndex}
              onFocusedIndexChange={setFocusedIndex}
            />
          ) : view === 'kanban' ? (
            <KanbanBoard onSelectTask={handleSelectTask} />
          ) : view === 'myday' ? (
            <MyDayView onSelectTask={handleSelectTask} selectedTaskId={selectedTask?.id} />
          ) : view === 'analytics' ? (
            <AnalyticsView />
          ) : view === 'activity' ? (
            <div className="p-6 overflow-auto h-full">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                  <History className="h-5 w-5" />
                  Activity Log
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Full audit trail of all task changes and actions
                </p>
                <ActivityTimeline showFilters showExport />
              </div>
            </div>
          ) : null}
        </div>

        {/* Detail panel (slides in) */}
        {selectedTask && (view === 'list' || view === 'kanban' || view === 'myday') && (
          <div className="w-[400px] min-w-[400px] max-w-[400px] border-l border-border overflow-hidden">
            <TaskDetailPanel taskId={selectedTask.id} onClose={handleCloseDetail} />
          </div>
        )}
      </div>

      {/* Overlays */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onCreateTask={() => setCreateDialogOpen(true)}
        onToggleView={toggleView}
        onNavigateMyDay={navigateMyDay}
        onShowShortcuts={() => setShortcutsOpen(true)}
        onFilterStatus={handleFilterStatus}
        onFilterPriority={handleFilterPriority}
        onSelectTask={handleSelectTask}
        currentView={view}
      />
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ToastContainer />
    </div>
  );
}
