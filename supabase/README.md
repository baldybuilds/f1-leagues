# Database Setup Instructions

## Setting Up Your Supabase Database

To fix the "could not find table: public.teams" error, you need to run the SQL migration to create the necessary database tables.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to the "SQL Editor" in the sidebar
4. Click "New Query"
5. Copy and paste the entire contents of `supabase/migrations/001_create_teams_table.sql`
6. Click "Run" to execute the SQL

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db reset
```

Or apply the migration manually:

```bash
supabase db push
```

## What This Migration Creates

### Tables:
- **teams**: Stores F1 league teams with owner information
- **tracks**: Pre-populated with all 2025 F1 tracks
- **team_tracks**: Junction table linking teams to their selected tracks
- **race_results**: Stores race results for each team/track combination

### Features:
- Row Level Security (RLS) policies for data protection
- Automatic timestamps with update triggers
- Foreign key relationships with cascade deletes
- Optimized indexes for performance

### Test the Setup

After running the migration:
1. Try creating a new team in the app
2. The "Create League" button should now work without errors
3. You should be able to select tracks and create your F1 league

## Troubleshooting

If you still get errors:
1. Make sure you're logged into the correct Supabase project
2. Check that your environment variables in `.env` are correct
3. Verify the migration ran successfully in the Supabase dashboard
4. Check the browser console for any additional error details

## Database Schema Overview

```
teams
├── id (UUID, Primary Key)
├── name (VARCHAR)
├── game (VARCHAR - 'F1 24' or 'F1 25')
├── start_date (DATE)
├── end_date (DATE)
├── owner_id (UUID, Foreign Key to auth.users)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

tracks (Pre-populated with 2025 F1 calendar)
├── id (UUID, Primary Key)
├── name (VARCHAR)
├── country (VARCHAR)
├── location (VARCHAR)
├── season (INTEGER)
├── round_number (INTEGER)
└── created_at (TIMESTAMP)

team_tracks (Junction table)
├── id (UUID, Primary Key)
├── team_id (UUID, Foreign Key to teams)
├── track_id (UUID, Foreign Key to tracks)
└── created_at (TIMESTAMP)

race_results
├── id (UUID, Primary Key)
├── team_id (UUID, Foreign Key to teams)
├── track_id (UUID, Foreign Key to tracks)
├── driver_name (VARCHAR)
├── position (INTEGER)
├── points (INTEGER)
├── fastest_lap (BOOLEAN)
├── dnf (BOOLEAN)
├── race_date (DATE)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```