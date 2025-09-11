-- QualiPal F1 League Manager - Complete Database Rebuild
-- This script completely rebuilds the database from scratch with proper constraints

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop all existing tables in correct order (respecting foreign key dependencies)
DROP TABLE IF EXISTS public.race_results CASCADE;
DROP TABLE IF EXISTS public.race_sessions CASCADE;
DROP TABLE IF EXISTS public.team_tracks CASCADE;
DROP TABLE IF EXISTS public.team_invites CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.tracks CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;

-- Create tracks table first (no dependencies)
CREATE TABLE public.tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  location TEXT NOT NULL,
  season INTEGER NOT NULL DEFAULT 2025,
  round_number INTEGER,
  circuit_length DECIMAL(5,3),
  lap_record TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, country, season)
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  game_version TEXT NOT NULL CHECK (game_version IN ('F1 24', 'F1 25')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- League settings
  points_system JSONB DEFAULT '{"1": 25, "2": 18, "3": 15, "4": 12, "5": 10, "6": 8, "7": 6, "8": 4, "9": 2, "10": 1}',
  fastest_lap_points INTEGER DEFAULT 1,
  pole_position_points INTEGER DEFAULT 0,
  sprint_race_enabled BOOLEAN DEFAULT false,
  sprint_points_system JSONB DEFAULT '{"1": 8, "2": 7, "3": 6, "4": 5, "5": 4, "6": 3, "7": 2, "8": 1}',
  dnf_penalty INTEGER DEFAULT 0,
  penalty_system JSONB DEFAULT '{}',
  minimum_races_for_championship INTEGER DEFAULT 1
);

-- Create team members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_name TEXT NOT NULL,
  team_name TEXT,
  car_number INTEGER,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id),
  UNIQUE(team_id, car_number)
);

-- Create team invites table
CREATE TABLE public.team_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, invitee_email)
);

-- Create team tracks table (which tracks are selected for a team's season)
CREATE TABLE public.team_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, track_id),
  UNIQUE(team_id, round_number)
);

-- Create race sessions table
CREATE TABLE public.race_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('practice', 'qualifying', 'sprint', 'race')),
  session_date TIMESTAMP WITH TIME ZONE,
  weather_conditions TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create race results table
CREATE TABLE public.race_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.race_sessions(id) ON DELETE CASCADE,
  team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  finishing_position INTEGER CHECK (finishing_position >= 1),
  grid_position INTEGER,
  fastest_lap BOOLEAN DEFAULT false,
  pole_position BOOLEAN DEFAULT false,
  lap_time TEXT,
  points_earned INTEGER DEFAULT 0,
  dnf BOOLEAN DEFAULT false,
  dnf_reason TEXT,
  penalties TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, team_member_id),
  UNIQUE(session_id, finishing_position)
);

-- Insert F1 2025 tracks data
INSERT INTO public.tracks (name, country, location, season, round_number, circuit_length, lap_record) VALUES
('Bahrain International Circuit', 'Bahrain', 'Sakhir', 2025, 1, 5.412, '1:31.447'),
('Jeddah Corniche Circuit', 'Saudi Arabia', 'Jeddah', 2025, 2, 6.174, '1:28.200'),
('Albert Park Circuit', 'Australia', 'Melbourne', 2025, 3, 5.278, '1:20.260'),
('Suzuka International Racing Course', 'Japan', 'Suzuka', 2025, 4, 5.807, '1:30.983'),
('Shanghai International Circuit', 'China', 'Shanghai', 2025, 5, 5.451, '1:32.238'),
('Miami International Autodrome', 'United States', 'Miami', 2025, 6, 5.412, '1:29.708'),
('Autodromo Enzo e Dino Ferrari', 'Italy', 'Imola', 2025, 7, 4.909, '1:15.484'),
('Circuit de Monaco', 'Monaco', 'Monte Carlo', 2025, 8, 3.337, '1:12.909'),
('Circuit Gilles Villeneuve', 'Canada', 'Montreal', 2025, 9, 4.361, '1:13.078'),
('Circuit de Barcelona-Catalunya', 'Spain', 'Barcelona', 2025, 10, 4.675, '1:16.330'),
('Red Bull Ring', 'Austria', 'Spielberg', 2025, 11, 4.318, '1:05.619'),
('Silverstone Circuit', 'United Kingdom', 'Silverstone', 2025, 12, 5.891, '1:27.097'),
('Hungaroring', 'Hungary', 'Budapest', 2025, 13, 4.381, '1:16.627'),
('Circuit de Spa-Francorchamps', 'Belgium', 'Spa', 2025, 14, 7.004, '1:46.286'),
('Circuit Park Zandvoort', 'Netherlands', 'Zandvoort', 2025, 15, 4.259, '1:11.097'),
('Autodromo Nazionale di Monza', 'Italy', 'Monza', 2025, 16, 5.793, '1:21.046'),
('Baku City Circuit', 'Azerbaijan', 'Baku', 2025, 17, 6.003, '1:43.009'),
('Marina Bay Street Circuit', 'Singapore', 'Singapore', 2025, 18, 5.063, '1:36.015'),
('Circuit of the Americas', 'United States', 'Austin', 2025, 19, 5.513, '1:36.169'),
('Autodromo Hermanos Rodriguez', 'Mexico', 'Mexico City', 2025, 20, 4.304, '1:17.774'),
('Autodromo Jose Carlos Pace', 'Brazil', 'Sao Paulo', 2025, 21, 4.309, '1:10.540'),
('Las Vegas Strip Circuit', 'United States', 'Las Vegas', 2025, 22, 6.201, '1:35.490'),
('Losail International Circuit', 'Qatar', 'Lusail', 2025, 23, 5.380, '1:24.319'),
('Yas Marina Circuit', 'United Arab Emirates', 'Abu Dhabi', 2025, 24, 5.281, '1:26.103');

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_teams_updated_at 
  BEFORE UPDATE ON public.teams 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_invites_updated_at 
  BEFORE UPDATE ON public.team_invites 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_race_sessions_updated_at 
  BEFORE UPDATE ON public.race_sessions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_race_results_updated_at 
  BEFORE UPDATE ON public.race_results 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_results ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive RLS policies

-- Teams: Users can only see and modify teams they created
CREATE POLICY "teams_policy" ON public.teams
FOR ALL TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Team members: Users can see memberships for teams they created or are members of
CREATE POLICY "team_members_select_policy" ON public.team_members
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() OR
  team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
);

-- Team members: Users can insert themselves or team creators can add members
CREATE POLICY "team_members_insert_policy" ON public.team_members
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() OR
  team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
);

-- Team members: Users can update their own membership, team creators can update any
CREATE POLICY "team_members_update_policy" ON public.team_members
FOR UPDATE TO authenticated
USING (
  user_id = auth.uid() OR
  team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
);

-- Team members: Users can delete their own membership, team creators can delete any
CREATE POLICY "team_members_delete_policy" ON public.team_members
FOR DELETE TO authenticated
USING (
  user_id = auth.uid() OR
  team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
);

-- Team invites: Users can see invites sent to them or their teams
CREATE POLICY "team_invites_select_policy" ON public.team_invites
FOR SELECT TO authenticated
USING (
  invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
  team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
);

-- Team invites: Only team creators can create invites
CREATE POLICY "team_invites_insert_policy" ON public.team_invites
FOR INSERT TO authenticated
WITH CHECK (
  team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
);

-- Team invites: Users can update invites sent to them, team creators can update their teams
CREATE POLICY "team_invites_update_policy" ON public.team_invites
FOR UPDATE TO authenticated
USING (
  invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
  team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
);

-- Team invites: Team creators can delete their team's invites
CREATE POLICY "team_invites_delete_policy" ON public.team_invites
FOR DELETE TO authenticated
USING (
  team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
);

-- Tracks: Everyone can read tracks (they're global data)
CREATE POLICY "tracks_policy" ON public.tracks
FOR SELECT TO authenticated
USING (true);

-- Team tracks: Users can see tracks for their teams
CREATE POLICY "team_tracks_select_policy" ON public.team_tracks
FOR SELECT TO authenticated
USING (
  team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid()) OR
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

-- Team tracks: Only team creators can manage team tracks
CREATE POLICY "team_tracks_modify_policy" ON public.team_tracks
FOR ALL TO authenticated
USING (team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid()))
WITH CHECK (team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid()));

-- Race sessions: Users can see sessions for their teams
CREATE POLICY "race_sessions_select_policy" ON public.race_sessions
FOR SELECT TO authenticated
USING (
  team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid()) OR
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

-- Race sessions: Only team creators can manage race sessions
CREATE POLICY "race_sessions_modify_policy" ON public.race_sessions
FOR ALL TO authenticated
USING (team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid()))
WITH CHECK (team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid()));

-- Race results: Users can see results for their teams
CREATE POLICY "race_results_select_policy" ON public.race_results
FOR SELECT TO authenticated
USING (
  session_id IN (
    SELECT rs.id FROM public.race_sessions rs
    WHERE rs.team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid()) OR
          rs.team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
  )
);

-- Race results: Only team creators can manage race results
CREATE POLICY "race_results_modify_policy" ON public.race_results
FOR ALL TO authenticated
USING (
  session_id IN (
    SELECT rs.id FROM public.race_sessions rs
    WHERE rs.team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
  )
)
WITH CHECK (
  session_id IN (
    SELECT rs.id FROM public.race_sessions rs
    WHERE rs.team_id IN (SELECT id FROM public.teams WHERE created_by = auth.uid())
  )
);

-- Create indexes for performance
CREATE INDEX idx_teams_created_by ON public.teams(created_by);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_invites_team_id ON public.team_invites(team_id);
CREATE INDEX idx_team_invites_invitee_email ON public.team_invites(invitee_email);
CREATE INDEX idx_team_invites_status ON public.team_invites(status);
CREATE INDEX idx_team_tracks_team_id ON public.team_tracks(team_id);
CREATE INDEX idx_team_tracks_track_id ON public.team_tracks(track_id);
CREATE INDEX idx_race_sessions_team_id ON public.race_sessions(team_id);
CREATE INDEX idx_race_sessions_track_id ON public.race_sessions(track_id);
CREATE INDEX idx_race_results_session_id ON public.race_results(session_id);
CREATE INDEX idx_race_results_team_member_id ON public.race_results(team_member_id);

-- Grant proper permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;