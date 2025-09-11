# QualiPal F1 League Manager - Setup Guide

## Quick Start

1. **Set up your Supabase project:**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Copy your project URL and anon key

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Set up the database:**
   - In your Supabase dashboard, go to the SQL Editor
   - Copy and paste the entire contents of `database-setup.sql`
   - Run the SQL script

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Database Schema

The application uses the following main tables:

- **profiles**: User profiles that extend Supabase auth.users
- **teams**: F1 leagues created by users
- **tracks**: Available F1 tracks for 2025 season
- **team_tracks**: Junction table linking teams to selected tracks
- **team_members**: Members of each team/league
- **team_invites**: Pending invitations to join teams
- **race_results**: Race results for each track/member combination

## Features

- **User Authentication**: Sign up and sign in with email/password
- **League Management**: Create and manage F1 leagues
- **Track Selection**: Choose from 2025 F1 season tracks
- **Team Invitations**: Invite other users to join your leagues
- **Race Results**: Track race results and standings
- **Responsive Design**: Modern UI that works on all devices

## Troubleshooting

### White Screen Issues
- Ensure your `.env` file has the correct Supabase credentials
- Check that the database setup SQL has been run successfully
- Verify that RLS policies are enabled and configured correctly

### Authentication Issues
- Make sure the `profiles` table and trigger are set up correctly
- Check that the `handle_new_user()` function is working
- Verify email confirmation settings in Supabase auth settings

### Database Connection Issues
- Confirm your Supabase project is active
- Check that your API keys haven't expired
- Ensure RLS is enabled on all tables

## Development

The app is built with:
- **React 19** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Shadcn/ui** for components
- **Supabase** for backend and auth
- **Phosphor Icons** for icons

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your Supabase setup
3. Ensure all database tables and policies are created
4. Check that your environment variables are correct