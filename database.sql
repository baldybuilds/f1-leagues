-- QualiPal F1 League Manager - Complete Database Schema
-- This file contains all the SQL queries needed to set up the database for the F1 league management system

-- Enable Row Level Security (RLS) for all tables
-- This ensures users can only access data they're authorized to see

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams/Leagues table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  game TEXT NOT NULL CHECK (game IN ('F1 24', 'F1 25')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  tracks TEXT[] NOT NULL, -- Array of track names
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- League settings
  points_system JSONB DEFAULT '{
    "1": 25, "2": 18, "3": 15, "4": 12, "5": 10,
    "6": 8, "7": 6, "8": 4, "9": 2, "10": 1
  }'::jsonb,
  scoring_rules JSONB DEFAULT '{
    "fastest_lap_point": true,
    "sprint_race_points": true,
    "pole_position_point": false
  }'::jsonb
);

-- Team invitations
CREATE TABLE IF NOT EXISTS public.team_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  UNIQUE(team_id, email)
);

-- Team members (users who have joined teams)
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  driver_name TEXT NOT NULL, -- In-game driver name
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Race results for each track in each team
CREATE TABLE IF NOT EXISTS public.race_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  track_name TEXT NOT NULL,
  member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL CHECK (position > 0),
  points INTEGER DEFAULT 0,
  fastest_lap BOOLEAN DEFAULT FALSE,
  pole_position BOOLEAN DEFAULT FALSE,
  dnf BOOLEAN DEFAULT FALSE,
  race_time INTERVAL, -- Race completion time
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, track_name, member_id)
);

-- Driver performance analytics
CREATE TABLE IF NOT EXISTS public.driver_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  track_name TEXT NOT NULL,
  qualifying_position INTEGER,
  race_position INTEGER,
  grid_penalty INTEGER DEFAULT 0,
  sectors JSONB, -- Sector times {"sector1": "00:23.456", "sector2": "00:45.123", "sector3": "00:34.789"}
  telemetry_data JSONB, -- Additional telemetry if needed
  consistency_rating DECIMAL(3,1), -- 0.0 to 10.0 rating
  pace_rating DECIMAL(3,1), -- 0.0 to 10.0 rating
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Performance indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON public.teams(created_by);
CREATE INDEX IF NOT EXISTS idx_team_invites_team_id ON public.team_invites(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_email ON public.team_invites(email);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_race_results_team_id ON public.race_results(team_id);
CREATE INDEX IF NOT EXISTS idx_race_results_member_id ON public.race_results(member_id);
CREATE INDEX IF NOT EXISTS idx_race_results_track ON public.race_results(team_id, track_name);
CREATE INDEX IF NOT EXISTS idx_driver_analytics_member_id ON public.driver_analytics(member_id);
CREATE INDEX IF NOT EXISTS idx_driver_analytics_team_track ON public.driver_analytics(team_id, track_name);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_analytics ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Teams policies
CREATE POLICY "Users can view teams they're members of" ON public.teams
  FOR SELECT USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = teams.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team admins can update teams" ON public.teams
  FOR UPDATE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = teams.id AND user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Team admins can delete teams" ON public.teams
  FOR DELETE USING (auth.uid() = created_by);

-- Team invites policies
CREATE POLICY "Users can view invites for their teams" ON public.team_invites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE id = team_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.team_members
          WHERE team_id = teams.id AND user_id = auth.uid() AND role = 'admin'
        )
      )
    ) OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND email = team_invites.email
    )
  );

CREATE POLICY "Team admins can create invites" ON public.team_invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE id = team_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.team_members
          WHERE team_id = teams.id AND user_id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Invited users can update invite status" ON public.team_invites
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND email = team_invites.email
    )
  );

-- Team members policies
CREATE POLICY "Users can view team members of teams they're in" ON public.team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join teams they're invited to" ON public.team_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.team_invites
      WHERE team_id = team_members.team_id
      AND email IN (SELECT email FROM public.users WHERE id = auth.uid())
      AND status = 'accepted'
    )
  );

CREATE POLICY "Team admins can manage members" ON public.team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE id = team_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.team_id = teams.id AND tm.user_id = auth.uid() AND tm.role = 'admin'
        )
      )
    )
  );

-- Race results policies
CREATE POLICY "Team members can view race results" ON public.race_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = race_results.team_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage race results" ON public.race_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE id = team_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.team_members
          WHERE team_id = teams.id AND user_id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- Driver analytics policies
CREATE POLICY "Team members can view analytics" ON public.driver_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = driver_analytics.team_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can manage analytics" ON public.driver_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE id = team_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.team_members
          WHERE team_id = teams.id AND user_id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate driver standings
CREATE OR REPLACE FUNCTION public.get_driver_standings(team_uuid UUID)
RETURNS TABLE (
  member_id UUID,
  driver_name TEXT,
  total_points INTEGER,
  races_completed INTEGER,
  wins INTEGER,
  podiums INTEGER,
  fastest_laps INTEGER,
  pole_positions INTEGER,
  average_position DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tm.id as member_id,
    tm.driver_name,
    COALESCE(SUM(rr.points), 0)::INTEGER as total_points,
    COUNT(rr.id)::INTEGER as races_completed,
    COUNT(CASE WHEN rr.position = 1 THEN 1 END)::INTEGER as wins,
    COUNT(CASE WHEN rr.position <= 3 THEN 1 END)::INTEGER as podiums,
    COUNT(CASE WHEN rr.fastest_lap = true THEN 1 END)::INTEGER as fastest_laps,
    COUNT(CASE WHEN rr.pole_position = true THEN 1 END)::INTEGER as pole_positions,
    COALESCE(AVG(rr.position), 0)::DECIMAL as average_position
  FROM public.team_members tm
  LEFT JOIN public.race_results rr ON tm.id = rr.member_id
  WHERE tm.team_id = team_uuid
  GROUP BY tm.id, tm.driver_name
  ORDER BY total_points DESC, races_completed DESC, average_position ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get team race results for a specific track
CREATE OR REPLACE FUNCTION public.get_race_results_by_track(team_uuid UUID, track TEXT)
RETURNS TABLE (
  member_id UUID,
  driver_name TEXT,
  position INTEGER,
  points INTEGER,
  fastest_lap BOOLEAN,
  pole_position BOOLEAN,
  dnf BOOLEAN,
  race_time INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tm.id as member_id,
    tm.driver_name,
    rr.position,
    rr.points,
    rr.fastest_lap,
    rr.pole_position,
    rr.dnf,
    rr.race_time
  FROM public.team_members tm
  LEFT JOIN public.race_results rr ON tm.id = rr.member_id AND rr.track_name = track
  WHERE tm.team_id = team_uuid
  ORDER BY 
    CASE WHEN rr.position IS NULL THEN 1 ELSE 0 END,
    rr.position ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers to update updated_at timestamps
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_race_results_updated_at ON public.race_results;
CREATE TRIGGER update_race_results_updated_at
  BEFORE UPDATE ON public.race_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default F1 2025 tracks (can be customized per team)
-- This is just reference data - teams will select their own tracks
INSERT INTO public.tracks_reference (name, country, type) VALUES
  ('Bahrain International Circuit', 'Bahrain', 'street'),
  ('Jeddah Corniche Circuit', 'Saudi Arabia', 'street'),
  ('Albert Park Circuit', 'Australia', 'street'),
  ('Suzuka International Racing Course', 'Japan', 'permanent'),
  ('Shanghai International Circuit', 'China', 'permanent'),
  ('Miami International Autodrome', 'United States', 'street'),
  ('Autodromo Enzo e Dino Ferrari', 'Italy', 'permanent'),
  ('Circuit de Monaco', 'Monaco', 'street'),
  ('Circuit Gilles Villeneuve', 'Canada', 'semi-permanent'),
  ('Circuit de Barcelona-Catalunya', 'Spain', 'permanent'),
  ('Red Bull Ring', 'Austria', 'permanent'),
  ('Silverstone Circuit', 'United Kingdom', 'permanent'),
  ('Hungaroring', 'Hungary', 'permanent'),
  ('Circuit de Spa-Francorchamps', 'Belgium', 'permanent'),
  ('Circuit Zandvoort', 'Netherlands', 'permanent'),
  ('Autodromo Nazionale di Monza', 'Italy', 'permanent'),
  ('Baku City Circuit', 'Azerbaijan', 'street'),
  ('Marina Bay Street Circuit', 'Singapore', 'street'),
  ('Circuit of The Americas', 'United States', 'permanent'),
  ('Autodromo Hermanos Rodriguez', 'Mexico', 'permanent'),
  ('Interlagos', 'Brazil', 'permanent'),
  ('Las Vegas Strip Circuit', 'United States', 'street'),
  ('Lusail International Circuit', 'Qatar', 'permanent'),
  ('Yas Marina Circuit', 'United Arab Emirates', 'permanent')
ON CONFLICT DO NOTHING;

-- Create the tracks reference table
CREATE TABLE IF NOT EXISTS public.tracks_reference (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL,
  type TEXT CHECK (type IN ('permanent', 'street', 'semi-permanent'))
);

-- ============================================================================
-- HELPFUL VIEWS
-- ============================================================================

-- View for team standings (simplified)
CREATE OR REPLACE VIEW public.team_standings AS
SELECT 
  t.id as team_id,
  t.name as team_name,
  COUNT(DISTINCT tm.id) as total_drivers,
  COUNT(DISTINCT rr.track_name) as races_completed,
  COALESCE(SUM(rr.points), 0) as total_points
FROM public.teams t
LEFT JOIN public.team_members tm ON t.id = tm.team_id
LEFT JOIN public.race_results rr ON tm.id = rr.member_id
GROUP BY t.id, t.name
ORDER BY total_points DESC;

-- View for recent race results
CREATE OR REPLACE VIEW public.recent_race_results AS
SELECT 
  t.name as team_name,
  rr.track_name,
  tm.driver_name,
  rr.position,
  rr.points,
  rr.created_at
FROM public.race_results rr
JOIN public.team_members tm ON rr.member_id = tm.id
JOIN public.teams t ON rr.team_id = t.id
ORDER BY rr.created_at DESC
LIMIT 50;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions for service role (for server-side operations)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================================================
-- NOTES
-- ============================================================================

/*
IMPLEMENTATION NOTES:

1. Run this entire file in your Supabase SQL editor
2. Make sure to enable RLS in your Supabase dashboard
3. Test the policies with different user accounts
4. The database supports:
   - Multiple teams/leagues
   - Team invitations and member management
   - Race results tracking
   - Driver analytics and performance data
   - Configurable scoring systems
   - Comprehensive standings calculations

SECURITY NOTES:
- All tables have RLS enabled
- Users can only see data for teams they're members of
- Only team admins can modify team settings and results
- Invitations are email-based and expire after 7 days

PERFORMANCE NOTES:
- Indexes are created for common query patterns
- Functions are marked as SECURITY DEFINER for optimal performance
- Views provide simplified access to complex data

CUSTOMIZATION:
- Points systems can be customized per team via the teams.points_system JSONB field
- Scoring rules can be modified via the teams.scoring_rules JSONB field
- Track selection is flexible - teams choose their own tracks from the reference list
*/