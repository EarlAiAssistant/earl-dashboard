// ============================================================
// GET /api/tasks  — List tasks with filtering, sorting, pagination
// POST /api/tasks — Create a new task
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { tasks, activities } from '@/src/lib/db/schema';
import { eq, desc, asc, and, like, sql, or, gte, lte, isNotNull } from 'drizzle-orm';
import { generateId } from '@/src/lib/utils';
import type { TaskStatus, TaskPriority, TaskFilters, PaginatedResponse, Task } from '@/src/lib/types';

export async function GET(request: NextRequest) {
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
    };

    // Build where conditions
    const conditions = [];
    if (filters.status && filters.status !== 'all') {
      conditions.push(eq(tasks.status, filters.status));
    }
    if (filters.priority && filters.priority !== 'all') {
      conditions.push(eq(tasks.priority, filters.priority));
    }
    if (filters.search) {
      // Search across title AND description
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

    // Sort mapping
    const sortColumn = {
      created_at: tasks.createdAt,
      updated_at: tasks.updatedAt,
      title: tasks.title,
      priority: tasks.priority,
    }[filters.sortBy || 'created_at'];

    const orderFn = filters.sortOrder === 'asc' ? asc : desc;

    // Count total
    const countResult = db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(where)
      .get();
    const total = countResult?.count ?? 0;

    // Fetch page
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
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const id = generateId();
    const now = new Date().toISOString();

    const newTask = {
      id,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      status: body.status || 'triage',
      priority: body.priority || 'medium',
      createdBy: body.createdBy || 'user',
      createdAt: now,
      updatedAt: now,
      myDay: null,
      myDayOrder: null,
    };

    db.insert(tasks).values(newTask).run();

    // Log activity
    db.insert(activities)
      .values({
        id: generateId(),
        taskId: id,
        action: 'created',
        details: JSON.stringify({ title: newTask.title, status: newTask.status, priority: newTask.priority }),
        timestamp: now,
      })
      .run();

    return NextResponse.json(mapTask(newTask), { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

/** Map a DB row to the API Task shape */
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
    myDay: row.myDay,
    myDayOrder: row.myDayOrder,
  };
}
