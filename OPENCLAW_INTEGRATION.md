# OpenClaw Integration Guide

This document explains how to integrate Earl Dashboard with OpenClaw to automatically track tasks and activities.

## Integration Methods

### 🎯 Method 1: Webhook (Recommended)

**Best for:** Real-time updates, most reliable

#### Setup Steps:

1. **Generate a webhook secret:**
   ```bash
   # Generate a random secret
   openssl rand -hex 32
   ```

2. **Add to environment variables:**
   ```env
   # In .env.local and Vercel
   OPENCLAW_WEBHOOK_SECRET=your-generated-secret
   ```

3. **Configure OpenClaw to send webhooks:**

   Add this to your OpenClaw configuration or create a custom plugin:

   ```javascript
   // Example webhook sender (pseudo-code)
   async function sendActivityToEarlDashboard(activity) {
     await fetch('https://your-app.vercel.app/api/webhook', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${process.env.OPENCLAW_WEBHOOK_SECRET}`
       },
       body: JSON.stringify({
         timestamp: new Date().toISOString(),
         type: activity.type, // 'tool_call', 'session_start', 'session_end'
         tool: activity.tool, // 'exec', 'web_search', etc.
         content: activity.content,
         status: activity.status, // 'running', 'completed', 'failed'
         session_key: activity.sessionKey
       })
     })
   }
   ```

4. **Test the webhook:**
   ```bash
   curl -X POST https://your-app.vercel.app/api/webhook \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your-webhook-secret" \
     -d '{
       "timestamp": "2024-01-01T12:00:00Z",
       "type": "tool_call",
       "tool": "exec",
       "content": "Test webhook",
       "status": "completed",
       "session_key": "test-123"
     }'
   ```

#### Webhook Payload Schema:

```typescript
{
  timestamp: string        // ISO 8601 format
  type: string            // Activity type (tool_call, session_start, etc.)
  tool?: string           // Tool name (exec, web_search, etc.)
  content?: string        // Description or output
  status?: string         // running, completed, failed, pending
  session_key?: string    // Unique session identifier
}
```

---

### 🔄 Method 2: API Polling (via Cron)

**Best for:** Simple setup, no OpenClaw modifications needed

The dashboard includes a cron job that runs every 30 minutes to poll for updates.

#### Setup Steps:

1. **Enable Vercel Cron** (automatically configured in `vercel.json`)

2. **Implement polling logic in `lib/openclaw.ts`:**

   ```typescript
   export async function pollAndUpdateTasks() {
     // Option A: Poll OpenClaw HTTP API
     const response = await fetch('http://openclaw-server:8080/api/sessions')
     const sessions = await response.json()
     
     // Option B: Read from shared database
     // const sessions = await db.query('SELECT * FROM openclaw_sessions')
     
     // Option C: Read session files
     // const files = await fs.readdir('/var/openclaw/sessions')
     
     // Process sessions and create/update tasks
     for (const session of sessions) {
       // Map session to task and save to Supabase
     }
   }
   ```

3. **Customize the polling interval:**

   Edit `vercel.json`:
   ```json
   "crons": [
     {
       "path": "/api/sync",
       "schedule": "*/10 * * * *"  // Every 10 minutes
     }
   ]
   ```

---

### 📂 Method 3: File Watching

**Best for:** OpenClaw writes session transcripts to files

#### Setup Steps:

1. **Install file watcher:**
   ```bash
   npm install chokidar
   ```

2. **Create a watcher script:**

   Create `scripts/watch-openclaw.js`:

   ```javascript
   const chokidar = require('chokidar')
   const fs = require('fs/promises')
   const { createClient } = require('@supabase/supabase-js')

   const OPENCLAW_DIR = process.env.OPENCLAW_TRANSCRIPT_DIR || '/var/openclaw/sessions'
   
   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL,
     process.env.SUPABASE_SERVICE_ROLE_KEY
   )

   async function processTranscript(filePath) {
     const content = await fs.readFile(filePath, 'utf-8')
     const data = JSON.parse(content)
     
     // Extract session info
     const sessionKey = data.sessionKey
     const activities = data.activities || []
     
     // Create/update task
     await supabase
       .from('tasks')
       .upsert({
         title: data.title || 'Untitled Task',
         session_key: sessionKey,
         status: data.status === 'completed' ? 'done' : 'in_progress',
         started_at: data.startedAt,
         completed_at: data.completedAt
       })
     
     // Log activities
     for (const activity of activities) {
       await supabase
         .from('activity_log')
         .insert({
           action_type: activity.type,
           details: activity.content,
           status: activity.status
         })
     }
   }

   // Watch for new/modified files
   const watcher = chokidar.watch(`${OPENCLAW_DIR}/**/*.json`, {
     persistent: true,
     ignoreInitial: true
   })

   watcher
     .on('add', processTranscript)
     .on('change', processTranscript)
     .on('error', error => console.error('Watcher error:', error))

   console.log(`Watching ${OPENCLAW_DIR} for OpenClaw session files...`)
   ```

3. **Run the watcher:**
   ```bash
   node scripts/watch-openclaw.js
   ```

4. **Run as a service (systemd example):**

   Create `/etc/systemd/system/earl-dashboard-watcher.service`:

   ```ini
   [Unit]
   Description=Earl Dashboard OpenClaw Watcher
   After=network.target

   [Service]
   Type=simple
   User=youruser
   WorkingDirectory=/path/to/earl-dashboard
   ExecStart=/usr/bin/node scripts/watch-openclaw.js
   Restart=always
   Environment=NODE_ENV=production
   Environment=OPENCLAW_TRANSCRIPT_DIR=/var/openclaw/sessions

   [Install]
   WantedBy=multi-user.target
   ```

   Enable and start:
   ```bash
   sudo systemctl enable earl-dashboard-watcher
   sudo systemctl start earl-dashboard-watcher
   ```

---

## Mapping OpenClaw Data to Dashboard

### Task Mapping

Earl Dashboard expects this structure:

```typescript
{
  title: string              // Short description
  description: string | null // Detailed description
  status: 'backlog' | 'in_progress' | 'done'
  session_key: string | null // Unique session ID
  started_at: string | null  // ISO timestamp
  completed_at: string | null // ISO timestamp
  metadata: {
    type?: string           // Activity type
    tool?: string           // Tool used
    [key: string]: any      // Custom fields
  }
}
```

### Activity Mapping

```typescript
{
  action_type: string       // Type of activity
  details: string | null    // Description
  status: string | null     // Status (running, completed, failed)
  metadata: {
    tool?: string
    session_key?: string
    [key: string]: any
  }
}
```

---

## Testing Integration

### 1. Test Webhook Endpoint

```bash
curl -X GET https://your-app.vercel.app/api/webhook
# Should return: {"status":"ok","message":"OpenClaw webhook endpoint is ready"}
```

### 2. Send Test Activity

```bash
curl -X POST https://your-app.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-webhook-secret" \
  -d '{
    "timestamp": "2024-01-01T12:00:00Z",
    "type": "tool_call",
    "tool": "exec",
    "content": "npm run build",
    "status": "completed",
    "session_key": "agent:main:test-123"
  }'
```

### 3. Check Dashboard

- Open Earl Dashboard
- Go to Activity Log - you should see the test activity
- Go to Dashboard - a task should be created

### 4. Manual Sync Test

```bash
curl -X POST https://your-app.vercel.app/api/sync \
  -H "Authorization: Bearer $(get-your-auth-token)"
```

---

## Troubleshooting

### Webhook not receiving data

- ✅ Check webhook URL is correct
- ✅ Verify Authorization header includes `Bearer` prefix
- ✅ Check webhook secret matches in both systems
- ✅ Look at Vercel logs: `vercel logs`
- ✅ Test with curl command above

### Cron not running

- ✅ Verify Vercel Cron is enabled in project settings
- ✅ Check `vercel.json` cron configuration
- ✅ Cron only works in production (not localhost)
- ✅ View Vercel logs to see cron execution

### Tasks not appearing

- ✅ Check session_key is unique
- ✅ Verify data is inserted into Supabase (check SQL editor)
- ✅ Check browser console for errors
- ✅ Ensure real-time subscription is working

### File watcher not detecting changes

- ✅ Verify OPENCLAW_TRANSCRIPT_DIR path is correct
- ✅ Check file permissions
- ✅ Test with manual file creation: `echo '{}' > /path/test.json`
- ✅ Check watcher process is running: `ps aux | grep watch-openclaw`

---

## Advanced Configuration

### Custom Task Classification

Edit `lib/openclaw.ts` to customize how activities map to tasks:

```typescript
export function mapActivityToTask(activity: OpenClawActivity): Partial<Task> {
  // Custom logic to determine task status
  let status: TaskStatus = 'backlog'
  
  if (activity.type === 'session_start') {
    status = 'in_progress'
  } else if (activity.type === 'session_end' && activity.status === 'completed') {
    status = 'done'
  }
  
  // Extract task title from content
  const title = activity.content?.match(/^[^\.!?]+/)?.[0] || 'Untitled Task'
  
  return {
    title,
    description: activity.content,
    status,
    session_key: activity.session_key,
    started_at: activity.timestamp,
    metadata: {
      type: activity.type,
      tool: activity.tool,
      priority: determinePriority(activity), // Custom function
      tags: extractTags(activity.content)    // Custom function
    }
  }
}
```

### Multiple OpenClaw Instances

If tracking multiple Earl instances:

```typescript
// Add instance identifier to metadata
metadata: {
  instance: 'earl-1' | 'earl-2',
  environment: 'production' | 'development'
}
```

Filter in UI by instance.

---

## Need Help?

- Check [main README](README.md) for setup instructions
- Review example payloads in `lib/openclaw.ts`
- Open an issue on GitHub

---

**Happy tracking! 🚀**
