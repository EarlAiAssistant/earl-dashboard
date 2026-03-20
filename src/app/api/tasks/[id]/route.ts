// ============================================================
// GET    /api/tasks/:id — Get single task with activity log
// PATCH  /api/tasks/:id — Update task fields
// DELETE /api/tasks/:id — Delete task
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { tasks, activities } from '@/src/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateId } from '@/src/lib/utils';
import type { TaskStatus, TaskPriority, Task, Activity } from '@/src/lib/types';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
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
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = db.select().from(tasks).where(eq(tasks.id, id)).get();
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const updates: Record<string, unknown> = { updatedAt: now };
    const changes: string[] = [];

    // Track each field change for the activity log
    if (body.title !== undefined && body.title !== existing.title) {
      updates.title = body.title.trim();
      changes.push(`title: "${existing.title}" → "${updates.title}"`);
    }
    if (body.description !== undefined && body.description !== existing.description) {
      updates.description = body.description?.trim() || null;
      changes.push('description updated');
    }
    if (body.status !== undefined && body.status !== existing.status) {
      updates.status = body.status;
      changes.push(`status: ${existing.status} → ${body.status}`);
    }
    if (body.priority !== undefined && body.priority !== existing.priority) {
      updates.priority = body.priority;
      changes.push(`priority: ${existing.priority} → ${body.priority}`);
    }

    if (changes.length === 0) {
      return NextResponse.json(mapTask(existing));
    }

    db.update(tasks).set(updates).where(eq(tasks.id, id)).run();

    // Log activity for each change
    db.insert(activities)
      .values({
        id: generateId(),
        taskId: id,
        action: 'updated',
        details: JSON.stringify({ changes }),
        timestamp: now,
      })
      .run();

    const updated = db.select().from(tasks).where(eq(tasks.id, id)).get();
    return NextResponse.json(mapTask(updated!));
  } catch (error) {
    console.error('PATCH /api/tasks/:id error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = db.select().from(tasks).where(eq(tasks.id, id)).get();
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Activities cascade-delete via FK
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
  };
}

function mapActivity(row: typeof activities.$inferSelect): Activity {
  return {
    id: row.id,
    taskId: row.taskId,
    action: row.action,
    details: row.details,
    timestamp: row.timestamp,
  };
}
