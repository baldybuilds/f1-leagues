/// <reference types="vite/client" />
declare const GITHUB_RUNTIME_PERMANENT_NAME: string
declare const BASE_KV_SERVICE_URL: string

// Add global interfaces for the types used across the app
declare global {
  interface Team {
    id: string
    name: string
    color: string
    points: number
    user_id: string
    created_at: string
    game?: string
    start_date?: string
    end_date?: string
    selected_tracks?: string[]
  }
}