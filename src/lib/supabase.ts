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
          user_id: string
          color: string
          points: number
          game: string | null
          start_date: string | null
          end_date: string | null
          selected_tracks: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          user_id: string
          color?: string
          points?: number
          game?: string | null
          start_date?: string | null
          end_date?: string | null
          selected_tracks?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
          color?: string
          points?: number
          game?: string | null
          start_date?: string | null
          end_date?: string | null
          selected_tracks?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      race_results: {
        Row: {
          id: string
          team_id: string
          track_id: string
          race_date: string
          position: number
          points: number
          fastest_lap: boolean
          dnf: boolean
          dnf_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          track_id: string
          race_date: string
          position: number
          points: number
          fastest_lap?: boolean
          dnf?: boolean
          dnf_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          track_id?: string
          race_date?: string
          position?: number
          points?: number
          fastest_lap?: boolean
          dnf?: boolean
          dnf_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leagues: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}