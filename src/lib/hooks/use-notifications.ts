// ============================================================
// React Query hooks for notifications
// ============================================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Notification, NotificationPreferences } from '@/src/lib/types';

const NOTIF_KEY = 'notifications';
const PREFS_KEY = 'notification-preferences';

interface NotificationResponse {
  data: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function useNotifications(page = 1) {
  return useQuery<NotificationResponse>({
    queryKey: [NOTIF_KEY, page],
    queryFn: async () => {
      const res = await fetch(`/api/notifications?page=${page}&pageSize=20`);
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
    refetchInterval: 30000, // Poll every 30s
  });
}

export function useUnreadCount() {
  const { data } = useNotifications();
  return data?.unreadCount ?? 0;
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to mark as read');
      return res.json();
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [NOTIF_KEY] }),
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (!res.ok) throw new Error('Failed to mark all as read');
      return res.json();
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [NOTIF_KEY] }),
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete notification');
      return res.json();
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [NOTIF_KEY] }),
  });
}

export function useNotificationPreferences() {
  return useQuery<NotificationPreferences>({
    queryKey: [PREFS_KEY],
    queryFn: async () => {
      const res = await fetch('/api/notifications/preferences');
      if (!res.ok) throw new Error('Failed to fetch preferences');
      return res.json();
    },
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prefs: Partial<NotificationPreferences>) => {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
      if (!res.ok) throw new Error('Failed to update preferences');
      return res.json();
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [PREFS_KEY] }),
  });
}
