# Vercel KV Setup Required

## Problem
The dashboard was showing "offline" because serverless functions don't have persistent file storage. The `.earl-status.json` file was getting wiped between requests.

## Solution
Switched to **Vercel KV** (Redis) for persistent storage.

## Required Setup

### 1. Create Vercel KV Database

1. Go to https://vercel.com/earlaipersonalassistant/earl-dashboard/stores
2. Click "Create Database"
3. Select "KV" (Redis)
4. Name it: `earl-status-kv`
5. Region: Choose closest to your primary users (e.g., `us-east-1`)
6. Click "Create"

### 2. Connect to Project

Vercel will automatically add these environment variables to your project:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### 3. Redeploy

After creating the KV store, Vercel should auto-redeploy. If not, manually trigger a redeploy.

## What Changed

**Before:**
- Status stored in `.earl-status.json` (ephemeral, wiped between requests)

**After:**
- Status stored in Vercel KV Redis (persistent across requests)
- Same API endpoints, same behavior, just actually works now

## Testing

After setup, test with:

```bash
# Send a ping
curl -X POST "https://earl-dashboard-sandy.vercel.app/api/earl/heartbeat" \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"task":"Test ping","model":"claude-sonnet-4-5"}'

# Check status (should show "active" not "offline")
curl "https://earl-dashboard-sandy.vercel.app/api/earl/heartbeat"
```

Expected output:
```json
{
  "status": "active",
  "task": "Test ping",
  "model": "claude-sonnet-4-5",
  "lastPing": "2026-01-31T18:30:00.000Z",
  "sessionUptime": null,
  "serverTime": "2026-01-31T18:30:05.000Z"
}
```

---

**Delete this file after KV is set up and working.**
