import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { DriverStanding, DriverPerformance } from '@/types/race-results'

export function useDriverStandings(teamId?: string) {
  const [standings, setStandings] = useState<DriverStanding[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStandings = async () => {
    setLoading(true)
    setError(null)
    
    try {
      let query = supabase
        .from('race_results')
        .select(`
          driver_name,
          team_id,
          teams!inner(name),
          position,
          points,
          fastest_lap,
          dnf
        `)

      if (teamId) {
        query = query.eq('team_id', teamId)
      }

      const { data: results, error: queryError } = await query

      if (queryError) throw queryError

      // Group results by driver and calculate standings
      const driverMap = new Map<string, any>()

      results?.forEach((result: any) => {
        const key = `${result.driver_name}-${result.team_id}`
        if (!driverMap.has(key)) {
          driverMap.set(key, {
            driver_name: result.driver_name,
            team_id: result.team_id,
            team_name: result.teams.name,
            total_points: 0,
            races_completed: 0,
            wins: 0,
            podiums: 0,
            fastest_laps: 0,
            dnfs: 0,
            positions: []
          })
        }

        const driver = driverMap.get(key)
        driver.total_points += result.points
        driver.races_completed += 1
        
        if (result.position === 1) driver.wins += 1
        if (result.position && result.position <= 3) driver.podiums += 1
        if (result.fastest_lap) driver.fastest_laps += 1
        if (result.dnf) driver.dnfs += 1
        if (result.position) driver.positions.push(result.position)
      })

      // Calculate final standings with additional stats
      const standingsData: DriverStanding[] = Array.from(driverMap.values()).map(driver => {
        const validPositions = driver.positions.filter((p: number) => p > 0)
        return {
          ...driver,
          average_position: validPositions.length > 0 
            ? Math.round((validPositions.reduce((a: number, b: number) => a + b, 0) / validPositions.length) * 10) / 10
            : 0,
          best_position: validPositions.length > 0 ? Math.min(...validPositions) : 0,
          worst_position: validPositions.length > 0 ? Math.max(...validPositions) : 0
        }
      })

      // Sort by total points descending
      standingsData.sort((a, b) => b.total_points - a.total_points)

      setStandings(standingsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch driver standings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStandings()
  }, [teamId])

  return { standings, loading, error, refetch: fetchStandings }
}

export function useDriverPerformance(driverName: string, teamId: string) {
  const [performance, setPerformance] = useState<DriverPerformance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPerformance = async () => {
    if (!driverName || !teamId) return

    setLoading(true)
    setError(null)
    
    try {
      const { data: results, error: queryError } = await supabase
        .from('race_results')
        .select(`
          *,
          tracks!inner(name)
        `)
        .eq('driver_name', driverName)
        .eq('team_id', teamId)
        .order('race_date', { ascending: true })

      if (queryError) throw queryError

      if (!results || results.length === 0) {
        setPerformance(null)
        return
      }

      // Calculate season statistics
      const validPositions = results
        .filter(r => r.position && !r.dnf)
        .map(r => r.position)
      
      const totalPoints = results.reduce((sum, r) => sum + r.points, 0)
      const wins = results.filter(r => r.position === 1).length
      const podiums = results.filter(r => r.position && r.position <= 3).length
      const fastestLaps = results.filter(r => r.fastest_lap).length
      const dnfs = results.filter(r => r.dnf).length
      const pointScoringRaces = results.filter(r => r.points > 0).length

      // Calculate consistency rating (lower standard deviation = more consistent)
      const avgPosition = validPositions.length > 0 
        ? validPositions.reduce((a, b) => a + b, 0) / validPositions.length 
        : 0
      
      const variance = validPositions.length > 1
        ? validPositions.reduce((sum, pos) => sum + Math.pow(pos - avgPosition, 2), 0) / validPositions.length
        : 0
      
      const consistencyRating = validPositions.length > 1 
        ? Math.max(0, 100 - Math.sqrt(variance) * 5) // Convert to 0-100 scale
        : 0

      const performanceData: DriverPerformance = {
        driver_name: driverName,
        race_results: results.map(r => ({
          track_id: r.track_id,
          track_name: r.tracks.name,
          race_date: r.race_date,
          position: r.position,
          points: r.points,
          fastest_lap: r.fastest_lap,
          dnf: r.dnf
        })),
        season_stats: {
          total_points: totalPoints,
          races_completed: results.length,
          wins,
          podiums,
          fastest_laps: fastestLaps,
          dnfs,
          average_position: Math.round(avgPosition * 10) / 10,
          consistency_rating: Math.round(consistencyRating),
          point_scoring_rate: results.length > 0 
            ? Math.round((pointScoringRaces / results.length) * 100) 
            : 0
        }
      }

      setPerformance(performanceData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch driver performance')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPerformance()
  }, [driverName, teamId])

  return { performance, loading, error, refetch: fetchPerformance }
}