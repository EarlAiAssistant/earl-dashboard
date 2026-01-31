-- API Keys Table
-- For public API authentication and rate limiting

CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    key_prefix TEXT NOT NULL, -- First 8 chars for display (e.g., "cc_a1b2c3d4")
    key_hash TEXT NOT NULL UNIQUE, -- SHA256 hash of full key
    scopes TEXT[] NOT NULL DEFAULT ARRAY['transcripts:read', 'transcripts:write', 'content:read', 'content:write', 'usage:read'],
    rate_limit INTEGER NOT NULL DEFAULT 60, -- Requests per minute
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON public.api_keys(key_prefix);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own API keys"
    ON public.api_keys
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own API keys"
    ON public.api_keys
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
    ON public.api_keys
    FOR DELETE
    USING (auth.uid() = user_id);

-- Allow service role to validate keys (for API authentication)
CREATE POLICY "Service role can validate keys"
    ON public.api_keys
    FOR SELECT
    USING (true);

-- Trigger for updated_at
CREATE TRIGGER api_keys_updated_at
    BEFORE UPDATE ON public.api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_referral_updated_at();

-- API Request Log (for analytics)
CREATE TABLE IF NOT EXISTS public.api_request_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_api_log_key ON public.api_request_log(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_log_user ON public.api_request_log(user_id);
CREATE INDEX IF NOT EXISTS idx_api_log_created ON public.api_request_log(created_at);
CREATE INDEX IF NOT EXISTS idx_api_log_endpoint ON public.api_request_log(endpoint);

-- Enable RLS
ALTER TABLE public.api_request_log ENABLE ROW LEVEL SECURITY;

-- Only service role can insert logs
CREATE POLICY "Service role only" ON public.api_request_log
    FOR ALL
    USING (false)
    WITH CHECK (false);

-- Comments
COMMENT ON TABLE public.api_keys IS 'API keys for public API authentication';
COMMENT ON COLUMN public.api_keys.key_hash IS 'SHA256 hash of the full API key';
COMMENT ON COLUMN public.api_keys.scopes IS 'Array of permitted scopes: transcripts:read/write, content:read/write, usage:read';
COMMENT ON TABLE public.api_request_log IS 'Log of all API requests for analytics and debugging';
