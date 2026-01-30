'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task, TaskStatus } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

const statusConfig = {
  backlog: { label: 'Backlog', color: 'bg-gray-700', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-700', icon: Loader2 },
  done: { label: 'Done', color: 'bg-green-700', icon: CheckCircle },
}

function TaskCard({ task, isDragging = false }: { task: Task; isDragging?: boolean }) {
  const config = statusConfig[task.status]
  const Icon = config.icon

  return (
    <div
      className={`p-3 md:p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-sm md:text-base text-white flex-1 pr-2">{task.title}</h3>
        <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </div>

      {task.description && (
        <p className="text-xs md:text-sm text-gray-400 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-1.5 md:gap-2 text-xs">
        {task.session_key && (
          <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-gray-700 text-gray-300 rounded text-[10px] md:text-xs">
            {task.session_key.substring(0, 8)}...
          </span>
        )}
        
        {task.started_at && (
          <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-blue-900/50 text-blue-300 rounded text-[10px] md:text-xs">
            Started {formatRelativeTime(task.started_at)}
          </span>
        )}
        
        {task.completed_at && (
          <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-green-900/50 text-green-300 rounded text-[10px] md:text-xs">
            Completed {formatRelativeTime(task.completed_at)}
          </span>
        )}
      </div>

      {task.metadata && Object.keys(task.metadata).length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          {task.metadata.type && (
            <span className="text-[10px] md:text-xs text-gray-500">Type: {task.metadata.type}</span>
          )}
          {task.metadata.tool && (
            <span className="text-[10px] md:text-xs text-gray-500 ml-2">Tool: {task.metadata.tool}</span>
          )}
        </div>
      )}
    </div>
  )
}

function SortableTaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} isDragging={isDragging} />
    </div>
  )
}

function Column({ status, tasks }: { status: TaskStatus; tasks: Task[] }) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="flex-1 min-w-full md:min-w-[300px]">
      <div className={`${config.color} rounded-lg p-3 md:p-4 mb-3 md:mb-4`}>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center">
            <Icon className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            <h2 className="font-semibold text-base md:text-lg">{config.label}</h2>
          </div>
          <span className="bg-white/20 px-2 py-1 rounded-full text-xs md:text-sm font-medium">
            {tasks.length}
          </span>
        </div>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 md:space-y-3">
          {tasks.length === 0 ? (
            <div className="p-4 md:p-8 text-center text-sm md:text-base text-gray-500 bg-gray-800/50 border border-gray-700 border-dashed rounded-lg">
              No tasks
            </div>
          ) : (
            tasks.map((task) => <SortableTaskCard key={task.id} task={task} />)
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tasks:', error)
    } else {
      setTasks(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()

    // Set up real-time subscription
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks()
      })
      .subscribe()

    // Poll for updates every 30 seconds as backup
    const interval = setInterval(fetchTasks, 30000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeTask = tasks.find((t) => t.id === active.id)
    if (!activeTask) return

    // Determine new status based on drop target
    let newStatus: TaskStatus | null = null
    const overTask = tasks.find((t) => t.id === over.id)
    
    if (overTask) {
      newStatus = overTask.status
    }

    if (newStatus && newStatus !== activeTask.status) {
      // Update task status
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          completed_at: newStatus === 'done' ? new Date().toISOString() : null,
        })
        .eq('id', activeTask.id)

      if (error) {
        console.error('Error updating task:', error)
      } else {
        fetchTasks()
      }
    }
  }

  const tasksByStatus = {
    backlog: tasks.filter((t) => t.status === 'backlog'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    done: tasks.filter((t) => t.status === 'done'),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:overflow-x-auto pb-4">
        <Column status="backlog" tasks={tasksByStatus.backlog} />
        <Column status="in_progress" tasks={tasksByStatus.in_progress} />
        <Column status="done" tasks={tasksByStatus.done} />
      </div>

      <DragOverlay>{activeTask ? <TaskCard task={activeTask} isDragging /> : null}</DragOverlay>
    </DndContext>
  )
}
