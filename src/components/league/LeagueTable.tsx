import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award } from '@phosphor-icons/react'

interface Team {
  id: string
  name: string
  color: string
  points: number
  user_id: string
  created_at: string
}

interface LeagueTableProps {
  teams: Team[]
}

export function LeagueTable({ teams }: LeagueTableProps) {
  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy size={20} className="text-yellow-500" weight="fill" />
      case 2:
        return <Medal size={20} className="text-gray-400" weight="fill" />
      case 3:
        return <Award size={20} className="text-amber-600" weight="fill" />
      default:
        return <span className="text-muted-foreground font-medium">{position}</span>
    }
  }

  const getRankBadge = (position: number) => {
    if (position <= 3) {
      return (
        <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800">
          Top 3
        </Badge>
      )
    }
    if (position <= 10) {
      return (
        <Badge variant="outline" className="text-accent border-accent">
          Top 10
        </Badge>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy size={20} className="text-primary" />
          League Standings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {teams.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy size={48} className="mx-auto mb-4 opacity-50" />
            <p>No teams in the league yet</p>
            <p className="text-sm">Be the first to create a team!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {teams.slice(0, 10).map((team, index) => {
              const position = index + 1
              return (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 flex justify-center">
                      {getRankIcon(position)}
                    </div>
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: team.color }}
                    />
                    <div>
                      <p className="font-medium text-sm">{team.name}</p>
                      {getRankBadge(position)}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-accent">{team.points}</p>
                    <p className="text-xs text-muted-foreground">pts</p>
                  </div>
                </div>
              )
            })}
            {teams.length > 10 && (
              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  +{teams.length - 10} more teams
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}