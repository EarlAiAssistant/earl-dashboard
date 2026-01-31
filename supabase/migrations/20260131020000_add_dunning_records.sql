-- Dunning Records Table
-- Tracks payment failures and recovery email sequences

CREATE TABLE IF NOT EXISTS public.dunning_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Dunning stage progression
    stage TEXT NOT NULL DEFAULT 'initial'
        CHECK (stage IN ('none', 'initial', 'reminder', 'warning', 'final', 'suspended')),
    
    -- Payment details
    amount_due INTEGER NOT NULL, -- Amount in cents
    currency TEXT NOT NULL DEFAULT 'usd',
    failed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Email tracking
    last_email_sent_at TIMESTAMPTZ,
    emails_sent INTEGER NOT NULL DEFAULT 0,
    
    -- Stripe references
    stripe_invoice_id TEXT NOT NULL UNIQUE,
    stripe_payment_intent_id TEXT,
    card_last_four TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dunning_user_id ON public.dunning_records(user_id);
CREATE INDEX IF NOT EXISTS idx_dunning_stage ON public.dunning_records(stage);
CREATE INDEX IF NOT EXISTS idx_dunning_invoice ON public.dunning_records(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_dunning_failed_at ON public.dunning_records(failed_at);

-- Enable RLS
ALTER TABLE public.dunning_records ENABLE ROW LEVEL SECURITY;

-- Policies: Only service role can access (internal only)
CREATE POLICY "Service role only" ON public.dunning_records
    FOR ALL
    USING (false)
    WITH CHECK (false);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_dunning_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dunning_records_updated_at
    BEFORE UPDATE ON public.dunning_records
    FOR EACH ROW
    EXECUTE FUNCTION update_dunning_updated_at();

-- Add subscription_status to users if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'subscription_status'
    ) THEN
        ALTER TABLE public.users ADD COLUMN subscription_status TEXT DEFAULT 'active';
    END IF;
END $$;

COMMENT ON TABLE public.dunning_records IS 'Tracks payment failures and automated dunning email sequences';
COMMENT ON COLUMN public.dunning_records.stage IS 'Current stage: none, initial (day 0), reminder (day 3), warning (day 7), final (day 14), suspended (day 15+)';
COMMENT ON COLUMN public.dunning_records.amount_due IS 'Amount due in cents';
