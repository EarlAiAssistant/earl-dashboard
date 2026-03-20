// ============================================================
// CRUD for integrations (Slack, email, etc.)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { integrations } from '@/src/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '@/src/lib/utils';

export async function GET() {
  try {
    const rows = db.select().from(integrations).all();
    return NextResponse.json(
      rows.map((r) => ({
        ...r,
        config: JSON.parse(r.config || '{}'),
      }))
    );
  } catch (error) {
    console.error('GET /api/integrations error:', error);
    return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.type || !body.name) {
      return NextResponse.json({ error: 'type and name are required' }, { status: 400 });
    }

    const id = generateId();
    db.insert(integrations)
      .values({
        id,
        type: body.type,
        name: body.name,
        config: JSON.stringify(body.config || {}),
        enabled: body.enabled !== false,
        createdAt: new Date().toISOString(),
      })
      .run();

    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch (error) {
    console.error('POST /api/integrations error:', error);
    return NextResponse.json({ error: 'Failed to create integration' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.config !== undefined) updates.config = JSON.stringify(body.config);
    if (body.enabled !== undefined) updates.enabled = body.enabled;

    db.update(integrations).set(updates).where(eq(integrations.id, body.id)).run();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/integrations error:', error);
    return NextResponse.json({ error: 'Failed to update integration' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    db.delete(integrations).where(eq(integrations.id, id)).run();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/integrations error:', error);
    return NextResponse.json({ error: 'Failed to delete integration' }, { status: 500 });
  }
}
