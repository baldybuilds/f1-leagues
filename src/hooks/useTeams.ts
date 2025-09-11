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
      
      // Get all teams with their associated data
      const { data: allTeams, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          race_results(points),
          team_tracks(track_id)
        `)
        .order('created_at', { ascending: false })

      if (teamsError) throw teamsError

      // Get user's team memberships
      const { data: memberships, error: membershipsError } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', user.id)

      if (membershipsError) throw membershipsError

      // Create a map of team memberships
      const membershipMap = new Map(
        memberships?.map(m => [m.team_id, m.role]) || []
      )

      // Process teams to calculate total points, track count, and user role
      const processedTeams = (allTeams || [])
        .map(team => {
          const userRole = team.created_by === user.id 
            ? 'owner' 
            : membershipMap.get(team.id) || null

          return {
            ...team,
            points: team.race_results?.reduce((sum: number, result: any) => sum + (result.points || 0), 0) || 0,
            track_count: team.team_tracks?.length || 0,
            user_role: userRole as 'owner' | 'admin' | 'member' | null
          }
        })
        // Only show teams where user is owner or member
        .filter(team => team.user_role !== null)

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