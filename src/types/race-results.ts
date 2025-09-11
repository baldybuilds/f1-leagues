export interface RaceResult {
  id: string
  team_id: string
  track_id: string
  race_date: string
  position: number
  points: number
  fastest_lap: boolean
  dnf: boolean
  dnf_reason?: string
  created_at: string
  updated_at: string
}

export interface RaceResultInput {
  position: number
  fastest_lap: boolean
  dnf: boolean
  dnf_reason?: string
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

export function calculatePoints(position: number, fastestLap: boolean, dnf: boolean): number {
  if (dnf) return 0
  
  const basePoints = F1_POINTS[position as keyof typeof F1_POINTS] || 0
  const fastestLapBonus = fastestLap && position <= 10 ? FASTEST_LAP_POINTS : 0
  
  return basePoints + fastestLapBonus
}