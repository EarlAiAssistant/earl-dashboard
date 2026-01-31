-- Add booster credits column to users table
-- Booster credits are one-time purchases that add to monthly limit

-- Add booster_credits column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS booster_credits INTEGER DEFAULT 0;

-- Add comment
COMMENT ON COLUMN users.booster_credits IS 'One-time purchased credits that add to monthly_transcript_limit. Reset on billing renewal.';

-- Create usage_log table if not exists (for tracking purchases)
CREATE TABLE IF NOT EXISTS usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'transcript_processed', 'booster_pack_purchased', 'usage_reset'
  credits_added INTEGER DEFAULT 0,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for querying usage log
CREATE INDEX IF NOT EXISTS idx_usage_log_user_id ON usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_log_action_type ON usage_log(action_type);
CREATE INDEX IF NOT EXISTS idx_usage_log_created_at ON usage_log(created_at);

-- RLS policies for usage_log
ALTER TABLE usage_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage log
CREATE POLICY IF NOT EXISTS "Users can view own usage log"
ON usage_log
FOR SELECT
USING (auth.uid() = user_id);

-- Only service role can insert (via API/webhooks)
CREATE POLICY IF NOT EXISTS "Service role can insert usage log"
ON usage_log
FOR INSERT
WITH CHECK (true); -- Will be enforced by service role key

-- Create helper function to get effective limit (base + booster)
CREATE OR REPLACE FUNCTION get_effective_transcript_limit(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  base_limit INTEGER;
  booster INTEGER;
BEGIN
  SELECT 
    COALESCE(monthly_transcript_limit, 0),
    COALESCE(booster_credits, 0)
  INTO base_limit, booster
  FROM users
  WHERE id = p_user_id;
  
  RETURN base_limit + booster;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user can process transcript
CREATE OR REPLACE FUNCTION can_process_transcript(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  used INTEGER;
  effective_limit INTEGER;
BEGIN
  SELECT COALESCE(monthly_transcripts_used, 0)
  INTO used
  FROM users
  WHERE id = p_user_id;
  
  effective_limit := get_effective_transcript_limit(p_user_id);
  
  RETURN used < effective_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_effective_transcript_limit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_process_transcript(UUID) TO authenticated;
