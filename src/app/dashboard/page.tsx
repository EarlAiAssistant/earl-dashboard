'use client';

import { useState } from 'react';
import { TaskList } from '@/src/components/task-list';
import { KanbanBoard } from '@/src/components/kanban-board';
import { TaskDetailPanel } from '@/src/components/task-detail-panel';
import { CreateTaskDialog } from '@/src/components/create-task-dialog';
import { Button } from '@/src/components/ui/button';
import type { Task } from '@/src/lib/types';
import { LayoutList, Columns3 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type ViewMode = 'list' | 'kanban';

export default function DashboardPage() {
  const [view, setView] = useState<ViewMode>('list');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseDetail = () => {
    setSelectedTask(null);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold tracking-tight">Earl Dashboard</h1>
          <span className="text-xs text-muted-foreground">Task Management</span>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center border border-border rounded-md overflow-hidden">
            <button
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5',
                view === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent text-muted-foreground'
              )}
              onClick={() => setView('list')}
            >
              <LayoutList className="h-3.5 w-3.5" />
              List
            </button>
            <button
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5',
                view === 'kanban'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent text-muted-foreground'
              )}
              onClick={() => setView('kanban')}
            >
              <Columns3 className="h-3.5 w-3.5" />
              Board
            </button>
          </div>

          <CreateTaskDialog />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Task view */}
        <div className="flex-1 overflow-hidden">
          {view === 'list' ? (
            <TaskList onSelectTask={handleSelectTask} selectedTaskId={selectedTask?.id} />
          ) : (
            <KanbanBoard onSelectTask={handleSelectTask} />
          )}
        </div>

        {/* Detail panel (slides in) */}
        {selectedTask && (
          <div className="w-[400px] min-w-[400px] max-w-[400px] border-l border-border overflow-hidden">
            <TaskDetailPanel taskId={selectedTask.id} onClose={handleCloseDetail} />
          </div>
        )}
      </div>
    </div>
  );
}
