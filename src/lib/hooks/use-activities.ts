// ============================================================
// React Query hooks for activity log
// ============================================================

'use client';

import { useQuery } from '@tanstack/react-query';

interface ActivityWithTask {
  id: string;
  taskId: string;
  taskTitle: string | null;
  action: string;
  actor: string;
  details: string | null;
  timestamp: string;
}

interface ActivitiesResponse {
  data: ActivityWithTask[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function useActivities(filters: {
  taskId?: string;
  action?: string;
  actor?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  return useQuery<ActivitiesResponse>({
    queryKey: ['activities', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.taskId) params.set('taskId', filters.taskId);
      if (filters.action) params.set('action', filters.action);
      if (filters.actor) params.set('actor', filters.actor);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);
      if (filters.page) params.set('page', String(filters.page));
      if (filters.pageSize) params.set('pageSize', String(filters.pageSize));

      const res = await fetch(`/api/activities?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch activities');
      return res.json();
    },
  });
}

export type { ActivityWithTask, ActivitiesResponse };
