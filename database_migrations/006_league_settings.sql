-- League Settings Table
-- This table stores custom scoring systems and rules for each team/league

CREATE TABLE league_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  scoring_system JSONB NOT NULL DEFAULT '{
    "name": "F1 2024 Standard",
    "position_points": {"1": 25, "2": 18, "3": 15, "4": 12, "5": 10, "6": 8, "7": 6, "8": 4, "9": 2, "10": 1},
    "fastest_lap_points": 1,
    "fastest_lap_required_position": 10
  }',
  rules JSONB NOT NULL DEFAULT '{
    "allow_dnf_recovery": false,
    "penalty_system": {
      "time_penalties": true,
      "position_penalties": true,
      "points_deductions": false,
      "automatic_penalties": true,
      "steward_review_required": false
    },
    "race_format": {
      "qualifying_format": "standard",
      "race_distance": "full",
      "sprint_races_enabled": false,
      "practice_sessions": 2
    },
    "driver_aids": {
      "abs": "choice",
      "traction_control": "choice",
      "racing_line": "choice",
      "braking_assist": "choice",
      "drs_assist": "choice",
      "ers_assist": "choice"
    },
    "weather_settings": {
      "dynamic_weather": true,
      "weather_changes_during_race": true
    },
    "session_settings": {
      "parc_ferme": true,
      "vehicle_damage": "standard",
      "safety_car": true,
      "virtual_safety_car": true,
      "formation_lap": true
    }
  }',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add unique constraint to ensure one settings record per team
ALTER TABLE league_settings ADD CONSTRAINT unique_team_settings UNIQUE (team_id);

-- Add RLS policies
ALTER TABLE league_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view settings for teams they are members of
CREATE POLICY "Users can view league settings for their teams" ON league_settings
  FOR SELECT USING (
    team_id IN (
      SELECT teams.id FROM teams WHERE owner_id = auth.uid()
      UNION
      SELECT team_members.team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Policy: Team owners and admins can update settings
CREATE POLICY "Team owners and admins can update league settings" ON league_settings
  FOR UPDATE USING (
    team_id IN (
      SELECT teams.id FROM teams WHERE owner_id = auth.uid()
      UNION
      SELECT team_members.team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Team owners and admins can insert settings
CREATE POLICY "Team owners and admins can insert league settings" ON league_settings
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT teams.id FROM teams WHERE owner_id = auth.uid()
      UNION
      SELECT team_members.team_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Team owners can delete settings
CREATE POLICY "Team owners can delete league settings" ON league_settings
  FOR DELETE USING (
    team_id IN (
      SELECT teams.id FROM teams WHERE owner_id = auth.uid()
    )
  );

-- Add trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_league_settings_updated_at 
  BEFORE UPDATE ON league_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create default settings for existing teams
INSERT INTO league_settings (team_id)
SELECT id FROM teams
WHERE id NOT IN (SELECT team_id FROM league_settings);