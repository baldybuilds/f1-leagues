-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    game VARCHAR(10) NOT NULL CHECK (game IN ('F1 24', 'F1 25')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tracks table for F1 2025 calendar
CREATE TABLE IF NOT EXISTS public.tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    season INTEGER NOT NULL DEFAULT 2025,
    round_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_tracks junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.team_tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, track_id)
);

-- Create race_results table for tracking results
CREATE TABLE IF NOT EXISTS public.race_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
    driver_name VARCHAR(255) NOT NULL,
    position INTEGER,
    points INTEGER DEFAULT 0,
    fastest_lap BOOLEAN DEFAULT FALSE,
    dnf BOOLEAN DEFAULT FALSE,
    race_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert F1 2025 tracks
INSERT INTO public.tracks (name, country, location, season, round_number) VALUES
    ('Bahrain International Circuit', 'Bahrain', 'Sakhir', 2025, 1),
    ('Jeddah Corniche Circuit', 'Saudi Arabia', 'Jeddah', 2025, 2),
    ('Albert Park Circuit', 'Australia', 'Melbourne', 2025, 3),
    ('Suzuka International Racing Course', 'Japan', 'Suzuka', 2025, 4),
    ('Shanghai International Circuit', 'China', 'Shanghai', 2025, 5),
    ('Miami International Autodrome', 'United States', 'Miami', 2025, 6),
    ('Autodromo Enzo e Dino Ferrari', 'Italy', 'Imola', 2025, 7),
    ('Circuit de Monaco', 'Monaco', 'Monaco', 2025, 8),
    ('Circuit Gilles-Villeneuve', 'Canada', 'Montreal', 2025, 9),
    ('Circuit de Barcelona-Catalunya', 'Spain', 'Barcelona', 2025, 10),
    ('Red Bull Ring', 'Austria', 'Spielberg', 2025, 11),
    ('Silverstone Circuit', 'United Kingdom', 'Silverstone', 2025, 12),
    ('Hungaroring', 'Hungary', 'Budapest', 2025, 13),
    ('Circuit de Spa-Francorchamps', 'Belgium', 'Spa', 2025, 14),
    ('Circuit Park Zandvoort', 'Netherlands', 'Zandvoort', 2025, 15),
    ('Autodromo Nazionale di Monza', 'Italy', 'Monza', 2025, 16),
    ('Baku City Circuit', 'Azerbaijan', 'Baku', 2025, 17),
    ('Marina Bay Street Circuit', 'Singapore', 'Singapore', 2025, 18),
    ('Circuit of the Americas', 'United States', 'Austin', 2025, 19),
    ('Autodromo Hermanos Rodriguez', 'Mexico', 'Mexico City', 2025, 20),
    ('Autodromo Jose Carlos Pace', 'Brazil', 'Sao Paulo', 2025, 21),
    ('Las Vegas Street Circuit', 'United States', 'Las Vegas', 2025, 22),
    ('Losail International Circuit', 'Qatar', 'Lusail', 2025, 23),
    ('Yas Marina Circuit', 'United Arab Emirates', 'Abu Dhabi', 2025, 24);

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for teams
CREATE POLICY "Users can view teams they own or are members of" ON public.teams
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can create teams" ON public.teams
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update teams they own" ON public.teams
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete teams they own" ON public.teams
    FOR DELETE USING (owner_id = auth.uid());

-- Create RLS policies for tracks (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view tracks" ON public.tracks
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create RLS policies for team_tracks
CREATE POLICY "Users can view team tracks for their teams" ON public.team_tracks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE teams.id = team_tracks.team_id 
            AND teams.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage team tracks for their teams" ON public.team_tracks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE teams.id = team_tracks.team_id 
            AND teams.owner_id = auth.uid()
        )
    );

-- Create RLS policies for race_results
CREATE POLICY "Users can view race results for their teams" ON public.race_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE teams.id = race_results.team_id 
            AND teams.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage race results for their teams" ON public.race_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE teams.id = race_results.team_id 
            AND teams.owner_id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX idx_teams_owner_id ON public.teams(owner_id);
CREATE INDEX idx_team_tracks_team_id ON public.team_tracks(team_id);
CREATE INDEX idx_team_tracks_track_id ON public.team_tracks(track_id);
CREATE INDEX idx_race_results_team_id ON public.race_results(team_id);
CREATE INDEX idx_race_results_track_id ON public.race_results(track_id);
CREATE INDEX idx_tracks_season ON public.tracks(season);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_teams_updated_at 
    BEFORE UPDATE ON public.teams 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_race_results_updated_at 
    BEFORE UPDATE ON public.race_results 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();