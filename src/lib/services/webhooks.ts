// ============================================================
// Webhook service — fires outgoing webhooks on task events
// ============================================================

import { db, DB_AVAILABLE } from '@/src/lib/db';
import { webhooks } from '@/src/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

/** Sign payload with HMAC-SHA256 */
function signPayload(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/** Fire all matching webhooks for an event */
export async function fireWebhooks(event: string, data: Record<string, unknown>): Promise<void> {
  if (!DB_AVAILABLE) return; // Silently skip when DB unavailable
  const allWebhooks = db.select().from(webhooks).all();
  const matching = allWebhooks.filter((wh) => {
    if (!wh.enabled) return false;
    try {
      const events = JSON.parse(wh.events) as string[];
      return events.includes(event) || events.includes('*');
    } catch {
      return false;
    }
  });

  if (matching.length === 0) return;

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  const body = JSON.stringify(payload);

  // Fire all webhooks concurrently (best effort)
  await Promise.allSettled(
    matching.map(async (wh) => {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-Earl-Event': event,
        };

        if (wh.secret) {
          headers['X-Earl-Signature'] = signPayload(body, wh.secret);
        }

        const res = await fetch(wh.url, {
          method: 'POST',
          headers,
          body,
          signal: AbortSignal.timeout(10000),
        });

        if (res.ok) {
          // Reset fail count on success
          db.update(webhooks)
            .set({
              lastTriggered: new Date().toISOString(),
              failCount: 0,
            })
            .where(eq(webhooks.id, wh.id))
            .run();
        } else {
          throw new Error(`HTTP ${res.status}`);
        }
      } catch (error) {
        const newFailCount = wh.failCount + 1;
        // Auto-disable after 10 consecutive failures
        db.update(webhooks)
          .set({
            failCount: newFailCount,
            enabled: newFailCount < 10,
          })
          .where(eq(webhooks.id, wh.id))
          .run();

        console.error(`Webhook ${wh.name} failed (${newFailCount}):`, error);
      }
    })
  );
}

/** Fire webhooks for common task events */
export function fireTaskCreated(task: Record<string, unknown>) {
  fireWebhooks('task.created', { task }).catch(console.error);
}

export function fireTaskUpdated(task: Record<string, unknown>, changes: Record<string, unknown>) {
  fireWebhooks('task.updated', { task, changes }).catch(console.error);
}

export function fireTaskCompleted(task: Record<string, unknown>) {
  fireWebhooks('task.completed', { task }).catch(console.error);
}

export function fireTaskDeleted(taskId: string) {
  fireWebhooks('task.deleted', { taskId }).catch(console.error);
}
