import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Team {
  id: string
  name: string
  game: 'F1 24' | 'F1 25'
  start_date: string
  end_date: string
  created_by: string
  created_at: string
  updated_at: string
  track_count?: number
  is_creator?: boolean
}

export function useTeams() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeams = async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // First, get teams where user is the creator
      const { data: createdTeams, error: createdError } = await supabase
        .from('teams')
        .select(`
          *,
          team_tracks(id)
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (createdError && !createdError.message.includes('relation') && !createdError.message.includes('does not exist')) {
        throw createdError
      }

      // For now, only show teams where user is creator to avoid RLS issues
      // Later we can add member teams once RLS is properly fixed
      const allTeams = createdTeams || []

      // Process teams to add track count and creator status
      const processedTeams = allTeams.map(team => ({
        id: team.id,
        name: team.name,
        game: team.game,
        start_date: team.start_date,
        end_date: team.end_date,
        created_by: team.created_by,
        created_at: team.created_at,
        updated_at: team.updated_at,
        track_count: team.team_tracks?.length || 0,
        is_creator: team.created_by === user.id
      }))

      setTeams(processedTeams)
      setError(null)
    } catch (err: any) {
      console.warn('Error fetching teams:', err.message)
      setTeams([])
      setError(null)
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
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user?.id])

  return { teams, loading, error, refetch: fetchTeams }
}