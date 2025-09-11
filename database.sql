-- QualiPal F1 League Manager Database Schema
-- Complete SQL setup for all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

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

-- F1 2025 Tracks data
CREATE TABLE IF NOT EXISTS public.tracks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  circuit_length DECIMAL(5,3),
  lap_record TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert F1 2025 tracks
INSERT INTO public.tracks (name, country, circuit_length, lap_record) VALUES
('Bahrain International Circuit', 'Bahrain', 5.412, '1:31.447'),
('Jeddah Corniche Circuit', 'Saudi Arabia', 6.174, '1:30.734'),
('Albert Park Circuit', 'Australia', 5.278, '1:20.260'),
('Suzuka International Racing Course', 'Japan', 5.807, '1:30.983'),
('Shanghai International Circuit', 'China', 5.451, '1:32.238'),
('Miami International Autodrome', 'United States', 5.410, '1:29.708'),
('Autodromo Enzo e Dino Ferrari', 'Italy', 4.909, '1:15.484'),
('Circuit de Monaco', 'Monaco', 3.337, '1:12.909'),
('Circuit Gilles Villeneuve', 'Canada', 4.361, '1:13.078'),
('Circuit de Barcelona-Catalunya', 'Spain', 4.675, '1:16.330'),
('Red Bull Ring', 'Austria', 4.318, '1:05.619'),
('Silverstone Circuit', 'United Kingdom', 5.891, '1:27.097'),
('Hungaroring', 'Hungary', 4.381, '1:16.627'),
('Circuit de Spa-Francorchamps', 'Belgium', 7.004, '1:41.252'),
('Circuit Park Zandvoort', 'Netherlands', 4.259, '1:11.097'),
('Autodromo Nazionale di Monza', 'Italy', 5.793, '1:21.046'),
('Baku City Circuit', 'Azerbaijan', 6.003, '1:43.009'),
('Marina Bay Street Circuit', 'Singapore', 5.063, '1:35.867'),
('Circuit of the Americas', 'United States', 5.513, '1:36.169'),
('Autodromo Hermanos Rodriguez', 'Mexico', 4.304, '1:17.774'),
('Autodromo Jose Carlos Pace', 'Brazil', 4.309, '1:10.540'),
('Las Vegas Street Circuit', 'United States', 6.201, '1:35.490'),
('Losail International Circuit', 'Qatar', 5.380, '1:24.319'),
('Yas Marina Circuit', 'United Arab Emirates', 5.281, '1:26.103')
ON CONFLICT DO NOTHING;

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
  UNIQUE(session_id, team_member_id),
  UNIQUE(session_id, finishing_position)
);

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

-- RLS Policies

-- User profiles policies
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Teams policies
CREATE POLICY "Anyone can view teams they're a member of" ON public.teams FOR SELECT USING (
  id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);
CREATE POLICY "Team creators can update their teams" ON public.teams FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Authenticated users can create teams" ON public.teams FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Team admins can delete teams" ON public.teams FOR DELETE USING (
  created_by = auth.uid() OR 
  id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'admin')
);

-- Team members policies
CREATE POLICY "Team members can view team memberships" ON public.team_members FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);
CREATE POLICY "Team admins can manage memberships" ON public.team_members FOR ALL USING (
  team_id IN (
    SELECT t.id FROM public.teams t 
    WHERE t.created_by = auth.uid() OR 
    t.id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'admin')
  )
);
CREATE POLICY "Users can join teams" ON public.team_members FOR INSERT WITH CHECK (user_id = auth.uid());

-- Tracks policies
CREATE POLICY "Anyone can view tracks" ON public.tracks FOR SELECT USING (true);

-- Team tracks policies
CREATE POLICY "Team members can view team tracks" ON public.team_tracks FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);
CREATE POLICY "Team admins can manage team tracks" ON public.team_tracks FOR ALL USING (
  team_id IN (
    SELECT t.id FROM public.teams t 
    WHERE t.created_by = auth.uid() OR 
    t.id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'admin')
  )
);

-- Race sessions policies
CREATE POLICY "Team members can view race sessions" ON public.race_sessions FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);
CREATE POLICY "Team admins can manage race sessions" ON public.race_sessions FOR ALL USING (
  team_id IN (
    SELECT t.id FROM public.teams t 
    WHERE t.created_by = auth.uid() OR 
    t.id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'admin')
  )
);

-- Race results policies
CREATE POLICY "Team members can view race results" ON public.race_results FOR SELECT USING (
  session_id IN (
    SELECT rs.id FROM public.race_sessions rs 
    JOIN public.team_members tm ON rs.team_id = tm.team_id 
    WHERE tm.user_id = auth.uid()
  )
);
CREATE POLICY "Team admins can manage race results" ON public.race_results FOR ALL USING (
  session_id IN (
    SELECT rs.id FROM public.race_sessions rs 
    JOIN public.teams t ON rs.team_id = t.id 
    WHERE t.created_by = auth.uid() OR 
    rs.team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'admin')
  )
);

-- Team invites policies
CREATE POLICY "Team admins can view team invites" ON public.team_invites FOR SELECT USING (
  team_id IN (
    SELECT t.id FROM public.teams t 
    WHERE t.created_by = auth.uid() OR 
    t.id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'admin')
  )
);
CREATE POLICY "Team admins can manage invites" ON public.team_invites FOR ALL USING (
  team_id IN (
    SELECT t.id FROM public.teams t 
    WHERE t.created_by = auth.uid() OR 
    t.id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid() AND role = 'admin')
  )
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
  p_finishing_position INTEGER,
  p_scoring_system JSONB,
  p_fastest_lap BOOLEAN DEFAULT FALSE,
  p_pole_position BOOLEAN DEFAULT FALSE,
  p_fastest_lap_points INTEGER DEFAULT 1,
  p_pole_points INTEGER DEFAULT 0
) RETURNS INTEGER AS $$
DECLARE
  base_points INTEGER := 0;
  bonus_points INTEGER := 0;
BEGIN
  -- Get base points from scoring system
  CASE p_finishing_position
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
  
  IF p_pole_position THEN
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
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_race_sessions_updated_at BEFORE UPDATE ON public.race_sessions FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_race_results_updated_at BEFORE UPDATE ON public.race_results FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

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