import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Flag, CalendarBlank, GameController, MapPin } from '@phosphor-icons/react'

interface CreateTeamModalProps {
  onClose: () => void
  onTeamCreated: () => void
}

interface Track {
  id: string
  name: string
  country: string
  location: string
  season: number
}

export function CreateTeamModal({ onClose, onTeamCreated }: CreateTeamModalProps) {
  const { user } = useAuth()
  const [teamName, setTeamName] = useState('')
  const [selectedGame, setSelectedGame] = useState<'F1_24' | 'F1_25' | ''>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedTracks, setSelectedTracks] = useState<string[]>([])
  const [availableTracks, setAvailableTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch available tracks from database
  useEffect(() => {
    const fetchTracks = async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('season', 2025)
        .order('name')

      if (error) {
        console.error('Error fetching tracks:', error)
        toast.error('Failed to load tracks')
        return
      }

      setAvailableTracks(data || [])
    }

    fetchTracks()
  }, [])

  const handleTrackToggle = (trackId: string) => {
    setSelectedTracks(prev => 
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    )
  }

  const selectAllTracks = () => {
    setSelectedTracks(availableTracks.map(track => track.id))
  }

  const clearAllTracks = () => {
    setSelectedTracks([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (selectedTracks.length === 0) {
      toast.error('Please select at least one track for your league')
      return
    }

    setLoading(true)

    try {
      // Create the team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: teamName,
          game: selectedGame,
          start_date: startDate,
          end_date: endDate,
          created_by: user.id,
        })
        .select()
        .single()

      if (teamError) throw teamError

      // Insert team-track relationships
      const teamTrackInserts = selectedTracks.map((trackId, index) => ({
        team_id: teamData.id,
        track_id: trackId,
        race_order: index + 1
      }))

      const { error: trackError } = await supabase
        .from('team_tracks')
        .insert(teamTrackInserts)

      if (trackError) throw trackError

      toast.success('League created successfully!')
      onTeamCreated()
    } catch (error: any) {
      console.error('Error creating team:', error)
      toast.error(error.message || 'Failed to create league')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Flag size={32} className="text-primary" weight="fill" />
          </div>
          <CardTitle className="text-2xl">Create New F1 League</CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-6 h-full flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Team Name */}
                <div className="space-y-2">
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    type="text"
                    placeholder="Enter your team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                    maxLength={50}
                  />
                </div>

                {/* Game Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <GameController size={16} />
                    F1 Game Version
                  </Label>
                  <Select value={selectedGame} onValueChange={(value: 'F1_24' | 'F1_25') => setSelectedGame(value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select F1 game version" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="F1_24">F1 24</SelectItem>
                      <SelectItem value="F1_25">F1 25</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <CalendarBlank size={16} />
                    League Duration
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="start-date" className="text-sm text-muted-foreground">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="end-date" className="text-sm text-muted-foreground">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        min={startDate}
                      />
                    </div>
                  </div>
                </div>

                {/* Team Color */}
                <div className="space-y-3">
                  <Label>Team Information</Label>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Your F1 league will be created with the selected tracks and date range. 
                      You can add race results and track standings once the league is created.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Track Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <MapPin size={16} />
                    Select Tracks ({selectedTracks.length}/{availableTracks.length})
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAllTracks}
                      className="text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearAllTracks}
                      className="text-xs"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-80 border rounded-lg p-4">
                  <div className="space-y-3">
                    {availableTracks.map((track) => (
                      <div
                        key={track.id}
                        className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md"
                      >
                        <Checkbox
                          id={track.id}
                          checked={selectedTracks.includes(track.id)}
                          onCheckedChange={() => handleTrackToggle(track.id)}
                        />
                        <Label
                          htmlFor={track.id}
                          className="flex-1 cursor-pointer flex items-center gap-2 text-sm"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{track.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {track.location}, {track.country}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <Separator />

            {/* Team Preview */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-3">League Preview</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{teamName || 'Your Team Name'}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {selectedGame ? (selectedGame === 'F1_24' ? 'F1 24' : 'F1 25') : 'Select game version'}
                  </div>
                </div>
                <div className="space-y-1 text-muted-foreground">
                  <div>
                    Duration: {startDate && endDate ? `${startDate} to ${endDate}` : 'Select dates'}
                  </div>
                  <div>
                    Tracks: {selectedTracks.length > 0 ? `${selectedTracks.length} selected` : 'None selected'}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={loading || !teamName.trim() || !selectedGame || !startDate || !endDate || selectedTracks.length === 0}
              >
                {loading ? 'Creating League...' : 'Create League'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}