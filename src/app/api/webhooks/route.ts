// ============================================================
// CRUD for webhook subscriptions
// GET    /api/webhooks — List all webhooks
// POST   /api/webhooks — Create webhook
// PATCH  /api/webhooks — Update webhook (id in body)
// DELETE /api/webhooks — Delete webhook (id in query)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db';
import { webhooks } from '@/src/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '@/src/lib/utils';
import crypto from 'crypto';

export async function GET() {
  try {
    const rows = db.select().from(webhooks).all();
    return NextResponse.json(
      rows.map((wh) => ({
        ...wh,
        events: JSON.parse(wh.events || '[]'),
      }))
    );
  } catch (error) {
    console.error('GET /api/webhooks error:', error);
    return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.url) {
      return NextResponse.json({ error: 'name and url are required' }, { status: 400 });
    }

    const id = generateId();
    const secret = body.secret || crypto.randomBytes(32).toString('hex');

    db.insert(webhooks)
      .values({
        id,
        name: body.name,
        url: body.url,
        events: JSON.stringify(body.events || ['*']),
        secret,
        enabled: body.enabled !== false,
        failCount: 0,
        createdAt: new Date().toISOString(),
      })
      .run();

    return NextResponse.json({ id, name: body.name, secret, message: 'Webhook created' }, { status: 201 });
  } catch (error) {
    console.error('POST /api/webhooks error:', error);
    return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.url !== undefined) updates.url = body.url;
    if (body.events !== undefined) updates.events = JSON.stringify(body.events);
    if (body.enabled !== undefined) updates.enabled = body.enabled;
    if (body.secret !== undefined) updates.secret = body.secret;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    db.update(webhooks).set(updates).where(eq(webhooks.id, body.id)).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/webhooks error:', error);
    return NextResponse.json({ error: 'Failed to update webhook' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    db.delete(webhooks).where(eq(webhooks.id, id)).run();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/webhooks error:', error);
    return NextResponse.json({ error: 'Failed to delete webhook' }, { status: 500 });
  }
}
