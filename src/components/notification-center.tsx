// ============================================================
// Notification center — bell icon with dropdown panel
// ============================================================

'use client';

import { useState, useRef, useEffect } from 'react';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '@/src/lib/hooks/use-notifications';
import { formatDate } from '@/src/lib/utils';
import { cn } from '@/src/lib/utils';
import { Bell, Check, CheckCheck, Trash2, X, Bot, User, Cog } from 'lucide-react';
import type { Notification } from '@/src/lib/types';

interface NotificationCenterProps {
  onSelectTask?: (taskId: string) => void;
}

export function NotificationCenter({ onSelectTask }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotif = useDeleteNotification();

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.data ?? [];

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleClick = (notif: Notification) => {
    if (!notif.read) {
      markAsRead.mutate(notif.id);
    }
    if (notif.taskId && onSelectTask) {
      onSelectTask(notif.taskId);
      setOpen(false);
    }
  };

  const actorIcon = (actor: string) => {
    if (actor === 'earl') return <Bot className="h-4 w-4 text-blue-400" />;
    if (actor === 'system') return <Cog className="h-4 w-4 text-gray-400" />;
    return <User className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-md hover:bg-accent transition-colors"
        title="Notifications"
      >
        <Bell className="h-4 w-4 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[500px] bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead.mutate()}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-accent rounded"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto max-h-[420px]">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No notifications yet
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    'flex gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-border/50',
                    notif.read
                      ? 'opacity-60 hover:opacity-80'
                      : 'bg-blue-500/5 hover:bg-blue-500/10'
                  )}
                  onClick={() => handleClick(notif)}
                >
                  {/* Actor icon */}
                  <div className="mt-0.5">{actorIcon(notif.actor)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm', !notif.read && 'font-medium')}>
                      {notif.title}
                    </p>
                    {notif.message && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {notif.message}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDate(notif.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-start gap-1">
                    {!notif.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead.mutate(notif.id);
                        }}
                        className="p-1 hover:bg-accent rounded"
                        title="Mark as read"
                      >
                        <Check className="h-3 w-3 text-muted-foreground" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotif.mutate(notif.id);
                      }}
                      className="p-1 hover:bg-accent rounded"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
