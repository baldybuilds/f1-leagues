import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { F1_2025_TRACKS, F1Track } from '@/data/f1-tracks'
import { DeleteTeamDialog } from './DeleteTeamDialog'
import { Flag, GameController, CalendarBlank, X, Pencil, Trash } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

interface Team {
  id: string
  name: string
  game: string
  start_date: string
  end_date: string
  tracks: string[]
  owner_id: string
  created_at: string
  updated_at: string
}

interface EditTeamModalProps {
  team: Team
  onClose: () => void
  onTeamUpdated: () => void
  onTeamDeleted?: () => void
}

export function EditTeamModal({ team, onClose, onTeamUpdated, onTeamDeleted }: EditTeamModalProps) {
  const [teams, setTeams] = useKV<Team[]>('teams', [])
  const [teamName, setTeamName] = useState(team.name)
  const [selectedGame, setSelectedGame] = useState(team.game)
  const [startDate, setStartDate] = useState(team.start_date)
  const [endDate, setEndDate] = useState(team.end_date)
  const [selectedTracks, setSelectedTracks] = useState<string[]>(team.tracks || [])
  const [loading, setLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const F1_GAMES = [
    { value: 'F1 24', label: 'F1 24' },
    { value: 'F1 25', label: 'F1 25' }
  ] as const

  // Track groups for better organization
  const trackGroups = [
    { name: 'Middle East & Asia', tracks: ['bahrain', 'saudi-arabia', 'qatar', 'abu-dhabi', 'japan', 'china', 'singapore'] },
    { name: 'Americas', tracks: ['miami', 'canada', 'united-states', 'mexico', 'brazil', 'las-vegas'] },
    { name: 'Europe', tracks: ['monaco', 'spain', 'austria', 'great-britain', 'hungary', 'belgium', 'netherlands', 'italy', 'emilia-romagna'] },
    { name: 'Others', tracks: ['australia', 'azerbaijan'] }
  ]

  const handleTrackToggle = (trackId: string) => {
    setSelectedTracks(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    )
  }

  const handleSelectAll = () => {
    setSelectedTracks(F1_2025_TRACKS.map(track => track.id))
  }

  const handleClearAll = () => {
    setSelectedTracks([])
  }

  const getTrackById = (id: string): F1Track | undefined => {
    return F1_2025_TRACKS.find(track => track.id === id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!teamName.trim()) {
      toast.error('Team name is required')
      return
    }

    if (!selectedGame) {
      toast.error('Please select a game')
      return
    }

    if (!startDate || !endDate) {
      toast.error('Please select start and end dates')
      return
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error('End date must be after start date')
      return
    }

    if (selectedTracks.length === 0) {
      toast.error('Please select at least one track')
      return
    }

    setLoading(true)

    try {
      const updatedTeam: Team = {
        ...team,
        name: teamName.trim(),
        game: selectedGame,
        start_date: startDate,
        end_date: endDate,
        tracks: selectedTracks,
        updated_at: new Date().toISOString()
      }

      // Update the team in the teams array
      setTeams(currentTeams => 
        currentTeams.map(t => t.id === team.id ? updatedTeam : t)
      )

      toast.success('Team updated successfully!')
      onTeamUpdated()
      onClose()
    } catch (error) {
      toast.error('Failed to update team')
      console.error('Error updating team:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTeamDeleted = () => {
    onTeamDeleted?.()
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Pencil size={20} className="text-primary" />
            <DialogTitle>Edit Team</DialogTitle>
          </div>
          <DialogDescription>
            Update your team details, game selection, dates, and track configuration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Basic Team Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter team name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="game-select">Game</Label>
                  <Select value={selectedGame} onValueChange={setSelectedGame} required>
                    <SelectTrigger id="game-select">
                      <SelectValue placeholder="Select F1 game" />
                    </SelectTrigger>
                    <SelectContent>
                      {F1_GAMES.map((game) => (
                        <SelectItem key={game.value} value={game.value}>
                          <div className="flex items-center gap-2">
                            <GameController size={16} />
                            {game.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Selected Tracks Summary */}
              {selectedTracks.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Selected Tracks ({selectedTracks.length})</CardTitle>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={handleClearAll}
                      >
                        Clear All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedTracks.map(trackId => {
                        const track = getTrackById(trackId)
                        return track ? (
                          <Badge 
                            key={trackId} 
                            variant="secondary" 
                            className="flex items-center gap-1"
                          >
                            <span>{track.flag}</span>
                            <span>{track.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1"
                              onClick={() => handleTrackToggle(trackId)}
                            >
                              <X size={12} />
                            </Button>
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Track Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Flag size={16} className="text-primary" />
                        Track Selection
                      </CardTitle>
                      <CardDescription>Choose tracks for your league calendar</CardDescription>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSelectAll}
                    >
                      Select All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trackGroups.map((group, groupIndex) => (
                      <div key={group.name}>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">{group.name}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {group.tracks.map(trackId => {
                            const track = getTrackById(trackId)
                            return track ? (
                              <div key={track.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={track.id}
                                  checked={selectedTracks.includes(track.id)}
                                  onCheckedChange={() => handleTrackToggle(track.id)}
                                />
                                <Label 
                                  htmlFor={track.id} 
                                  className="text-sm flex items-center gap-2 cursor-pointer"
                                >
                                  <span>{track.flag}</span>
                                  <span>{track.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({track.length}km, {track.laps} laps)
                                  </span>
                                </Label>
                              </div>
                            ) : null
                          })}
                        </div>
                        {groupIndex < trackGroups.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash size={16} className="mr-2" />
              Delete Team
            </Button>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Team'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>

      <DeleteTeamDialog
        team={team}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onTeamDeleted={handleTeamDeleted}
      />
    </Dialog>
  )
}