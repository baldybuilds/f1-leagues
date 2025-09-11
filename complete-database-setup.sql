-- F1 League Manager Database Setup
-- Complete database schema with proper relationships and RLS policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS public.race_results CASCADE;
DROP TABLE IF EXISTS public.team_invites CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.team_tracks CASCADE;
DROP TABLE IF EXISTS public.tracks CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;

-- Create teams table
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    game_version VARCHAR(10) NOT NULL CHECK (game_version IN ('F1 24', 'F1 25')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Create tracks table
CREATE TABLE public.tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    circuit_length DECIMAL(4,3),
    lap_record VARCHAR(20)
);

-- Create team_tracks junction table
CREATE TABLE public.team_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE NOT NULL,
    race_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, track_id),
    UNIQUE(team_id, race_order)
);

-- Create team_members table
CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    driver_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Create team_invites table
CREATE TABLE public.team_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    invitee_email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    UNIQUE(team_id, invitee_email)
);

-- Create race_results table
CREATE TABLE public.race_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    finishing_position INTEGER NOT NULL CHECK (finishing_position >= 1),
    points INTEGER NOT NULL DEFAULT 0,
    fastest_lap BOOLEAN DEFAULT FALSE,
    dnf BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, track_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_teams_created_by ON public.teams(created_by);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_invites_invitee_email ON public.team_invites(invitee_email);
CREATE INDEX idx_team_invites_team_id ON public.team_invites(team_id);
CREATE INDEX idx_race_results_team_id ON public.race_results(team_id);
CREATE INDEX idx_race_results_user_id ON public.race_results(user_id);

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_tracks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams table
CREATE POLICY "Users can view teams they created or are members of" ON public.teams
    FOR SELECT USING (
        auth.uid() = created_by OR 
        auth.uid() IN (
            SELECT user_id FROM public.team_members WHERE team_id = teams.id
        )
    );

CREATE POLICY "Users can insert their own teams" ON public.teams
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team creators can update their teams" ON public.teams
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Team creators can delete their teams" ON public.teams
    FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for team_members table
CREATE POLICY "Users can view team members for teams they have access to" ON public.team_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE teams.id = team_members.team_id 
            AND (teams.created_by = auth.uid() OR auth.uid() IN (
                SELECT user_id FROM public.team_members tm WHERE tm.team_id = teams.id
            ))
        )
    );

CREATE POLICY "Team creators can manage team members" ON public.team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE teams.id = team_members.team_id 
            AND teams.created_by = auth.uid()
        )
    );

-- RLS Policies for team_invites table
CREATE POLICY "Users can view invites sent to them or sent by them" ON public.team_invites
    FOR SELECT USING (
        invitee_email = auth.email() OR 
        inviter_id = auth.uid()
    );

CREATE POLICY "Team creators can send invites" ON public.team_invites
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE teams.id = team_invites.team_id 
            AND teams.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update invites sent to them" ON public.team_invites
    FOR UPDATE USING (invitee_email = auth.email());

-- RLS Policies for tracks table (public read access)
CREATE POLICY "Everyone can view tracks" ON public.tracks
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can manage tracks" ON public.tracks
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for team_tracks table
CREATE POLICY "Users can view team tracks for accessible teams" ON public.team_tracks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE teams.id = team_tracks.team_id 
            AND (teams.created_by = auth.uid() OR auth.uid() IN (
                SELECT user_id FROM public.team_members WHERE team_id = teams.id
            ))
        )
    );

CREATE POLICY "Team creators can manage team tracks" ON public.team_tracks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE teams.id = team_tracks.team_id 
            AND teams.created_by = auth.uid()
        )
    );

-- RLS Policies for race_results table
CREATE POLICY "Users can view race results for accessible teams" ON public.race_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE teams.id = race_results.team_id 
            AND (teams.created_by = auth.uid() OR auth.uid() IN (
                SELECT user_id FROM public.team_members WHERE team_id = teams.id
            ))
        )
    );

CREATE POLICY "Team creators can manage race results" ON public.race_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE teams.id = race_results.team_id 
            AND teams.created_by = auth.uid()
        )
    );

-- Insert 2025 F1 tracks data
INSERT INTO public.tracks (name, country, location, year, circuit_length, lap_record) VALUES
('Bahrain International Circuit', 'Bahrain', 'Sakhir', 2025, 5.412, '1:31.447'),
('Jeddah Corniche Circuit', 'Saudi Arabia', 'Jeddah', 2025, 6.174, '1:30.734'),
('Albert Park Circuit', 'Australia', 'Melbourne', 2025, 5.278, '1:20.260'),
('Suzuka International Racing Course', 'Japan', 'Suzuka', 2025, 5.807, '1:30.983'),
('Shanghai International Circuit', 'China', 'Shanghai', 2025, 5.451, '1:32.238'),
('Circuit de Monaco', 'Monaco', 'Monte Carlo', 2025, 3.337, '1:12.909'),
('Circuit Gilles Villeneuve', 'Canada', 'Montreal', 2025, 4.361, '1:13.078'),
('Circuit de Barcelona-Catalunya', 'Spain', 'Barcelona', 2025, 4.675, '1:18.149'),
('Red Bull Ring', 'Austria', 'Spielberg', 2025, 4.318, '1:05.619'),
('Silverstone Circuit', 'United Kingdom', 'Silverstone', 2025, 5.891, '1:27.097'),
('Hungaroring', 'Hungary', 'Budapest', 2025, 4.381, '1:16.627'),
('Circuit de Spa-Francorchamps', 'Belgium', 'Spa', 2025, 7.004, '1:46.286'),
('Circuit Zandvoort', 'Netherlands', 'Zandvoort', 2025, 4.259, '1:11.097'),
('Autodromo Nazionale Monza', 'Italy', 'Monza', 2025, 5.793, '1:21.046'),
('Baku City Circuit', 'Azerbaijan', 'Baku', 2025, 6.003, '1:43.009'),
('Marina Bay Street Circuit', 'Singapore', 'Singapore', 2025, 5.063, '1:41.905'),
('Circuit of the Americas', 'United States', 'Austin', 2025, 5.513, '1:36.169'),
('Autodromo Hermanos Rodriguez', 'Mexico', 'Mexico City', 2025, 4.304, '1:17.774'),
('Autodromo Jose Carlos Pace', 'Brazil', 'Sao Paulo', 2025, 4.309, '1:10.540'),
('Las Vegas Strip Circuit', 'United States', 'Las Vegas', 2025, 6.201, '1:35.490'),
('Losail International Circuit', 'Qatar', 'Lusail', 2025, 5.380, '1:24.319'),
('Yas Marina Circuit', 'United Arab Emirates', 'Abu Dhabi', 2025, 5.281, '1:26.103');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_race_results_updated_at BEFORE UPDATE ON public.race_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;