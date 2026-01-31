# How to Run SQL Migration in Production Supabase

## Task: Add Subscription Tables to Call-Content Database

**Status:** SQL migration needs to be run in production Supabase  
**File:** The migration was created in an earlier session but needs to be re-created or located  
**Database:** Call-Content production Supabase instance

---

## What This Migration Does

Adds subscription management to Call-Content:
- User subscription tracking (tier, Stripe customer ID)
- Usage tracking (transcripts processed per month)
- Helper functions (check limits, increment usage, reset monthly usage)

---

## SQL Migration to Run

```sql
-- Add subscription columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'starter';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial';
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_transcript_limit INTEGER DEFAULT 10;
ALTER TABLE users ADD COLUMN IF NOT EXISTS transcripts_used_this_month INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS usage_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS usage_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  transcript_id UUID,
  action_type TEXT NOT NULL, -- 'transcript_processed', 'content_generated', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_log_user_id ON usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_log_created_at ON usage_log(created_at DESC);

-- Helper function: Check if user can process transcript
CREATE OR REPLACE FUNCTION can_process_transcript(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_limit INTEGER;
  v_used INTEGER;
  v_status TEXT;
BEGIN
  SELECT 
    monthly_transcript_limit,
    transcripts_used_this_month,
    subscription_status
  INTO v_limit, v_used, v_status
  FROM users
  WHERE id = p_user_id;
  
  -- Allow if on active subscription or trial
  IF v_status NOT IN ('active', 'trial') THEN
    RETURN FALSE;
  END IF;
  
  -- Check usage limit
  RETURN v_used < v_limit;
END;
$$ LANGUAGE plpgsql;

-- Helper function: Increment usage
CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID, p_transcript_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Increment counter
  UPDATE users
  SET transcripts_used_this_month = transcripts_used_this_month + 1
  WHERE id = p_user_id;
  
  -- Log the usage
  INSERT INTO usage_log (user_id, transcript_id, action_type)
  VALUES (p_user_id, p_transcript_id, 'transcript_processed');
END;
$$ LANGUAGE plpgsql;

-- Helper function: Reset monthly usage (call via cron)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET 
    transcripts_used_this_month = 0,
    usage_reset_date = NOW()
  WHERE usage_reset_date < NOW() - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql;

-- Set up monthly reset cron (runs daily, resets users whose reset date has passed)
-- Note: You'll need to set this up in Supabase Cron or use an external scheduler
```

---

## How to Run This Migration

### Step 1: Go to Supabase SQL Editor

1. Log in to https://supabase.com
2. Select your **Call-Content project**
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Paste the SQL

Copy the entire SQL block above and paste it into the editor.

### Step 3: Run the Migration

1. Click **Run** (or press Cmd/Ctrl + Enter)
2. Check for errors in the output panel
3. If successful, you should see "Success. No rows returned"

### Step 4: Verify Tables Were Created

Run this query to check:

```sql
-- Check if columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('stripe_customer_id', 'subscription_tier', 'monthly_transcript_limit');

-- Check if usage_log table exists
SELECT * FROM usage_log LIMIT 1;

-- Test the helper function
SELECT can_process_transcript('00000000-0000-0000-0000-000000000000');
```

### Step 5: Set Up Monthly Usage Reset

You have two options:

**Option A: Supabase Cron (if available)**
```sql
SELECT cron.schedule(
  'reset-monthly-usage',
  '0 0 * * *', -- Run daily at midnight
  $$SELECT reset_monthly_usage();$$
);
```

**Option B: External Cron (via Vercel Cron or GitHub Actions)**
Create a serverless function that calls:
```sql
SELECT reset_monthly_usage();
```

---

## What to Do After Migration

1. ✅ Verify tables/columns exist (Step 4 above)
2. Update `.env` with Supabase connection details (if needed)
3. Test the Stripe webhook integration
4. Test checkout flow end-to-end

---

## Troubleshooting

**Error: "relation users does not exist"**
- The Call-Content database doesn't have a `users` table yet
- You may need to run the initial schema migration first

**Error: "permission denied"**
- You're using the anon key instead of service_role key
- Run the migration in the SQL Editor (not via API)

**Error: "column already exists"**
- Migration was partially run before
- Add `IF NOT EXISTS` clauses (already included above)

---

**Next Steps After This Migration:**
1. Integrate Stripe API routes into Next.js app
2. Add billing dashboard to app navigation
3. Add usage gating to transcript processing
4. Test checkout flow end-to-end

---

**Status:** Ready to run (waiting for Drew to execute in Supabase SQL Editor)
