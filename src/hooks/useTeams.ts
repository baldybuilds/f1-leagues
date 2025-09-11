import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Team {
  id: string
  name: string
  game_version: string
  season_start_date: string
  season_end_date: string
  created_by: string
  created_at: string
  updated_at: string
  // These will be calculated/joined fields
  points?: number
  track_count?: number
  user_role?: 'owner' | 'admin' | 'member' | null
}

export function useTeams() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeams = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      
      // Use the new function to get teams user has access to
      const { data: userTeams, error: userTeamsError } = await supabase
        .rpc('get_user_teams', { p_user_id: user.id })

      if (userTeamsError) throw userTeamsError

      if (!userTeams || userTeams.length === 0) {
        setTeams([])
        setError(null)
        return
      }

      // Get team details for teams user has access to
      const teamIds = userTeams.map(ut => ut.team_id)
      
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          race_results(points),
          team_tracks(track_id)
        `)
        .in('id', teamIds)
        .order('created_at', { ascending: false })

      if (teamsError) throw teamsError

      // Create a map of user roles
      const roleMap = new Map(
        userTeams.map(ut => [ut.team_id, ut.role === 'creator' ? 'owner' : ut.role])
      )

      // Process teams to calculate total points and track count
      const processedTeams = (teamsData || [])
        .map(team => ({
          ...team,
          points: team.race_results?.reduce((sum: number, result: any) => sum + (result.points || 0), 0) || 0,
          track_count: team.team_tracks?.length || 0,
          user_role: roleMap.get(team.id) as 'owner' | 'admin' | 'member'
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
    if (user?.id) {
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

      // Subscribe to team member changes
      const membersSubscription = supabase
        .channel('team_members_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'team_members' },
          () => {
            fetchTeams()
          }
        )
        .subscribe()

      return () => {
        teamsSubscription.unsubscribe()
        raceResultsSubscription.unsubscribe()
        membersSubscription.unsubscribe()
      }
    }
  }, [user?.id])

  return { teams, loading, error, refetch: fetchTeams, updateTeamPoints }
}