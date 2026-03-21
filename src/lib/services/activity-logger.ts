// ============================================================
// Activity logger — centralized audit trail
// ============================================================

import { db, DB_AVAILABLE } from '@/src/lib/db';
import { activities } from '@/src/lib/db/schema';
import { generateId } from '@/src/lib/utils';

interface LogActivityInput {
  taskId: string;
  action: string;
  actor?: string; // 'user' | 'earl' | 'system'
  details?: Record<string, unknown>;
}

/** Log an activity entry */
export function logActivity(input: LogActivityInput): void {
  if (!DB_AVAILABLE) return; // Silently skip when DB unavailable
  db.insert(activities)
    .values({
      id: generateId(),
      taskId: input.taskId,
      action: input.action,
      actor: input.actor || 'user',
      details: input.details ? JSON.stringify(input.details) : null,
      timestamp: new Date().toISOString(),
    })
    .run();
}

/** Log task creation */
export function logTaskCreated(taskId: string, title: string, actor = 'user') {
  logActivity({
    taskId,
    action: 'created',
    actor,
    details: { title },
  });
}

/** Log task field updates with before/after */
export function logTaskUpdated(
  taskId: string,
  changes: Array<{ field: string; from: unknown; to: unknown }>,
  actor = 'user'
) {
  logActivity({
    taskId,
    action: 'updated',
    actor,
    details: { changes },
  });
}

/** Log a note/comment added */
export function logNoteAdded(taskId: string, note: string, actor = 'user') {
  logActivity({
    taskId,
    action: 'note_added',
    actor,
    details: { note },
  });
}

/** Log task deletion */
export function logTaskDeleted(taskId: string, title: string, actor = 'user') {
  logActivity({
    taskId,
    action: 'deleted',
    actor,
    details: { title },
  });
}

/** Log task archived */
export function logTaskArchived(taskId: string, actor = 'user') {
  logActivity({
    taskId,
    action: 'archived',
    actor,
  });
}
