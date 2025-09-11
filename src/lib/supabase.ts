import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          user_id: string
          color?: string
          points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
          color?: string
          points?: number
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