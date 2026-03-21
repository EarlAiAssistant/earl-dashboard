// ============================================================
// Database connection — singleton for the app
// Falls back gracefully when SQLite is unavailable (e.g. Vercel)
// ============================================================

import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type * as schema from './schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let db: BetterSQLite3Database<typeof schema> = null as any;
export let DB_AVAILABLE = false;
export let DB_ERROR: string | null = null;

function initDb() {
  try {
    // Dynamic require so bundler doesn't fail if native module is missing
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require('drizzle-orm/better-sqlite3');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    const schemaModule = require('./schema');

    const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'earl-dashboard.db');

    // Ensure data directory exists
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const sqlite = new Database(DB_PATH);

    // Enable WAL mode for better concurrent access
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
    sqlite.pragma('busy_timeout = 5000');

    const database = drizzle(sqlite, { schema: schemaModule });

    // Run migrations inline (create tables if not exist)
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'triage' CHECK(status IN ('triage','backlog','in_progress','in_review','done')),
        priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('urgent','high','medium','low')),
        created_by TEXT NOT NULL DEFAULT 'system',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        completed_at TEXT,
        my_day TEXT,
        my_day_order INTEGER,
        archived INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        action TEXT NOT NULL,
        actor TEXT NOT NULL DEFAULT 'user',
        details TEXT,
        timestamp TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT,
        task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
        actor TEXT NOT NULL DEFAULT 'system',
        read INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS webhooks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        events TEXT NOT NULL,
        secret TEXT,
        enabled INTEGER NOT NULL DEFAULT 1,
        last_triggered TEXT,
        fail_count INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS integrations (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        config TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS notification_preferences (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL DEFAULT 'default',
        task_created INTEGER NOT NULL DEFAULT 1,
        task_completed INTEGER NOT NULL DEFAULT 1,
        status_changed INTEGER NOT NULL DEFAULT 1,
        priority_changed INTEGER NOT NULL DEFAULT 0,
        high_priority INTEGER NOT NULL DEFAULT 1,
        earl_action INTEGER NOT NULL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS task_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        default_status TEXT NOT NULL DEFAULT 'triage',
        default_priority TEXT NOT NULL DEFAULT 'medium',
        title_template TEXT,
        description_template TEXT,
        is_built_in INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS saved_filters (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        filters TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
      CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
      CREATE INDEX IF NOT EXISTS idx_tasks_my_day ON tasks(my_day);
      CREATE INDEX IF NOT EXISTS idx_tasks_archived ON tasks(archived);
      CREATE INDEX IF NOT EXISTS idx_activities_task_id ON activities(task_id);
      CREATE INDEX IF NOT EXISTS idx_activities_actor ON activities(actor);
      CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
    `);

    // Phase 2/3: Add columns to existing tables if upgrading
    const safeAlter = (sql: string) => { try { sqlite.exec(sql); } catch { /* column already exists */ } };
    safeAlter('ALTER TABLE tasks ADD COLUMN my_day TEXT');
    safeAlter('ALTER TABLE tasks ADD COLUMN my_day_order INTEGER');
    safeAlter('ALTER TABLE tasks ADD COLUMN completed_at TEXT');
    safeAlter('ALTER TABLE tasks ADD COLUMN archived INTEGER NOT NULL DEFAULT 0');
    safeAlter('ALTER TABLE activities ADD COLUMN actor TEXT NOT NULL DEFAULT \'user\'');

    // Insert built-in templates if they don't exist
    const templateCount = sqlite.prepare('SELECT COUNT(*) as count FROM task_templates WHERE is_built_in = 1').get() as { count: number };
    if (templateCount.count === 0) {
      sqlite.exec(`
        INSERT INTO task_templates (id, name, description, default_status, default_priority, title_template, description_template, is_built_in)
        VALUES
          ('tpl_bug', 'Bug Report', 'Report a bug or defect', 'triage', 'high', '[Bug] ', '## Steps to Reproduce\n1. \n\n## Expected Behavior\n\n\n## Actual Behavior\n\n\n## Environment\n- OS: \n- Browser: ', 1),
          ('tpl_feature', 'Feature Request', 'Request a new feature', 'backlog', 'medium', '[Feature] ', '## Problem Statement\n\n\n## Proposed Solution\n\n\n## Acceptance Criteria\n- [ ] \n- [ ] \n- [ ] ', 1),
          ('tpl_design', 'Design Task', 'Design-related work', 'backlog', 'medium', '[Design] ', '## Objective\n\n\n## Requirements\n\n\n## Deliverables\n- [ ] \n- [ ] ', 1),
          ('tpl_chore', 'Chore', 'Maintenance or cleanup task', 'backlog', 'low', '[Chore] ', '## What needs to be done\n\n\n## Why\n\n', 1);
      `);
    }

    // Insert default notification preferences if none exist
    const prefCount = sqlite.prepare('SELECT COUNT(*) as count FROM notification_preferences').get() as { count: number };
    if (prefCount.count === 0) {
      sqlite.exec(`
        INSERT INTO notification_preferences (id, user_id, task_created, task_completed, status_changed, priority_changed, high_priority, earl_action)
        VALUES ('pref_default', 'default', 1, 1, 1, 0, 1, 1);
      `);
    }

    db = database as BetterSQLite3Database<typeof schema>;
    DB_AVAILABLE = true;
    console.log('[DB] SQLite initialized at', DB_PATH);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    DB_ERROR = message;
    DB_AVAILABLE = false;
    // db stays as the null cast — routes check DB_AVAILABLE before using it
    console.warn('[DB] SQLite unavailable — browser storage fallback will be used:', message);
  }
}

// Initialize once at module load
initDb();
