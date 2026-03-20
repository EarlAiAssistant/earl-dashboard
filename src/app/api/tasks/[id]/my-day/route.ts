// ============================================================
// POST   /api/tasks/:id/my-day — Add task to My Day
// DELETE /api/tasks/:id/my-day — Remove task from My Day
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { tasks } from '@/src/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = db.select().from(tasks).where(eq(tasks.id, id)).get();
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const now = new Date().toISOString();

    // Get max order for today's My Day tasks
    const maxOrder = db
      .select({ max: sql<number>`COALESCE(MAX(my_day_order), 0)` })
      .from(tasks)
      .where(sql`my_day IS NOT NULL`)
      .get();

    db.update(tasks)
      .set({
        myDay: now,
        myDayOrder: (maxOrder?.max ?? 0) + 1,
        updatedAt: now,
      })
      .where(eq(tasks.id, id))
      .run();

    const updated = db.select().from(tasks).where(eq(tasks.id, id)).get();
    return NextResponse.json(updated);
  } catch (error) {
    console.error('POST /api/tasks/:id/my-day error:', error);
    return NextResponse.json({ error: 'Failed to add to My Day' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = db.select().from(tasks).where(eq(tasks.id, id)).get();
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    db.update(tasks)
      .set({
        myDay: null,
        myDayOrder: null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(tasks.id, id))
      .run();

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('DELETE /api/tasks/:id/my-day error:', error);
    return NextResponse.json({ error: 'Failed to remove from My Day' }, { status: 500 });
  }
}
