import { useDatabaseStatus } from '@/hooks/useDatabaseStatus'
import { Database, ExternalLink } from '@phosphor-icons/react'

export function DatabaseStatusBanner() {
  const { isConnected, tablesExist } = useDatabaseStatus()

  // Don't show banner if everything is working
  if (isConnected && tablesExist) {
    return null
  }

  // Don't show banner while still checking
  if (isConnected === null) {
    return null
  }

  return (
    <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-sm">
          <Database className="h-4 w-4 text-destructive" />
          <span className="text-destructive">
            Database setup required. Please run the SQL setup in Supabase to use all features.
          </span>
        </div>
        <a 
          href="/SETUP.md" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm font-medium text-destructive hover:underline"
        >
          Setup Guide
          <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </div>
    </div>
  )
}