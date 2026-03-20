// ============================================================
// Advanced filter bar with multi-filter, save, and URL sync
// ============================================================

'use client';

import { useState } from 'react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select } from '@/src/components/ui/select';
import { useSavedFilters, useSaveFilter } from '@/src/lib/hooks/use-tasks';
import { toastSuccess } from '@/src/lib/hooks/use-toast';
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  STATUS_LABELS,
  PRIORITY_LABELS,
} from '@/src/lib/types';
import type { TaskStatus, TaskPriority, TaskFilters } from '@/src/lib/types';
import {
  Search,
  Filter,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Bookmark,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface AdvancedFiltersProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
}

export function AdvancedFilters({ filters, onFiltersChange }: AdvancedFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSave, setShowSave] = useState(false);

  const { data: savedFilters } = useSavedFilters();
  const saveFilter = useSaveFilter();

  // Count active filters
  const activeCount = [
    filters.status && filters.status !== 'all',
    filters.priority && filters.priority !== 'all',
    filters.search,
    filters.createdBy,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  const clearAll = () => {
    onFiltersChange({
      status: 'all',
      priority: 'all',
      search: '',
      createdBy: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
  };

  const handleSaveFilter = async () => {
    if (!saveName.trim()) return;
    await saveFilter.mutateAsync({ name: saveName.trim(), filters });
    toastSuccess('Filter saved', `"${saveName}" saved successfully`);
    setSaveName('');
    setShowSave(false);
  };

  const loadSavedFilter = (savedFilter: { filters: TaskFilters }) => {
    onFiltersChange({ ...savedFilter.filters, sortBy: filters.sortBy, sortOrder: filters.sortOrder });
  };

  return (
    <div className="border-b border-border">
      {/* Primary filter row */}
      <div className="flex flex-wrap gap-2 p-4 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            placeholder="Search tasks..."
            className="pl-8"
          />
        </div>

        {/* Status */}
        <Select
          value={filters.status || 'all'}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as TaskStatus | 'all' })}
          className="w-[140px]"
        >
          <option value="all">All Status</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </Select>

        {/* Priority */}
        <Select
          value={filters.priority || 'all'}
          onChange={(e) => onFiltersChange({ ...filters, priority: e.target.value as TaskPriority | 'all' })}
          className="w-[140px]"
        >
          <option value="all">All Priority</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
          ))}
        </Select>

        {/* Expand button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-1" />
          More
          {activeCount > 0 && (
            <Badge className="ml-1 bg-primary/20 text-primary border-primary/30 text-[10px] px-1.5">
              {activeCount}
            </Badge>
          )}
          {expanded ? (
            <ChevronUp className="h-3 w-3 ml-1" />
          ) : (
            <ChevronDown className="h-3 w-3 ml-1" />
          )}
        </Button>

        {/* Clear all */}
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground">
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex flex-wrap gap-3">
            {/* Created by */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Input
                value={filters.createdBy || ''}
                onChange={(e) => onFiltersChange({ ...filters, createdBy: e.target.value || undefined })}
                placeholder="Created by..."
                className="w-[150px]"
              />
            </div>

            {/* Date range */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value || undefined })}
                className="w-[150px]"
              />
              <span className="text-muted-foreground text-sm">to</span>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value || undefined })}
                className="w-[150px]"
              />
            </div>
          </div>

          {/* Saved filters row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Saved filter chips */}
            {savedFilters && savedFilters.length > 0 && (
              <>
                <Bookmark className="h-4 w-4 text-muted-foreground" />
                {savedFilters.map((sf) => (
                  <button
                    key={sf.id}
                    onClick={() => loadSavedFilter(sf)}
                    className="px-2.5 py-1 text-xs rounded-full border border-border hover:border-primary/50 hover:bg-accent transition-colors"
                  >
                    {sf.name}
                  </button>
                ))}
              </>
            )}

            {/* Save current filter */}
            {activeCount > 0 && !showSave && (
              <Button variant="ghost" size="sm" onClick={() => setShowSave(true)} className="text-xs">
                <Save className="h-3 w-3 mr-1" />
                Save filter
              </Button>
            )}
            {showSave && (
              <div className="flex items-center gap-2">
                <Input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Filter name..."
                  className="w-[150px] h-7 text-xs"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveFilter()}
                />
                <Button size="sm" onClick={handleSaveFilter} disabled={!saveName.trim()} className="h-7 text-xs">
                  Save
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowSave(false)} className="h-7 text-xs">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
