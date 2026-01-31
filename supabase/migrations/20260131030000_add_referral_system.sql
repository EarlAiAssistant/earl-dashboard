-- Referral System Tables
-- Give $20, Get $20 referral program

-- Referral Codes Table
CREATE TABLE IF NOT EXISTS public.referral_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    uses INTEGER NOT NULL DEFAULT 0,
    max_uses INTEGER, -- NULL = unlimited
    credits_earned INTEGER NOT NULL DEFAULT 0, -- Total credits earned in cents
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Referrals Table
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    referral_code TEXT NOT NULL REFERENCES public.referral_codes(code),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'qualified', 'rewarded', 'expired')),
    referee_subscribed_at TIMESTAMPTZ,
    reward_issued_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add referred_by to users if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'referred_by'
    ) THEN
        ALTER TABLE public.users ADD COLUMN referred_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON public.referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON public.referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users(referred_by);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Policies for referral_codes
CREATE POLICY "Users can view own referral code"
    ON public.referral_codes
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own referral code"
    ON public.referral_codes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Public can validate codes (for signup page)
CREATE POLICY "Anyone can validate codes"
    ON public.referral_codes
    FOR SELECT
    USING (true);

-- Policies for referrals
CREATE POLICY "Referrers can view their referrals"
    ON public.referrals
    FOR SELECT
    USING (auth.uid() = referrer_id);

CREATE POLICY "Referees can view their referral"
    ON public.referrals
    FOR SELECT
    USING (auth.uid() = referee_id);

-- Function to increment referral uses
CREATE OR REPLACE FUNCTION increment_referral_uses(code_id TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.referral_codes
    SET uses = uses + 1,
        updated_at = NOW()
    WHERE code = code_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment credits earned
CREATE OR REPLACE FUNCTION increment_referral_credits(code_text TEXT, amount INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE public.referral_codes
    SET credits_earned = credits_earned + amount,
        updated_at = NOW()
    WHERE code = code_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_referral_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER referral_codes_updated_at
    BEFORE UPDATE ON public.referral_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_referral_updated_at();

CREATE TRIGGER referrals_updated_at
    BEFORE UPDATE ON public.referrals
    FOR EACH ROW
    EXECUTE FUNCTION update_referral_updated_at();

-- Comments
COMMENT ON TABLE public.referral_codes IS 'Unique referral codes for each user';
COMMENT ON TABLE public.referrals IS 'Tracks referral relationships and reward status';
COMMENT ON COLUMN public.referrals.status IS 'pending: signed up, qualified: subscribed 30+ days, rewarded: credit issued, expired: cancelled before qualifying';
