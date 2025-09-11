import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Team {
  id: string
  name: string
  color: string
  points: number
  user_id: string
  created_at: string
  game?: string
  start_date?: string
  end_date?: string
  selected_tracks?: string[]
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('points', { ascending: false })

      if (error) throw error
      setTeams(data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Function to recalculate team points based on race results
  const updateTeamPoints = async (teamId: string) => {
    try {
      const { data: raceResults, error: raceError } = await supabase
        .from('race_results')
        .select('points')
        .eq('team_id', teamId)

      if (raceError) throw raceError

      const totalPoints = raceResults?.reduce((sum, result) => sum + result.points, 0) || 0

      const { error: updateError } = await supabase
        .from('teams')
        .update({ points: totalPoints })
        .eq('id', teamId)

      if (updateError) throw updateError

      // Refresh teams after points update
      fetchTeams()
    } catch (err: any) {
      console.error('Error updating team points:', err.message)
    }
  }

  useEffect(() => {
    fetchTeams()

    // Subscribe to real-time changes for teams
    const teamsSubscription = supabase
      .channel('teams_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'teams' },
        () => {
          fetchTeams()
        }
      )
      .subscribe()

    // Subscribe to race results changes to update team points
    const raceResultsSubscription = supabase
      .channel('race_results_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'race_results' },
        (payload) => {
          if (payload.new && 'team_id' in payload.new) {
            updateTeamPoints(payload.new.team_id as string)
          }
          if (payload.old && 'team_id' in payload.old) {
            updateTeamPoints(payload.old.team_id as string)
          }
        }
      )
      .subscribe()

    return () => {
      teamsSubscription.unsubscribe()
      raceResultsSubscription.unsubscribe()
    }
  }, [])

  return { teams, loading, error, refetch: fetchTeams, updateTeamPoints }
}