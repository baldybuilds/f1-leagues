import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Validate Supabase configuration
if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-anon-key') {
  console.warn('⚠️  Supabase is not configured. Please update your .env file with your Supabase project credentials.')
  console.warn('📖 See database-setup.sql for setup instructions.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)