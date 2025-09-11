import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRaceResults } from '@/hooks/useRaceResults'
import { supabase } from '@/lib/supabase'
import { CalendarBlank, Flag, Trophy, Plus } from '@phosphor-icons/react'
import type { RaceResult } from '@/types/race-results'

interface RaceCalendarProps {
  teamId: string
  onAddResult?: (trackId: string) => void
}

export function RaceCalendar({ teamId, onAddResult }: RaceCalendarProps) {
  const { raceResults, loading } = useRaceResults({ teamId })
  const [teamTracks, setTeamTracks] = useState<any[]>([])

  // Fetch team tracks from database
  useEffect(() => {
    const fetchTeamTracks = async () => {
      const { data, error } = await supabase
        .from('team_tracks')
        .select(`
          track_id,
          tracks (*)
        `)
        .eq('team_id', teamId)

      if (error) {
        console.error('Error fetching team tracks:', error)
        return
      }

      setTeamTracks(data?.map(tt => tt.tracks) || [])
    }

    fetchTeamTracks()
  }, [teamId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarBlank size={20} />
            Race Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse h-12 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const tracks = teamTracks || []
  
  // Create a map of track results for quick lookup
  const trackResults = new Map<string, RaceResult>()
  raceResults.forEach(result => {
    trackResults.set(result.track_id, result)
  })

  const completedRaces = tracks.filter(track => trackResults.has(track.id))
  const upcomingRaces = tracks.filter(track => !trackResults.has(track.id))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarBlank size={20} />
          Race Calendar
          <Badge variant="outline" className="ml-2">
            {completedRaces.length}/{tracks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Upcoming Races */}
        {upcomingRaces.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
              Upcoming Races ({upcomingRaces.length})
            </h4>
            <div className="space-y-2">
              {upcomingRaces.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{track.flag}</span>
                    <div>
                      <p className="font-medium text-sm">{track.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {track.country} • {track.length}km • {track.laps} laps
                      </p>
                    </div>
                  </div>
                  {onAddResult && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAddResult(track.id)}
                    >
                      <Plus size={14} className="mr-1" />
                      Add Result
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Races */}
        {completedRaces.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
              Completed Races ({completedRaces.length})
            </h4>
            <div className="space-y-2">
              {completedRaces.map((track) => {
                const result = trackResults.get(track.id)!
                const getPositionColor = (position: number, dnf: boolean) => {
                  if (dnf) return 'bg-destructive text-destructive-foreground'
                  if (position === 1) return 'bg-yellow-500 text-yellow-50'
                  if (position === 2) return 'bg-gray-400 text-gray-50'
                  if (position === 3) return 'bg-amber-600 text-amber-50'
                  if (position <= 10) return 'bg-accent text-accent-foreground'
                  return 'bg-muted text-muted-foreground'
                }

                return (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{track.flag}</span>
                      <div>
                        <p className="font-medium text-sm">{track.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(result.race_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {result.fastest_lap && (
                        <Badge variant="outline" className="text-xs">
                          <Flag size={10} className="mr-1" />
                          FL
                        </Badge>
                      )}
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getPositionColor(result.position, result.dnf)}`}>
                          {result.dnf ? 'DNF' : `P${result.position}`}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-accent">
                            {result.points} pts
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tracks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarBlank size={48} className="mx-auto mb-4 opacity-50" />
            <p>No tracks selected for this league</p>
            <p className="text-sm">Edit your team to select tracks</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}