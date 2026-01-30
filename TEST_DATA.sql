-- Test Data for Earl Dashboard
-- Run this in Supabase SQL Editor to populate sample data

-- Insert sample tasks
INSERT INTO tasks (title, description, status, session_key, started_at, completed_at, metadata)
VALUES 
(
  'Build Next.js Dashboard',
  'Create a production-ready dashboard for tracking Earl''s activities with Kanban board, documents, and activity log.',
  'done',
  'agent:main:20240101-001',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '1 hour',
  '{"type": "development", "tool": "exec"}'::jsonb
),
(
  'Integrate OpenClaw Webhook',
  'Set up webhook endpoint to receive real-time updates from OpenClaw sessions.',
  'in_progress',
  'agent:main:20240101-002',
  NOW() - INTERVAL '30 minutes',
  NULL,
  '{"type": "integration", "tool": "api"}'::jsonb
),
(
  'Test File Upload',
  'Verify document upload functionality works with various file types.',
  'backlog',
  'agent:main:20240101-003',
  NULL,
  NULL,
  '{"type": "testing", "priority": "high"}'::jsonb
),
(
  'Deploy to Vercel',
  'Configure environment variables and deploy the dashboard to production.',
  'backlog',
  NULL,
  NULL,
  NULL,
  '{"type": "deployment"}'::jsonb
),
(
  'Configure Supabase',
  'Set up database, storage, and authentication for the Earl Dashboard.',
  'done',
  'agent:main:20240101-004',
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '2 hours',
  '{"type": "infrastructure", "tool": "supabase"}'::jsonb
);

-- Insert sample activity logs
INSERT INTO activity_log (action_type, details, status, metadata)
VALUES
(
  'session_start',
  'Started new development session for Earl Dashboard',
  'completed',
  '{"session_key": "agent:main:20240101-001", "duration_minutes": 60}'::jsonb
),
(
  'tool_call',
  'Executed npm install to set up project dependencies',
  'completed',
  '{"tool": "exec", "command": "npm install", "session_key": "agent:main:20240101-001"}'::jsonb
),
(
  'tool_call',
  'Created Supabase database schema and migrations',
  'completed',
  '{"tool": "file_write", "files": ["migrations/initial_schema.sql"], "session_key": "agent:main:20240101-001"}'::jsonb
),
(
  'tool_call',
  'Built KanbanBoard component with drag-and-drop functionality',
  'completed',
  '{"tool": "code", "component": "KanbanBoard", "session_key": "agent:main:20240101-001"}'::jsonb
),
(
  'tool_call',
  'Implemented file upload feature with Supabase Storage',
  'completed',
  '{"tool": "integration", "service": "supabase-storage", "session_key": "agent:main:20240101-002"}'::jsonb
),
(
  'web_search',
  'Researched Next.js 16 App Router best practices',
  'completed',
  '{"tool": "web_search", "query": "Next.js 16 App Router", "results": 5}'::jsonb
),
(
  'tool_call',
  'Running type check on TypeScript files',
  'running',
  '{"tool": "exec", "command": "npm run type-check", "session_key": "agent:main:20240101-002"}'::jsonb
),
(
  'session_end',
  'Development session completed successfully',
  'completed',
  '{"session_key": "agent:main:20240101-001", "tasks_completed": 12}'::jsonb
);

-- Verify insertion
SELECT 
  'Tasks' as table_name,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE status = 'backlog') as backlog,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
  COUNT(*) FILTER (WHERE status = 'done') as done
FROM tasks

UNION ALL

SELECT 
  'Activity Logs' as table_name,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE status = 'running') as running,
  COUNT(*) FILTER (WHERE status = 'failed') as failed
FROM activity_log;
