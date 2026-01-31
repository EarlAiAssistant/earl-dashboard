-- Onboarding Tracking Migration
-- Creates table to track user onboarding progress

CREATE TABLE IF NOT EXISTS public.user_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Onboarding steps (boolean flags)
  has_uploaded_transcript BOOLEAN DEFAULT false,
  has_generated_content BOOLEAN DEFAULT false,
  has_exported_content BOOLEAN DEFAULT false,
  
  -- Completion tracking
  is_completed BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  
  -- Metadata
  steps_completed INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 3,
  time_to_complete_seconds INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_user_onboarding_user_id ON public.user_onboarding(user_id);
CREATE INDEX idx_user_onboarding_completed ON public.user_onboarding(is_completed);
CREATE INDEX idx_user_onboarding_active ON public.user_onboarding(is_completed, is_dismissed)
  WHERE is_completed = false AND is_dismissed = false;

-- RLS Policies
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding status"
  ON public.user_onboarding FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding status"
  ON public.user_onboarding FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding status"
  ON public.user_onboarding FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Trigger to auto-update updated_at (reuse existing function)
CREATE TRIGGER user_onboarding_updated_at
  BEFORE UPDATE ON public.user_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to auto-calculate completion
CREATE OR REPLACE FUNCTION public.update_onboarding_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Count completed steps
  NEW.steps_completed := (
    (CASE WHEN NEW.has_uploaded_transcript THEN 1 ELSE 0 END) +
    (CASE WHEN NEW.has_generated_content THEN 1 ELSE 0 END) +
    (CASE WHEN NEW.has_exported_content THEN 1 ELSE 0 END)
  );
  
  -- Mark as completed if all steps done
  IF NEW.steps_completed >= NEW.total_steps AND NEW.is_completed = false THEN
    NEW.is_completed := true;
    NEW.completed_at := NOW();
    NEW.time_to_complete_seconds := EXTRACT(EPOCH FROM (NOW() - NEW.started_at))::INTEGER;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_onboarding_completion_trigger
  BEFORE UPDATE ON public.user_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION public.update_onboarding_completion();
