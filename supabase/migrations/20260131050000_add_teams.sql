-- Team System Tables
-- Provides team creation, membership, invitations, and role-based access

-- Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    owner_id UUID REFERENCES auth.users(id) ON DELETE RESTRICT NOT NULL,
    stripe_customer_id TEXT,
    subscription_tier TEXT,
    subscription_status TEXT DEFAULT 'active',
    monthly_transcript_limit INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'member'
        CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Team Invitations Table
CREATE TABLE IF NOT EXISTS public.team_invites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member'
        CHECK (role IN ('admin', 'member', 'viewer')),
    token TEXT NOT NULL UNIQUE,
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add current_team_id to users if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'current_team_id'
    ) THEN
        ALTER TABLE public.users ADD COLUMN current_team_id UUID REFERENCES public.teams(id);
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teams_owner ON public.teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_teams_slug ON public.teams(slug);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_team ON public.team_invites(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_email ON public.team_invites(email);
CREATE INDEX IF NOT EXISTS idx_team_invites_token ON public.team_invites(token);
CREATE INDEX IF NOT EXISTS idx_users_current_team ON public.users(current_team_id);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- Policies for teams
CREATE POLICY "Team members can view team"
    ON public.teams
    FOR SELECT
    USING (
        id IN (
            SELECT team_id FROM public.team_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can update team"
    ON public.teams
    FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "Users can create teams"
    ON public.teams
    FOR INSERT
    WITH CHECK (owner_id = auth.uid());

-- Policies for team_members
CREATE POLICY "Team members can view members"
    ON public.team_members
    FOR SELECT
    USING (
        team_id IN (
            SELECT team_id FROM public.team_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins and owners can manage members"
    ON public.team_members
    FOR ALL
    USING (
        team_id IN (
            SELECT team_id FROM public.team_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Policies for team_invites
CREATE POLICY "Admins can view and manage invites"
    ON public.team_invites
    FOR ALL
    USING (
        team_id IN (
            SELECT team_id FROM public.team_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Public access for accepting invites by token
CREATE POLICY "Anyone can view invite by token"
    ON public.team_invites
    FOR SELECT
    USING (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_teams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION update_teams_updated_at();

-- Comments
COMMENT ON TABLE public.teams IS 'Team/organization entities';
COMMENT ON TABLE public.team_members IS 'Team membership and roles';
COMMENT ON TABLE public.team_invites IS 'Pending team invitations';
COMMENT ON COLUMN public.team_members.role IS 'Role hierarchy: owner > admin > member > viewer';
