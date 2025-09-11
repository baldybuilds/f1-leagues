import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDriverStandings } from '@/hooks/useDriverStandings'
import { DriverPerformanceModal } from './DriverPerformanceModal'
import { Trophy, Medal, Zap, X, TrendUp, Users } from '@phosphor-icons/react'

interface DriverStandingsProps {
  teamId?: string
  title?: string
}

export function DriverStandings({ teamId, title = "Driver Standings" }: DriverStandingsProps) {
  const { standings, loading, error } = useDriverStandings(teamId)
  const [selectedDriver, setSelectedDriver] = useState<{ name: string; teamId: string } | null>(null)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy size={20} className="text-primary" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy size={20} className="text-primary" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <X size={48} className="text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (standings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy size={20} className="text-primary" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No race results yet</h3>
            <p className="text-muted-foreground">
              Start adding race results to see driver standings
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy size={20} className="text-yellow-500" weight="fill" />
      case 2:
        return <Medal size={20} className="text-gray-400" weight="fill" />
      case 3:
        return <Medal size={20} className="text-amber-600" weight="fill" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{position}</span>
    }
  }

  const getPositionBadgeColor = (position: number) => {
    if (position === 1) return "bg-yellow-500 text-white"
    if (position === 2) return "bg-gray-400 text-white"
    if (position === 3) return "bg-amber-600 text-white"
    return "bg-muted text-muted-foreground"
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy size={20} className="text-primary" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {standings.map((driver, index) => (
              <div
                key={`${driver.driver_name}-${driver.team_id}`}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setSelectedDriver({ name: driver.driver_name, teamId: driver.team_id })}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getPositionIcon(index + 1)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold">{driver.driver_name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {driver.team_name}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Trophy size={14} />
                        <span>{driver.wins} wins</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Medal size={14} />
                        <span>{driver.podiums} podiums</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Zap size={14} />
                        <span>{driver.fastest_laps} FL</span>
                      </span>
                      {driver.average_position > 0 && (
                        <span className="flex items-center space-x-1">
                          <TrendUp size={14} />
                          <span>Avg: P{driver.average_position}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {driver.total_points}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {driver.races_completed} races
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedDriver && (
        <DriverPerformanceModal
          driverName={selectedDriver.name}
          teamId={selectedDriver.teamId}
          onClose={() => setSelectedDriver(null)}
        />
      )}
    </>
  )
}