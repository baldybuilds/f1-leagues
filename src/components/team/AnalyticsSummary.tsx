import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDriverStandings } from '@/hooks/useDriverStandings'
import { 
  Trophy, 
  Medal, 
  Zap, 
  Users, 
  Flag,
  TrendUp,
  Target,
  Crown
} from '@phosphor-icons/react'

interface AnalyticsSummaryProps {
  teamId: string
  className?: string
}

export function AnalyticsSummary({ teamId, className }: AnalyticsSummaryProps) {
  const { standings, loading } = useDriverStandings(teamId)

  if (loading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className || ''}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-6 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (standings.length === 0) {
    return null
  }

  // Calculate team statistics
  const totalPoints = standings.reduce((sum, driver) => sum + driver.total_points, 0)
  const totalRaces = standings.reduce((sum, driver) => sum + driver.races_completed, 0)
  const totalWins = standings.reduce((sum, driver) => sum + driver.wins, 0)
  const totalPodiums = standings.reduce((sum, driver) => sum + driver.podiums, 0)
  const totalFastestLaps = standings.reduce((sum, driver) => sum + driver.fastest_laps, 0)
  const topDriver = standings[0] // Already sorted by points

  const averagePosition = standings.length > 0
    ? standings
        .filter(d => d.average_position > 0)
        .reduce((sum, driver) => sum + driver.average_position, 0) / 
      standings.filter(d => d.average_position > 0).length
    : 0

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className || ''}`}>
      <Card>
        <CardContent className="p-4 text-center">
          <Trophy size={24} className="text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold">{totalPoints}</div>
          <div className="text-sm text-muted-foreground">Total Points</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <Users size={24} className="text-accent mx-auto mb-2" />
          <div className="text-2xl font-bold">{standings.length}</div>
          <div className="text-sm text-muted-foreground">Active Drivers</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <Crown size={24} className="text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{totalWins}</div>
          <div className="text-sm text-muted-foreground">Total Wins</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <TrendUp size={24} className="text-secondary mx-auto mb-2" />
          <div className="text-2xl font-bold">
            {averagePosition > 0 ? `P${Math.round(averagePosition * 10) / 10}` : '--'}
          </div>
          <div className="text-sm text-muted-foreground">Avg Position</div>
        </CardContent>
      </Card>

      {/* Top Driver Card (full width) */}
      {topDriver && (
        <Card className="col-span-2 md:col-span-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Trophy size={20} className="text-primary" />
              <span>Leading Driver</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                  <Crown size={20} className="text-primary" weight="fill" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{topDriver.driver_name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <Medal size={14} />
                      <span>{topDriver.wins} wins</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Target size={14} />
                      <span>{topDriver.podiums} podiums</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Zap size={14} />
                      <span>{topDriver.fastest_laps} fastest laps</span>
                    </span>
                    {topDriver.average_position > 0 && (
                      <span className="flex items-center space-x-1">
                        <TrendUp size={14} />
                        <span>Avg: P{topDriver.average_position}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{topDriver.total_points}</div>
                <div className="text-sm text-muted-foreground">{topDriver.races_completed} races</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Stats Row */}
      <Card className="col-span-2 md:col-span-4">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Medal size={20} className="text-amber-600 mx-auto mb-1" />
              <div className="text-xl font-bold">{totalPodiums}</div>
              <div className="text-xs text-muted-foreground">Total Podiums</div>
            </div>
            <div>
              <Zap size={20} className="text-primary mx-auto mb-1" />
              <div className="text-xl font-bold">{totalFastestLaps}</div>
              <div className="text-xs text-muted-foreground">Fastest Laps</div>
            </div>
            <div>
              <Flag size={20} className="text-accent mx-auto mb-1" />
              <div className="text-xl font-bold">{totalRaces}</div>
              <div className="text-xs text-muted-foreground">Total Races</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}