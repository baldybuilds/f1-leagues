import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Team {
  id: string
  name: string
  game: string
  start_date: string
  end_date: string
  owner_id: string
  created_at: string
  updated_at: string
  // These will be calculated/joined fields
  points?: number
  track_count?: number
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeams = async () => {
    try {
      setLoading(true)
      
      // Get teams with calculated points from race results
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          race_results(points),
          team_tracks(track_id)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Process teams to calculate total points and track count
      const processedTeams = (data || []).map(team => ({
        ...team,
        points: team.race_results?.reduce((sum: number, result: any) => sum + (result.points || 0), 0) || 0,
        track_count: team.team_tracks?.length || 0
      }))

      // Sort by points (highest first)
      processedTeams.sort((a, b) => (b.points || 0) - (a.points || 0))

      setTeams(processedTeams)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching teams:', err)
    } finally {
      setLoading(false)
    }
  }

  // Function to recalculate team points based on race results
  const updateTeamPoints = async (teamId: string) => {
    try {
      // Just refetch teams since points are calculated dynamically
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