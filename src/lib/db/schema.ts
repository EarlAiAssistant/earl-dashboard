// ============================================================
// Drizzle ORM schema — SQLite for local dev, swap to PG later
// ============================================================

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Tasks table — core entity
 * id: UUID-style text primary key (nanoid)
 */
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', {
    enum: ['triage', 'backlog', 'in_progress', 'in_review', 'done'],
  })
    .notNull()
    .default('triage'),
  priority: text('priority', {
    enum: ['urgent', 'high', 'medium', 'low'],
  })
    .notNull()
    .default('medium'),
  createdBy: text('created_by').notNull().default('system'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

/**
 * Activities table — audit log for task changes
 */
export const activities = sqliteTable('activities', {
  id: text('id').primaryKey(),
  taskId: text('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  action: text('action').notNull(), // e.g. "created", "status_changed", "priority_changed"
  details: text('details'), // JSON string with before/after values
  timestamp: text('timestamp')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// Infer types from schema
export type TaskRow = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type ActivityRow = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
