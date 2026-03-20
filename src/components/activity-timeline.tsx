// ============================================================
// Activity timeline — rich audit trail for task detail or standalone
// ============================================================

'use client';

import { useState, useMemo } from 'react';
import { useActivities } from '@/src/lib/hooks/use-activities';
import type { ActivityWithTask } from '@/src/lib/hooks/use-activities';
import { formatDate, formatDateTime, cn } from '@/src/lib/utils';
import {
  Plus,
  ArrowRight,
  Pencil,
  Trash2,
  Archive,
  RotateCcw,
  Sun,
  SunDim,
  MessageSquare,
  Bot,
  User,
  Cog,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { Button } from '@/src/components/ui/button';

interface ActivityTimelineProps {
  taskId?: string; // If provided, show for single task
  showFilters?: boolean;
  showExport?: boolean;
  compact?: boolean;
}

const ACTION_CONFIG: Record<string, { icon: typeof Plus; color: string; label: string }> = {
  created: { icon: Plus, color: 'text-green-400', label: 'Created' },
  updated: { icon: Pencil, color: 'text-blue-400', label: 'Updated' },
  status_changed: { icon: ArrowRight, color: 'text-purple-400', label: 'Status changed' },
  priority_changed: { icon: ArrowRight, color: 'text-orange-400', label: 'Priority changed' },
  description_updated: { icon: Pencil, color: 'text-blue-400', label: 'Description updated' },
  title_updated: { icon: Pencil, color: 'text-blue-400', label: 'Title updated' },
  deleted: { icon: Trash2, color: 'text-red-400', label: 'Deleted' },
  archived: { icon: Archive, color: 'text-gray-400', label: 'Archived' },
  restored: { icon: RotateCcw, color: 'text-green-400', label: 'Restored' },
  added_to_my_day: { icon: Sun, color: 'text-yellow-400', label: 'Added to My Day' },
  removed_from_my_day: { icon: SunDim, color: 'text-gray-400', label: 'Removed from My Day' },
  note_added: { icon: MessageSquare, color: 'text-cyan-400', label: 'Note added' },
};

function getActionConfig(action: string) {
  return ACTION_CONFIG[action] || { icon: Pencil, color: 'text-gray-400', label: action };
}

function ActorBadge({ actor }: { actor: string }) {
  if (actor === 'earl') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
        <Bot className="h-3 w-3" />
        Earl
      </span>
    );
  }
  if (actor === 'system') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded">
        <Cog className="h-3 w-3" />
        System
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-green-500/10 text-green-400 border border-green-500/20 rounded">
      <User className="h-3 w-3" />
      You
    </span>
  );
}

function renderDetails(action: string, details: string | null): React.ReactNode {
  if (!details) return null;

  try {
    const parsed = JSON.parse(details);

    // Note
    if (parsed.note) {
      return (
        <div className="mt-1 p-2 bg-muted/50 rounded text-xs text-muted-foreground italic">
          &ldquo;{parsed.note}&rdquo;
        </div>
      );
    }

    // Changes array (new format)
    if (parsed.changes && Array.isArray(parsed.changes)) {
      return (
        <div className="mt-1 space-y-0.5">
          {parsed.changes.map((change: { field: string; from: unknown; to: unknown } | string, i: number) => {
            if (typeof change === 'string') {
              return (
                <div key={i} className="text-xs text-muted-foreground">
                  {change}
                </div>
              );
            }
            return (
              <div key={i} className="text-xs flex items-center gap-1.5">
                <span className="text-muted-foreground">{change.field}:</span>
                <span className="line-through text-red-400/70">{String(change.from || '(empty)')}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-green-400">{String(change.to || '(empty)')}</span>
              </div>
            );
          })}
        </div>
      );
    }

    // Simple key-value (title, status, etc.)
    if (parsed.title) {
      return <span className="text-xs text-muted-foreground"> — {parsed.title}</span>;
    }
  } catch {
    return <span className="text-xs text-muted-foreground"> — {details}</span>;
  }

  return null;
}

export function ActivityTimeline({
  taskId,
  showFilters = false,
  showExport = false,
  compact = false,
}: ActivityTimelineProps) {
  const [actionFilter, setActionFilter] = useState('');
  const [actorFilter, setActorFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useActivities({
    taskId,
    action: actionFilter || undefined,
    actor: actorFilter || undefined,
    page,
    pageSize: compact ? 10 : 25,
  });

  const activities = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleExport = (format: 'json' | 'csv') => {
    const params = new URLSearchParams({ export: format });
    if (taskId) params.set('taskId', taskId);
    if (actionFilter) params.set('action', actionFilter);
    if (actorFilter) params.set('actor', actorFilter);
    window.open(`/api/activities?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm animate-pulse">
        Loading activity...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <Select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="text-xs h-7 w-32"
          >
            <option value="">All actions</option>
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="note_added">Notes</option>
            <option value="deleted">Deleted</option>
            <option value="archived">Archived</option>
          </Select>
          <Select
            value={actorFilter}
            onChange={(e) => { setActorFilter(e.target.value); setPage(1); }}
            className="text-xs h-7 w-28"
          >
            <option value="">All actors</option>
            <option value="user">User</option>
            <option value="earl">Earl</option>
            <option value="system">System</option>
          </Select>

          {showExport && (
            <div className="ml-auto flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExport('csv')}
                className="text-xs h-7"
              >
                <Download className="h-3 w-3 mr-1" />
                CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExport('json')}
                className="text-xs h-7"
              >
                <Download className="h-3 w-3 mr-1" />
                JSON
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      {activities.length === 0 ? (
        <div className="py-6 text-center text-muted-foreground text-sm">
          No activity yet
        </div>
      ) : (
        <div className="space-y-0">
          {activities.map((activity, idx) => {
            const config = getActionConfig(activity.action);
            const Icon = config.icon;

            return (
              <div
                key={activity.id}
                className={cn(
                  'relative flex gap-3 py-2.5',
                  idx < activities.length - 1 && 'border-l-2 border-border ml-[7px] pl-5',
                  idx === activities.length - 1 && 'ml-0'
                )}
              >
                {/* Timeline dot */}
                <div
                  className={cn(
                    'flex-shrink-0 flex items-center justify-center w-4 h-4 rounded-full border-2 border-background',
                    idx < activities.length - 1 ? 'absolute -left-[9px] top-3' : '',
                    config.color
                  )}
                >
                  <Icon className="h-2.5 w-2.5" />
                </div>

                {/* Content */}
                <div className={cn('flex-1 min-w-0', idx === activities.length - 1 && 'ml-6')}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <ActorBadge actor={activity.actor} />
                    <span className={cn('text-sm font-medium', config.color)}>
                      {config.label}
                    </span>
                    {!taskId && activity.taskTitle && (
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        on &ldquo;{activity.taskTitle}&rdquo;
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground ml-auto whitespace-nowrap" title={formatDateTime(activity.timestamp)}>
                      {formatDate(activity.timestamp)}
                    </span>
                  </div>
                  {renderDetails(activity.action, activity.details)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages} ({data?.total ?? 0} entries)
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="h-7 px-2"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="h-7 px-2"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
