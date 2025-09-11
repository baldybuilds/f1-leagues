import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Team {
  id: string
  name: string
  game: 'F1_24' | 'F1_25'
  start_date: string
  end_date: string
  created_by: string
  created_at: string
  updated_at: string
  track_count?: number
  is_admin?: boolean
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
      
      // Get teams where user is a member
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          team_tracks(id),
          team_members!inner(is_admin)
        `)
        .eq('team_members.user_id', user.id)
        .order('created_at', { ascending: false })

      if (teamsError) throw teamsError

      // Process teams to add track count and admin status
      const processedTeams = (teamsData || []).map(team => ({
        id: team.id,
        name: team.name,
        game: team.game,
        start_date: team.start_date,
        end_date: team.end_date,
        created_by: team.created_by,
        created_at: team.created_at,
        updated_at: team.updated_at,
        track_count: team.team_tracks?.length || 0,
        is_admin: team.team_members?.[0]?.is_admin || false
      }))

      setTeams(processedTeams)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching teams:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchTeams()

      // Subscribe to real-time changes
      const subscription = supabase
        .channel('team_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'teams' },
          () => fetchTeams()
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'team_members' },
          () => fetchTeams()
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user?.id])

  return { teams, loading, error, refetch: fetchTeams }
}