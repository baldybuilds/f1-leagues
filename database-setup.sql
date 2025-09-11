-- QualiPal F1 League Manager Database Setup
-- Complete SQL schema for the F1 League Management application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies and tables if they exist (in correct order)
DROP POLICY IF EXISTS "Users can view own teams" ON public.teams;
DROP POLICY IF EXISTS "Users can create teams" ON public.teams;
DROP POLICY IF EXISTS "Team creators can update teams" ON public.teams;
DROP POLICY IF EXISTS "Team creators can delete teams" ON public.teams;
DROP POLICY IF EXISTS "Users can view invites" ON public.team_invites;
DROP POLICY IF EXISTS "Users can create invites" ON public.team_invites;
DROP POLICY IF EXISTS "Users can update own invites" ON public.team_invites;
DROP POLICY IF EXISTS "Team members can view race results" ON public.race_results;
DROP POLICY IF EXISTS "Team creators can manage race results" ON public.race_results;
DROP POLICY IF EXISTS "Team members can view team tracks" ON public.team_tracks;
DROP POLICY IF EXISTS "Team creators can manage team tracks" ON public.team_tracks;
DROP POLICY IF EXISTS "Users can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can create team members" ON public.team_members;
DROP POLICY IF EXISTS "Team creators can manage team members" ON public.team_members;

DROP TABLE IF EXISTS public.race_results CASCADE;
DROP TABLE IF EXISTS public.team_tracks CASCADE;
DROP TABLE IF EXISTS public.team_invites CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.tracks CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  game TEXT NOT NULL CHECK (game IN ('F1 24', 'F1 25')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  max_members INTEGER DEFAULT 20,
  scoring_system JSONB DEFAULT '{"win": 25, "second": 18, "third": 15, "fourth": 12, "fifth": 10, "sixth": 8, "seventh": 6, "eighth": 4, "ninth": 2, "tenth": 1}'::jsonb
);

-- Create tracks table
CREATE TABLE public.tracks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  location TEXT NOT NULL,
  season INTEGER NOT NULL,
  circuit_length DECIMAL(5,3),
  lap_record TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create team_tracks junction table
CREATE TABLE public.team_tracks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL,
  race_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(team_id, track_id),
  UNIQUE(team_id, round_number)
);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  driver_name TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(team_id, user_id)
);

-- Create team_invites table
CREATE TABLE public.team_invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  inviter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  invitee_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days') NOT NULL,
  UNIQUE(team_id, invitee_email)
);

-- Create race_results table
CREATE TABLE public.race_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_track_id UUID REFERENCES public.team_tracks(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE NOT NULL,
  finishing_position INTEGER NOT NULL CHECK (finishing_position >= 1),
  points INTEGER DEFAULT 0,
  fastest_lap BOOLEAN DEFAULT FALSE,
  dnf BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(team_track_id, member_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for teams
CREATE POLICY "Users can view teams they are members of" ON public.teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team creators can update their teams" ON public.teams
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Team creators can delete their teams" ON public.teams
  FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for tracks (public read)
CREATE POLICY "Anyone can view tracks" ON public.tracks
  FOR SELECT TO authenticated USING (true);

-- Create RLS policies for team_tracks
CREATE POLICY "Team members can view team tracks" ON public.team_tracks
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team creators can manage team tracks" ON public.team_tracks
  FOR ALL USING (
    team_id IN (
      SELECT id FROM public.teams WHERE created_by = auth.uid()
    )
  );

-- Create RLS policies for team_members
CREATE POLICY "Users can view team members" ON public.team_members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create team members" ON public.team_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR 
    team_id IN (
      SELECT id FROM public.teams WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Team creators can manage team members" ON public.team_members
  FOR ALL USING (
    team_id IN (
      SELECT id FROM public.teams WHERE created_by = auth.uid()
    )
  );

-- Create RLS policies for team_invites
CREATE POLICY "Users can view their invites" ON public.team_invites
  FOR SELECT USING (
    invitee_email = (SELECT email FROM public.profiles WHERE id = auth.uid()) OR
    inviter_id = auth.uid()
  );

CREATE POLICY "Team creators can create invites" ON public.team_invites
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT id FROM public.teams WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their own invites" ON public.team_invites
  FOR UPDATE USING (
    invitee_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- Create RLS policies for race_results
CREATE POLICY "Team members can view race results" ON public.race_results
  FOR SELECT USING (
    team_track_id IN (
      SELECT tt.id FROM public.team_tracks tt
      JOIN public.team_members tm ON tt.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team creators can manage race results" ON public.race_results
  FOR ALL USING (
    team_track_id IN (
      SELECT tt.id FROM public.team_tracks tt
      JOIN public.teams t ON tt.team_id = t.id
      WHERE t.created_by = auth.uid()
    )
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert F1 2025 tracks data
INSERT INTO public.tracks (name, country, location, season, circuit_length, lap_record) VALUES
('Bahrain International Circuit', 'Bahrain', 'Sakhir', 2025, 5.412, '1:31.447'),
('Jeddah Corniche Circuit', 'Saudi Arabia', 'Jeddah', 2025, 6.174, '1:30.734'),
('Albert Park Circuit', 'Australia', 'Melbourne', 2025, 5.278, '1:20.260'),
('Suzuka International Racing Course', 'Japan', 'Suzuka', 2025, 5.807, '1:30.983'),
('Shanghai International Circuit', 'China', 'Shanghai', 2025, 5.451, '1:32.238'),
('Miami International Autodrome', 'United States', 'Miami', 2025, 5.412, '1:29.708'),
('Autodromo Enzo e Dino Ferrari', 'Italy', 'Imola', 2025, 4.909, '1:15.484'),
('Circuit de Monaco', 'Monaco', 'Monte Carlo', 2025, 3.337, '1:12.909'),
('Circuit Gilles Villeneuve', 'Canada', 'Montreal', 2025, 4.361, '1:13.078'),
('Circuit de Barcelona-Catalunya', 'Spain', 'Barcelona', 2025, 4.675, '1:16.330'),
('Red Bull Ring', 'Austria', 'Spielberg', 2025, 4.318, '1:05.619'),
('Silverstone Circuit', 'United Kingdom', 'Silverstone', 2025, 5.891, '1:27.097'),
('Hungaroring', 'Hungary', 'Budapest', 2025, 4.381, '1:16.627'),
('Circuit de Spa-Francorchamps', 'Belgium', 'Spa', 2025, 7.004, '1:46.286'),
('Circuit Park Zandvoort', 'Netherlands', 'Zandvoort', 2025, 4.259, '1:11.097'),
('Autodromo Nazionale di Monza', 'Italy', 'Monza', 2025, 5.793, '1:21.046'),
('Baku City Circuit', 'Azerbaijan', 'Baku', 2025, 6.003, '1:43.009'),
('Marina Bay Street Circuit', 'Singapore', 'Singapore', 2025, 5.063, '1:41.905'),
('Circuit of the Americas', 'United States', 'Austin', 2025, 5.513, '1:36.169'),
('Autodromo Hermanos Rodriguez', 'Mexico', 'Mexico City', 2025, 4.304, '1:17.774'),
('Autodromo Jose Carlos Pace', 'Brazil', 'Sao Paulo', 2025, 4.309, '1:10.540'),
('Las Vegas Street Circuit', 'United States', 'Las Vegas', 2025, 6.201, '1:35.490'),
('Losail International Circuit', 'Qatar', 'Lusail', 2025, 5.380, '1:24.319'),
('Yas Marina Circuit', 'United Arab Emirates', 'Abu Dhabi', 2025, 5.281, '1:26.103');

-- Create indexes for better performance
CREATE INDEX idx_teams_created_by ON public.teams(created_by);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_tracks_team_id ON public.team_tracks(team_id);
CREATE INDEX idx_team_invites_invitee_email ON public.team_invites(invitee_email);
CREATE INDEX idx_race_results_team_track_id ON public.race_results(team_track_id);
CREATE INDEX idx_race_results_member_id ON public.race_results(member_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;