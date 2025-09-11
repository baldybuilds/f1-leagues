-- QualiPal F1 League Manager Database Schema
-- Fixed version without circular RLS policy references
-- 
-- This file contains all necessary SQL commands to set up the database:
-- - Tables for users, teams, tracks, race results, and invites
-- - Row Level Security policies (simplified to avoid circular references)
-- - Functions for automatic points calculation
-- - Triggers for data consistency
-- - Indexes for performance
--
-- To use: Execute this entire file in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams/Leagues table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  game_version TEXT NOT NULL CHECK (game_version IN ('F1 24', 'F1 25')),
  season_start_date DATE NOT NULL,
  season_end_date DATE NOT NULL,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text), 1, 8),
  scoring_system JSONB DEFAULT '{"win": 25, "second": 18, "third": 15, "fourth": 12, "fifth": 10, "sixth": 8, "seventh": 6, "eighth": 4, "ninth": 2, "tenth": 1}'::jsonb,
  points_for_fastest_lap INTEGER DEFAULT 1,
  points_for_pole_position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if they don't exist (for existing databases)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teams' AND column_name='scoring_system') THEN
    ALTER TABLE public.teams ADD COLUMN scoring_system JSONB DEFAULT '{"win": 25, "second": 18, "third": 15, "fourth": 12, "fifth": 10, "sixth": 8, "seventh": 6, "eighth": 4, "ninth": 2, "tenth": 1}'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teams' AND column_name='points_for_fastest_lap') THEN
    ALTER TABLE public.teams ADD COLUMN points_for_fastest_lap INTEGER DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teams' AND column_name='points_for_pole_position') THEN
    ALTER TABLE public.teams ADD COLUMN points_for_pole_position INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='teams' AND column_name='invite_code') THEN
    ALTER TABLE public.teams ADD COLUMN invite_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text), 1, 8);
  END IF;
END $$;

-- Team members table (for invites and memberships)
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  driver_name TEXT NOT NULL,
  team_name TEXT,
  car_number INTEGER CHECK (car_number >= 1 AND car_number <= 99),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id),
  UNIQUE(team_id, car_number)
);

-- Add columns if they don't exist (for existing databases)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_members' AND column_name='role') THEN
    ALTER TABLE public.team_members ADD COLUMN role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_members' AND column_name='driver_name') THEN
    ALTER TABLE public.team_members ADD COLUMN driver_name TEXT NOT NULL DEFAULT 'Default Driver';
    -- Update any existing rows that might have null values
    UPDATE public.team_members SET driver_name = 'Default Driver' WHERE driver_name IS NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_members' AND column_name='team_name') THEN
    ALTER TABLE public.team_members ADD COLUMN team_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_members' AND column_name='car_number') THEN
    ALTER TABLE public.team_members ADD COLUMN car_number INTEGER CHECK (car_number >= 1 AND car_number <= 99);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_members' AND column_name='joined_at') THEN
    ALTER TABLE public.team_members ADD COLUMN joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- F1 2025 Tracks data
CREATE TABLE IF NOT EXISTS public.tracks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  location TEXT NOT NULL,
  season INTEGER NOT NULL DEFAULT 2025,
  circuit_length DECIMAL(5,3),
  lap_record TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, country, season)
);

-- Add columns if they don't exist (for existing databases)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tracks' AND column_name='location') THEN
    ALTER TABLE public.tracks ADD COLUMN location TEXT NOT NULL DEFAULT '';
    -- Update any existing rows that might have null values
    UPDATE public.tracks SET location = country WHERE location = '' OR location IS NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tracks' AND column_name='season') THEN
    ALTER TABLE public.tracks ADD COLUMN season INTEGER NOT NULL DEFAULT 2025;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tracks' AND column_name='circuit_length') THEN
    ALTER TABLE public.tracks ADD COLUMN circuit_length DECIMAL(5,3);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tracks' AND column_name='lap_record') THEN
    ALTER TABLE public.tracks ADD COLUMN lap_record TEXT;
  END IF;
END $$;

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name='tracks' AND constraint_name='tracks_name_country_season_key'
  ) THEN
    ALTER TABLE public.tracks ADD CONSTRAINT tracks_name_country_season_key UNIQUE (name, country, season);
  END IF;
END $$;

-- Insert F1 2025 tracks
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

-- Team tracks (selected tracks for each team/league)
CREATE TABLE IF NOT EXISTS public.team_tracks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE NOT NULL,
  race_order INTEGER NOT NULL,
  race_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, track_id),
  UNIQUE(team_id, race_order)
);

-- Race sessions table
CREATE TABLE IF NOT EXISTS public.race_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('practice_1', 'practice_2', 'practice_3', 'qualifying', 'sprint_qualifying', 'sprint_race', 'race')),
  session_date TIMESTAMP WITH TIME ZONE,
  weather_conditions TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, track_id, session_type)
);

-- Race results table
CREATE TABLE IF NOT EXISTS public.race_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.race_sessions(id) ON DELETE CASCADE NOT NULL,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE NOT NULL,
  finishing_position INTEGER NOT NULL CHECK (finishing_position >= 1),
  grid_position INTEGER CHECK (grid_position >= 1),
  fastest_lap BOOLEAN DEFAULT FALSE,
  pole_position BOOLEAN DEFAULT FALSE,
  lap_time TEXT,
  points_earned INTEGER DEFAULT 0,
  dnf BOOLEAN DEFAULT FALSE,
  dnf_reason TEXT,
  penalties TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, team_member_id)
);

-- Add columns if they don't exist (for existing databases)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='race_results' AND column_name='finishing_position') THEN
    ALTER TABLE public.race_results ADD COLUMN finishing_position INTEGER NOT NULL DEFAULT 99 CHECK (finishing_position >= 1);
  ELSE
    -- Handle existing column that might have null values
    UPDATE public.race_results SET finishing_position = 99 WHERE finishing_position IS NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='race_results' AND column_name='grid_position') THEN
    ALTER TABLE public.race_results ADD COLUMN grid_position INTEGER CHECK (grid_position >= 1);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='race_results' AND column_name='fastest_lap') THEN
    ALTER TABLE public.race_results ADD COLUMN fastest_lap BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='race_results' AND column_name='pole_position') THEN
    ALTER TABLE public.race_results ADD COLUMN pole_position BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='race_results' AND column_name='lap_time') THEN
    ALTER TABLE public.race_results ADD COLUMN lap_time TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='race_results' AND column_name='points_earned') THEN
    ALTER TABLE public.race_results ADD COLUMN points_earned INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='race_results' AND column_name='dnf') THEN
    ALTER TABLE public.race_results ADD COLUMN dnf BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='race_results' AND column_name='dnf_reason') THEN
    ALTER TABLE public.race_results ADD COLUMN dnf_reason TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='race_results' AND column_name='penalties') THEN
    ALTER TABLE public.race_results ADD COLUMN penalties TEXT;
  END IF;
END $$;

-- Team invites table
CREATE TABLE IF NOT EXISTS public.team_invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text), 1, 12),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(team_id, email)
);

-- Championship standings view (calculated)
CREATE OR REPLACE VIEW public.championship_standings AS
SELECT 
  tm.id as team_member_id,
  tm.team_id,
  tm.driver_name,
  tm.team_name,
  tm.car_number,
  COALESCE(SUM(rr.points_earned), 0) as total_points,
  COUNT(CASE WHEN rs.session_type = 'race' AND rr.finishing_position IS NOT NULL THEN 1 END) as races_completed,
  COUNT(CASE WHEN rs.session_type = 'race' AND rr.finishing_position = 1 THEN 1 END) as wins,
  COUNT(CASE WHEN rs.session_type = 'race' AND rr.finishing_position <= 3 THEN 1 END) as podiums,
  COUNT(CASE WHEN rr.fastest_lap = true THEN 1 END) as fastest_laps,
  COUNT(CASE WHEN rr.pole_position = true THEN 1 END) as pole_positions,
  ROW_NUMBER() OVER (PARTITION BY tm.team_id ORDER BY COALESCE(SUM(rr.points_earned), 0) DESC, COUNT(CASE WHEN rs.session_type = 'race' AND rr.finishing_position = 1 THEN 1 END) DESC) as championship_position
FROM public.team_members tm
LEFT JOIN public.race_results rr ON tm.id = rr.team_member_id
LEFT JOIN public.race_sessions rs ON rr.session_id = rs.id
GROUP BY tm.id, tm.team_id, tm.driver_name, tm.team_name, tm.car_number;

-- Enable Row Level Security on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

DROP POLICY IF EXISTS "Anyone can view teams they're a member of" ON public.teams;
DROP POLICY IF EXISTS "Team creators can update their teams" ON public.teams;
DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
DROP POLICY IF EXISTS "Team creators can delete teams" ON public.teams;
DROP POLICY IF EXISTS "Team creators can view their teams" ON public.teams;

DROP POLICY IF EXISTS "Team members can view team memberships" ON public.team_members;
DROP POLICY IF EXISTS "Team admins can manage memberships" ON public.team_members;
DROP POLICY IF EXISTS "Users can join teams" ON public.team_members;
DROP POLICY IF EXISTS "Team creators can manage all memberships" ON public.team_members;
DROP POLICY IF EXISTS "Users can view own membership" ON public.team_members;
DROP POLICY IF EXISTS "Members can view team memberships" ON public.team_members;

DROP POLICY IF EXISTS "Anyone can view tracks" ON public.tracks;

DROP POLICY IF EXISTS "Team members can view team tracks" ON public.team_tracks;
DROP POLICY IF EXISTS "Team admins can manage team tracks" ON public.team_tracks;
DROP POLICY IF EXISTS "Team creators can manage team tracks" ON public.team_tracks;

DROP POLICY IF EXISTS "Team members can view race sessions" ON public.race_sessions;
DROP POLICY IF EXISTS "Team admins can manage race sessions" ON public.race_sessions;
DROP POLICY IF EXISTS "Team creators can manage race sessions" ON public.race_sessions;

DROP POLICY IF EXISTS "Team members can view race results" ON public.race_results;
DROP POLICY IF EXISTS "Team admins can manage race results" ON public.race_results;
DROP POLICY IF EXISTS "Team creators can manage race results" ON public.race_results;

DROP POLICY IF EXISTS "Team admins can view team invites" ON public.team_invites;
DROP POLICY IF EXISTS "Team admins can manage invites" ON public.team_invites;
DROP POLICY IF EXISTS "Team creators can manage invites" ON public.team_invites;

-- Simplified RLS Policies to avoid circular references

-- User profiles policies
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Teams policies - ONLY for team creators to avoid circular references
CREATE POLICY "Team creators can manage their teams" ON public.teams FOR ALL USING (created_by = auth.uid());

-- Team members policies - separate insert/select/update/delete to avoid conflicts
CREATE POLICY "Users can view own memberships" ON public.team_members FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Team creators can view all team memberships" ON public.team_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_members.team_id AND created_by = auth.uid())
);
CREATE POLICY "Users can create memberships" ON public.team_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Team creators can manage memberships" ON public.team_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_members.team_id AND created_by = auth.uid())
);
CREATE POLICY "Team creators can delete memberships" ON public.team_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_members.team_id AND created_by = auth.uid())
);

-- Tracks policies - everyone can view tracks
CREATE POLICY "Anyone can view tracks" ON public.tracks FOR SELECT USING (true);

-- Team tracks policies - only team creators can manage
CREATE POLICY "Team creators can manage team tracks" ON public.team_tracks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_tracks.team_id AND created_by = auth.uid())
);

-- Race sessions policies - only team creators can manage
CREATE POLICY "Team creators can manage race sessions" ON public.race_sessions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = race_sessions.team_id AND created_by = auth.uid())
);

-- Race results policies - only team creators can manage
CREATE POLICY "Team creators can manage race results" ON public.race_results FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.race_sessions rs 
    JOIN public.teams t ON rs.team_id = t.id 
    WHERE rs.id = race_results.session_id AND t.created_by = auth.uid()
  )
);

-- Team invites policies - only team creators can manage
CREATE POLICY "Team creators can manage invites" ON public.team_invites FOR ALL USING (
  EXISTS (SELECT 1 FROM public.teams WHERE id = team_invites.team_id AND created_by = auth.uid())
);

-- Functions for common operations

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to calculate points based on position and scoring system
CREATE OR REPLACE FUNCTION public.calculate_points(
  p_finish_pos INTEGER,
  p_scoring_system JSONB,
  p_fastest_lap BOOLEAN DEFAULT FALSE,
  p_pole_pos BOOLEAN DEFAULT FALSE,
  p_fastest_lap_points INTEGER DEFAULT 1,
  p_pole_points INTEGER DEFAULT 0
) RETURNS INTEGER AS $$
DECLARE
  base_points INTEGER := 0;
  bonus_points INTEGER := 0;
BEGIN
  -- Get base points from scoring system
  CASE p_finish_pos
    WHEN 1 THEN base_points := (p_scoring_system->>'win')::INTEGER;
    WHEN 2 THEN base_points := (p_scoring_system->>'second')::INTEGER;
    WHEN 3 THEN base_points := (p_scoring_system->>'third')::INTEGER;
    WHEN 4 THEN base_points := (p_scoring_system->>'fourth')::INTEGER;
    WHEN 5 THEN base_points := (p_scoring_system->>'fifth')::INTEGER;
    WHEN 6 THEN base_points := (p_scoring_system->>'sixth')::INTEGER;
    WHEN 7 THEN base_points := (p_scoring_system->>'seventh')::INTEGER;
    WHEN 8 THEN base_points := (p_scoring_system->>'eighth')::INTEGER;
    WHEN 9 THEN base_points := (p_scoring_system->>'ninth')::INTEGER;
    WHEN 10 THEN base_points := (p_scoring_system->>'tenth')::INTEGER;
    ELSE base_points := 0;
  END CASE;
  
  -- Add bonus points
  IF p_fastest_lap THEN
    bonus_points := bonus_points + p_fastest_lap_points;
  END IF;
  
  IF p_pole_pos THEN
    bonus_points := bonus_points + p_pole_points;
  END IF;
  
  RETURN COALESCE(base_points, 0) + bonus_points;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically calculate points on race result insert/update
CREATE OR REPLACE FUNCTION public.auto_calculate_points() 
RETURNS TRIGGER AS $$
DECLARE
  team_scoring JSONB;
  team_fastest_lap_points INTEGER;
  team_pole_points INTEGER;
BEGIN
  -- Get team scoring system
  SELECT t.scoring_system, t.points_for_fastest_lap, t.points_for_pole_position
  INTO team_scoring, team_fastest_lap_points, team_pole_points
  FROM public.teams t
  JOIN public.race_sessions rs ON t.id = rs.team_id
  WHERE rs.id = NEW.session_id;
  
  -- Calculate points
  NEW.points_earned := public.calculate_points(
    NEW.finishing_position,
    team_scoring,
    NEW.fastest_lap,
    NEW.pole_position,
    team_fastest_lap_points,
    team_pole_points
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate points
DROP TRIGGER IF EXISTS auto_calculate_points_trigger ON public.race_results;
CREATE TRIGGER auto_calculate_points_trigger
  BEFORE INSERT OR UPDATE ON public.race_results
  FOR EACH ROW EXECUTE PROCEDURE public.auto_calculate_points();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers for tables with updated_at columns
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams;
DROP TRIGGER IF EXISTS update_race_sessions_updated_at ON public.race_sessions;
DROP TRIGGER IF EXISTS update_race_results_updated_at ON public.race_results;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_race_sessions_updated_at BEFORE UPDATE ON public.race_sessions FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_race_results_updated_at BEFORE UPDATE ON public.race_results FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- App-level functions to handle member access

-- Function to check if user is member of a team
CREATE OR REPLACE FUNCTION public.is_team_member(p_team_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = p_team_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is team creator
CREATE OR REPLACE FUNCTION public.is_team_creator(p_team_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.teams 
    WHERE id = p_team_id AND created_by = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get teams user has access to (created or member of)
CREATE OR REPLACE FUNCTION public.get_user_teams(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE(team_id UUID, team_name TEXT, role TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as team_id,
    t.name as team_name,
    'creator' as role
  FROM public.teams t
  WHERE t.created_by = p_user_id
  
  UNION ALL
  
  SELECT 
    tm.team_id,
    t.name as team_name,
    tm.role::TEXT as role
  FROM public.team_members tm
  JOIN public.teams t ON tm.team_id = t.id
  WHERE tm.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_tracks_team_id ON public.team_tracks(team_id);
CREATE INDEX IF NOT EXISTS idx_race_sessions_team_id ON public.race_sessions(team_id);
CREATE INDEX IF NOT EXISTS idx_race_results_session_id ON public.race_results(session_id);
CREATE INDEX IF NOT EXISTS idx_race_results_team_member_id ON public.race_results(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_team_id ON public.team_invites(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_invite_code ON public.team_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_teams_invite_code ON public.teams(invite_code);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;