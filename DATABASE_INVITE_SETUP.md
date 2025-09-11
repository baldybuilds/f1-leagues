# Database Setup for Team Invites and Members

Run these SQL commands in your Supabase SQL editor to set up the invite system:

## Create team_invites table

```sql
CREATE TABLE IF NOT EXISTS public.team_invites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    inviter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invitee_email text NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(team_id, invitee_email, status) -- Prevent duplicate pending invites
);

-- Create index for faster queries
CREATE INDEX idx_team_invites_invitee_email ON public.team_invites(invitee_email);
CREATE INDEX idx_team_invites_team_id ON public.team_invites(team_id);
CREATE INDEX idx_team_invites_status ON public.team_invites(status);

-- Enable RLS
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_invites
CREATE POLICY "Users can view invites sent to their email" ON public.team_invites
    FOR SELECT USING (invitee_email = auth.jwt() ->> 'email');

CREATE POLICY "Team owners and admins can view team invites" ON public.team_invites
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.teams t 
            WHERE t.id = team_invites.team_id 
            AND t.owner_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.team_members tm 
            WHERE tm.team_id = team_invites.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.role = 'admin'
        )
    );

CREATE POLICY "Team owners and admins can create invites" ON public.team_invites
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.teams t 
            WHERE t.id = team_invites.team_id 
            AND t.owner_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.team_members tm 
            WHERE tm.team_id = team_invites.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.role = 'admin'
        )
    );

CREATE POLICY "Users can update invites sent to their email" ON public.team_invites
    FOR UPDATE USING (invitee_email = auth.jwt() ->> 'email');
```

## Create team_members table

```sql
CREATE TABLE IF NOT EXISTS public.team_members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(team_id, user_id) -- Prevent duplicate memberships
);

-- Create indexes for faster queries
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_members
CREATE POLICY "Users can view team members of teams they belong to" ON public.team_members
    FOR SELECT USING (
        -- Team owner can see all members
        EXISTS (
            SELECT 1 FROM public.teams t 
            WHERE t.id = team_members.team_id 
            AND t.owner_id = auth.uid()
        )
        OR
        -- Team members can see other team members
        EXISTS (
            SELECT 1 FROM public.team_members tm 
            WHERE tm.team_id = team_members.team_id 
            AND tm.user_id = auth.uid()
        )
    );

CREATE POLICY "Team owners can manage all team members" ON public.team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.teams t 
            WHERE t.id = team_members.team_id 
            AND t.owner_id = auth.uid()
        )
    );

CREATE POLICY "Team admins can manage non-admin members" ON public.team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm 
            WHERE tm.team_id = team_members.team_id 
            AND tm.user_id = auth.uid() 
            AND tm.role = 'admin'
        )
        AND team_members.role = 'member'
    );

CREATE POLICY "Users can be added as team members" ON public.team_members
    FOR INSERT WITH CHECK (true); -- This will be controlled by application logic
```

## Create function to handle invite acceptance

```sql
CREATE OR REPLACE FUNCTION handle_invite_acceptance()
RETURNS TRIGGER AS $$
BEGIN
    -- When an invite is accepted, ensure the user becomes a team member
    IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
        INSERT INTO public.team_members (team_id, user_id, role)
        SELECT NEW.team_id, auth.uid(), 'member'
        WHERE NOT EXISTS (
            SELECT 1 FROM public.team_members 
            WHERE team_id = NEW.team_id AND user_id = auth.uid()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER trigger_handle_invite_acceptance
    AFTER UPDATE ON public.team_invites
    FOR EACH ROW
    EXECUTE FUNCTION handle_invite_acceptance();
```

## Update existing tables (if needed)

```sql
-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to new tables
CREATE TRIGGER trigger_team_invites_updated_at
    BEFORE UPDATE ON public.team_invites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

After running these commands, your database will support the team invite and member management system!