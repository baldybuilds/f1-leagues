export interface LeagueSettings {
  id: string
  team_id: string
  scoring_system: ScoringSystem
  rules: LeagueRules
  created_at: string
  updated_at: string
}

export interface ScoringSystem {
  name: string
  position_points: { [position: number]: number }
  fastest_lap_points: number
  fastest_lap_required_position?: number // Must finish in top X to get fastest lap points
  pole_position_points?: number
  dnf_points?: number
  sprint_race_points?: { [position: number]: number }
  qualifying_points?: { [position: number]: number }
}

export interface LeagueRules {
  allow_dnf_recovery: boolean // Can drivers rejoin after DNF
  mandatory_pit_stops?: number
  tire_compounds_required?: string[]
  penalty_system: PenaltySystem
  race_format: RaceFormat
  driver_aids: DriverAids
  weather_settings: WeatherSettings
  session_settings: SessionSettings
}

export interface PenaltySystem {
  time_penalties: boolean
  position_penalties: boolean
  points_deductions: boolean
  automatic_penalties: boolean
  steward_review_required: boolean
}

export interface RaceFormat {
  qualifying_format: 'standard' | 'sprint_qualifying' | 'elimination'
  race_distance: 'short' | 'medium' | 'full'
  sprint_races_enabled: boolean
  practice_sessions: number
}

export interface DriverAids {
  abs: 'off' | 'on' | 'choice'
  traction_control: 'off' | 'medium' | 'full' | 'choice'
  racing_line: 'off' | 'corners_only' | 'full' | 'choice'
  braking_assist: 'off' | 'low' | 'medium' | 'high' | 'choice'
  drs_assist: 'off' | 'on' | 'choice'
  ers_assist: 'off' | 'on' | 'choice'
}

export interface WeatherSettings {
  dynamic_weather: boolean
  forced_weather?: 'clear' | 'light_rain' | 'heavy_rain' | 'random'
  weather_changes_during_race: boolean
}

export interface SessionSettings {
  parc_ferme: boolean
  vehicle_damage: 'off' | 'reduced' | 'standard' | 'simulation'
  safety_car: boolean
  virtual_safety_car: boolean
  formation_lap: boolean
}

// Predefined scoring systems
export const SCORING_SYSTEMS: { [key: string]: ScoringSystem } = {
  'f1_2024': {
    name: 'F1 2024 Standard',
    position_points: {
      1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
      6: 8, 7: 6, 8: 4, 9: 2, 10: 1
    },
    fastest_lap_points: 1,
    fastest_lap_required_position: 10
  },
  'f1_classic': {
    name: 'F1 Classic (Pre-2010)',
    position_points: {
      1: 10, 2: 8, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1
    },
    fastest_lap_points: 0
  },
  'custom_extended': {
    name: 'Extended Points',
    position_points: {
      1: 25, 2: 20, 3: 16, 4: 13, 5: 11,
      6: 10, 7: 9, 8: 8, 9: 7, 10: 6,
      11: 5, 12: 4, 13: 3, 14: 2, 15: 1
    },
    fastest_lap_points: 1,
    fastest_lap_required_position: 15,
    pole_position_points: 1
  },
  'sprint_weekend': {
    name: 'Sprint Weekend Format',
    position_points: {
      1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
      6: 8, 7: 6, 8: 4, 9: 2, 10: 1
    },
    fastest_lap_points: 1,
    fastest_lap_required_position: 10,
    sprint_race_points: {
      1: 8, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1
    }
  }
}

// Default league rules
export const DEFAULT_LEAGUE_RULES: LeagueRules = {
  allow_dnf_recovery: false,
  penalty_system: {
    time_penalties: true,
    position_penalties: true,
    points_deductions: false,
    automatic_penalties: true,
    steward_review_required: false
  },
  race_format: {
    qualifying_format: 'standard',
    race_distance: 'full',
    sprint_races_enabled: false,
    practice_sessions: 2
  },
  driver_aids: {
    abs: 'choice',
    traction_control: 'choice',
    racing_line: 'choice',
    braking_assist: 'choice',
    drs_assist: 'choice',
    ers_assist: 'choice'
  },
  weather_settings: {
    dynamic_weather: true,
    weather_changes_during_race: true
  },
  session_settings: {
    parc_ferme: true,
    vehicle_damage: 'standard',
    safety_car: true,
    virtual_safety_car: true,
    formation_lap: true
  }
}