// ============================================================
// Database connection — singleton for the app
// ============================================================

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'earl-dashboard.db');

// Ensure data directory exists
import fs from 'fs';
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(DB_PATH);

// Enable WAL mode for better concurrent access
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('busy_timeout = 5000');

export const db = drizzle(sqlite, { schema });

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
    my_day TEXT,
    my_day_order INTEGER
  );

  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details TEXT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now'))
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
  CREATE INDEX IF NOT EXISTS idx_activities_task_id ON activities(task_id);
`);

// Phase 2: Add columns to existing tables if upgrading
try {
  sqlite.exec(`ALTER TABLE tasks ADD COLUMN my_day TEXT`);
} catch { /* column already exists */ }
try {
  sqlite.exec(`ALTER TABLE tasks ADD COLUMN my_day_order INTEGER`);
} catch { /* column already exists */ }

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
