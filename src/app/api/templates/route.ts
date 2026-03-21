// ============================================================
// GET  /api/templates — List all task templates
// POST /api/templates — Create a custom template
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db, DB_AVAILABLE } from '@/src/lib/db';
import { taskTemplates } from '@/src/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '@/src/lib/utils';

function dbUnavailable() {
  return NextResponse.json(
    { error: 'Database unavailable. Running in browser storage mode.', code: 'DB_UNAVAILABLE' },
    { status: 503 }
  );
}

export async function GET() {
  if (!DB_AVAILABLE) return dbUnavailable();
  try {
    const templates = db.select().from(taskTemplates).all();
    return NextResponse.json(templates.map(mapTemplate));
  } catch (error) {
    console.error('GET /api/templates error:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!DB_AVAILABLE) return dbUnavailable();
  try {
    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const id = generateId();
    const now = new Date().toISOString();

    db.insert(taskTemplates)
      .values({
        id,
        name: body.name.trim(),
        description: body.description?.trim() || null,
        defaultStatus: body.defaultStatus || 'triage',
        defaultPriority: body.defaultPriority || 'medium',
        titleTemplate: body.titleTemplate?.trim() || null,
        descriptionTemplate: body.descriptionTemplate?.trim() || null,
        isBuiltIn: false,
        createdAt: now,
      })
      .run();

    const created = db.select().from(taskTemplates).where(
      eq(taskTemplates.id, id)
    ).get();

    return NextResponse.json(mapTemplate(created!), { status: 201 });
  } catch (error) {
    console.error('POST /api/templates error:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}

function mapTemplate(row: typeof taskTemplates.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    defaultStatus: row.defaultStatus,
    defaultPriority: row.defaultPriority,
    titleTemplate: row.titleTemplate,
    descriptionTemplate: row.descriptionTemplate,
    isBuiltIn: row.isBuiltIn,
    createdAt: row.createdAt,
  };
}
