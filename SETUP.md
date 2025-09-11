# F1 League Manager Setup Guide

Your F1 League Manager app is ready to run! Here's how to get it working:

## 🚀 Quick Start

1. **Database Setup** (Required)
   - Open your Supabase project dashboard
   - Go to the SQL Editor
   - Copy and paste the entire content of `complete-database-setup.sql`
   - Run the SQL to create all necessary tables and data

2. **Environment Variables** (Already configured)
   - Your `.env` file is already set up with your Supabase credentials
   - No changes needed unless you want to use a different Supabase project

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

## 🏁 What's Included

- **Authentication**: Sign up/sign in with Supabase Auth
- **League Management**: Create F1 leagues with custom settings
- **Team Invites**: Invite friends to join your leagues
- **Track Selection**: Choose from all 2025 F1 tracks
- **Modern UI**: Beautiful, responsive design with F1 theming

## 🔧 Database Schema

The app uses these main tables:
- `teams` - League information
- `team_members` - Users in each league
- `team_invites` - Pending invitations
- `tracks` - F1 circuit data (pre-populated with 2025 tracks)
- `race_results` - Race outcome tracking
- `team_tracks` - Selected tracks per league

## 🛠️ Troubleshooting

**White screen on load?**
- Make sure you've run the SQL setup in Supabase
- Check browser console for errors
- Verify your Supabase URL and keys in `.env`

**Can't create leagues?**
- Ensure all database tables are created
- Check RLS policies are applied correctly
- Verify you're signed in

## 📝 Next Steps

Once the database is set up, you can:
1. Sign up for an account
2. Create your first F1 league
3. Invite friends to join
4. Start tracking race results!

---

Need help? Check the browser console for detailed error messages.