import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Flag, Palette } from '@phosphor-icons/react'

interface CreateTeamModalProps {
  onClose: () => void
  onTeamCreated: () => void
}

const teamColors = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
]

export function CreateTeamModal({ onClose, onTeamCreated }: CreateTeamModalProps) {
  const { user } = useAuth()
  const [teamName, setTeamName] = useState('')
  const [selectedColor, setSelectedColor] = useState(teamColors[0])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      const { error } = await supabase
        .from('teams')
        .insert({
          name: teamName,
          color: selectedColor,
          user_id: user.id,
          points: 0,
        })

      if (error) throw error

      toast.success('Team created successfully!')
      onTeamCreated()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create team')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Flag size={32} className="text-primary" weight="fill" />
          </div>
          <CardTitle className="text-2xl">Create New Team</CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Palette size={16} />
                Team Color
              </Label>
              <div className="grid grid-cols-4 gap-3">
                {teamColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
                      selectedColor === color
                        ? 'border-ring scale-110'
                        : 'border-border hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Team Preview</h4>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: selectedColor }}
                />
                <span className="font-medium">{teamName || 'Your Team Name'}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading || !teamName.trim()}>
                {loading ? 'Creating...' : 'Create Team'}
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