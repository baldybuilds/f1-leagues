import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { RaceResult } from '@/types/race-results'

interface UseRaceResultsProps {
  teamId?: string
  trackId?: string
}

export function useRaceResults({ teamId, trackId }: UseRaceResultsProps = {}) {
  const [raceResults, setRaceResults] = useState<RaceResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRaceResults = async () => {
    try {
      setLoading(true)
      let query = supabase.from('race_results').select('*')
      
      if (teamId) {
        query = query.eq('team_id', teamId)
      }
      
      if (trackId) {
        query = query.eq('track_id', trackId)
      }
      
      const { data, error } = await query.order('race_date', { ascending: true })

      if (error) throw error
      setRaceResults(data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addRaceResult = async (result: Omit<RaceResult, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('race_results')
        .insert(result)
        .select()
        .single()

      if (error) throw error
      
      setRaceResults(prev => [...prev, data])
      return data
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const updateRaceResult = async (id: string, updates: Partial<RaceResult>) => {
    try {
      const { data, error } = await supabase
        .from('race_results')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      setRaceResults(prev => prev.map(result => 
        result.id === id ? data : result
      ))
      return data
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const deleteRaceResult = async (id: string) => {
    try {
      const { error } = await supabase
        .from('race_results')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setRaceResults(prev => prev.filter(result => result.id !== id))
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  useEffect(() => {
    fetchRaceResults()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('race_results_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'race_results' },
        () => {
          fetchRaceResults()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [teamId, trackId])

  return { 
    raceResults, 
    loading, 
    error, 
    refetch: fetchRaceResults,
    addRaceResult,
    updateRaceResult,
    deleteRaceResult
  }
}