import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRaceResults } from '@/hooks/useRaceResults'
import { F1_2025_TRACKS } from '@/data/f1-tracks'
import { formatDistance } from 'date-fns'
import { Trophy, Flag, Plus, Calendar, MapPin, Timer } from '@phosphor-icons/react'
import type { RaceResult } from '@/types/race-results'

interface RaceResultsProps {
  teamId: string
  onAddResult?: () => void
}

export function RaceResults({ teamId, onAddResult }: RaceResultsProps) {
  const { raceResults, loading } = useRaceResults({ teamId })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy size={20} />
            Race Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const sortedResults = [...raceResults].sort((a, b) => 
    new Date(b.race_date).getTime() - new Date(a.race_date).getTime()
  )

  const totalPoints = raceResults.reduce((sum, result) => sum + result.points, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy size={20} />
            Race Results
            {raceResults.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {totalPoints} pts
              </Badge>
            )}
          </CardTitle>
          {onAddResult && (
            <Button size="sm" onClick={onAddResult}>
              <Plus size={16} className="mr-2" />
              Add Result
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {raceResults.length === 0 ? (
          <div className="text-center py-8">
            <Trophy size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No race results yet</h3>
            <p className="text-muted-foreground mb-4">
              {onAddResult 
                ? "Start adding your race results to track your progress"
                : "No race results have been added to this team yet"
              }
            </p>
            {onAddResult && (
              <Button onClick={onAddResult}>
                <Plus size={16} className="mr-2" />
                Add First Result
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedResults.map((result) => (
              <RaceResultCard key={result.id} result={result} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface RaceResultCardProps {
  result: RaceResult
}

function RaceResultCard({ result }: RaceResultCardProps) {
  const track = F1_2025_TRACKS.find(t => t.id === result.track_id)
  
  if (!track) return null

  const getPositionColor = (position: number, dnf: boolean) => {
    if (dnf) return 'bg-destructive text-destructive-foreground'
    if (position === 1) return 'bg-yellow-500 text-yellow-50'
    if (position === 2) return 'bg-gray-400 text-gray-50'
    if (position === 3) return 'bg-amber-600 text-amber-50'
    if (position <= 10) return 'bg-accent text-accent-foreground'
    return 'bg-muted text-muted-foreground'
  }

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${getPositionColor(result.position, result.dnf)}`}>
            {result.dnf ? 'DNF' : `P${result.position}`}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{track.flag}</span>
              <h4 className="font-semibold">{track.name}</h4>
              {result.fastest_lap && (
                <Badge variant="outline" className="text-xs">
                  <Timer size={12} className="mr-1" />
                  Fastest Lap
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(result.race_date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                {track.country}
              </div>
              {result.dnf && result.dnf_reason && (
                <div className="text-destructive">
                  {result.dnf_reason}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-accent">
            {result.points} pts
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDistance(new Date(result.created_at), new Date(), { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  )
}