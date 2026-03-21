// ============================================================
// GET /api/analytics — Dashboard analytics & reporting
// Supports: overview, trends, hourly, export
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db, DB_AVAILABLE } from '@/src/lib/db';
import { tasks } from '@/src/lib/db/schema';
import { eq, sql, and, gte, lte } from 'drizzle-orm';
import type { TaskStatus, TaskPriority } from '@/src/lib/types';

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
    const type = searchParams.get('type') || 'overview';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const exportFormat = searchParams.get('export');

    switch (type) {
      case 'overview':
        return getOverview(dateFrom, dateTo);
      case 'trends':
        return getTrends(dateFrom, dateTo);
      case 'hourly':
        return getHourly();
      case 'export':
        return getExport(exportFormat || 'json', dateFrom, dateTo);
      default:
        return NextResponse.json({ error: 'Unknown analytics type' }, { status: 400 });
    }
  } catch (error) {
    console.error('GET /api/analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

async function getOverview(dateFrom: string | null, dateTo: string | null) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

  // Total tasks
  const totalResult = db
    .select({ count: sql<number>`count(*)` })
    .from(tasks)
    .where(eq(tasks.archived, false))
    .get();

  // Tasks this week
  const weekResult = db
    .select({ count: sql<number>`count(*)` })
    .from(tasks)
    .where(and(eq(tasks.archived, false), gte(tasks.createdAt, weekAgo)))
    .get();

  // Tasks this month
  const monthResult = db
    .select({ count: sql<number>`count(*)` })
    .from(tasks)
    .where(and(eq(tasks.archived, false), gte(tasks.createdAt, monthAgo)))
    .get();

  // Completed tasks
  const completedResult = db
    .select({ count: sql<number>`count(*)` })
    .from(tasks)
    .where(and(eq(tasks.archived, false), eq(tasks.status, 'done')))
    .get();

  const completedWeekResult = db
    .select({ count: sql<number>`count(*)` })
    .from(tasks)
    .where(and(eq(tasks.status, 'done'), gte(tasks.completedAt, weekAgo)))
    .get();

  const completedMonthResult = db
    .select({ count: sql<number>`count(*)` })
    .from(tasks)
    .where(and(eq(tasks.status, 'done'), gte(tasks.completedAt, monthAgo)))
    .get();

  // Average completion time (hours)
  const avgResult = db
    .select({
      avg: sql<number>`AVG((julianday(completed_at) - julianday(created_at)) * 24)`,
    })
    .from(tasks)
    .where(and(eq(tasks.status, 'done'), sql`completed_at IS NOT NULL`))
    .get();

  // By status
  const statusCounts = db
    .select({
      status: tasks.status,
      count: sql<number>`count(*)`,
    })
    .from(tasks)
    .where(eq(tasks.archived, false))
    .groupBy(tasks.status)
    .all();

  const byStatus: Record<string, number> = {};
  for (const row of statusCounts) {
    byStatus[row.status] = row.count;
  }

  // By priority
  const priorityCounts = db
    .select({
      priority: tasks.priority,
      count: sql<number>`count(*)`,
    })
    .from(tasks)
    .where(eq(tasks.archived, false))
    .groupBy(tasks.priority)
    .all();

  const byPriority: Record<string, number> = {};
  for (const row of priorityCounts) {
    byPriority[row.priority] = row.count;
  }

  return NextResponse.json({
    totalTasks: totalResult?.count ?? 0,
    tasksThisWeek: weekResult?.count ?? 0,
    tasksThisMonth: monthResult?.count ?? 0,
    completedTasks: completedResult?.count ?? 0,
    completedThisWeek: completedWeekResult?.count ?? 0,
    completedThisMonth: completedMonthResult?.count ?? 0,
    averageCompletionHours: avgResult?.avg ? Math.round(avgResult.avg * 10) / 10 : null,
    byStatus,
    byPriority,
  });
}

async function getTrends(dateFrom: string | null, dateTo: string | null) {
  const days = 30;
  const now = new Date();
  const startDate = dateFrom
    ? new Date(dateFrom)
    : new Date(now.getTime() - days * 86400000);

  const trends = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 86400000);
    const dateStr = date.toISOString().split('T')[0];
    const nextDateStr = new Date(date.getTime() + 86400000).toISOString().split('T')[0];

    const created = db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(and(gte(tasks.createdAt, dateStr), lte(tasks.createdAt, nextDateStr)))
      .get();

    const completed = db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(and(
        sql`completed_at IS NOT NULL`,
        gte(tasks.completedAt, dateStr),
        lte(tasks.completedAt, nextDateStr)
      ))
      .get();

    trends.push({
      date: dateStr,
      created: created?.count ?? 0,
      completed: completed?.count ?? 0,
    });
  }

  return NextResponse.json({ trends });
}

async function getHourly() {
  // Activity by hour of day
  const hourly = db
    .select({
      hour: sql<number>`CAST(strftime('%H', created_at) AS INTEGER)`,
      count: sql<number>`count(*)`,
    })
    .from(tasks)
    .groupBy(sql`strftime('%H', created_at)`)
    .all();

  // Fill in missing hours
  const result = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: hourly.find((h) => h.hour === i)?.count ?? 0,
  }));

  return NextResponse.json({ hourly: result });
}

async function getExport(format: string, dateFrom: string | null, dateTo: string | null) {
  const conditions = [eq(tasks.archived, false)];
  if (dateFrom) conditions.push(gte(tasks.createdAt, dateFrom));
  if (dateTo) conditions.push(lte(tasks.createdAt, dateTo));

  const allTasks = db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .all();

  if (format === 'csv') {
    const headers = 'id,title,status,priority,created_by,created_at,updated_at,completed_at';
    const rows = allTasks.map((t) =>
      [
        t.id,
        `"${t.title.replace(/"/g, '""')}"`,
        t.status,
        t.priority,
        t.createdBy,
        t.createdAt,
        t.updatedAt,
        t.completedAt || '',
      ].join(',')
    );

    return new NextResponse([headers, ...rows].join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  }

  return NextResponse.json({ tasks: allTasks, count: allTasks.length });
}
