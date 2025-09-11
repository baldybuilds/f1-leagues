import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDriverStandings } from '@/hooks/useDriverStandings'
import { useRaceResults } from '@/hooks/useRaceResults'
import { 
  TrendUp, 
  TrendDown, 
  ChartLine,
  Trophy,
  Medal,
  Zap,
  Target
} from '@phosphor-icons/react'

interface PerformanceTrendsProps {
  teamId: string
  driverName?: string
  className?: string
}

export function PerformanceTrends({ teamId, driverName, className }: PerformanceTrendsProps) {
  const { raceResults, loading } = useRaceResults({ teamId })
  const { standings } = useDriverStandings(teamId)

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ChartLine size={20} />
            <span>Performance Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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

  // Filter results by driver if specified
  const filteredResults = driverName 
    ? (raceResults || []).filter(r => r.driver_name === driverName)
    : (raceResults || [])

  if (filteredResults.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ChartLine size={20} />
            <span>Performance Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No race data available for trends analysis
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort results by date/creation order
  const sortedResults = [...filteredResults].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  // Calculate performance metrics
  const recentRaces = sortedResults.slice(-5) // Last 5 races
  const previousRaces = sortedResults.slice(-10, -5) // Previous 5 races

  const calculateAveragePosition = (races: typeof sortedResults) => {
    const validPositions = races.filter(r => r.position && !r.dnf).map(r => r.position!)
    return validPositions.length > 0 
      ? validPositions.reduce((a, b) => a + b, 0) / validPositions.length 
      : 0
  }

  const calculatePoints = (races: typeof sortedResults) => {
    return races.reduce((sum, race) => sum + race.points, 0)
  }

  const recentAvgPosition = calculateAveragePosition(recentRaces)
  const previousAvgPosition = calculateAveragePosition(previousRaces)
  const recentPoints = calculatePoints(recentRaces)
  const previousPoints = calculatePoints(previousRaces)

  const positionTrend = previousAvgPosition > 0 
    ? recentAvgPosition - previousAvgPosition 
    : 0

  const pointsTrend = previousRaces.length > 0 
    ? recentPoints - previousPoints 
    : 0

  const getTrendIcon = (trend: number, isPosition = false) => {
    // For position, lower is better (negative trend is good)
    const isImproving = isPosition ? trend < 0 : trend > 0
    return isImproving 
      ? <TrendUp size={16} className="text-green-500" />
      : <TrendDown size={16} className="text-red-500" />
  }

  const getTrendColor = (trend: number, isPosition = false) => {
    const isImproving = isPosition ? trend < 0 : trend > 0
    return isImproving ? 'text-green-500' : 'text-red-500'
  }

  // Recent performance highlights
  const recentWins = recentRaces.filter(r => r.position === 1).length
  const recentPodiums = recentRaces.filter(r => r.position && r.position <= 3).length
  const recentFastestLaps = recentRaces.filter(r => r.fastest_lap).length
  const recentDNFs = recentRaces.filter(r => r.dnf).length

  const consistency = recentRaces.length > 1 ? (() => {
    const validPositions = recentRaces.filter(r => r.position && !r.dnf).map(r => r.position!)
    if (validPositions.length < 2) return 0
    
    const avg = validPositions.reduce((a, b) => a + b, 0) / validPositions.length
    const variance = validPositions.reduce((sum, pos) => sum + Math.pow(pos - avg, 2), 0) / validPositions.length
    return Math.max(0, 100 - Math.sqrt(variance) * 10) // 0-100 scale
  })() : 0

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ChartLine size={20} />
          <span>Performance Trends</span>
          {driverName && (
            <Badge variant="outline">{driverName}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Trend Indicators */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <div className="text-sm text-muted-foreground">Avg Position</div>
                <div className="text-lg font-bold">
                  P{recentAvgPosition > 0 ? Math.round(recentAvgPosition * 10) / 10 : '--'}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {previousAvgPosition > 0 && getTrendIcon(positionTrend, true)}
                <span className={`text-sm font-medium ${getTrendColor(positionTrend, true)}`}>
                  {previousAvgPosition > 0 && Math.abs(positionTrend) > 0.1 
                    ? `${positionTrend > 0 ? '+' : ''}${Math.round(positionTrend * 10) / 10}`
                    : ''}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <div className="text-sm text-muted-foreground">Points Trend</div>
                <div className="text-lg font-bold">{recentPoints} pts</div>
              </div>
              <div className="flex items-center space-x-1">
                {previousRaces.length > 0 && getTrendIcon(pointsTrend)}
                <span className={`text-sm font-medium ${getTrendColor(pointsTrend)}`}>
                  {previousRaces.length > 0 && pointsTrend !== 0 
                    ? `${pointsTrend > 0 ? '+' : ''}${pointsTrend}`
                    : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Performance Stats */}
          <div>
            <h4 className="font-medium mb-3">Recent Performance (Last 5 Races)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-2 rounded border">
                <Trophy size={16} className="text-yellow-500 mx-auto mb-1" />
                <div className="text-lg font-bold">{recentWins}</div>
                <div className="text-xs text-muted-foreground">Wins</div>
              </div>
              <div className="text-center p-2 rounded border">
                <Medal size={16} className="text-amber-600 mx-auto mb-1" />
                <div className="text-lg font-bold">{recentPodiums}</div>
                <div className="text-xs text-muted-foreground">Podiums</div>
              </div>
              <div className="text-center p-2 rounded border">
                <Zap size={16} className="text-primary mx-auto mb-1" />
                <div className="text-lg font-bold">{recentFastestLaps}</div>
                <div className="text-xs text-muted-foreground">Fastest Laps</div>
              </div>
              <div className="text-center p-2 rounded border">
                <Target size={16} className="text-secondary mx-auto mb-1" />
                <div className="text-lg font-bold">{Math.round(consistency)}</div>
                <div className="text-xs text-muted-foreground">Consistency</div>
              </div>
            </div>
          </div>

          {/* Race by Race Mini Chart */}
          <div>
            <h4 className="font-medium mb-3">Position History</h4>
            <div className="flex items-end space-x-2 h-20 p-2 border rounded">
              {sortedResults.slice(-10).map((result, index) => {
                const height = result.dnf ? 10 : result.position ? Math.max(10, 70 - (result.position * 4)) : 10
                const color = result.dnf 
                  ? 'bg-destructive' 
                  : result.position === 1 
                    ? 'bg-yellow-500' 
                    : result.position && result.position <= 3 
                      ? 'bg-primary' 
                      : result.position && result.position <= 10 
                        ? 'bg-secondary' 
                        : 'bg-muted'
                
                return (
                  <div
                    key={result.id}
                    className={`w-4 ${color} rounded-t transition-all hover:opacity-80`}
                    style={{ height: `${height}%` }}
                    title={`${result.track_id}: ${result.dnf ? 'DNF' : `P${result.position || '--'}`} (${result.points} pts)`}
                  />
                )
              })}
            </div>
            <div className="text-xs text-muted-foreground mt-1 text-center">
              Last 10 races (hover for details)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}