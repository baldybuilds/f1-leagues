# Database Setup Instructions

## Prerequisites
1. Make sure you have a Supabase project set up
2. Navigate to your Supabase project's SQL Editor

## Setup Steps

### 1. Run the Database Script
Execute the complete SQL script found in `database_complete_rebuild.sql` in your Supabase SQL Editor.

**Important:** Make sure you run this script in a fresh database or be prepared that it will DROP all existing tables and recreate them.

### 2. Configure Environment Variables
Make sure your `.env` file contains:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Enable Authentication
In your Supabase project:
1. Go to Authentication → Settings
2. Enable "Allow new users to sign up"
3. Configure any authentication providers you want to use

## Database Schema Overview

The database includes the following tables:

### Core Tables
- **teams**: F1 leagues/teams with settings and metadata
- **team_members**: Users who belong to teams
- **team_invites**: Invitations to join teams
- **tracks**: F1 circuit information (pre-populated with 2025 season)
- **team_tracks**: Which tracks are selected for each team's season

### Race Management Tables
- **race_sessions**: Individual race sessions (practice, qualifying, sprint, race)
- **race_results**: Results for each session and driver

### Key Features
- Row Level Security (RLS) enabled on all tables
- Proper foreign key relationships
- Real-time subscriptions supported
- F1 2025 season tracks pre-loaded
- League settings and scoring systems

## Troubleshooting

### Common Issues
1. **"infinite recursion detected in policy"**: This was fixed by using simple, non-recursive policies
2. **"column does not exist"**: All column names have been standardized to match the application code
3. **"ON CONFLICT specification"**: Fixed by adding proper unique constraints

### Database Verification
After running the script, verify the setup by checking:
1. All tables exist with proper structure
2. Track data is populated (should have 24 F1 2025 tracks)
3. RLS policies are enabled
4. No policy conflicts exist

## Application Features Supported
- Create and manage F1 leagues
- Invite and manage team members
- Track selection for seasons
- Race result tracking (ready for future development)
- League standings and analytics (ready for future development)