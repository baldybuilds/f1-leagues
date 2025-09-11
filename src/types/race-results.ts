export interface RaceResult {
  id: string
  team_id: string
  track_id: string
  driver_name: string
  race_date: string | null
  position: number | null
  points: number
  fastest_lap: boolean
  dnf: boolean
  created_at: string
  updated_at: string
}

export interface RaceResultInput {
  driver_name: string
  position: number | null
  fastest_lap: boolean
  dnf: boolean
}

// F1 points system
export const F1_POINTS = {
  1: 25,
  2: 18,
  3: 15,
  4: 12,
  5: 10,
  6: 8,
  7: 6,
  8: 4,
  9: 2,
  10: 1
} as const

export const FASTEST_LAP_POINTS = 1

export function calculatePoints(position: number | null, fastestLap: boolean, dnf: boolean): number {
  if (dnf || position === null) return 0
  
  const basePoints = F1_POINTS[position as keyof typeof F1_POINTS] || 0
  const fastestLapBonus = fastestLap && position <= 10 ? FASTEST_LAP_POINTS : 0
  
  return basePoints + fastestLapBonus
}

export interface DriverStanding {
  driver_name: string
  team_id: string
  team_name: string
  total_points: number
  races_completed: number
  wins: number
  podiums: number
  fastest_laps: number
  dnfs: number
  average_position: number
  best_position: number
  worst_position: number
}

export interface DriverPerformance {
  driver_name: string
  race_results: Array<{
    track_id: string
    track_name: string
    race_date: string | null
    position: number | null
    points: number
    fastest_lap: boolean
    dnf: boolean
  }>
  season_stats: {
    total_points: number
    races_completed: number
    wins: number
    podiums: number
    fastest_laps: number
    dnfs: number
    average_position: number
    consistency_rating: number
    point_scoring_rate: number
  }
}