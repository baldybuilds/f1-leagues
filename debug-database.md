# Database Debug Information

## Current Issues
1. Tracks are not showing up in Create Team Modal
2. Circular reference errors in RLS policies have been fixed

## Quick Database Checks

To verify the current state of the database, run these queries in Supabase SQL editor:

```sql
-- Check if tracks table exists and has data
SELECT COUNT(*) as track_count FROM public.tracks;
SELECT * FROM public.tracks LIMIT 5;

-- Check if teams table is accessible
SELECT COUNT(*) as team_count FROM public.teams;

-- Check team_members table
SELECT COUNT(*) as member_count FROM public.team_members;

-- Test the new function
SELECT * FROM public.get_user_teams();
```

## Solution Applied
- Removed circular RLS policies between teams and team_members tables
- Created app-level functions to handle member access
- Updated useTeams hook to use the new get_user_teams() function

## Next Steps
1. Apply the complete database.sql file to Supabase
2. Verify tracks data is properly inserted
3. Test team creation functionality