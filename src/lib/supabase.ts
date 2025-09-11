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
          game_version: string
          start_date: string
          end_date: string
          created_by: string
          created_at: string
          updated_at: string
          points_system: any
          fastest_lap_points: number
          pole_position_points: number
          sprint_race_enabled: boolean
          sprint_points_system: any
          dnf_penalty: number
          penalty_system: any
          minimum_races_for_championship: number
        }
        Insert: {
          id?: string
          name: string
          game_version: string
          start_date: string
          end_date: string
          created_by: string
          created_at?: string
          updated_at?: string
          points_system?: any
          fastest_lap_points?: number
          pole_position_points?: number
          sprint_race_enabled?: boolean
          sprint_points_system?: any
          dnf_penalty?: number
          penalty_system?: any
          minimum_races_for_championship?: number
        }
        Update: {
          id?: string
          name?: string
          game_version?: string
          start_date?: string
          end_date?: string
          created_by?: string
          created_at?: string
          updated_at?: string
          points_system?: any
          fastest_lap_points?: number
          pole_position_points?: number
          sprint_race_enabled?: boolean
          sprint_points_system?: any
          dnf_penalty?: number
          penalty_system?: any
          minimum_races_for_championship?: number
        }
      }
      team_invites: {
        Row: {
          id: string
          team_id: string
          inviter_id: string
          invitee_email: string
          status: 'pending' | 'accepted' | 'declined'
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          inviter_id: string
          invitee_email: string
          status?: 'pending' | 'accepted' | 'declined'
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          inviter_id?: string
          invitee_email?: string
          status?: 'pending' | 'accepted' | 'declined'
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          driver_name: string
          team_name: string | null
          car_number: number | null
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          driver_name: string
          team_name?: string | null
          car_number?: number | null
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
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
          round_number: number | null
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
          round_number?: number | null
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
          round_number?: number | null
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
          round_number: number
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          track_id: string
          round_number: number
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          track_id?: string
          round_number?: number
          created_at?: string
        }
      }
      race_sessions: {
        Row: {
          id: string
          team_id: string
          track_id: string
          session_type: 'practice' | 'qualifying' | 'sprint' | 'race'
          session_date: string | null
          weather_conditions: string | null
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          track_id: string
          session_type: 'practice' | 'qualifying' | 'sprint' | 'race'
          session_date?: string | null
          weather_conditions?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          track_id?: string
          session_type?: 'practice' | 'qualifying' | 'sprint' | 'race'
          session_date?: string | null
          weather_conditions?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      race_results: {
        Row: {
          id: string
          session_id: string
          team_member_id: string
          finishing_position: number | null
          grid_position: number | null
          fastest_lap: boolean
          pole_position: boolean
          lap_time: string | null
          points_earned: number
          dnf: boolean
          dnf_reason: string | null
          penalties: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          team_member_id: string
          finishing_position?: number | null
          grid_position?: number | null
          fastest_lap?: boolean
          pole_position?: boolean
          lap_time?: string | null
          points_earned?: number
          dnf?: boolean
          dnf_reason?: string | null
          penalties?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          team_member_id?: string
          finishing_position?: number | null
          grid_position?: number | null
          fastest_lap?: boolean
          pole_position?: boolean
          lap_time?: string | null
          points_earned?: number
          dnf?: boolean
          dnf_reason?: string | null
          penalties?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}