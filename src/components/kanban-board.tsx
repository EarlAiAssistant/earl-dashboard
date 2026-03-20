'use client';

import { useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useState } from 'react';
import { useTasks, useUpdateTask } from '@/src/lib/hooks/use-tasks';
import {
  TASK_STATUSES,
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
} from '@/src/lib/types';
import type { Task, TaskStatus } from '@/src/lib/types';
import { Badge } from '@/src/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface KanbanBoardProps {
  onSelectTask: (task: Task) => void;
}

export function KanbanBoard({ onSelectTask }: KanbanBoardProps) {
  const { data, isLoading, isError } = useTasks({ pageSize: 200 });
  const updateTask = useUpdateTask();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Group tasks by status
  const columns = useMemo(() => {
    const groups: Record<TaskStatus, Task[]> = {
      triage: [],
      backlog: [],
      in_progress: [],
      in_review: [],
      done: [],
    };
    if (data?.data) {
      for (const task of data.data) {
        groups[task.status].push(task);
      }
    }
    return groups;
  }, [data]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = data?.data.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    // The "over" target is the column droppable id (which is the status)
    const newStatus = over.id as TaskStatus;

    const task = data?.data.find((t) => t.id === taskId);
    if (task && task.status !== newStatus && TASK_STATUSES.includes(newStatus)) {
      updateTask.mutate({ id: taskId, status: newStatus });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12 text-destructive">
        Failed to load tasks.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 p-4 overflow-x-auto h-full">
        {TASK_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={columns[status]}
            onSelectTask={onSelectTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

// ---- Column Component ----

import { useDroppable } from '@dnd-kit/core';

function KanbanColumn({
  status,
  tasks,
  onSelectTask,
}: {
  status: TaskStatus;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col w-[280px] min-w-[280px] rounded-lg bg-secondary/30 border border-border',
        isOver && 'border-primary/50 bg-primary/5'
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Badge className={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>
        </div>
        <span className="text-xs text-muted-foreground font-medium">{tasks.length}</span>
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[100px]">
        {tasks.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4 italic">
            Drop tasks here
          </div>
        ) : (
          tasks.map((task) => (
            <DraggableCard key={task.id} task={task} onSelectTask={onSelectTask} />
          ))
        )}
      </div>
    </div>
  );
}

// ---- Draggable Card Wrapper ----

import { useDraggable } from '@dnd-kit/core';

function DraggableCard({
  task,
  onSelectTask,
}: {
  task: Task;
  onSelectTask: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(isDragging && 'opacity-30')}
    >
      <KanbanCard task={task} onClick={() => onSelectTask(task)} />
    </div>
  );
}

// ---- Card Component ----

function KanbanCard({
  task,
  isDragging,
  onClick,
}: {
  task: Task;
  isDragging?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        'p-3 rounded-md border border-border bg-card cursor-pointer',
        'hover:border-ring transition-colors shadow-sm',
        isDragging && 'shadow-lg rotate-2 border-primary'
      )}
      onClick={onClick}
    >
      <p className="text-sm font-medium mb-2 line-clamp-2">{task.title}</p>
      <div className="flex items-center gap-2">
        <Badge className={cn('text-[10px]', PRIORITY_COLORS[task.priority])}>
          {PRIORITY_LABELS[task.priority]}
        </Badge>
      </div>
    </div>
  );
}
