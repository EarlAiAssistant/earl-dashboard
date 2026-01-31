# Earl Dashboard Status API

## Overview

The dashboard now supports multiple ways to track Earl's activity status:

1. **Database tables** (activity_log, tasks)
2. **ACTIVITY_LOG.md file** (parsed for timestamps)
3. **Status API endpoint** (for programmatic updates)

---

## Status Detection Logic

**Active** (🟢 Green):
- Activity within last 5 minutes

**Idle** (🟡 Yellow):  
- Activity within last 60 minutes
- No activity in last 5 minutes

**Offline** (⚪ Gray):
- No activity for >60 minutes

---

## API Endpoints

### POST /api/status

Update Earl's current activity status.

**Request:**
```bash
curl -X POST https://your-dashboard.vercel.app/api/status \
  -H "Content-Type: application/json" \
  -d '{"task": "Building call-content pricing page"}'
```

**Payload:**
```json
{
  "task": "Current task description",
  "status": "active" // optional
}
```

**Response:**
```json
{
  "success": true
}
```

---

### GET /api/status

Get Earl's current status.

**Request:**
```bash
curl https://your-dashboard.vercel.app/api/status
```

**Response:**
```json
{
  "lastActivity": "2026-01-31T10:32:00Z",
  "currentTask": "Building call-content pricing page",
  "isActive": true
}
```

---

## From OpenClaw

To update status from within OpenClaw, use the `exec` tool:

```typescript
exec({
  command: `curl -X POST https://your-dashboard.vercel.app/api/status \
    -H "Content-Type: application/json" \
    -d '{"task": "Current work description"}'`
})
```

Or add to HEARTBEAT.md:

```markdown
## Dashboard Status Update
- Every heartbeat, POST current task to /api/status
- Keeps dashboard showing "Active" status
- Updates current task display
```

---

## ACTIVITY_LOG.md Format

The dashboard also parses `public/ACTIVITY_LOG.md` for status:

```markdown
**Last Updated:** 2026-01-31 10:32 UTC
**Current Task:** Building pricing page components
```

Update this file regularly (every 30-60 min) to keep status fresh.

---

## Environment Variables

For production, set in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

*Last Updated: 2026-01-31*
