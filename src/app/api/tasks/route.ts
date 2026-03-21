// ============================================================
// GET /api/tasks  — List tasks with filtering, sorting, pagination
// POST /api/tasks — Create a new task
// Returns 503 when database is unavailable (Vercel/serverless)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db, DB_AVAILABLE } from '@/src/lib/db';
import { tasks } from '@/src/lib/db/schema';
import { eq, desc, asc, and, like, sql, or, gte, lte, isNotNull } from 'drizzle-orm';
import { generateId } from '@/src/lib/utils';
import { logTaskCreated } from '@/src/lib/services/activity-logger';
import { notifyTaskCreated, notifyHighPriority } from '@/src/lib/services/notifications';
import { fireTaskCreated } from '@/src/lib/services/webhooks';
import type { TaskStatus, TaskPriority, TaskFilters, PaginatedResponse, Task } from '@/src/lib/types';

function dbUnavailable() {
  return NextResponse.json(
    { error: 'Database unavailable. Running in browser storage mode.', code: 'DB_UNAVAILABLE' },
    { status: 503 }
  );
}

export async function GET(request: NextRequest) {
  if (!DB_AVAILABLE) return dbUnavailable();

  try {
    const { searchParams } = new URL(request.url);

    const filters: TaskFilters = {
      status: (searchParams.get('status') as TaskStatus) || 'all',
      priority: (searchParams.get('priority') as TaskPriority) || 'all',
      sortBy: (searchParams.get('sortBy') as TaskFilters['sortBy']) || 'created_at',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '50'),
      search: searchParams.get('search') || undefined,
      createdBy: searchParams.get('createdBy') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      myDay: searchParams.get('myDay') === 'true' || undefined,
      archived: searchParams.get('archived') === 'true' || undefined,
    };

    const conditions = [];

    // By default, exclude archived unless explicitly requested
    if (filters.archived) {
      conditions.push(eq(tasks.archived, true));
    } else {
      conditions.push(eq(tasks.archived, false));
    }

    if (filters.status && filters.status !== 'all') {
      conditions.push(eq(tasks.status, filters.status));
    }
    if (filters.priority && filters.priority !== 'all') {
      conditions.push(eq(tasks.priority, filters.priority));
    }
    if (filters.search) {
      conditions.push(
        or(
          like(tasks.title, `%${filters.search}%`),
          like(tasks.description, `%${filters.search}%`)
        )!
      );
    }
    if (filters.createdBy) {
      conditions.push(eq(tasks.createdBy, filters.createdBy));
    }
    if (filters.dateFrom) {
      conditions.push(gte(tasks.createdAt, filters.dateFrom));
    }
    if (filters.dateTo) {
      conditions.push(lte(tasks.createdAt, filters.dateTo));
    }
    if (filters.myDay) {
      conditions.push(isNotNull(tasks.myDay));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const sortColumn = {
      created_at: tasks.createdAt,
      updated_at: tasks.updatedAt,
      title: tasks.title,
      priority: tasks.priority,
    }[filters.sortBy || 'created_at'];

    const orderFn = filters.sortOrder === 'asc' ? asc : desc;

    const countResult = db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(where)
      .get();
    const total = countResult?.count ?? 0;

    const page = filters.page || 1;
    const pageSize = Math.min(filters.pageSize || 50, 100);
    const offset = (page - 1) * pageSize;

    const rows = db
      .select()
      .from(tasks)
      .where(where)
      .orderBy(orderFn(sortColumn))
      .limit(pageSize)
      .offset(offset)
      .all();

    const result: PaginatedResponse<Task> = {
      data: rows.map(mapTask),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    // If this looks like a DB error, return 503
    if (isDbError(error)) return dbUnavailable();
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!DB_AVAILABLE) return dbUnavailable();

  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const id = generateId();
    const now = new Date().toISOString();
    const actor = body.createdBy || 'user';

    const newTask = {
      id,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      status: body.status || 'triage',
      priority: body.priority || 'medium',
      createdBy: actor,
      createdAt: now,
      updatedAt: now,
      completedAt: body.status === 'done' ? now : null,
      myDay: null,
      myDayOrder: null,
      archived: false,
    };

    db.insert(tasks).values(newTask).run();

    // Activity log
    logTaskCreated(id, newTask.title, actor);

    // Notifications
    notifyTaskCreated(newTask.title, id, actor);
    if (newTask.priority === 'urgent') {
      notifyHighPriority(newTask.title, id, actor);
    }

    // Webhooks
    fireTaskCreated(newTask as unknown as Record<string, unknown>);

    return NextResponse.json(mapTask(newTask), { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    if (isDbError(error)) return dbUnavailable();
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
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

function isDbError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('sqlite') ||
    msg.includes('better-sqlite3') ||
    msg.includes('database') ||
    msg.includes('no such table') ||
    msg.includes('enoent')
  );
}
