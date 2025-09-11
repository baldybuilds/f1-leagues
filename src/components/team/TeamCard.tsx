import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { InviteModal } from './InviteModal'
import { Flag, ChevronDown, ChevronUp, CalendarBlank, GameController, Crown, User, UserPlus } from '@phosphor-icons/react'

interface Team {
  id: string
  name: string
  game: 'F1 24' | 'F1 25'
  start_date: string
  end_date: string
  created_by: string
  created_at: string
  updated_at: string
  track_count?: number
  is_creator?: boolean
}

interface TeamCardProps {
  team: Team
  isOwner: boolean
  onTeamUpdated?: () => void
  onTeamDeleted?: () => void
}

export function TeamCard({ team, isOwner }: TeamCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)

  const canManageTeam = isOwner || team.is_creator

  const getRoleIcon = () => {
    if (isOwner || team.is_creator) return <Crown size={12} className="text-primary" />
    return <User size={12} className="text-muted-foreground" />
  }

  const getRoleText = () => {
    if (isOwner || team.is_creator) return 'Owner'
    return 'Member'
  }

  const getGameLabel = () => {
    return team.game
  }

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary/30 shadow-sm flex items-center justify-center">
                <Flag size={16} className="text-primary" weight="fill" />
              </div>
              <div>
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Badge variant={(isOwner || team.is_creator) ? "default" : "secondary"} className="text-xs">
                    {getRoleIcon()}
                    <span className="ml-1">{getRoleText()}</span>
                  </Badge>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canManageTeam && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInviteModal(true)}
                    title="Invite Members"
                  >
                    <UserPlus size={16} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">
                Created {new Date(team.created_at).toLocaleDateString()}
              </div>
              <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {isExpanded ? (
                      <>
                        <ChevronUp size={16} className="mr-1" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} className="mr-1" />
                        Show Details
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            </div>

            {/* Team Info */}
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <GameController size={12} />
                {getGameLabel()}
              </div>
              <div className="flex items-center gap-1">
                <CalendarBlank size={12} />
                {new Date(team.start_date).toLocaleDateString()} - {new Date(team.end_date).toLocaleDateString()}
              </div>
              {(team.track_count || 0) > 0 && (
                <div className="flex items-center gap-1 col-span-2">
                  <Flag size={12} />
                  {team.track_count} tracks selected
                </div>
              )}
            </div>

            {/* Expandable Content */}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    League features coming soon! Invite members and get ready to track your F1 season.
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>

      {/* Invite Modal */}
      {showInviteModal && canManageTeam && (
        <InviteModal
          teamId={team.id}
          teamName={team.name}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </>
  )
}