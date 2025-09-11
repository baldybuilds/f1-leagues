-- QualiPal F1 League Manager Database Complete Fix
-- This script fixes all current database issues including:
-- 1. Column naming issues (invitee_email vs email)
-- 2. Circular RLS policy references
-- 3. Missing triggers and constraints
-- 4. Track data issues

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fix team_invites table structure
DO $$ 
BEGIN
  -- Rename email to invitee_email if needed
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_invites' AND column_name='email') 
  AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_invites' AND column_name='invitee_email') THEN
    ALTER TABLE public.team_invites RENAME COLUMN email TO invitee_email;
  END IF;
  
  -- Rename invited_by to inviter_id if needed
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_invites' AND column_name='invited_by') 
  AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_invites' AND column_name='inviter_id') THEN
    ALTER TABLE public.team_invites RENAME COLUMN invited_by TO inviter_id;
  END IF;
  
  -- Add missing columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_invites' AND column_name='updated_at') THEN
    ALTER TABLE public.team_invites ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Fix unique constraints
DO $$ 
BEGIN
  -- Drop old constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name='team_invites' AND constraint_name='team_invites_team_id_email_key'
  ) THEN
    ALTER TABLE public.team_invites DROP CONSTRAINT team_invites_team_id_email_key;
  END IF;
  
  -- Add correct constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name='team_invites' AND constraint_name='team_invites_team_id_invitee_email_key'
  ) THEN
    ALTER TABLE public.team_invites ADD CONSTRAINT team_invites_team_id_invitee_email_key UNIQUE (team_id, invitee_email);
  END IF;
END $$;

-- Ensure tracks table has all required data
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

-- Completely remove and recreate RLS policies to eliminate circular references
-- Disable RLS temporarily to drop all policies
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_tracks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to prevent conflicts
DROP POLICY IF EXISTS "Team creators can manage their teams" ON public.teams;
DROP POLICY IF EXISTS "Team creators can manage teams" ON public.teams;
DROP POLICY IF EXISTS "Users can view own memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team creators can view all team memberships" ON public.team_members;
DROP POLICY IF EXISTS "Users can create memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team creators can manage memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team creators can delete memberships" ON public.team_members;
DROP POLICY IF EXISTS "Users can manage own team memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team creators can manage team tracks" ON public.team_tracks;
DROP POLICY IF EXISTS "Team access for team tracks" ON public.team_tracks;
DROP POLICY IF EXISTS "Team creators can manage race sessions" ON public.race_sessions;
DROP POLICY IF EXISTS "Team access for race sessions" ON public.race_sessions;
DROP POLICY IF EXISTS "Team creators can manage race results" ON public.race_results;
DROP POLICY IF EXISTS "Team access for race results" ON public.race_results;
DROP POLICY IF EXISTS "Team creators can manage invites" ON public.team_invites;
DROP POLICY IF EXISTS "Users can view their invites" ON public.team_invites;
DROP POLICY IF EXISTS "Users can view their own invites" ON public.team_invites;

-- Re-enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive RLS policies

-- Teams: Only creators can manage their teams, members can view via app functions
CREATE POLICY "teams_policy" ON public.teams 
FOR ALL TO authenticated 
USING (created_by = auth.uid());

-- Team members: Users can manage their own memberships only
CREATE POLICY "team_members_policy" ON public.team_members 
FOR ALL TO authenticated 
USING (user_id = auth.uid());

-- For team creators to manage all memberships of their teams, we'll use app-level functions
-- This avoids circular reference in RLS

-- Team tracks: Only accessible via application functions (no direct RLS)
CREATE POLICY "team_tracks_policy" ON public.team_tracks 
FOR ALL TO authenticated 
USING (false); -- Disable direct access, use app functions

-- Race sessions: Only accessible via application functions
CREATE POLICY "race_sessions_policy" ON public.race_sessions 
FOR ALL TO authenticated 
USING (false); -- Disable direct access, use app functions

-- Race results: Only accessible via application functions  
CREATE POLICY "race_results_policy" ON public.race_results 
FOR ALL TO authenticated 
USING (false); -- Disable direct access, use app functions

-- Team invites: Split into separate policies for different operations
CREATE POLICY "team_invites_insert" ON public.team_invites 
FOR INSERT TO authenticated 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND created_by = auth.uid())
);

CREATE POLICY "team_invites_select" ON public.team_invites 
FOR SELECT TO authenticated 
USING (
  invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND created_by = auth.uid())
);

CREATE POLICY "team_invites_update" ON public.team_invites 
FOR UPDATE TO authenticated 
USING (
  invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND created_by = auth.uid())
);

CREATE POLICY "team_invites_delete" ON public.team_invites 
FOR DELETE TO authenticated 
USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND created_by = auth.uid())
);

-- Create security definer functions for safe cross-table access

-- Function to get team tracks for a user
CREATE OR REPLACE FUNCTION public.get_user_team_tracks(p_team_id UUID)
RETURNS TABLE(
  id UUID,
  team_id UUID,
  track_id UUID,
  race_order INTEGER,
  race_date DATE,
  created_at TIMESTAMPTZ
) 
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has access to this team
  IF NOT EXISTS (
    SELECT 1 FROM public.teams WHERE id = p_team_id AND created_by = auth.uid()
    UNION
    SELECT 1 FROM public.team_members WHERE team_id = p_team_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to team tracks';
  END IF;

  RETURN QUERY
  SELECT tt.id, tt.team_id, tt.track_id, tt.race_order, tt.race_date, tt.created_at
  FROM public.team_tracks tt
  WHERE tt.team_id = p_team_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get race sessions for a user
CREATE OR REPLACE FUNCTION public.get_user_race_sessions(p_team_id UUID)
RETURNS TABLE(
  id UUID,
  team_id UUID,
  track_id UUID,
  session_type TEXT,
  session_date TIMESTAMPTZ,
  weather_conditions TEXT,
  completed BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has access to this team
  IF NOT EXISTS (
    SELECT 1 FROM public.teams WHERE id = p_team_id AND created_by = auth.uid()
    UNION
    SELECT 1 FROM public.team_members WHERE team_id = p_team_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to race sessions';
  END IF;

  RETURN QUERY
  SELECT rs.id, rs.team_id, rs.track_id, rs.session_type, rs.session_date, 
         rs.weather_conditions, rs.completed, rs.created_at, rs.updated_at
  FROM public.race_sessions rs
  WHERE rs.team_id = p_team_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get race results for a user
CREATE OR REPLACE FUNCTION public.get_user_race_results(p_team_id UUID)
RETURNS TABLE(
  id UUID,
  session_id UUID,
  team_member_id UUID,
  finishing_position INTEGER,
  grid_position INTEGER,
  fastest_lap BOOLEAN,
  pole_position BOOLEAN,
  lap_time TEXT,
  points_earned INTEGER,
  dnf BOOLEAN,
  dnf_reason TEXT,
  penalties TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has access to this team
  IF NOT EXISTS (
    SELECT 1 FROM public.teams WHERE id = p_team_id AND created_by = auth.uid()
    UNION
    SELECT 1 FROM public.team_members WHERE team_id = p_team_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to race results';
  END IF;

  RETURN QUERY
  SELECT rr.id, rr.session_id, rr.team_member_id, rr.finishing_position, 
         rr.grid_position, rr.fastest_lap, rr.pole_position, rr.lap_time,
         rr.points_earned, rr.dnf, rr.dnf_reason, rr.penalties,
         rr.created_at, rr.updated_at
  FROM public.race_results rr
  JOIN public.race_sessions rs ON rr.session_id = rs.id
  WHERE rs.team_id = p_team_id;
END;
$$ LANGUAGE plpgsql;

-- Add the updated_at trigger for team_invites
DROP TRIGGER IF EXISTS update_team_invites_updated_at ON public.team_invites;
CREATE TRIGGER update_team_invites_updated_at 
  BEFORE UPDATE ON public.team_invites 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Create proper indexes
CREATE INDEX IF NOT EXISTS idx_team_invites_invitee_email ON public.team_invites(invitee_email);
CREATE INDEX IF NOT EXISTS idx_team_invites_status ON public.team_invites(status);
CREATE INDEX IF NOT EXISTS idx_team_invites_team_id ON public.team_invites(team_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;