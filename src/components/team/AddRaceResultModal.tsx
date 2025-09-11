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
import { F1_2025_TRACKS } from '@/data/f1-tracks'
import { toast } from 'sonner'
import { Trophy, Flag, X } from '@phosphor-icons/react'

interface AddRaceResultModalProps {
  teamId: string
  selectedTracks: string[]
  preselectedTrack?: string
  onClose: () => void
  onResultAdded: () => void
}

export function AddRaceResultModal({ teamId, selectedTracks, preselectedTrack, onClose, onResultAdded }: AddRaceResultModalProps) {
  const { addRaceResult } = useRaceResults()
  const [trackId, setTrackId] = useState(preselectedTrack || '')
  const [raceDate, setRaceDate] = useState('')
  const [position, setPosition] = useState('')
  const [fastestLap, setFastestLap] = useState(false)
  const [dnf, setDnf] = useState(false)
  const [dnfReason, setDnfReason] = useState('')
  const [loading, setLoading] = useState(false)

  // Set preselected track when prop changes
  useEffect(() => {
    if (preselectedTrack) {
      setTrackId(preselectedTrack)
    }
  }, [preselectedTrack])

  const availableTracks = F1_2025_TRACKS.filter(track => 
    selectedTracks.includes(track.id)
  )

  const selectedTrack = F1_2025_TRACKS.find(track => track.id === trackId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const positionNum = parseInt(position)
      const points = calculatePoints(positionNum, fastestLap, dnf)

      await addRaceResult({
        team_id: teamId,
        track_id: trackId,
        race_date: raceDate,
        position: positionNum,
        points,
        fastest_lap: fastestLap,
        dnf,
        dnf_reason: dnf ? dnfReason : undefined
      })

      toast.success('Race result added successfully!')
      onResultAdded()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add race result')
    } finally {
      setLoading(false)
    }
  }

  const previewPoints = position ? calculatePoints(parseInt(position), fastestLap, dnf) : 0

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
                        <span>{track.flag}</span>
                        <span>{track.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTrack && (
                <p className="text-xs text-muted-foreground">
                  {selectedTrack.country} • {selectedTrack.length}km • {selectedTrack.laps} laps
                </p>
              )}
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

            {/* DNF Reason */}
            {dnf && (
              <div className="space-y-2">
                <Label htmlFor="dnf-reason">DNF Reason</Label>
                <Textarea
                  id="dnf-reason"
                  placeholder="e.g., Engine failure, Collision, etc."
                  value={dnfReason}
                  onChange={(e) => setDnfReason(e.target.value)}
                  maxLength={200}
                />
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
              disabled={loading || !trackId || !raceDate || !position}
            >
              {loading ? 'Adding Result...' : 'Add Race Result'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}