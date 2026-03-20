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

/** Activity action types */
export const ACTIVITY_ACTIONS = [
  'created',
  'updated',
  'status_changed',
  'priority_changed',
  'description_updated',
  'title_updated',
  'deleted',
  'archived',
  'restored',
  'added_to_my_day',
  'removed_from_my_day',
  'note_added',
] as const;
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

/** Actor types */
export const ACTORS = ['user', 'earl', 'system'] as const;
export type Actor = (typeof ACTORS)[number];

/** Notification types */
export const NOTIFICATION_TYPES = [
  'task_created',
  'task_completed',
  'status_changed',
  'priority_changed',
  'high_priority',
  'earl_action',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** Core task shape returned from the API */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  myDay: string | null;
  myDayOrder: number | null;
  archived: boolean;
}

/** Activity log entry */
export interface Activity {
  id: string;
  taskId: string;
  action: string;
  actor: string;
  details: string | null;
  timestamp: string;
}

/** Notification */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  taskId: string | null;
  actor: string;
  read: boolean;
  createdAt: string;
}

/** Webhook subscription */
export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string | null;
  enabled: boolean;
  lastTriggered: string | null;
  failCount: number;
  createdAt: string;
}

/** Integration config */
export interface Integration {
  id: string;
  type: 'slack' | 'email' | 'webhook';
  name: string;
  config: Record<string, unknown>;
  enabled: boolean;
  createdAt: string;
}

/** Notification preferences */
export interface NotificationPreferences {
  id: string;
  userId: string;
  taskCreated: boolean;
  taskCompleted: boolean;
  statusChanged: boolean;
  priorityChanged: boolean;
  highPriority: boolean;
  earlAction: boolean;
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
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
  myDay?: boolean;
  archived?: boolean;
}

/** Activity filters */
export interface ActivityFilters {
  taskId?: string;
  action?: string;
  actor?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

/** Analytics data shapes */
export interface AnalyticsOverview {
  totalTasks: number;
  tasksThisWeek: number;
  tasksThisMonth: number;
  completedTasks: number;
  completedThisWeek: number;
  completedThisMonth: number;
  averageCompletionHours: number | null;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
}

export interface AnalyticsTrend {
  date: string;
  created: number;
  completed: number;
}

export interface AnalyticsHourly {
  hour: number;
  count: number;
}

/** Task template */
export interface TaskTemplate {
  id: string;
  name: string;
  description: string | null;
  defaultStatus: TaskStatus;
  defaultPriority: TaskPriority;
  titleTemplate: string | null;
  descriptionTemplate: string | null;
  isBuiltIn: boolean;
  createdAt: string;
}

/** Saved filter view */
export interface SavedFilter {
  id: string;
  name: string;
  filters: TaskFilters;
  createdAt: string;
}

/** Toast notification types */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

/** Keyboard shortcut definition */
export interface KeyboardShortcut {
  key: string;
  label: string;
  description: string;
  meta?: boolean;
  shift?: boolean;
  context?: 'global' | 'list' | 'detail';
}

/** Earl API types */
export interface EarlCreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  note?: string;
}

export interface EarlUpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  note?: string;
}

export interface EarlSearchRequest {
  query?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  limit?: number;
}
