import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flag, Trophy } from '@phosphor-icons/react'

interface Team {
  id: string
  name: string
  color: string
  points: number
  user_id: string
  created_at: string
}

interface TeamCardProps {
  team: Team
  isOwner: boolean
}

export function TeamCard({ team, isOwner }: TeamCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: team.color }}
            />
            <div>
              <CardTitle className="text-lg">{team.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                {isOwner && (
                  <Badge variant="secondary" className="text-xs">
                    <Flag size={12} className="mr-1" />
                    Your Team
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-accent font-semibold">
              <Trophy size={16} weight="fill" />
              {team.points}
            </div>
            <p className="text-xs text-muted-foreground">points</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="text-sm text-muted-foreground">
          Created {new Date(team.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  )
}