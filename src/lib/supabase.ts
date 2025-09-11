import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Validate Supabase configuration
if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-anon-key') {
  console.warn('⚠️  Supabase is not configured. Please update your .env file with your Supabase project credentials.')
  console.warn('📖 See SUPABASE_SETUP.md for setup instructions.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          name: string
          game: string
          start_date: string
          end_date: string
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          game: string
          start_date: string
          end_date: string
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          game?: string
          start_date?: string
          end_date?: string
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      tracks: {
        Row: {
          id: string
          name: string
          country: string
          location: string
          season: number
          round_number: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          country: string
          location: string
          season?: number
          round_number: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          country?: string
          location?: string
          season?: number
          round_number?: number
          created_at?: string
        }
      }
      team_tracks: {
        Row: {
          id: string
          team_id: string
          track_id: string
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          track_id: string
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          track_id?: string
          created_at?: string
        }
      }
      race_results: {
        Row: {
          id: string
          team_id: string
          track_id: string
          driver_name: string
          position: number | null
          points: number
          fastest_lap: boolean
          dnf: boolean
          race_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          track_id: string
          driver_name: string
          position?: number | null
          points?: number
          fastest_lap?: boolean
          dnf?: boolean
          race_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          track_id?: string
          driver_name?: string
          position?: number | null
          points?: number
          fastest_lap?: boolean
          dnf?: boolean
          race_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}