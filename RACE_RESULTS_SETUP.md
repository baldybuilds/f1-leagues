# Database Setup for Race Results

## Required Database Changes

To support race results tracking, you need to update your Supabase database with the following changes:

### 1. Update the `teams` table

Add these columns to your existing `teams` table:

```sql
-- Add new columns to teams table
ALTER TABLE teams 
ADD COLUMN game VARCHAR(50),
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE,
ADD COLUMN selected_tracks TEXT[];
```

### 2. Create the `race_results` table

```sql
-- Create race_results table
CREATE TABLE race_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    track_id VARCHAR(50) NOT NULL,
    race_date DATE NOT NULL,
    position INTEGER NOT NULL CHECK (position >= 1 AND position <= 30),
    points INTEGER NOT NULL DEFAULT 0,
    fastest_lap BOOLEAN DEFAULT FALSE,
    dnf BOOLEAN DEFAULT FALSE,
    dnf_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Add indexes for better performance

```sql
-- Add indexes for race_results
CREATE INDEX idx_race_results_team_id ON race_results(team_id);
CREATE INDEX idx_race_results_track_id ON race_results(track_id);
CREATE INDEX idx_race_results_race_date ON race_results(race_date);
```

### 4. Set up Row Level Security (RLS)

```sql
-- Enable RLS on race_results
ALTER TABLE race_results ENABLE ROW LEVEL SECURITY;

-- Policy for reading race results (all authenticated users can read)
CREATE POLICY "race_results_read_policy" ON race_results
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for inserting race results (only team owners can insert)
CREATE POLICY "race_results_insert_policy" ON race_results
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM teams 
            WHERE teams.id = race_results.team_id 
            AND teams.user_id = auth.uid()
        )
    );

-- Policy for updating race results (only team owners can update)
CREATE POLICY "race_results_update_policy" ON race_results
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM teams 
            WHERE teams.id = race_results.team_id 
            AND teams.user_id = auth.uid()
        )
    );

-- Policy for deleting race results (only team owners can delete)
CREATE POLICY "race_results_delete_policy" ON race_results
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM teams 
            WHERE teams.id = race_results.team_id 
            AND teams.user_id = auth.uid()
        )
    );
```

### 5. Create a trigger to update team points automatically

```sql
-- Function to recalculate team points
CREATE OR REPLACE FUNCTION recalculate_team_points()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE teams 
    SET points = (
        SELECT COALESCE(SUM(race_results.points), 0) 
        FROM race_results 
        WHERE race_results.team_id = COALESCE(NEW.team_id, OLD.team_id)
    )
    WHERE id = COALESCE(NEW.team_id, OLD.team_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for race results changes
CREATE TRIGGER trigger_recalculate_team_points
    AFTER INSERT OR UPDATE OR DELETE ON race_results
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_team_points();
```

## Running the Migration

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Run each of the above SQL blocks in order
4. Verify that the tables and policies were created successfully

## Features Added

With these database changes, the F1 League Manager now supports:

- **Race Result Tracking**: Add, edit, and delete race results for each team
- **Automatic Points Calculation**: F1 points system with fastest lap bonuses
- **DNF Support**: Track retirements with reasons
- **Real-time Updates**: Live point calculations and standings updates
- **Track-specific Results**: Results tied to selected tracks for each team
- **Historical Data**: View past race results with dates and details

## F1 Points System

The system uses the standard F1 points allocation:
- P1: 25 points
- P2: 18 points  
- P3: 15 points
- P4: 12 points
- P5: 10 points
- P6: 8 points
- P7: 6 points
- P8: 4 points
- P9: 2 points
- P10: 1 point
- Fastest Lap: +1 point (if finishing in top 10)
- DNF: 0 points