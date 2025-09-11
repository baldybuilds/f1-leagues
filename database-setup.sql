-- QualiPal F1 League Manager Database Setup
-- Complete SQL setup for the application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
DO $$ BEGIN
  CREATE TYPE game_type AS ENUM ('F1_24', 'F1_25');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Core Tables

-- Tracks table
CREATE TABLE IF NOT EXISTS public.tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  season INTEGER NOT NULL DEFAULT 2025,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  circuit_length DECIMAL(5,3),
  lap_record VARCHAR(10)
);

-- Teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  game game_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Team tracks table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.team_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  race_order INTEGER NOT NULL,
  race_date DATE,
  UNIQUE(team_id, track_id),
  UNIQUE(team_id, race_order)
);

-- Team invites table
CREATE TABLE IF NOT EXISTS public.team_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email VARCHAR(255) NOT NULL,
  status invite_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  UNIQUE(team_id, invited_email)
);

-- Race results table
CREATE TABLE IF NOT EXISTS public.race_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_track_id UUID NOT NULL REFERENCES public.team_tracks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  finishing_position INTEGER NOT NULL CHECK (finishing_position >= 1),
  points INTEGER NOT NULL DEFAULT 0,
  fastest_lap BOOLEAN DEFAULT FALSE,
  dnf BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_track_id, user_id),
  UNIQUE(team_track_id, finishing_position)
);

-- League settings table
CREATE TABLE IF NOT EXISTS public.league_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE UNIQUE,
  points_system JSONB NOT NULL DEFAULT '[25,18,15,12,10,8,6,4,2,1]'::jsonb,
  fastest_lap_points INTEGER DEFAULT 1,
  dnf_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert 2025 F1 tracks
INSERT INTO public.tracks (name, country, location, circuit_length, lap_record) VALUES
('Bahrain International Circuit', 'Bahrain', 'Sakhir', 5.412, '1:31.447'),
('Jeddah Corniche Circuit', 'Saudi Arabia', 'Jeddah', 6.174, '1:30.734'),
('Albert Park Circuit', 'Australia', 'Melbourne', 5.278, '1:20.260'),
('Suzuka International Racing Course', 'Japan', 'Suzuka', 5.807, '1:30.983'),
('Shanghai International Circuit', 'China', 'Shanghai', 5.451, '1:32.238'),
('Miami International Autodrome', 'United States', 'Miami', 5.412, '1:29.708'),
('Autodromo Enzo e Dino Ferrari', 'Italy', 'Imola', 4.909, '1:15.484'),
('Circuit de Monaco', 'Monaco', 'Monte Carlo', 3.337, '1:12.909'),
('Circuit Gilles Villeneuve', 'Canada', 'Montreal', 4.361, '1:13.078'),
('Circuit de Barcelona-Catalunya', 'Spain', 'Barcelona', 4.675, '1:16.330'),
('Red Bull Ring', 'Austria', 'Spielberg', 4.318, '1:05.619'),
('Silverstone Circuit', 'United Kingdom', 'Silverstone', 5.891, '1:27.097'),
('Hungaroring', 'Hungary', 'Budapest', 4.381, '1:16.627'),
('Circuit de Spa-Francorchamps', 'Belgium', 'Spa', 7.004, '1:46.286'),
('Circuit Park Zandvoort', 'Netherlands', 'Zandvoort', 4.259, '1:11.097'),
('Autodromo Nazionale Monza', 'Italy', 'Monza', 5.793, '1:21.046'),
('Baku City Circuit', 'Azerbaijan', 'Baku', 6.003, '1:43.009'),
('Marina Bay Street Circuit', 'Singapore', 'Singapore', 5.063, '1:36.015'),
('Circuit of the Americas', 'United States', 'Austin', 5.513, '1:36.169'),
('Autodromo Hermanos Rodriguez', 'Mexico', 'Mexico City', 4.304, '1:17.774'),
('Autodromo Jose Carlos Pace', 'Brazil', 'Sao Paulo', 4.309, '1:10.540'),
('Las Vegas Strip Circuit', 'United States', 'Las Vegas', 6.201, '1:35.490'),
('Losail International Circuit', 'Qatar', 'Lusail', 5.380, '1:24.319'),
('Yas Marina Circuit', 'United Arab Emirates', 'Abu Dhabi', 5.281, '1:26.103')
ON CONFLICT (name, country) DO NOTHING;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_settings ENABLE ROW LEVEL SECURITY;

-- Tracks are public (no RLS needed)
ALTER TABLE public.tracks DISABLE ROW LEVEL SECURITY;

-- Teams policies
DROP POLICY IF EXISTS "Users can view teams they are members of" ON public.teams;
CREATE POLICY "Users can view teams they are members of" ON public.teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create teams" ON public.teams;
CREATE POLICY "Users can create teams" ON public.teams
  FOR INSERT WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Team creators can update teams" ON public.teams;
CREATE POLICY "Team creators can update teams" ON public.teams
  FOR UPDATE USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Team creators can delete teams" ON public.teams;
CREATE POLICY "Team creators can delete teams" ON public.teams
  FOR DELETE USING (created_by = auth.uid());

-- Team members policies
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;
CREATE POLICY "Users can view team members of their teams" ON public.team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Team admins can manage members" ON public.team_members;
CREATE POLICY "Team admins can manage members" ON public.team_members
  FOR ALL USING (
    team_id IN (
      SELECT t.id FROM public.teams t
      WHERE t.created_by = auth.uid()
    )
  );

-- Team tracks policies
DROP POLICY IF EXISTS "Users can view tracks of their teams" ON public.team_tracks;
CREATE POLICY "Users can view tracks of their teams" ON public.team_tracks
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Team creators can manage team tracks" ON public.team_tracks;
CREATE POLICY "Team creators can manage team tracks" ON public.team_tracks
  FOR ALL USING (
    team_id IN (
      SELECT id FROM public.teams 
      WHERE created_by = auth.uid()
    )
  );

-- Team invites policies
DROP POLICY IF EXISTS "Users can view invites for their email" ON public.team_invites;
CREATE POLICY "Users can view invites for their email" ON public.team_invites
  FOR SELECT USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR invited_by = auth.uid()
    OR team_id IN (
      SELECT id FROM public.teams WHERE created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Team creators can manage invites" ON public.team_invites;
CREATE POLICY "Team creators can manage invites" ON public.team_invites
  FOR ALL USING (
    team_id IN (
      SELECT id FROM public.teams 
      WHERE created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own invite status" ON public.team_invites;
CREATE POLICY "Users can update their own invite status" ON public.team_invites
  FOR UPDATE USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Race results policies
DROP POLICY IF EXISTS "Users can view race results of their teams" ON public.race_results;
CREATE POLICY "Users can view race results of their teams" ON public.race_results
  FOR SELECT USING (
    team_track_id IN (
      SELECT tt.id FROM public.team_tracks tt
      JOIN public.team_members tm ON tt.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Team creators can manage race results" ON public.race_results;
CREATE POLICY "Team creators can manage race results" ON public.race_results
  FOR ALL USING (
    team_track_id IN (
      SELECT tt.id FROM public.team_tracks tt
      JOIN public.teams t ON tt.team_id = t.id
      WHERE t.created_by = auth.uid()
    )
  );

-- League settings policies
DROP POLICY IF EXISTS "Users can view league settings of their teams" ON public.league_settings;
CREATE POLICY "Users can view league settings of their teams" ON public.league_settings
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Team creators can manage league settings" ON public.league_settings;
CREATE POLICY "Team creators can manage league settings" ON public.league_settings
  FOR ALL USING (
    team_id IN (
      SELECT id FROM public.teams 
      WHERE created_by = auth.uid()
    )
  );

-- Functions and Triggers

-- Function to automatically add creator as team member
CREATE OR REPLACE FUNCTION add_creator_as_team_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.team_members (team_id, user_id, is_admin)
  VALUES (NEW.id, NEW.created_by, true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to add creator as team member
DROP TRIGGER IF EXISTS add_creator_as_team_member_trigger ON public.teams;
CREATE TRIGGER add_creator_as_team_member_trigger
  AFTER INSERT ON public.teams
  FOR EACH ROW EXECUTE FUNCTION add_creator_as_team_member();

-- Function to create default league settings
CREATE OR REPLACE FUNCTION create_default_league_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.league_settings (team_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default league settings
DROP TRIGGER IF EXISTS create_default_league_settings_trigger ON public.teams;
CREATE TRIGGER create_default_league_settings_trigger
  AFTER INSERT ON public.teams
  FOR EACH ROW EXECUTE FUNCTION create_default_league_settings();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_race_results_updated_at ON public.race_results;
CREATE TRIGGER update_race_results_updated_at
  BEFORE UPDATE ON public.race_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_league_settings_updated_at ON public.league_settings;
CREATE TRIGGER update_league_settings_updated_at
  BEFORE UPDATE ON public.league_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.tracks TO anon;

-- Clean up any potential orphaned records (run after setup)
-- These will only run if the referenced tables exist and have data
DO $$
BEGIN
  -- Clean up orphaned team_members
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_members') THEN
    DELETE FROM public.team_members 
    WHERE team_id NOT IN (SELECT id FROM public.teams);
  END IF;
  
  -- Clean up orphaned team_tracks
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_tracks') THEN
    DELETE FROM public.team_tracks 
    WHERE team_id NOT IN (SELECT id FROM public.teams);
  END IF;
  
  -- Clean up orphaned team_invites
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_invites') THEN
    DELETE FROM public.team_invites 
    WHERE team_id NOT IN (SELECT id FROM public.teams);
  END IF;
  
  -- Clean up orphaned race_results
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'race_results') THEN
    DELETE FROM public.race_results 
    WHERE team_track_id NOT IN (SELECT id FROM public.team_tracks);
  END IF;
  
  -- Clean up orphaned league_settings
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'league_settings') THEN
    DELETE FROM public.league_settings 
    WHERE team_id NOT IN (SELECT id FROM public.teams);
  END IF;
END $$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';