// ============================================================
// React Query hooks for analytics
// ============================================================

'use client';

import { useQuery } from '@tanstack/react-query';
import type { AnalyticsOverview, AnalyticsTrend, AnalyticsHourly } from '@/src/lib/types';

export function useAnalyticsOverview() {
  return useQuery<AnalyticsOverview>({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const res = await fetch('/api/analytics?type=overview');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
  });
}

export function useAnalyticsTrends(dateFrom?: string) {
  return useQuery<{ trends: AnalyticsTrend[] }>({
    queryKey: ['analytics', 'trends', dateFrom],
    queryFn: async () => {
      const params = dateFrom ? `&dateFrom=${dateFrom}` : '';
      const res = await fetch(`/api/analytics?type=trends${params}`);
      if (!res.ok) throw new Error('Failed to fetch trends');
      return res.json();
    },
  });
}

export function useAnalyticsHourly() {
  return useQuery<{ hourly: AnalyticsHourly[] }>({
    queryKey: ['analytics', 'hourly'],
    queryFn: async () => {
      const res = await fetch('/api/analytics?type=hourly');
      if (!res.ok) throw new Error('Failed to fetch hourly data');
      return res.json();
    },
  });
}
