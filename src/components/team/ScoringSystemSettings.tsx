import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { ScoringSystem, SCORING_SYSTEMS } from '@/types/league-settings'
import { Trophy, Lightning, Target, Plus, Trash } from '@phosphor-icons/react'

interface ScoringSystemSettingsProps {
  scoringSystem: ScoringSystem
  onChange: (scoringSystem: ScoringSystem) => void
  disabled?: boolean
}

export function ScoringSystemSettings({ scoringSystem, onChange, disabled = false }: ScoringSystemSettingsProps) {
  const [customSystem, setCustomSystem] = useState<ScoringSystem>(scoringSystem)

  const handlePresetChange = (presetKey: string) => {
    const preset = SCORING_SYSTEMS[presetKey]
    if (preset) {
      onChange(preset)
      setCustomSystem(preset)
    }
  }

  const handleCustomChange = (updates: Partial<ScoringSystem>) => {
    const updated = { ...customSystem, ...updates }
    setCustomSystem(updated)
    onChange(updated)
  }

  const handlePositionPointChange = (position: number, points: number) => {
    const newPositionPoints = { ...customSystem.position_points }
    if (points === 0) {
      delete newPositionPoints[position]
    } else {
      newPositionPoints[position] = points
    }
    handleCustomChange({ position_points: newPositionPoints })
  }

  const addPositionPoint = () => {
    const maxPosition = Math.max(...Object.keys(customSystem.position_points).map(Number), 0)
    const newPosition = maxPosition + 1
    handlePositionPointChange(newPosition, 1)
  }

  const removePositionPoint = (position: number) => {
    const newPositionPoints = { ...customSystem.position_points }
    delete newPositionPoints[position]
    handleCustomChange({ position_points: newPositionPoints })
  }

  const currentPreset = Object.entries(SCORING_SYSTEMS).find(
    ([_, preset]) => JSON.stringify(preset) === JSON.stringify(scoringSystem)
  )?.[0]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy size={20} className="text-primary" />
            Scoring System Presets
          </CardTitle>
          <CardDescription>
            Choose from predefined scoring systems or create a custom configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(SCORING_SYSTEMS).map(([key, preset]) => (
              <Card 
                key={key} 
                className={`cursor-pointer transition-colors ${
                  currentPreset === key 
                    ? 'ring-2 ring-primary' 
                    : disabled 
                      ? 'cursor-not-allowed opacity-50' 
                      : 'hover:bg-muted/50'
                }`}
                onClick={() => !disabled && handlePresetChange(key)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{preset.name}</CardTitle>
                    {currentPreset === key && (
                      <Badge variant="default">Active</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Win:</span> {preset.position_points[1] || 0} pts
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Fastest Lap:</span> {preset.fastest_lap_points || 0} pts
                    </div>
                    {preset.pole_position_points && (
                      <div className="text-sm">
                        <span className="font-medium">Pole Position:</span> {preset.pole_position_points} pts
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} className="text-accent" />
            Custom Scoring Configuration
          </CardTitle>
          <CardDescription>
            Fine-tune your scoring system settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="positions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="positions">Position Points</TabsTrigger>
              <TabsTrigger value="bonuses">Bonus Points</TabsTrigger>
              <TabsTrigger value="sprint">Sprint & Qualifying</TabsTrigger>
            </TabsList>

            <TabsContent value="positions" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Points by Position</Label>
                {!disabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addPositionPoint}
                    className="flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Position
                  </Button>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(customSystem.position_points)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([position, points]) => (
                    <div key={position} className="flex items-center gap-2">
                      <Label className="w-12 text-sm">P{position}:</Label>
                      <Input
                        type="number"
                        value={points}
                        onChange={(e) => handlePositionPointChange(Number(position), Number(e.target.value))}
                        disabled={disabled}
                        className="flex-1"
                        min="0"
                        max="100"
                      />
                      {!disabled && Number(position) > 10 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePositionPoint(Number(position))}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="bonuses" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fastest-lap-points" className="text-base font-medium">
                    Fastest Lap Bonus
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="fastest-lap-points"
                      type="number"
                      value={customSystem.fastest_lap_points}
                      onChange={(e) => handleCustomChange({ fastest_lap_points: Number(e.target.value) })}
                      disabled={disabled}
                      className="w-24"
                      min="0"
                      max="10"
                    />
                    <span className="text-sm text-muted-foreground">points</span>
                  </div>
                </div>

                {customSystem.fastest_lap_points > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="fastest-lap-required" className="text-sm">
                      Must finish in top
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="fastest-lap-required"
                        type="number"
                        value={customSystem.fastest_lap_required_position || 10}
                        onChange={(e) => handleCustomChange({ fastest_lap_required_position: Number(e.target.value) })}
                        disabled={disabled}
                        className="w-24"
                        min="1"
                        max="20"
                      />
                      <span className="text-sm text-muted-foreground">positions to earn fastest lap bonus</span>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="pole-points" className="text-base font-medium">
                    Pole Position Bonus
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="pole-points"
                      type="number"
                      value={customSystem.pole_position_points || 0}
                      onChange={(e) => handleCustomChange({ pole_position_points: Number(e.target.value) })}
                      disabled={disabled}
                      className="w-24"
                      min="0"
                      max="10"
                    />
                    <span className="text-sm text-muted-foreground">points</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dnf-points" className="text-base font-medium">
                    DNF Points
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="dnf-points"
                      type="number"
                      value={customSystem.dnf_points || 0}
                      onChange={(e) => handleCustomChange({ dnf_points: Number(e.target.value) })}
                      disabled={disabled}
                      className="w-24"
                      min="0"
                      max="10"
                    />
                    <span className="text-sm text-muted-foreground">points (typically 0)</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sprint" className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Sprint Race Points</Label>
                <p className="text-sm text-muted-foreground">
                  Configure points awarded for sprint race positions
                </p>

                {customSystem.sprint_race_points ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Enable Sprint Races</span>
                      <Switch
                        checked={true}
                        onCheckedChange={(checked) => {
                          if (!checked) {
                            const { sprint_race_points, ...rest } = customSystem
                            handleCustomChange(rest)
                          }
                        }}
                        disabled={disabled}
                      />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                      {Object.entries(customSystem.sprint_race_points)
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([position, points]) => (
                          <div key={position} className="flex items-center gap-2">
                            <Label className="w-8 text-sm">P{position}:</Label>
                            <Input
                              type="number"
                              value={points}
                              onChange={(e) => {
                                const newSprintPoints = { ...customSystem.sprint_race_points! }
                                newSprintPoints[Number(position)] = Number(e.target.value)
                                handleCustomChange({ sprint_race_points: newSprintPoints })
                              }}
                              disabled={disabled}
                              className="flex-1"
                              min="0"
                              max="50"
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Enable Sprint Races</span>
                    <Switch
                      checked={false}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleCustomChange({
                            sprint_race_points: {
                              1: 8, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1
                            }
                          })
                        }
                      }}
                      disabled={disabled}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightning size={20} className="text-accent" />
            Current Configuration Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-3">Position Points</h4>
              <div className="space-y-1">
                {Object.entries(customSystem.position_points)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .slice(0, 10)
                  .map(([position, points]) => (
                    <div key={position} className="flex justify-between text-sm">
                      <span>P{position}</span>
                      <span>{points} pts</span>
                    </div>
                  ))}
                {Object.keys(customSystem.position_points).length > 10 && (
                  <div className="text-sm text-muted-foreground">
                    +{Object.keys(customSystem.position_points).length - 10} more positions
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Bonus Points</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Fastest Lap</span>
                  <span>{customSystem.fastest_lap_points} pts</span>
                </div>
                {customSystem.pole_position_points && (
                  <div className="flex justify-between">
                    <span>Pole Position</span>
                    <span>{customSystem.pole_position_points} pts</span>
                  </div>
                )}
                {customSystem.sprint_race_points && (
                  <div className="flex justify-between">
                    <span>Sprint Race Win</span>
                    <span>{customSystem.sprint_race_points[1] || 0} pts</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}