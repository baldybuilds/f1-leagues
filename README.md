# QualiPal - F1 League Manager

A modern, clean F1 league management application built with React, TypeScript, and Supabase.

## 🏁 Features

- **League Creation**: Create F1 leagues with track selection from the 2025 calendar
- **Game Support**: Choose between F1 24 and F1 25
- **Team Invitations**: Email-based invitation system for league members
- **Track Selection**: Full 2025 F1 track lineup with detailed information
- **Role Management**: Owner and member roles with appropriate permissions
- **Real-time Updates**: Live updates using Supabase subscriptions

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Icons**: Phosphor Icons

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- A Supabase project

### Setup

1. **Clone and install dependencies**
   ```bash
   git clone <your-repo>
   cd qualipal
   npm install
   ```

2. **Configure environment variables**
   Create a `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Set up the database**
   Run the SQL in `database-setup.sql` in your Supabase SQL editor. This will:
   - Create all necessary tables
   - Set up Row Level Security policies
   - Insert 2025 F1 track data
   - Configure triggers and functions

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📊 Database Schema

### Core Tables

- **teams**: League information and configuration
- **team_members**: User membership in leagues
- **team_invites**: Email-based invitation system
- **team_tracks**: Many-to-many relationship for track selection
- **tracks**: F1 circuit information
- **race_results**: Future: race performance data
- **league_settings**: Future: custom scoring and rules

### Key Features

- UUID primary keys for security
- Row Level Security for data isolation
- Enum types for constrained values
- Automated triggers for data consistency
- Real-time subscriptions support

## 🎨 Design System

### Colors
- **Primary**: Deep magenta/purple (`oklch(0.68 0.14 340)`)
- **Secondary**: Gold/yellow (`oklch(0.88 0.10 60)`)
- **Accent**: Teal/cyan (`oklch(0.75 0.12 180)`)

### Typography
- **Headings**: Quicksand (clean, modern)
- **Body**: Quicksand (consistency)
- **Code**: JetBrains Mono (data display)

## 🏗️ Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── team/           # League management components
│   └── ui/             # shadcn/ui components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
└── types/              # TypeScript type definitions
```

## 🔐 Authentication & Security

- Supabase Auth for user management
- Row Level Security policies
- Email-based invitations
- Role-based access control
- Secure data isolation between leagues

## 🎯 Current Status

✅ **Complete**
- Authentication system
- League creation and management
- Track selection from 2025 calendar
- Invitation system
- Clean, responsive UI
- Database schema and security

🔄 **Ready for Extension**
- Race result tracking
- Driver standings
- Performance analytics
- Custom scoring systems
- Calendar integration

## 🚀 Future Roadmap

1. **Race Results**: Add race performance tracking
2. **Driver Standings**: League leaderboards and statistics
3. **Analytics**: Performance insights and trends
4. **Scoring Systems**: Custom points and rules configuration
5. **Calendar**: Race scheduling and planning
6. **Mobile App**: React Native companion app

## 🤝 Contributing

This is a clean, well-structured codebase ready for feature expansion. The database schema and component architecture support easy addition of new functionality.

## 📝 License

MIT License - see LICENSE file for details.