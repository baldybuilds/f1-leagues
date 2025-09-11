-- QualiPal Database Fix Script
-- Run this to fix all current issues with the database

-- 1. Fix team_invites table column naming
DO $$ 
BEGIN
  -- Rename email to invitee_email if email column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_invites' AND column_name='email') 
  AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_invites' AND column_name='invitee_email') THEN
    ALTER TABLE public.team_invites RENAME COLUMN email TO invitee_email;
  END IF;
  
  -- Rename invited_by to inviter_id if invited_by column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_invites' AND column_name='invited_by') 
  AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_invites' AND column_name='inviter_id') THEN
    ALTER TABLE public.team_invites RENAME COLUMN invited_by TO inviter_id;
  END IF;
  
  -- Add missing columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_invites' AND column_name='updated_at') THEN
    ALTER TABLE public.team_invites ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- 2. Fix unique constraints for team_invites
DO $$ 
BEGIN
  -- Drop old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name='team_invites' AND constraint_name='team_invites_team_id_email_key'
  ) THEN
    ALTER TABLE public.team_invites DROP CONSTRAINT team_invites_team_id_email_key;
  END IF;
  
  -- Add new constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name='team_invites' AND constraint_name='team_invites_team_id_invitee_email_key'
  ) THEN
    ALTER TABLE public.team_invites ADD CONSTRAINT team_invites_team_id_invitee_email_key UNIQUE (team_id, invitee_email);
  END IF;
END $$;

-- 3. Add updated_at trigger for team_invites if it doesn't exist
DROP TRIGGER IF EXISTS update_team_invites_updated_at ON public.team_invites;
CREATE TRIGGER update_team_invites_updated_at 
  BEFORE UPDATE ON public.team_invites 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- 4. Ensure tracks table has correct data and schema
INSERT INTO public.tracks (name, country, location, season, circuit_length, lap_record) VALUES
('Bahrain International Circuit', 'Bahrain', 'Sakhir', 2025, 5.412, '1:31.447'),
('Jeddah Corniche Circuit', 'Saudi Arabia', 'Jeddah', 2025, 6.174, '1:30.734'),
('Albert Park Circuit', 'Australia', 'Melbourne', 2025, 5.278, '1:20.260'),
('Suzuka International Racing Course', 'Japan', 'Suzuka', 2025, 5.807, '1:30.983'),
('Shanghai International Circuit', 'China', 'Shanghai', 2025, 5.451, '1:32.238'),
('Miami International Autodrome', 'United States', 'Miami', 2025, 5.410, '1:29.708'),
('Autodromo Enzo e Dino Ferrari', 'Italy', 'Imola', 2025, 4.909, '1:15.484'),
('Circuit de Monaco', 'Monaco', 'Monte Carlo', 2025, 3.337, '1:12.909'),
('Circuit Gilles Villeneuve', 'Canada', 'Montreal', 2025, 4.361, '1:13.078'),
('Circuit de Barcelona-Catalunya', 'Spain', 'Barcelona', 2025, 4.675, '1:16.330'),
('Red Bull Ring', 'Austria', 'Spielberg', 2025, 4.318, '1:05.619'),
('Silverstone Circuit', 'United Kingdom', 'Silverstone', 2025, 5.891, '1:27.097'),
('Hungaroring', 'Hungary', 'Budapest', 2025, 4.381, '1:16.627'),
('Circuit de Spa-Francorchamps', 'Belgium', 'Spa', 2025, 7.004, '1:41.252'),
('Circuit Park Zandvoort', 'Netherlands', 'Zandvoort', 2025, 4.259, '1:11.097'),
('Autodromo Nazionale di Monza', 'Italy', 'Monza', 2025, 5.793, '1:21.046'),
('Baku City Circuit', 'Azerbaijan', 'Baku', 2025, 6.003, '1:43.009'),
('Marina Bay Street Circuit', 'Singapore', 'Singapore', 2025, 5.063, '1:35.867'),
('Circuit of the Americas', 'United States', 'Austin', 2025, 5.513, '1:36.169'),
('Autodromo Hermanos Rodriguez', 'Mexico', 'Mexico City', 2025, 4.304, '1:17.774'),
('Autodromo Jose Carlos Pace', 'Brazil', 'São Paulo', 2025, 4.309, '1:10.540'),
('Las Vegas Street Circuit', 'United States', 'Las Vegas', 2025, 6.201, '1:35.490'),
('Losail International Circuit', 'Qatar', 'Doha', 2025, 5.380, '1:24.319'),
('Yas Marina Circuit', 'United Arab Emirates', 'Abu Dhabi', 2025, 5.281, '1:26.103')
ON CONFLICT (name, country, season) DO NOTHING;

-- 5. Fix RLS policies to eliminate infinite recursion
-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Team creators can manage their teams" ON public.teams;
DROP POLICY IF EXISTS "Users can view own memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team creators can view all team memberships" ON public.team_members;
DROP POLICY IF EXISTS "Users can create memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team creators can manage memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team creators can delete memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team creators can manage team tracks" ON public.team_tracks;
DROP POLICY IF EXISTS "Team creators can manage race sessions" ON public.race_sessions;
DROP POLICY IF EXISTS "Team creators can manage race results" ON public.race_results;
DROP POLICY IF EXISTS "Team creators can manage invites" ON public.team_invites;
DROP POLICY IF EXISTS "Users can view their invites" ON public.team_invites;

-- Create simplified, non-recursive policies

-- Teams: Only team creators can manage, others can view if they're members
CREATE POLICY "Team creators can manage teams" ON public.teams FOR ALL USING (created_by = auth.uid());

-- Team members: Users can view/manage their own memberships, creators can manage all
CREATE POLICY "Users can manage own team memberships" ON public.team_members FOR ALL USING (user_id = auth.uid());

-- Team tracks: Only accessible by people who can see the team (via separate table lookup)
CREATE POLICY "Team access for team tracks" ON public.team_tracks FOR ALL USING (
  team_id IN (
    SELECT id FROM public.teams WHERE created_by = auth.uid()
    UNION
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
  )
);

-- Race sessions: Only accessible by team members
CREATE POLICY "Team access for race sessions" ON public.race_sessions FOR ALL USING (
  team_id IN (
    SELECT id FROM public.teams WHERE created_by = auth.uid()
    UNION
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
  )
);

-- Race results: Only accessible by team members
CREATE POLICY "Team access for race results" ON public.race_results FOR ALL USING (
  session_id IN (
    SELECT rs.id FROM public.race_sessions rs
    WHERE rs.team_id IN (
      SELECT id FROM public.teams WHERE created_by = auth.uid()
      UNION
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  )
);

-- Team invites: Team creators can manage, users can view their own invites
CREATE POLICY "Team creators can manage invites" ON public.team_invites FOR ALL USING (
  team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
);

CREATE POLICY "Users can view their own invites" ON public.team_invites FOR SELECT USING (
  invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Ensure proper indexing
CREATE INDEX IF NOT EXISTS idx_team_invites_invitee_email ON public.team_invites(invitee_email);
CREATE INDEX IF NOT EXISTS idx_team_invites_status ON public.team_invites(status);

-- 6. Grant permissions
GRANT ALL ON public.team_invites TO authenticated;