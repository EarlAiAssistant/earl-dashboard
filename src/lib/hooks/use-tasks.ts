// ============================================================
// React Query hooks for task CRUD operations
// Supports localStorage fallback when API returns 503 (DB unavailable)
// ============================================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toastInfo } from '@/src/lib/hooks/use-toast';
import type {
  Task,
  Activity,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  PaginatedResponse,
} from '@/src/lib/types';

const TASKS_KEY = 'tasks';
const STORAGE_MODE_KEY = 'app_storage_mode';
const STORAGE_TASKS_KEY = 'local_tasks';

// ─── Storage mode ────────────────────────────────────────────

/** Returns true if currently running in browser-storage-only mode */
function isLocalMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_MODE_KEY) === 'local';
}

function setLocalMode(on: boolean) {
  if (typeof window === 'undefined') return;
  if (on) {
    localStorage.setItem(STORAGE_MODE_KEY, 'local');
  } else {
    localStorage.removeItem(STORAGE_MODE_KEY);
  }
}

/** Export the current mode so components can read it */
export function getStorageMode(): 'server' | 'browser' {
  return isLocalMode() ? 'browser' : 'server';
}

// ─── localStorage task store ─────────────────────────────────

function getLocalTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_TASKS_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

function saveLocalTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
}

function localGenerateId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Helpers ─────────────────────────────────────────────────

function buildQueryString(filters: TaskFilters): string {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.priority && filters.priority !== 'all') params.set('priority', filters.priority);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
  if (filters.search) params.set('search', filters.search);
  return params.toString();
}

/** Check if response indicates DB is unavailable */
async function checkFor503(res: Response): Promise<boolean> {
  if (res.status === 503) {
    if (!isLocalMode()) {
      setLocalMode(true);
      toastInfo('Running in offline mode (browser storage only). Data is stored in this browser.');
    }
    return true;
  }
  return false;
}

// ─── Local filter/sort ────────────────────────────────────────

function applyFilters(tasks: Task[], filters: TaskFilters): PaginatedResponse<Task> {
  let filtered = tasks.filter((t) => !t.archived);

  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter((t) => t.status === filters.status);
  }
  if (filters.priority && filters.priority !== 'all') {
    filtered = filtered.filter((t) => t.priority === filters.priority);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
    );
  }
  if (filters.myDay) {
    filtered = filtered.filter((t) => !!t.myDay);
  }

  // Sort
  const sortBy = filters.sortBy || 'created_at';
  const sortOrder = filters.sortOrder || 'desc';
  filtered.sort((a, b) => {
    let va = '';
    let vb = '';
    if (sortBy === 'created_at') { va = a.createdAt; vb = b.createdAt; }
    else if (sortBy === 'updated_at') { va = a.updatedAt; vb = b.updatedAt; }
    else if (sortBy === 'title') { va = a.title; vb = b.title; }
    else if (sortBy === 'priority') {
      const ord = { urgent: 0, high: 1, medium: 2, low: 3 };
      va = String(ord[a.priority as keyof typeof ord] ?? 2);
      vb = String(ord[b.priority as keyof typeof ord] ?? 2);
    }
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  const page = filters.page || 1;
  const pageSize = Math.min(filters.pageSize || 50, 100);
  const total = filtered.length;
  const data = filtered.slice((page - 1) * pageSize, page * pageSize);

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

// ─── Hooks ────────────────────────────────────────────────────

/** Fetch paginated task list */
export function useTasks(filters: TaskFilters = {}) {
  return useQuery<PaginatedResponse<Task>>({
    queryKey: [TASKS_KEY, filters],
    queryFn: async () => {
      // If already in local mode, skip the API call
      if (isLocalMode()) {
        return applyFilters(getLocalTasks(), filters);
      }

      const qs = buildQueryString(filters);
      const res = await fetch(`/api/tasks${qs ? `?${qs}` : ''}`);

      if (await checkFor503(res)) {
        return applyFilters(getLocalTasks(), filters);
      }
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
  });
}

/** Fetch single task with activities */
export function useTask(id: string | null) {
  return useQuery<Task & { activities: Activity[] }>({
    queryKey: [TASKS_KEY, id],
    queryFn: async () => {
      if (isLocalMode()) {
        const task = getLocalTasks().find((t) => t.id === id);
        if (!task) throw new Error('Task not found');
        return { ...task, activities: [] };
      }

      const res = await fetch(`/api/tasks/${id}`);

      if (await checkFor503(res)) {
        const task = getLocalTasks().find((t) => t.id === id);
        if (!task) throw new Error('Task not found');
        return { ...task, activities: [] };
      }
      if (!res.ok) throw new Error('Failed to fetch task');
      return res.json();
    },
    enabled: !!id,
  });
}

/** Create a new task */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, CreateTaskInput>({
    mutationFn: async (input) => {
      if (isLocalMode()) {
        const now = new Date().toISOString();
        const task: Task = {
          id: localGenerateId(),
          title: input.title,
          description: input.description || null,
          status: input.status || 'triage',
          priority: input.priority || 'medium',
          createdBy: input.createdBy || 'user',
          createdAt: now,
          updatedAt: now,
          completedAt: null,
          myDay: null,
          myDayOrder: null,
          archived: false,
        };
        const tasks = getLocalTasks();
        tasks.unshift(task);
        saveLocalTasks(tasks);
        return task;
      }

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (await checkFor503(res)) {
        // Retry in local mode
        const now = new Date().toISOString();
        const task: Task = {
          id: localGenerateId(),
          title: input.title,
          description: input.description || null,
          status: input.status || 'triage',
          priority: input.priority || 'medium',
          createdBy: input.createdBy || 'user',
          createdAt: now,
          updatedAt: now,
          completedAt: null,
          myDay: null,
          myDayOrder: null,
          archived: false,
        };
        const tasks = getLocalTasks();
        tasks.unshift(task);
        saveLocalTasks(tasks);
        return task;
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create task');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
    },
  });
}

/** Update an existing task */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, { id: string } & UpdateTaskInput>({
    mutationFn: async ({ id, ...updates }) => {
      if (isLocalMode()) {
        const tasks = getLocalTasks();
        const idx = tasks.findIndex((t) => t.id === id);
        if (idx === -1) throw new Error('Task not found');
        const now = new Date().toISOString();
        tasks[idx] = {
          ...tasks[idx],
          ...updates,
          updatedAt: now,
          completedAt: updates.status === 'done' ? now : tasks[idx].completedAt,
        };
        saveLocalTasks(tasks);
        return tasks[idx];
      }

      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (await checkFor503(res)) {
        const tasks = getLocalTasks();
        const idx = tasks.findIndex((t) => t.id === id);
        if (idx === -1) throw new Error('Task not found');
        const now = new Date().toISOString();
        tasks[idx] = {
          ...tasks[idx],
          ...updates,
          updatedAt: now,
          completedAt: updates.status === 'done' ? now : tasks[idx].completedAt,
        };
        saveLocalTasks(tasks);
        return tasks[idx];
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update task');
      }
      return res.json();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
    },
  });
}

/** Delete a task */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; id: string }, Error, string>({
    mutationFn: async (id) => {
      if (isLocalMode()) {
        const tasks = getLocalTasks().filter((t) => t.id !== id);
        saveLocalTasks(tasks);
        return { success: true, id };
      }

      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });

      if (await checkFor503(res)) {
        const tasks = getLocalTasks().filter((t) => t.id !== id);
        saveLocalTasks(tasks);
        return { success: true, id };
      }

      if (!res.ok) throw new Error('Failed to delete task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
    },
  });
}

/** Add task to My Day */
export function useAddToMyDay() {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, string>({
    mutationFn: async (id) => {
      if (isLocalMode()) {
        const tasks = getLocalTasks();
        const idx = tasks.findIndex((t) => t.id === id);
        if (idx === -1) throw new Error('Task not found');
        tasks[idx] = { ...tasks[idx], myDay: new Date().toISOString(), updatedAt: new Date().toISOString() };
        saveLocalTasks(tasks);
        return tasks[idx];
      }

      const res = await fetch(`/api/tasks/${id}/my-day`, { method: 'POST' });

      if (await checkFor503(res)) {
        const tasks = getLocalTasks();
        const idx = tasks.findIndex((t) => t.id === id);
        if (idx === -1) throw new Error('Task not found');
        tasks[idx] = { ...tasks[idx], myDay: new Date().toISOString(), updatedAt: new Date().toISOString() };
        saveLocalTasks(tasks);
        return tasks[idx];
      }

      if (!res.ok) throw new Error('Failed to add to My Day');
      return res.json();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
    },
  });
}

/** Remove task from My Day */
export function useRemoveFromMyDay() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; id: string }, Error, string>({
    mutationFn: async (id) => {
      if (isLocalMode()) {
        const tasks = getLocalTasks();
        const idx = tasks.findIndex((t) => t.id === id);
        if (idx === -1) throw new Error('Task not found');
        tasks[idx] = { ...tasks[idx], myDay: null, myDayOrder: null, updatedAt: new Date().toISOString() };
        saveLocalTasks(tasks);
        return { success: true, id };
      }

      const res = await fetch(`/api/tasks/${id}/my-day`, { method: 'DELETE' });

      if (await checkFor503(res)) {
        const tasks = getLocalTasks();
        const idx = tasks.findIndex((t) => t.id === id);
        if (idx === -1) throw new Error('Task not found');
        tasks[idx] = { ...tasks[idx], myDay: null, myDayOrder: null, updatedAt: new Date().toISOString() };
        saveLocalTasks(tasks);
        return { success: true, id };
      }

      if (!res.ok) throw new Error('Failed to remove from My Day');
      return res.json();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
    },
  });
}

/** Fetch task templates (returns defaults in local mode) */
export function useTemplates() {
  return useQuery<import('@/src/lib/types').TaskTemplate[]>({
    queryKey: ['templates'],
    queryFn: async () => {
      if (isLocalMode()) return [];

      const res = await fetch('/api/templates');
      if (await checkFor503(res)) return [];
      if (!res.ok) throw new Error('Failed to fetch templates');
      return res.json();
    },
  });
}

/** Fetch saved filters (returns empty in local mode) */
export function useSavedFilters() {
  return useQuery<import('@/src/lib/types').SavedFilter[]>({
    queryKey: ['saved-filters'],
    queryFn: async () => {
      if (isLocalMode()) return [];

      const res = await fetch('/api/filters');
      if (await checkFor503(res)) return [];
      if (!res.ok) throw new Error('Failed to fetch saved filters');
      return res.json();
    },
  });
}

/** Save a named filter */
export function useSaveFilter() {
  const queryClient = useQueryClient();

  return useMutation<import('@/src/lib/types').SavedFilter, Error, { name: string; filters: TaskFilters }>({
    mutationFn: async ({ name, filters }) => {
      if (isLocalMode()) {
        throw new Error('Saved filters are not available in browser storage mode.');
      }

      const res = await fetch('/api/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, filters }),
      });
      if (await checkFor503(res)) {
        throw new Error('Saved filters are not available in browser storage mode.');
      }
      if (!res.ok) throw new Error('Failed to save filter');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-filters'] });
    },
  });
}
