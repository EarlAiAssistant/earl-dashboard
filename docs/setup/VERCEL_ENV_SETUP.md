# Vercel Environment Variable Setup

## Required Action

The heartbeat API now requires authentication. You need to add the API key to Vercel:

### Steps:

1. Go to https://vercel.com/earlaipersonalassistant/earl-dashboard/settings/environment-variables

2. Add a new environment variable:
   - **Name:** `EARL_HEARTBEAT_KEY`
   - **Value:** `b30cb6974665d550e78102740c2b1d2bb3445183ddeb21c8a358d6d351ec49a0`
   - **Environments:** Production, Preview, Development (select all)

3. Click "Save"

4. Redeploy the app (Vercel will prompt you, or go to Deployments → click the three dots → Redeploy)

### What This Does:

- **GET /api/earl/heartbeat** - Still public (anyone can read status)
- **POST /api/earl/heartbeat** - Now requires `x-api-key` header (only Earl can update)

This prevents anyone from sending fake status updates to your dashboard.

### Local Testing:

The API key is already configured in:
- `.env.local` (for Next.js dev server)
- `earl-helpers/.earl-config` (for the ping script)

Both files are gitignored and won't be committed.

---

**Delete this file after you've added the environment variable to Vercel.**
