// ============================================================
// Notification service — creates notifications based on preferences
// ============================================================

import { db, DB_AVAILABLE } from '@/src/lib/db';
import { notifications, notificationPreferences } from '@/src/lib/db/schema';
import { generateId } from '@/src/lib/utils';
import type { NotificationType } from '@/src/lib/types';

interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message?: string;
  taskId?: string;
  actor?: string;
}

/** Check if a notification type is enabled in preferences */
function isNotificationEnabled(type: NotificationType): boolean {
  if (!DB_AVAILABLE) return false; // No DB, skip notifications
  const prefs = db
    .select()
    .from(notificationPreferences)
    .limit(1)
    .get();

  if (!prefs) return true; // Default: all enabled

  const mapping: Record<NotificationType, boolean> = {
    task_created: prefs.taskCreated,
    task_completed: prefs.taskCompleted,
    status_changed: prefs.statusChanged,
    priority_changed: prefs.priorityChanged,
    high_priority: prefs.highPriority,
    earl_action: prefs.earlAction,
  };

  return mapping[type] ?? true;
}

/** Create a notification (respects user preferences) */
export function createNotification(input: CreateNotificationInput): void {
  if (!DB_AVAILABLE) return; // Silently skip when DB unavailable
  if (!isNotificationEnabled(input.type)) return;

  db.insert(notifications)
    .values({
      id: generateId(),
      type: input.type,
      title: input.title,
      message: input.message || null,
      taskId: input.taskId || null,
      actor: input.actor || 'system',
      read: false,
      createdAt: new Date().toISOString(),
    })
    .run();
}

/** Create task notification helper */
export function notifyTaskCreated(taskTitle: string, taskId: string, actor: string) {
  createNotification({
    type: 'task_created',
    title: `Task created: ${taskTitle}`,
    message: `${actor === 'earl' ? 'Earl' : 'You'} created a new task`,
    taskId,
    actor,
  });
}

export function notifyTaskCompleted(taskTitle: string, taskId: string, actor: string) {
  createNotification({
    type: 'task_completed',
    title: `Task completed: ${taskTitle}`,
    message: `${actor === 'earl' ? 'Earl' : 'You'} marked this task as done`,
    taskId,
    actor,
  });
}

export function notifyStatusChanged(taskTitle: string, taskId: string, from: string, to: string, actor: string) {
  createNotification({
    type: 'status_changed',
    title: `Status changed: ${taskTitle}`,
    message: `${from} → ${to}`,
    taskId,
    actor,
  });
}

export function notifyHighPriority(taskTitle: string, taskId: string, actor: string) {
  createNotification({
    type: 'high_priority',
    title: `🔴 Urgent task: ${taskTitle}`,
    message: `${actor === 'earl' ? 'Earl' : 'You'} set this task to urgent priority`,
    taskId,
    actor,
  });
}

export function notifyEarlAction(action: string, taskTitle: string, taskId: string) {
  createNotification({
    type: 'earl_action',
    title: `Earl: ${action}`,
    message: taskTitle,
    taskId,
    actor: 'earl',
  });
}
