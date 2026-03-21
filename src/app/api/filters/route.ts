// ============================================================
// GET  /api/filters — List saved filter views
// POST /api/filters — Save a named filter
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db, DB_AVAILABLE } from '@/src/lib/db';
import { savedFilters } from '@/src/lib/db/schema';
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
    const filters = db.select().from(savedFilters).all();
    return NextResponse.json(
      filters.map((f) => ({
        ...f,
        filters: JSON.parse(f.filters),
      }))
    );
  } catch (error) {
    console.error('GET /api/filters error:', error);
    return NextResponse.json({ error: 'Failed to fetch filters' }, { status: 500 });
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

    db.insert(savedFilters)
      .values({
        id,
        name: body.name.trim(),
        filters: JSON.stringify(body.filters || {}),
        createdAt: now,
      })
      .run();

    const created = db.select().from(savedFilters).where(eq(savedFilters.id, id)).get();
    return NextResponse.json(
      { ...created!, filters: JSON.parse(created!.filters) },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/filters error:', error);
    return NextResponse.json({ error: 'Failed to save filter' }, { status: 500 });
  }
}
