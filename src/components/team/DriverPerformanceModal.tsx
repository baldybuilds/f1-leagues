import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDriverPerformance } from '@/hooks/useDriverStandings'
import { PerformanceTrends } from './PerformanceTrends'
import { 
  Trophy, 
  Medal, 
  Zap, 
  X, 
  TrendUp, 
  TrendDown,
  Target,
  Calendar,
  ChartLine,
  Award
} from '@phosphor-icons/react'

interface DriverPerformanceModalProps {
  driverName: string
  teamId: string
  onClose: () => void
}

export function DriverPerformanceModal({ driverName, teamId, onClose }: DriverPerformanceModalProps) {
  const { performance, loading, error } = useDriverPerformance(driverName, teamId)

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading Performance Data...</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error || !performance) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Error Loading Performance</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <X size={48} className="text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground">
              {error || 'No performance data available for this driver'}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const { season_stats, race_results } = performance

  const getPositionColor = (position: number | null, dnf: boolean) => {
    if (dnf) return 'text-destructive'
    if (!position) return 'text-muted-foreground'
    if (position === 1) return 'text-yellow-500'
    if (position <= 3) return 'text-primary'
    if (position <= 10) return 'text-foreground'
    return 'text-muted-foreground'
  }

  const getPositionBadge = (position: number | null, dnf: boolean) => {
    if (dnf) return <Badge variant="destructive">DNF</Badge>
    if (!position) return <Badge variant="outline">--</Badge>
    if (position === 1) return <Badge className="bg-yellow-500 text-white">P{position}</Badge>
    if (position <= 3) return <Badge variant="default">P{position}</Badge>
    if (position <= 10) return <Badge variant="secondary">P{position}</Badge>
    return <Badge variant="outline">P{position}</Badge>
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Award size={24} className="text-primary" />
            <span>{driverName} - Performance Analytics</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Season Statistics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy size={32} className="text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{season_stats.total_points}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Calendar size={32} className="text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold">{season_stats.races_completed}</div>
                <div className="text-sm text-muted-foreground">Races</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Medal size={32} className="text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{season_stats.wins}</div>
                <div className="text-sm text-muted-foreground">Wins</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Target size={32} className="text-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold">{season_stats.podiums}</div>
                <div className="text-sm text-muted-foreground">Podiums</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabbed Content */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="races">All Races</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ChartLine size={20} />
                      <span>Performance Metrics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Average Position</span>
                        <span className="text-sm font-bold">
                          P{season_stats.average_position || '--'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Point Scoring Rate</span>
                        <span className="text-sm font-bold">{season_stats.point_scoring_rate}%</span>
                      </div>
                      <Progress value={season_stats.point_scoring_rate} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Consistency Rating</span>
                        <span className="text-sm font-bold">{season_stats.consistency_rating}/100</span>
                      </div>
                      <Progress value={season_stats.consistency_rating} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center">
                        <Zap size={20} className="text-primary mx-auto mb-1" />
                        <div className="text-lg font-bold">{season_stats.fastest_laps}</div>
                        <div className="text-xs text-muted-foreground">Fastest Laps</div>
                      </div>
                      <div className="text-center">
                        <X size={20} className="text-destructive mx-auto mb-1" />
                        <div className="text-lg font-bold">{season_stats.dnfs}</div>
                        <div className="text-xs text-muted-foreground">DNFs</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Results */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {race_results.slice(-8).map((result, index) => (
                        <div key={result.track_id} className="flex items-center justify-between p-2 rounded border">
                          <div>
                            <div className="font-medium text-sm">{result.track_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {result.race_date ? new Date(result.race_date).toLocaleDateString() : 'TBD'}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getPositionBadge(result.position, result.dnf)}
                            <div className="text-sm font-bold">{result.points}pts</div>
                            {result.fastest_lap && <Zap size={14} className="text-primary" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="mt-6">
              <PerformanceTrends teamId={teamId} driverName={driverName} />
            </TabsContent>

            <TabsContent value="races" className="mt-6">
              {/* Detailed Race Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Complete Race Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Track</th>
                          <th className="text-left p-2">Date</th>
                          <th className="text-center p-2">Position</th>
                          <th className="text-center p-2">Points</th>
                          <th className="text-center p-2">FL</th>
                          <th className="text-center p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {race_results.map((result) => (
                          <tr key={result.track_id} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-medium">{result.track_name}</td>
                            <td className="p-2 text-muted-foreground">
                              {result.race_date ? new Date(result.race_date).toLocaleDateString() : 'TBD'}
                            </td>
                            <td className="p-2 text-center">
                              <span className={`font-bold ${getPositionColor(result.position, result.dnf)}`}>
                                {result.dnf ? 'DNF' : result.position ? `P${result.position}` : '--'}
                              </span>
                            </td>
                            <td className="p-2 text-center font-bold">{result.points}</td>
                            <td className="p-2 text-center">
                              {result.fastest_lap && <Zap size={16} className="text-primary mx-auto" />}
                            </td>
                            <td className="p-2 text-center">
                              {result.dnf ? (
                                <Badge variant="destructive">DNF</Badge>
                              ) : result.position ? (
                                <Badge variant="outline">Finished</Badge>
                              ) : (
                                <Badge variant="secondary">Pending</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}