import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { RaceResults } from './RaceResults'
import { RaceCalendar } from './RaceCalendar'
import { AddRaceResultModal } from './AddRaceResultModal'
import { Flag, Trophy, ChevronDown, ChevronUp, CalendarBlank, GameController } from '@phosphor-icons/react'
import { F1_GAMES } from '@/data/f1-tracks'

interface Team {
  id: string
  name: string
  color: string
  points: number
  user_id: string
  created_at: string
  game?: string
  start_date?: string
  end_date?: string
  selected_tracks?: string[]
}

interface TeamCardProps {
  team: Team
  isOwner: boolean
}

export function TeamCard({ team, isOwner }: TeamCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAddResult, setShowAddResult] = useState(false)
  const [preselectedTrack, setPreselectedTrack] = useState<string>('')

  const selectedGame = team.game ? F1_GAMES.find(g => g.value === team.game) : null
  const hasDateRange = team.start_date && team.end_date
  const tracksCount = team.selected_tracks?.length || 0

  const handleResultAdded = () => {
    setShowAddResult(false)
    setPreselectedTrack('')
    // The race results component will automatically update via the hook
  }

  const handleAddResultFromCalendar = (trackId: string) => {
    setPreselectedTrack(trackId)
    setShowAddResult(true)
  }

  return (
    <>
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
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">
                Created {new Date(team.created_at).toLocaleDateString()}
              </div>
              {isOwner && (
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
              )}
            </div>

            {/* Team Info */}
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              {selectedGame && (
                <div className="flex items-center gap-1">
                  <GameController size={12} />
                  {selectedGame.label}
                </div>
              )}
              {hasDateRange && (
                <div className="flex items-center gap-1">
                  <CalendarBlank size={12} />
                  {new Date(team.start_date!).toLocaleDateString()} - {new Date(team.end_date!).toLocaleDateString()}
                </div>
              )}
              {tracksCount > 0 && (
                <div className="flex items-center gap-1 col-span-2">
                  <Flag size={12} />
                  {tracksCount} tracks selected
                </div>
              )}
            </div>

            {/* Expandable Content */}
            {isOwner && (
              <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CollapsibleContent className="space-y-4">
                  <Tabs defaultValue="results" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="results">Race Results</TabsTrigger>
                      <TabsTrigger value="calendar">Race Calendar</TabsTrigger>
                    </TabsList>
                    <TabsContent value="results" className="mt-4">
                      <RaceResults
                        teamId={team.id}
                        selectedTracks={team.selected_tracks || []}
                        onAddResult={() => setShowAddResult(true)}
                      />
                    </TabsContent>
                    <TabsContent value="calendar" className="mt-4">
                      <RaceCalendar
                        teamId={team.id}
                        selectedTracks={team.selected_tracks || []}
                        onAddResult={handleAddResultFromCalendar}
                      />
                    </TabsContent>
                  </Tabs>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Race Result Modal */}
      {showAddResult && team.selected_tracks && (
        <AddRaceResultModal
          teamId={team.id}
          selectedTracks={team.selected_tracks}
          preselectedTrack={preselectedTrack}
          onClose={() => {
            setShowAddResult(false)
            setPreselectedTrack('')
          }}
          onResultAdded={handleResultAdded}
        />
      )}
    </>
  )
}