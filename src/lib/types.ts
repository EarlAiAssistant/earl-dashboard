// ============================================================
// Core types for the Earl Dashboard task management system
// ============================================================

/** Task status workflow: triage → backlog → in_progress → in_review → done */
export const TASK_STATUSES = ['triage', 'backlog', 'in_progress', 'in_review', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** Task priority levels */
export const TASK_PRIORITIES = ['urgent', 'high', 'medium', 'low'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

/** Human-readable labels for statuses */
export const STATUS_LABELS: Record<TaskStatus, string> = {
  triage: 'Triage',
  backlog: 'Backlog',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
};

/** Human-readable labels for priorities */
export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

/** Priority colors for badges */
export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

/** Status colors for badges */
export const STATUS_COLORS: Record<TaskStatus, string> = {
  triage: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  backlog: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  in_review: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  done: 'bg-green-500/10 text-green-400 border-green-500/20',
};

/** Core task shape returned from the API */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  createdBy: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/** Activity log entry */
export interface Activity {
  id: string;
  taskId: string;
  action: string;
  details: string | null;
  timestamp: string; // ISO date string
}

/** Input for creating a task */
export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  createdBy?: string;
}

/** Input for updating a task */
export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
}

/** Paginated API response */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Query filters for task list */
export interface TaskFilters {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  sortBy?: 'created_at' | 'title' | 'priority' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  search?: string;
}
