// ============================================================
// GET /api/activities — List activities with filtering, pagination
// Supports: taskId, action, actor, dateFrom, dateTo, export (json/csv)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { activities, tasks } from '@/src/lib/db/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const taskId = searchParams.get('taskId');
    const action = searchParams.get('action');
    const actor = searchParams.get('actor');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const exportFormat = searchParams.get('export'); // 'json' | 'csv'
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '50'), 200);

    const conditions = [];
    if (taskId) conditions.push(eq(activities.taskId, taskId));
    if (action) conditions.push(eq(activities.action, action));
    if (actor) conditions.push(eq(activities.actor, actor));
    if (dateFrom) conditions.push(gte(activities.timestamp, dateFrom));
    if (dateTo) conditions.push(lte(activities.timestamp, dateTo));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // Export mode — return all matching (up to 10k)
    if (exportFormat) {
      const allRows = db
        .select({
          id: activities.id,
          taskId: activities.taskId,
          taskTitle: tasks.title,
          action: activities.action,
          actor: activities.actor,
          details: activities.details,
          timestamp: activities.timestamp,
        })
        .from(activities)
        .leftJoin(tasks, eq(activities.taskId, tasks.id))
        .where(where)
        .orderBy(desc(activities.timestamp))
        .limit(10000)
        .all();

      if (exportFormat === 'csv') {
        const csvHeader = 'id,task_id,task_title,action,actor,details,timestamp';
        const csvRows = allRows.map((r) =>
          [
            r.id,
            r.taskId,
            `"${(r.taskTitle || '').replace(/"/g, '""')}"`,
            r.action,
            r.actor,
            `"${(r.details || '').replace(/"/g, '""')}"`,
            r.timestamp,
          ].join(',')
        );
        const csv = [csvHeader, ...csvRows].join('\n');

        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="activities-${new Date().toISOString().split('T')[0]}.csv"`,
          },
        });
      }

      return NextResponse.json({ data: allRows, count: allRows.length });
    }

    // Paginated mode
    const countResult = db
      .select({ count: sql<number>`count(*)` })
      .from(activities)
      .where(where)
      .get();
    const total = countResult?.count ?? 0;
    const offset = (page - 1) * pageSize;

    const rows = db
      .select({
        id: activities.id,
        taskId: activities.taskId,
        taskTitle: tasks.title,
        action: activities.action,
        actor: activities.actor,
        details: activities.details,
        timestamp: activities.timestamp,
      })
      .from(activities)
      .leftJoin(tasks, eq(activities.taskId, tasks.id))
      .where(where)
      .orderBy(desc(activities.timestamp))
      .limit(pageSize)
      .offset(offset)
      .all();

    return NextResponse.json({
      data: rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('GET /api/activities error:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
