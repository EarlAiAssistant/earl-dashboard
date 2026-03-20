// ============================================================
// Skeleton loading component for placeholder UI
// ============================================================

import { cn } from '@/src/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted/50', className)}
      aria-hidden="true"
    />
  );
}

/** Task list row skeleton */
export function TaskRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
      <Skeleton className="h-4 flex-1 max-w-[300px]" />
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-4 w-4 rounded-full" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

/** Kanban card skeleton */
export function KanbanCardSkeleton() {
  return (
    <div className="p-3 rounded-md border border-border bg-card space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-5 w-16" />
    </div>
  );
}

/** Stat card skeleton */
export function StatCardSkeleton() {
  return (
    <div className="p-4 bg-card border border-border rounded-lg space-y-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}
