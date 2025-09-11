import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Team {
  id: string
  name: string
  color: string
  points: number
  user_id: string
  created_at: string
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

  useEffect(() => {
    fetchTeams()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('teams_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'teams' },
        () => {
          fetchTeams()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { teams, loading, error, refetch: fetchTeams }
}