# Earl AI API Integration

The Earl Dashboard provides a dedicated API endpoint for Earl AI to manage tasks programmatically.

## Authentication

All requests require a Bearer token:

```
Authorization: Bearer <EARL_API_KEY>
```

Set the `EARL_API_KEY` environment variable. Default dev key: `earl-dev-key-change-me`

## Endpoint

```
POST /api/earl
GET  /api/earl?q=<query>&status=<status>&limit=<n>
```

## Actions

### Create Task

```json
POST /api/earl
{
  "action": "create",
  "title": "Fix login bug",
  "description": "Users can't log in on mobile",
  "status": "triage",          // optional: triage|backlog|in_progress|in_review|done
  "priority": "high",          // optional: urgent|high|medium|low
  "note": "Found during testing" // optional: adds activity note
}
```

**Response:**
```json
{
  "success": true,
  "task": { "id": "abc123", "title": "Fix login bug", ... },
  "message": "Task \"Fix login bug\" created by Earl"
}
```

### Update Task

```json
POST /api/earl
{
  "action": "update",
  "id": "abc123",
  "title": "Fix login bug (mobile)",   // optional
  "description": "...",                  // optional
  "status": "in_progress",              // optional
  "priority": "urgent",                 // optional
  "note": "Starting work on this"       // optional
}
```

### Mark Task Done

```json
POST /api/earl
{
  "action": "done",
  "id": "abc123",
  "note": "Fixed and deployed"  // optional
}
```

### Add Note

```json
POST /api/earl
{
  "action": "note",
  "id": "abc123",
  "note": "Investigated: root cause is session timeout"
}
```

### Search Tasks

```json
POST /api/earl
{
  "action": "search",
  "query": "login",           // optional: text search
  "status": "in_progress",    // optional: filter by status
  "priority": "high",         // optional: filter by priority
  "limit": 10                 // optional: max results (default 20)
}
```

Or via GET:
```
GET /api/earl?q=login&status=in_progress&limit=10
```

**Response:**
```json
{
  "success": true,
  "tasks": [...],
  "count": 3
}
```

## Activity Trail

All Earl actions are logged in the activity trail with:
- `actor: "earl"` — clearly identifies Earl's actions
- Full before/after change tracking
- Notes attached to specific tasks

## Notifications

Earl actions generate in-app notifications:
- Task creation → "Earl created: Task Title"
- Status changes → "Earl moved Task Title to In Progress"
- Urgent priority → "🔴 Urgent task: Task Title"

Users can configure notification preferences in Settings → Notifications.

## Webhooks

Earl actions also trigger outgoing webhooks (if configured):
- `task.created` — when Earl creates a task
- `task.updated` — when Earl updates task fields
- `task.completed` — when Earl marks a task done

Configure webhooks in Settings → Webhooks.

## Error Handling

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (missing fields, invalid action) |
| 401 | Unauthorized (missing/invalid API key) |
| 404 | Task not found |
| 500 | Server error |

## OpenClaw Integration

To use from OpenClaw, configure the Earl Dashboard URL and API key:

```bash
# In your OpenClaw skill or helper script:
curl -X POST http://localhost:3000/api/earl \
  -H "Authorization: Bearer $EARL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "create", "title": "Review PR #42", "priority": "high"}'
```

### Example: Move task to in_progress

```bash
curl -X POST http://localhost:3000/api/earl \
  -H "Authorization: Bearer $EARL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "update", "id": "TASK_ID", "status": "in_progress", "note": "Working on this now"}'
```

### Example: Search for tasks

```bash
curl "http://localhost:3000/api/earl?q=bug&status=triage&limit=5" \
  -H "Authorization: Bearer $EARL_API_KEY"
```
