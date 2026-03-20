// ============================================================
// Drizzle ORM schema — SQLite for local dev, swap to PG later
// ============================================================

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Tasks table — core entity
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
  completedAt: text('completed_at'), // When task was moved to done
  myDay: text('my_day'),
  myDayOrder: integer('my_day_order'),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
});

/**
 * Activities table — audit log for task changes
 */
export const activities = sqliteTable('activities', {
  id: text('id').primaryKey(),
  taskId: text('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  actor: text('actor').notNull().default('user'), // 'user', 'earl', 'system'
  details: text('details'), // JSON string with before/after values
  timestamp: text('timestamp')
    .notNull()
    .default(sql`(datetime('now'))`),
});

/**
 * Notifications table — in-app notification center
 */
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'task_created', 'task_completed', 'status_changed', 'priority_changed', 'task_overdue', 'earl_action'
  title: text('title').notNull(),
  message: text('message'),
  taskId: text('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  actor: text('actor').notNull().default('system'),
  read: integer('read', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

/**
 * Webhooks table — outgoing webhook subscriptions
 */
export const webhooks = sqliteTable('webhooks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  events: text('events').notNull(), // JSON array of event types
  secret: text('secret'), // HMAC signing secret
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  lastTriggered: text('last_triggered'),
  failCount: integer('fail_count').notNull().default(0),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

/**
 * Integrations table — third-party integration settings
 */
export const integrations = sqliteTable('integrations', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'slack', 'email', 'webhook'
  name: text('name').notNull(),
  config: text('config').notNull(), // JSON config (channel, webhook URL, etc.)
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

/**
 * Notification preferences
 */
export const notificationPreferences = sqliteTable('notification_preferences', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default('default'),
  taskCreated: integer('task_created', { mode: 'boolean' }).notNull().default(true),
  taskCompleted: integer('task_completed', { mode: 'boolean' }).notNull().default(true),
  statusChanged: integer('status_changed', { mode: 'boolean' }).notNull().default(true),
  priorityChanged: integer('priority_changed', { mode: 'boolean' }).notNull().default(false),
  highPriority: integer('high_priority', { mode: 'boolean' }).notNull().default(true),
  earlAction: integer('earl_action', { mode: 'boolean' }).notNull().default(true),
});

/**
 * Task templates — pre-built templates for quick task creation
 */
export const taskTemplates = sqliteTable('task_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  defaultStatus: text('default_status', {
    enum: ['triage', 'backlog', 'in_progress', 'in_review', 'done'],
  })
    .notNull()
    .default('triage'),
  defaultPriority: text('default_priority', {
    enum: ['urgent', 'high', 'medium', 'low'],
  })
    .notNull()
    .default('medium'),
  titleTemplate: text('title_template'),
  descriptionTemplate: text('description_template'),
  isBuiltIn: integer('is_built_in', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

/**
 * Saved filters — named filter views
 */
export const savedFilters = sqliteTable('saved_filters', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  filters: text('filters').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// Infer types
export type TaskRow = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type ActivityRow = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
export type TaskTemplateRow = typeof taskTemplates.$inferSelect;
export type NewTaskTemplate = typeof taskTemplates.$inferInsert;
export type SavedFilterRow = typeof savedFilters.$inferSelect;
export type NewSavedFilter = typeof savedFilters.$inferInsert;
export type NotificationRow = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type WebhookRow = typeof webhooks.$inferSelect;
export type NewWebhook = typeof webhooks.$inferInsert;
export type IntegrationRow = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;
export type NotificationPreferenceRow = typeof notificationPreferences.$inferSelect;
