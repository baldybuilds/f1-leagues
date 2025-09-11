# Supabase Setup Guide

## Prerequisites
1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Note your project URL and anon key

## Database Schema

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create teams table
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  color VARCHAR(7) DEFAULT '#3b82f6',
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leagues table (for future expansion)
CREATE TABLE leagues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;

-- Create policies for teams table
CREATE POLICY "Users can view all teams" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own teams" ON teams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own teams" ON teams
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own teams" ON teams
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for leagues table
CREATE POLICY "Users can view all leagues" ON leagues
  FOR SELECT USING (true);

CREATE POLICY "Users can create leagues" ON leagues
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "League creators can update their leagues" ON leagues
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "League creators can delete their leagues" ON leagues
  FOR DELETE USING (auth.uid() = created_by);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON leagues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in your Supabase project URL and anon key:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Authentication

The app uses Supabase Auth with email/password authentication. Users will need to verify their email addresses after signing up.

## Features

- **Team Management**: Users can create and customize F1 teams
- **Global Leaderboard**: View all teams ranked by points
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Changes reflect immediately across the app