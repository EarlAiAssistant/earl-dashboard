-- Migration: Add Stripe Subscription Support to call-content project
-- Run this in Supabase SQL Editor for project: cizdjxheuwfxhihukcbw

-- Add subscription columns to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT CHECK (subscription_tier IN ('starter', 'professional', 'agency', 'enterprise')),
  ADD COLUMN IF NOT EXISTS transcripts_used_this_month INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS subscription_period_start TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);

-- Add usage tracking table for detailed analytics
CREATE TABLE IF NOT EXISTS public.subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL, -- 'transcript_processed', 'content_generated', etc.
  transcript_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for usage queries
CREATE INDEX IF NOT EXISTS idx_usage_user_created ON public.subscription_usage(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_action_type ON public.subscription_usage(action_type);

-- RLS policies for subscription_usage
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
  ON public.subscription_usage
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert usage"
  ON public.subscription_usage
  FOR INSERT
  WITH CHECK (true);

-- Function to reset monthly usage counter
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET transcripts_used_this_month = 0
  WHERE subscription_period_end < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can process transcript
CREATE OR REPLACE FUNCTION can_process_transcript(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier TEXT;
  v_used INTEGER;
  v_limit INTEGER;
  v_status TEXT;
BEGIN
  -- Get user's subscription info
  SELECT subscription_tier, transcripts_used_this_month, subscription_status
  INTO v_tier, v_used, v_status
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- If no subscription or not active, deny
  IF v_status IS NULL OR v_status != 'active' THEN
    RETURN FALSE;
  END IF;
  
  -- Determine limit based on tier
  v_limit := CASE v_tier
    WHEN 'starter' THEN 20
    WHEN 'professional' THEN 50
    WHEN 'agency' THEN 150
    WHEN 'enterprise' THEN 999999 -- Effectively unlimited for enterprise
    ELSE 0
  END;
  
  -- Check if under limit
  RETURN v_used < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage counter
CREATE OR REPLACE FUNCTION increment_transcript_usage(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET transcripts_used_this_month = transcripts_used_this_month + 1
  WHERE id = p_user_id;
  
  INSERT INTO public.subscription_usage (user_id, action_type)
  VALUES (p_user_id, 'transcript_processed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION reset_monthly_usage() TO service_role;
GRANT EXECUTE ON FUNCTION can_process_transcript(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION increment_transcript_usage(UUID) TO service_role;

COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Current Stripe subscription status';
COMMENT ON COLUMN public.profiles.subscription_tier IS 'Subscription tier: starter, professional, agency, or enterprise';
COMMENT ON COLUMN public.profiles.transcripts_used_this_month IS 'Number of transcripts processed in current billing period';
COMMENT ON TABLE public.subscription_usage IS 'Detailed usage tracking for analytics and billing';
