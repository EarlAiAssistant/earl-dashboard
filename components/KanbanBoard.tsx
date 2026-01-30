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
  useDroppable,
  DragOverEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Clock, CheckCircle, AlertCircle, Loader2, Plus, X } from 'lucide-react'

const statusConfig = {
  backlog: { label: 'Backlog', color: 'bg-gray-700', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-700', icon: Loader2 },
  done: { label: 'Done', color: 'bg-green-700', icon: CheckCircle },
}

function TaskCard({ task, isDragging = false, onClick }: { task: Task; isDragging?: boolean; onClick?: () => void }) {
  const config = statusConfig[task.status]
  const Icon = config.icon

  return (
    <div
      onClick={onClick}
      className={`p-3 md:p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        isDragging ? 'opacity-50 cursor-grabbing' : ''
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

function SortableTaskCard({ task, onView }: { task: Task; onView: (task: Task) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleClick = () => {
    // Only open detail if not dragging
    if (!isDragging) {
      onView(task)
    }
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} isDragging={isDragging} onClick={handleClick} />
    </div>
  )
}

function Column({ status, tasks, isOver, onViewTask }: { 
  status: TaskStatus; 
  tasks: Task[]; 
  isOver?: boolean;
  onViewTask: (task: Task) => void;
}) {
  const config = statusConfig[status]
  const Icon = config.icon
  const { setNodeRef } = useDroppable({
    id: status,
  })

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

      <div 
        ref={setNodeRef}
        className={`min-h-[200px] rounded-lg transition-colors ${
          isOver ? 'bg-blue-900/20 border-2 border-blue-500' : ''
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 md:space-y-3 p-2">
            {tasks.length === 0 ? (
              <div className="p-4 md:p-8 text-center text-sm md:text-base text-gray-500 bg-gray-800/50 border border-gray-700 border-dashed rounded-lg">
                Drop tasks here
              </div>
            ) : (
              tasks.map((task) => <SortableTaskCard key={task.id} task={task} onView={onViewTask} />)
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}

function CreateTaskModal({ isOpen, onClose, onCreateTask }: { 
  isOpen: boolean; 
  onClose: () => void;
  onCreateTask: (title: string, description: string, status: TaskStatus) => void;
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('backlog')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onCreateTask(title, description, status)
      setTitle('')
      setDescription('')
      setStatus('backlog')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Create New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Task title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Task description..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="backlog">Backlog</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TaskDetailModal({ task, isOpen, onClose }: {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !task) return null

  const config = statusConfig[task.status]
  const Icon = config.icon
  const { formatDate } = require('@/lib/utils')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`${config.color} p-2 rounded-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">{task.title}</h2>
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.color} text-white`}>
              {config.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Description</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Metadata */}
          {task.metadata && Object.keys(task.metadata).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Metadata</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(task.metadata).map(([key, value]) => (
                  <span key={key} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm">
                    <span className="text-gray-500">{key}:</span> {String(value)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Session Key */}
          {task.session_key && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Session Key</h3>
              <code className="block px-3 py-2 bg-gray-900 text-green-400 rounded-lg text-sm font-mono">
                {task.session_key}
              </code>
            </div>
          )}

          {/* Timestamps */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Timeline</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Created:</span>
                <span className="text-gray-300">{formatDate(task.created_at)}</span>
              </div>
              {task.started_at && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Started:</span>
                  <span className="text-blue-300">{formatDate(task.started_at)}</span>
                </div>
              )}
              {task.completed_at && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Completed:</span>
                  <span className="text-green-300">{formatDate(task.completed_at)}</span>
                </div>
              )}
              {task.updated_at && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Updated:</span>
                  <span className="text-gray-300">{formatDate(task.updated_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Task ID */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Task ID</h3>
            <code className="block px-3 py-2 bg-gray-900 text-gray-400 rounded-lg text-xs font-mono break-all">
              {task.id}
            </code>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [viewingTask, setViewingTask] = useState<Task | null>(null)
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

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    setOverId(over?.id as string || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)
    setOverId(null)

    if (!over) return

    const activeTask = tasks.find((t) => t.id === active.id)
    if (!activeTask) return

    // Check if dropped on a column
    let newStatus: TaskStatus | null = null
    
    if (over.id === 'backlog' || over.id === 'in_progress' || over.id === 'done') {
      newStatus = over.id as TaskStatus
    } else {
      // Dropped on a task - get that task's status
      const overTask = tasks.find((t) => t.id === over.id)
      if (overTask) {
        newStatus = overTask.status
      }
    }

    if (newStatus && newStatus !== activeTask.status) {
      // Update task status
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          started_at: newStatus === 'in_progress' && !activeTask.started_at 
            ? new Date().toISOString() 
            : activeTask.started_at,
          completed_at: newStatus === 'done' 
            ? new Date().toISOString() 
            : null,
        })
        .eq('id', activeTask.id)

      if (error) {
        console.error('Error updating task:', error)
      } else {
        fetchTasks()
      }
    }
  }

  const handleCreateTask = async (title: string, description: string, status: TaskStatus) => {
    const { error } = await supabase
      .from('tasks')
      .insert({
        title,
        description,
        status,
        session_key: 'manual-entry',
        metadata: { type: 'user-created' },
      })

    if (error) {
      console.error('Error creating task:', error)
      alert('Failed to create task')
    } else {
      fetchTasks()
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
    <>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Create Task</span>
        </button>
      </div>

      <DndContext 
        sensors={sensors} 
        onDragStart={handleDragStart} 
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:overflow-x-auto pb-4">
          <Column 
            status="backlog" 
            tasks={tasksByStatus.backlog}
            isOver={overId === 'backlog'}
            onViewTask={setViewingTask}
          />
          <Column 
            status="in_progress" 
            tasks={tasksByStatus.in_progress}
            isOver={overId === 'in_progress'}
            onViewTask={setViewingTask}
          />
          <Column 
            status="done" 
            tasks={tasksByStatus.done}
            isOver={overId === 'done'}
            onViewTask={setViewingTask}
          />
        </div>

        <DragOverlay>{activeTask ? <TaskCard task={activeTask} isDragging /> : null}</DragOverlay>
      </DndContext>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateTask}
      />

      <TaskDetailModal
        task={viewingTask}
        isOpen={!!viewingTask}
        onClose={() => setViewingTask(null)}
      />
    </>
  )
}
