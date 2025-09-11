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
          description: string | null
          game_version: string
          season_start_date: string
          season_end_date: string
          created_by: string
          invite_code: string
          scoring_system: any
          points_for_fastest_lap: number
          points_for_pole_position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          game_version: string
          season_start_date: string
          season_end_date: string
          created_by: string
          invite_code?: string
          scoring_system?: any
          points_for_fastest_lap?: number
          points_for_pole_position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          game_version?: string
          season_start_date?: string
          season_end_date?: string
          created_by?: string
          invite_code?: string
          scoring_system?: any
          points_for_fastest_lap?: number
          points_for_pole_position?: number
          created_at?: string
          updated_at?: string
        }
      }
      team_invites: {
        Row: {
          id: string
          team_id: string
          invited_by: string
          invitee_email: string
          invite_code: string
          status: 'pending' | 'accepted' | 'declined' | 'expired'
          expires_at: string
          created_at: string
          accepted_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          invited_by: string
          invitee_email: string
          invite_code?: string
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          expires_at?: string
          created_at?: string
          accepted_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          invited_by?: string
          invitee_email?: string
          invite_code?: string
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          expires_at?: string
          created_at?: string
          accepted_at?: string | null
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: 'admin' | 'member'
          driver_name: string
          team_name: string | null
          car_number: number | null
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role?: 'admin' | 'member'
          driver_name: string
          team_name?: string | null
          car_number?: number | null
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: 'admin' | 'member'
          driver_name?: string
          team_name?: string | null
          car_number?: number | null
          joined_at?: string
        }
      }
      tracks: {
        Row: {
          id: string
          name: string
          country: string
          location: string
          season: number
          circuit_length: number | null
          lap_record: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          country: string
          location: string
          season?: number
          circuit_length?: number | null
          lap_record?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          country?: string
          location?: string
          season?: number
          circuit_length?: number | null
          lap_record?: string | null
          created_at?: string
        }
      }
      team_tracks: {
        Row: {
          id: string
          team_id: string
          track_id: string
          race_order: number
          race_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          track_id: string
          race_order: number
          race_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          track_id?: string
          race_order?: number
          race_date?: string | null
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
      league_settings: {
        Row: {
          id: string
          team_id: string
          scoring_system: any // JSON field
          rules: any // JSON field
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          scoring_system: any
          rules: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          scoring_system?: any
          rules?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}