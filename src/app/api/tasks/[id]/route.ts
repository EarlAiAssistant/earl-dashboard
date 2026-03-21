// ============================================================
// GET    /api/tasks/:id — Get single task with activity log
// PATCH  /api/tasks/:id — Update task fields
// DELETE /api/tasks/:id — Delete task
// Returns 503 when database is unavailable (Vercel/serverless)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db, DB_AVAILABLE } from '@/src/lib/db';
import { tasks, activities } from '@/src/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateId } from '@/src/lib/utils';
import { logTaskUpdated, logTaskDeleted } from '@/src/lib/services/activity-logger';
import {
  notifyTaskCompleted,
  notifyStatusChanged,
  notifyHighPriority,
} from '@/src/lib/services/notifications';
import { fireTaskUpdated, fireTaskCompleted, fireTaskDeleted } from '@/src/lib/services/webhooks';
import type { TaskStatus, TaskPriority, Task, Activity } from '@/src/lib/types';

type RouteParams = { params: Promise<{ id: string }> };

function dbUnavailable() {
  return NextResponse.json(
    { error: 'Database unavailable. Running in browser storage mode.', code: 'DB_UNAVAILABLE' },
    { status: 503 }
  );
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  if (!DB_AVAILABLE) return dbUnavailable();

  try {
    const { id } = await params;

    const task = db.select().from(tasks).where(eq(tasks.id, id)).get();
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const taskActivities = db
      .select()
      .from(activities)
      .where(eq(activities.taskId, id))
      .orderBy(desc(activities.timestamp))
      .all();

    return NextResponse.json({
      ...mapTask(task),
      activities: taskActivities.map(mapActivity),
    });
  } catch (error) {
    console.error('GET /api/tasks/:id error:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  if (!DB_AVAILABLE) return dbUnavailable();

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = db.select().from(tasks).where(eq(tasks.id, id)).get();
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const actor = body._actor || 'user'; // Internal field for Earl API
    const updates: Record<string, unknown> = { updatedAt: now };
    const changes: Array<{ field: string; from: unknown; to: unknown }> = [];

    if (body.title !== undefined && body.title !== existing.title) {
      updates.title = body.title.trim();
      changes.push({ field: 'title', from: existing.title, to: updates.title });
    }
    if (body.description !== undefined && body.description !== existing.description) {
      updates.description = body.description?.trim() || null;
      changes.push({ field: 'description', from: existing.description, to: updates.description });
    }
    if (body.status !== undefined && body.status !== existing.status) {
      updates.status = body.status;
      changes.push({ field: 'status', from: existing.status, to: body.status });

      // Track completion time
      if (body.status === 'done') {
        updates.completedAt = now;
        notifyTaskCompleted(existing.title, id, actor);
        fireTaskCompleted({ ...mapTask(existing), status: 'done' } as unknown as Record<string, unknown>);
      } else if (existing.status === 'done') {
        updates.completedAt = null; // Reopened
      }

      notifyStatusChanged(existing.title, id, existing.status, body.status, actor);
    }
    if (body.priority !== undefined && body.priority !== existing.priority) {
      updates.priority = body.priority;
      changes.push({ field: 'priority', from: existing.priority, to: body.priority });

      if (body.priority === 'urgent') {
        notifyHighPriority(existing.title, id, actor);
      }
    }
    if (body.archived !== undefined && body.archived !== existing.archived) {
      updates.archived = body.archived;
      changes.push({ field: 'archived', from: existing.archived, to: body.archived });
    }

    if (changes.length === 0 && !body._note) {
      return NextResponse.json(mapTask(existing));
    }

    if (changes.length > 0) {
      db.update(tasks).set(updates).where(eq(tasks.id, id)).run();
      logTaskUpdated(id, changes, actor);
      fireTaskUpdated(
        mapTask({ ...existing, ...updates } as typeof existing) as unknown as Record<string, unknown>,
        Object.fromEntries(changes.map((c) => [c.field, { from: c.from, to: c.to }]))
      );
    }

    // Handle note (from Earl API)
    if (body._note) {
      db.insert(activities)
        .values({
          id: generateId(),
          taskId: id,
          action: 'note_added',
          actor,
          details: JSON.stringify({ note: body._note }),
          timestamp: now,
        })
        .run();
    }

    const updated = db.select().from(tasks).where(eq(tasks.id, id)).get();
    return NextResponse.json(mapTask(updated!));
  } catch (error) {
    console.error('PATCH /api/tasks/:id error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  if (!DB_AVAILABLE) return dbUnavailable();

  try {
    const { id } = await params;

    const existing = db.select().from(tasks).where(eq(tasks.id, id)).get();
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    logTaskDeleted(id, existing.title, 'user');
    fireTaskDeleted(id);

    db.delete(tasks).where(eq(tasks.id, id)).run();

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('DELETE /api/tasks/:id error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}

function mapTask(row: typeof tasks.$inferSelect): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as TaskStatus,
    priority: row.priority as TaskPriority,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    completedAt: row.completedAt,
    myDay: row.myDay,
    myDayOrder: row.myDayOrder,
    archived: row.archived,
  };
}

function mapActivity(row: typeof activities.$inferSelect): Activity {
  return {
    id: row.id,
    taskId: row.taskId,
    action: row.action,
    actor: row.actor,
    details: row.details,
    timestamp: row.timestamp,
  };
}
