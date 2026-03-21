// ============================================================
// GET  /api/notifications/preferences — Get notification preferences
// PUT  /api/notifications/preferences — Update notification preferences
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db, DB_AVAILABLE } from '@/src/lib/db';
import { notificationPreferences } from '@/src/lib/db/schema';
import { eq } from 'drizzle-orm';

function dbUnavailable() {
  return NextResponse.json(
    { error: 'Database unavailable. Running in browser storage mode.', code: 'DB_UNAVAILABLE' },
    { status: 503 }
  );
}

export async function GET() {
  if (!DB_AVAILABLE) return dbUnavailable();
  try {
    const prefs = db.select().from(notificationPreferences).limit(1).get();
    if (!prefs) {
      return NextResponse.json({
        taskCreated: true,
        taskCompleted: true,
        statusChanged: true,
        priorityChanged: false,
        highPriority: true,
        earlAction: true,
      });
    }
    return NextResponse.json({
      taskCreated: prefs.taskCreated,
      taskCompleted: prefs.taskCompleted,
      statusChanged: prefs.statusChanged,
      priorityChanged: prefs.priorityChanged,
      highPriority: prefs.highPriority,
      earlAction: prefs.earlAction,
    });
  } catch (error) {
    console.error('GET /api/notifications/preferences error:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!DB_AVAILABLE) return dbUnavailable();
  try {
    const body = await request.json();

    const existing = db.select().from(notificationPreferences).limit(1).get();

    const updates = {
      taskCreated: body.taskCreated ?? true,
      taskCompleted: body.taskCompleted ?? true,
      statusChanged: body.statusChanged ?? true,
      priorityChanged: body.priorityChanged ?? false,
      highPriority: body.highPriority ?? true,
      earlAction: body.earlAction ?? true,
    };

    if (existing) {
      db.update(notificationPreferences)
        .set(updates)
        .where(eq(notificationPreferences.id, existing.id))
        .run();
    } else {
      db.insert(notificationPreferences)
        .values({ id: 'pref_default', userId: 'default', ...updates })
        .run();
    }

    return NextResponse.json({ success: true, ...updates });
  } catch (error) {
    console.error('PUT /api/notifications/preferences error:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
