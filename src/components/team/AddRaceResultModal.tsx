import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { useRaceResults } from '@/hooks/useRaceResults'
import { calculatePoints } from '@/types/race-results'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Trophy, Flag, X } from '@phosphor-icons/react'

interface AddRaceResultModalProps {
  teamId: string
  preselectedTrack?: string
  onClose: () => void
  onResultAdded: () => void
}

export function AddRaceResultModal({ teamId, preselectedTrack, onClose, onResultAdded }: AddRaceResultModalProps) {
  const { addRaceResult } = useRaceResults()
  const [trackId, setTrackId] = useState(preselectedTrack || '')
  const [raceDate, setRaceDate] = useState('')
  const [position, setPosition] = useState('')
  const [fastestLap, setFastestLap] = useState(false)
  const [dnf, setDnf] = useState(false)
  const [driverName, setDriverName] = useState('')
  const [availableTracks, setAvailableTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Set preselected track when prop changes
  useEffect(() => {
    if (preselectedTrack) {
      setTrackId(preselectedTrack)
    }
  }, [preselectedTrack])

  // Fetch available tracks for this team
  useEffect(() => {
    const fetchTeamTracks = async () => {
      const { data, error } = await supabase
        .from('team_tracks')
        .select(`
          track_id,
          tracks (*)
        `)
        .eq('team_id', teamId)

      if (error) {
        console.error('Error fetching team tracks:', error)
        return
      }

      setAvailableTracks(data?.map(tt => tt.tracks) || [])
    }

    fetchTeamTracks()
  }, [teamId])

  const selectedTrack = availableTracks.find(track => track.id === trackId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const positionNum = dnf ? null : parseInt(position)
      const points = calculatePoints(positionNum, fastestLap, dnf)

      await addRaceResult({
        team_id: teamId,
        track_id: trackId,
        driver_name: driverName,
        race_date: raceDate || null,
        position: positionNum,
        points,
        fastest_lap: fastestLap,
        dnf,
      })

      toast.success('Race result added successfully!')
      onResultAdded()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add race result')
    } finally {
      setLoading(false)
    }
  }

  const previewPoints = position ? calculatePoints(dnf ? null : parseInt(position), fastestLap, dnf) : 0

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy size={20} className="text-primary" />
              Add Race Result
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Track Selection */}
            <div className="space-y-2">
              <Label>Track</Label>
              <Select value={trackId} onValueChange={setTrackId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a track" />
                </SelectTrigger>
                <SelectContent>
                  {availableTracks.map((track) => (
                    <SelectItem key={track.id} value={track.id}>
                      <div className="flex items-center gap-2">
                        <span>{track.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTrack && (
                <p className="text-xs text-muted-foreground">
                  {selectedTrack.location}, {selectedTrack.country} • Round {selectedTrack.round_number}
                </p>
              )}
            </div>

            {/* Driver Name */}
            <div className="space-y-2">
              <Label htmlFor="driver-name">Driver Name</Label>
              <Input
                id="driver-name"
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Enter driver name"
                required
              />
            </div>

            {/* Race Date */}
            <div className="space-y-2">
              <Label htmlFor="race-date">Race Date</Label>
              <Input
                id="race-date"
                type="date"
                value={raceDate}
                onChange={(e) => setRaceDate(e.target.value)}
                required
              />
            </div>

            {/* DNF Toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dnf"
                checked={dnf}
                onCheckedChange={(checked) => {
                  setDnf(checked as boolean)
                  if (checked) {
                    setPosition('21') // Set to last position
                    setFastestLap(false)
                  }
                }}
              />
              <Label htmlFor="dnf" className="text-sm">
                Did Not Finish (DNF)
              </Label>
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label htmlFor="position">Finishing Position</Label>
              <Select value={position} onValueChange={setPosition} required disabled={dnf}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((pos) => (
                    <SelectItem key={pos} value={pos.toString()}>
                      P{pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fastest Lap */}
            {!dnf && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fastest-lap"
                  checked={fastestLap}
                  onCheckedChange={(checked) => setFastestLap(checked as boolean)}
                />
                <Label htmlFor="fastest-lap" className="text-sm">
                  Fastest Lap (+1 point if P1-P10)
                </Label>
              </div>
            )}

            {/* Points Preview */}
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Points Earned:</span>
                <span className="text-lg font-bold text-accent">{previewPoints}</span>
              </div>
              {position && parseInt(position) <= 10 && fastestLap && !dnf && (
                <p className="text-xs text-muted-foreground mt-1">
                  Base: {previewPoints - 1} + Fastest Lap: 1
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !trackId || !driverName || (!dnf && !position)}
            >
              {loading ? 'Adding Result...' : 'Add Race Result'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}