// ============================================================
// GET    /api/notifications — List notifications (paginated)
// PATCH  /api/notifications — Mark as read (single or bulk)
// DELETE /api/notifications — Delete notification(s)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db, DB_AVAILABLE } from '@/src/lib/db';
import { notifications } from '@/src/lib/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';

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
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const offset = (page - 1) * pageSize;

    const where = unreadOnly ? eq(notifications.read, false) : undefined;

    const countResult = db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(where)
      .get();
    const total = countResult?.count ?? 0;

    const unreadCount = db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(eq(notifications.read, false))
      .get();

    const rows = db
      .select()
      .from(notifications)
      .where(where)
      .orderBy(desc(notifications.createdAt))
      .limit(pageSize)
      .offset(offset)
      .all();

    return NextResponse.json({
      data: rows,
      total,
      unreadCount: unreadCount?.count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('GET /api/notifications error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!DB_AVAILABLE) return dbUnavailable();
  try {
    const body = await request.json();

    if (body.markAllRead) {
      db.update(notifications)
        .set({ read: true })
        .where(eq(notifications.read, false))
        .run();
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (body.id) {
      db.update(notifications)
        .set({ read: true })
        .where(eq(notifications.id, body.id))
        .run();
      return NextResponse.json({ success: true });
    }

    if (body.ids && Array.isArray(body.ids)) {
      for (const id of body.ids) {
        db.update(notifications)
          .set({ read: true })
          .where(eq(notifications.id, id))
          .run();
      }
      return NextResponse.json({ success: true, count: body.ids.length });
    }

    return NextResponse.json({ error: 'Provide id, ids array, or markAllRead: true' }, { status: 400 });
  } catch (error) {
    console.error('PATCH /api/notifications error:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!DB_AVAILABLE) return dbUnavailable();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      db.delete(notifications).where(eq(notifications.id, id)).run();
      return NextResponse.json({ success: true });
    }

    // Delete all read notifications
    const deleteAll = searchParams.get('readOnly') === 'true';
    if (deleteAll) {
      db.delete(notifications).where(eq(notifications.read, true)).run();
      return NextResponse.json({ success: true, message: 'All read notifications deleted' });
    }

    return NextResponse.json({ error: 'Provide id or readOnly=true' }, { status: 400 });
  } catch (error) {
    console.error('DELETE /api/notifications error:', error);
    return NextResponse.json({ error: 'Failed to delete notifications' }, { status: 500 });
  }
}
