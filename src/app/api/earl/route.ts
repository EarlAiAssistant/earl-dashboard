// ============================================================
// Earl AI Integration API
// POST /api/earl — Create task, update task, add note, search
//
// All requests require: Authorization: Bearer <EARL_API_KEY>
// Body: { action: "create"|"update"|"done"|"note"|"search", ... }
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { tasks, activities } from '@/src/lib/db/schema';
import { eq, desc, like, or, sql } from 'drizzle-orm';
import { generateId } from '@/src/lib/utils';
import { logTaskCreated, logTaskUpdated, logNoteAdded } from '@/src/lib/services/activity-logger';
import {
  notifyTaskCreated,
  notifyTaskCompleted,
  notifyStatusChanged,
  notifyHighPriority,
  notifyEarlAction,
} from '@/src/lib/services/notifications';
import { fireTaskCreated, fireTaskUpdated, fireTaskCompleted } from '@/src/lib/services/webhooks';
import type { TaskStatus, TaskPriority, Task } from '@/src/lib/types';

const EARL_API_KEY = process.env.EARL_API_KEY || 'earl-dev-key-change-me';

function authenticate(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  if (!auth) return false;
  const token = auth.replace('Bearer ', '');
  return token === EARL_API_KEY;
}

export async function POST(request: NextRequest) {
  if (!authenticate(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create':
        return handleCreate(body);
      case 'update':
        return handleUpdate(body);
      case 'done':
        return handleDone(body);
      case 'note':
        return handleNote(body);
      case 'search':
        return handleSearch(body);
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Valid actions: create, update, done, note, search` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('POST /api/earl error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Also support GET for search
export async function GET(request: NextRequest) {
  if (!authenticate(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const status = searchParams.get('status') as TaskStatus | null;
    const priority = searchParams.get('priority') as TaskPriority | null;
    const limit = parseInt(searchParams.get('limit') || '20');

    return handleSearch({ query, status, priority, limit });
  } catch (error) {
    console.error('GET /api/earl error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleCreate(body: {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  note?: string;
}) {
  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const id = generateId();
  const now = new Date().toISOString();

  const newTask = {
    id,
    title: body.title.trim(),
    description: body.description?.trim() || null,
    status: body.status || 'triage' as const,
    priority: body.priority || 'medium' as const,
    createdBy: 'earl',
    createdAt: now,
    updatedAt: now,
    completedAt: body.status === 'done' ? now : null,
    myDay: null,
    myDayOrder: null,
    archived: false,
  };

  db.insert(tasks).values(newTask).run();

  logTaskCreated(id, newTask.title, 'earl');
  notifyTaskCreated(newTask.title, id, 'earl');
  notifyEarlAction('Created task', newTask.title, id);
  if (newTask.priority === 'urgent') {
    notifyHighPriority(newTask.title, id, 'earl');
  }
  fireTaskCreated(newTask as unknown as Record<string, unknown>);

  // Add note if provided
  if (body.note) {
    logNoteAdded(id, body.note, 'earl');
  }

  return NextResponse.json({
    success: true,
    task: mapTask(newTask),
    message: `Task "${newTask.title}" created by Earl`,
  }, { status: 201 });
}

async function handleUpdate(body: {
  id?: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  note?: string;
}) {
  if (!body.id) {
    return NextResponse.json({ error: 'Task id is required' }, { status: 400 });
  }

  const existing = db.select().from(tasks).where(eq(tasks.id, body.id)).get();
  if (!existing) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const now = new Date().toISOString();
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
    if (body.status === 'done') {
      updates.completedAt = now;
      notifyTaskCompleted(existing.title, body.id, 'earl');
      fireTaskCompleted({ ...mapTask(existing), status: 'done' } as unknown as Record<string, unknown>);
    }
    notifyStatusChanged(existing.title, body.id, existing.status, body.status, 'earl');
  }
  if (body.priority !== undefined && body.priority !== existing.priority) {
    updates.priority = body.priority;
    changes.push({ field: 'priority', from: existing.priority, to: body.priority });
    if (body.priority === 'urgent') {
      notifyHighPriority(existing.title, body.id, 'earl');
    }
  }

  if (changes.length > 0) {
    db.update(tasks).set(updates).where(eq(tasks.id, body.id)).run();
    logTaskUpdated(body.id, changes, 'earl');
    notifyEarlAction('Updated task', existing.title, body.id);
    fireTaskUpdated(
      mapTask({ ...existing, ...updates } as typeof existing) as unknown as Record<string, unknown>,
      Object.fromEntries(changes.map((c) => [c.field, { from: c.from, to: c.to }]))
    );
  }

  if (body.note) {
    logNoteAdded(body.id, body.note, 'earl');
  }

  const updated = db.select().from(tasks).where(eq(tasks.id, body.id)).get();
  return NextResponse.json({
    success: true,
    task: mapTask(updated!),
    changes: changes.length,
    message: changes.length > 0
      ? `Earl updated ${changes.map((c) => c.field).join(', ')}`
      : 'No changes',
  });
}

async function handleDone(body: { id?: string; note?: string }) {
  if (!body.id) {
    return NextResponse.json({ error: 'Task id is required' }, { status: 400 });
  }

  const existing = db.select().from(tasks).where(eq(tasks.id, body.id)).get();
  if (!existing) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const now = new Date().toISOString();
  db.update(tasks)
    .set({ status: 'done', completedAt: now, updatedAt: now })
    .where(eq(tasks.id, body.id))
    .run();

  logTaskUpdated(body.id, [{ field: 'status', from: existing.status, to: 'done' }], 'earl');
  notifyTaskCompleted(existing.title, body.id, 'earl');
  notifyEarlAction('Completed task', existing.title, body.id);
  fireTaskCompleted({ ...mapTask(existing), status: 'done' } as unknown as Record<string, unknown>);

  if (body.note) {
    logNoteAdded(body.id, body.note, 'earl');
  }

  const updated = db.select().from(tasks).where(eq(tasks.id, body.id)).get();
  return NextResponse.json({
    success: true,
    task: mapTask(updated!),
    message: `Earl marked "${existing.title}" as done`,
  });
}

async function handleNote(body: { id?: string; note?: string }) {
  if (!body.id) {
    return NextResponse.json({ error: 'Task id is required' }, { status: 400 });
  }
  if (!body.note?.trim()) {
    return NextResponse.json({ error: 'Note is required' }, { status: 400 });
  }

  const existing = db.select().from(tasks).where(eq(tasks.id, body.id)).get();
  if (!existing) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  logNoteAdded(body.id, body.note.trim(), 'earl');

  return NextResponse.json({
    success: true,
    message: `Earl added note to "${existing.title}"`,
  });
}

async function handleSearch(body: {
  query?: string;
  status?: TaskStatus | null;
  priority?: TaskPriority | null;
  limit?: number;
}) {
  const conditions = [eq(tasks.archived, false)];

  if (body.query) {
    conditions.push(
      or(
        like(tasks.title, `%${body.query}%`),
        like(tasks.description, `%${body.query}%`)
      )!
    );
  }
  if (body.status) {
    conditions.push(eq(tasks.status, body.status));
  }
  if (body.priority) {
    conditions.push(eq(tasks.priority, body.priority));
  }

  const results = db
    .select()
    .from(tasks)
    .where(conditions.length > 1 ? sql`${conditions.reduce((a, b) => sql`${a} AND ${b}`)}` : conditions[0])
    .orderBy(desc(tasks.updatedAt))
    .limit(body.limit || 20)
    .all();

  return NextResponse.json({
    success: true,
    tasks: results.map(mapTask),
    count: results.length,
  });
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
