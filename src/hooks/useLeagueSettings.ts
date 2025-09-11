import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { LeagueSettings, ScoringSystem, LeagueRules, DEFAULT_LEAGUE_RULES, SCORING_SYSTEMS } from '@/types/league-settings'

export function useLeagueSettings(teamId: string) {
  const { user } = useAuth()
  const [settings, setSettings] = useState<LeagueSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    if (!teamId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      const { data, error: fetchError } = await supabase
        .from('league_settings')
        .select('*')
        .eq('team_id', teamId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw fetchError
      }

      if (data) {
        setSettings(data)
      } else {
        // Create default settings if none exist
        const defaultSettings = {
          team_id: teamId,
          scoring_system: SCORING_SYSTEMS.f1_2024,
          rules: DEFAULT_LEAGUE_RULES
        }

        const { data: newSettings, error: createError } = await supabase
          .from('league_settings')
          .insert([defaultSettings])
          .select()
          .single()

        if (createError) throw createError
        setSettings(newSettings)
      }
      
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching league settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (updates: Partial<Pick<LeagueSettings, 'scoring_system' | 'rules'>>) => {
    if (!settings || !user?.id) return

    try {
      const { data, error: updateError } = await supabase
        .from('league_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single()

      if (updateError) throw updateError
      
      setSettings(data)
      return data
    } catch (err: any) {
      setError(err.message)
      console.error('Error updating league settings:', err)
      throw err
    }
  }

  const updateScoringSystem = async (scoringSystem: ScoringSystem) => {
    return updateSettings({ scoring_system: scoringSystem })
  }

  const updateRules = async (rules: LeagueRules) => {
    return updateSettings({ rules })
  }

  useEffect(() => {
    if (teamId) {
      fetchSettings()

      // Subscribe to settings changes
      const subscription = supabase
        .channel('league_settings_changes')
        .on('postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'league_settings',
            filter: `team_id=eq.${teamId}`
          },
          () => {
            fetchSettings()
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [teamId])

  return { 
    settings, 
    loading, 
    error, 
    refetch: fetchSettings,
    updateScoringSystem,
    updateRules,
    updateSettings
  }
}