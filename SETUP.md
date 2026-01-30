# Setup Guide for Earl Dashboard

Complete step-by-step instructions to get your dashboard running.

## Part 1: Supabase Setup (10 minutes)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **New Project**
3. Fill in:
   - **Name:** earl-dashboard
   - **Database Password:** (generate a strong password and save it)
   - **Region:** Choose closest to you
4. Click **Create Project** (wait ~2 minutes for provisioning)

### Step 2: Run Database Migration

1. In your Supabase project, go to **SQL Editor**
2. Click **New Query**
3. Open `supabase/migrations/20240101000000_initial_schema.sql` from this repo
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** (bottom right)
7. Verify success message appears

### Step 3: Create Storage Bucket

1. Go to **Storage** in the left sidebar
2. You should see a `documents` bucket already created
3. If not, click **New Bucket**:
   - **Name:** documents
   - **Public:** OFF (private)
   - Click **Create Bucket**

### Step 4: Get API Keys

1. Go to **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbG...` (the `anon` key)
   - **service_role secret:** `eyJhbG...` (the `service_role` key) ⚠️ **Keep this secret!**

### Step 5: Create User Account

1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter:
   - **Email:** drew@example.com (or your actual email)
   - **Password:** (create a strong password)
   - **Auto Confirm User:** ✅ ON
4. Click **Create User**
5. **Save these credentials** - you'll use them to log in!

## Part 2: Local Development Setup (5 minutes)

### Step 1: Install Dependencies

```bash
cd earl-dashboard
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG... (your anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... (your service_role key)
OPENCLAW_WEBHOOK_SECRET=some-random-secret-string
```

### Step 3: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 4: Test Login

1. Click **Sign In**
2. Enter the email/password you created in Supabase
3. You should see the dashboard!

## Part 3: Vercel Deployment (10 minutes)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Earl Dashboard"
git branch -M main

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/earl-dashboard.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com/new)
2. Click **Import Project**
3. Select your GitHub repository
4. Configure:
   - **Framework Preset:** Next.js (auto-detected)
   - Click **Environment Variables** dropdown
5. Add all variables from your `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbG...
   SUPABASE_SERVICE_ROLE_KEY = eyJhbG...
   OPENCLAW_WEBHOOK_SECRET = some-random-secret
   ```
6. Click **Deploy**
7. Wait 2-3 minutes for build to complete

### Step 3: Test Production Site

1. Once deployed, Vercel gives you a URL: `https://earl-dashboard.vercel.app`
2. Visit the URL
3. Log in with your credentials
4. Everything should work!

### Step 4: Enable Cron (Auto-Sync)

Vercel Cron is automatically configured in `vercel.json`. Verify:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Cron Jobs**
3. You should see: `*/30 * * * * → /api/sync`
4. If not visible, add manually:
   - **Path:** `/api/sync`
   - **Schedule:** `*/30 * * * *` (every 30 minutes)

## Part 4: OpenClaw Integration

Choose one of these methods to sync Earl's data:

### Method 1: Webhook (Recommended)

Configure OpenClaw to POST to your webhook:

```bash
# Webhook URL
https://your-app.vercel.app/api/webhook

# Headers
Authorization: Bearer your-webhook-secret

# Payload example
{
  "timestamp": "2024-01-01T12:00:00Z",
  "type": "tool_call",
  "tool": "exec",
  "content": "Building Next.js app",
  "status": "running",
  "session_key": "agent:main:123"
}
```

**How to configure in OpenClaw:**
- Check OpenClaw docs for webhook configuration
- Or add a plugin/script that sends HTTP POST requests after each tool call

### Method 2: API Polling (Auto via Cron)

The `/api/sync` endpoint is called every 30 minutes automatically by Vercel Cron.

**To customize the sync logic:**
1. Edit `lib/openclaw.ts`
2. Update `pollAndUpdateTasks()` function
3. Add logic to fetch from OpenClaw API or read files

### Method 3: Manual Sync

You can also trigger sync manually:

```bash
curl -X POST https://your-app.vercel.app/api/sync \
  -H "Authorization: Bearer your-auth-token"
```

Or add a "Sync Now" button in the UI.

## Testing the Integration

### Create a Test Task

Using the Supabase SQL Editor:

```sql
INSERT INTO tasks (title, description, status, session_key, started_at)
VALUES (
  'Test Task',
  'This is a test task from OpenClaw',
  'in_progress',
  'session-test-123',
  now()
);
```

Refresh your dashboard - you should see the new task!

### Create Test Activity

```sql
INSERT INTO activity_log (action_type, details, status)
VALUES (
  'tool_call',
  'Earl executed a test command',
  'completed'
);
```

Check the Activity Log tab - it should appear!

## Troubleshooting

### Can't log in

- ✅ Check user exists in Supabase Authentication
- ✅ Verify email/password are correct
- ✅ Try password reset via Supabase dashboard

### Environment variables not working

- ✅ Restart dev server after changing `.env.local`
- ✅ In Vercel, redeploy after adding environment variables
- ✅ Make sure variable names match exactly (case-sensitive)

### Database connection fails

- ✅ Check Supabase project is active (not paused)
- ✅ Verify URL and keys are correct
- ✅ Test connection in Supabase dashboard

### File upload fails

- ✅ Check Storage bucket `documents` exists
- ✅ Verify RLS policies are enabled
- ✅ Try smaller file first (< 1MB)

### Tasks not appearing

- ✅ Check Supabase SQL Editor - run `SELECT * FROM tasks;`
- ✅ Verify real-time subscription is working (check browser console)
- ✅ Try manual insert (see "Create a Test Task" above)

## Next Steps

Once everything is working:

1. ✅ Bookmark your dashboard URL
2. ✅ Save your login credentials in a password manager
3. ✅ Configure OpenClaw webhook integration
4. ✅ Test creating tasks and activities
5. ✅ Upload some test documents
6. ✅ Customize the UI to your liking

## Need Help?

- 📖 Check the main [README.md](README.md)
- 🐛 Open an issue on GitHub
- 💬 Ask in the OpenClaw community

---

**You're all set! Happy tracking! 🚀**
