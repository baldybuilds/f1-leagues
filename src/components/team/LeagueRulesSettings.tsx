import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { LeagueRules } from '@/types/league-settings'
import { 
  Flag, 
  Timer, 
  Shield, 
  CloudRain, 
  Gear, 
  Warning,
  GameController,
  Car,
  Lightning
} from '@phosphor-icons/react'

interface LeagueRulesSettingsProps {
  rules: LeagueRules
  onChange: (rules: LeagueRules) => void
  disabled?: boolean
}

export function LeagueRulesSettings({ rules, onChange, disabled = false }: LeagueRulesSettingsProps) {
  const handleRuleChange = <K extends keyof LeagueRules>(
    section: K,
    updates: Partial<LeagueRules[K]>
  ) => {
    onChange({
      ...rules,
      [section]: { ...rules[section], ...updates }
    })
  }

  const handleSimpleRuleChange = <K extends keyof LeagueRules>(
    key: K,
    value: LeagueRules[K]
  ) => {
    onChange({ ...rules, [key]: value })
  }

  return (
    <div className="space-y-6">
      {/* Race Format Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag size={20} className="text-primary" />
            Race Format
          </CardTitle>
          <CardDescription>
            Configure race weekend format and session structure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="qualifying-format">Qualifying Format</Label>
              <Select
                value={rules.race_format.qualifying_format}
                onValueChange={(value: any) => 
                  handleRuleChange('race_format', { qualifying_format: value })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Q1-Q2-Q3</SelectItem>
                  <SelectItem value="sprint_qualifying">Sprint Qualifying</SelectItem>
                  <SelectItem value="elimination">Elimination Qualifying</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="race-distance">Race Distance</Label>
              <Select
                value={rules.race_format.race_distance}
                onValueChange={(value: any) => 
                  handleRuleChange('race_format', { race_distance: value })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (25% Distance)</SelectItem>
                  <SelectItem value="medium">Medium (50% Distance)</SelectItem>
                  <SelectItem value="full">Full Distance (100%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="practice-sessions">Practice Sessions</Label>
              <Input
                id="practice-sessions"
                type="number"
                value={rules.race_format.practice_sessions}
                onChange={(e) => 
                  handleRuleChange('race_format', { practice_sessions: Number(e.target.value) })
                }
                disabled={disabled}
                min="0"
                max="3"
                className="w-24"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sprint-races">Enable Sprint Races</Label>
              <Switch
                id="sprint-races"
                checked={rules.race_format.sprint_races_enabled}
                onCheckedChange={(checked) =>
                  handleRuleChange('race_format', { sprint_races_enabled: checked })
                }
                disabled={disabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Penalty System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warning size={20} className="text-destructive" />
            Penalty System
          </CardTitle>
          <CardDescription>
            Configure how penalties are applied and enforced
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="time-penalties">Time Penalties</Label>
              <Switch
                id="time-penalties"
                checked={rules.penalty_system.time_penalties}
                onCheckedChange={(checked) =>
                  handleRuleChange('penalty_system', { time_penalties: checked })
                }
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="position-penalties">Position Penalties</Label>
              <Switch
                id="position-penalties"
                checked={rules.penalty_system.position_penalties}
                onCheckedChange={(checked) =>
                  handleRuleChange('penalty_system', { position_penalties: checked })
                }
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="points-deductions">Points Deductions</Label>
              <Switch
                id="points-deductions"
                checked={rules.penalty_system.points_deductions}
                onCheckedChange={(checked) =>
                  handleRuleChange('penalty_system', { points_deductions: checked })
                }
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="automatic-penalties">Automatic Penalties</Label>
              <Switch
                id="automatic-penalties"
                checked={rules.penalty_system.automatic_penalties}
                onCheckedChange={(checked) =>
                  handleRuleChange('penalty_system', { automatic_penalties: checked })
                }
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="steward-review">Steward Review Required</Label>
              <Switch
                id="steward-review"
                checked={rules.penalty_system.steward_review_required}
                onCheckedChange={(checked) =>
                  handleRuleChange('penalty_system', { steward_review_required: checked })
                }
                disabled={disabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver Aids */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GameController size={20} className="text-accent" />
            Driver Assistance
          </CardTitle>
          <CardDescription>
            Configure allowed driver aids and assistance systems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="abs">ABS (Anti-lock Braking)</Label>
              <Select
                value={rules.driver_aids.abs}
                onValueChange={(value: any) => 
                  handleRuleChange('driver_aids', { abs: value })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Disabled</SelectItem>
                  <SelectItem value="on">Enabled</SelectItem>
                  <SelectItem value="choice">Player Choice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="traction-control">Traction Control</Label>
              <Select
                value={rules.driver_aids.traction_control}
                onValueChange={(value: any) => 
                  handleRuleChange('driver_aids', { traction_control: value })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Disabled</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                  <SelectItem value="choice">Player Choice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="racing-line">Racing Line</Label>
              <Select
                value={rules.driver_aids.racing_line}
                onValueChange={(value: any) => 
                  handleRuleChange('driver_aids', { racing_line: value })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Disabled</SelectItem>
                  <SelectItem value="corners_only">Corners Only</SelectItem>
                  <SelectItem value="full">Full Line</SelectItem>
                  <SelectItem value="choice">Player Choice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="braking-assist">Braking Assist</Label>
              <Select
                value={rules.driver_aids.braking_assist}
                onValueChange={(value: any) => 
                  handleRuleChange('driver_aids', { braking_assist: value })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Disabled</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="choice">Player Choice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="drs-assist">DRS Assist</Label>
              <Select
                value={rules.driver_aids.drs_assist}
                onValueChange={(value: any) => 
                  handleRuleChange('driver_aids', { drs_assist: value })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Manual Only</SelectItem>
                  <SelectItem value="on">Automatic</SelectItem>
                  <SelectItem value="choice">Player Choice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ers-assist">ERS Assist</Label>
              <Select
                value={rules.driver_aids.ers_assist}
                onValueChange={(value: any) => 
                  handleRuleChange('driver_aids', { ers_assist: value })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Manual Only</SelectItem>
                  <SelectItem value="on">Automatic</SelectItem>
                  <SelectItem value="choice">Player Choice</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather & Environment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudRain size={20} className="text-blue-500" />
            Weather & Environment
          </CardTitle>
          <CardDescription>
            Configure weather conditions and environmental settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="dynamic-weather">Dynamic Weather</Label>
              <Switch
                id="dynamic-weather"
                checked={rules.weather_settings.dynamic_weather}
                onCheckedChange={(checked) =>
                  handleRuleChange('weather_settings', { dynamic_weather: checked })
                }
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="weather-changes">Weather Changes During Race</Label>
              <Switch
                id="weather-changes"
                checked={rules.weather_settings.weather_changes_during_race}
                onCheckedChange={(checked) =>
                  handleRuleChange('weather_settings', { weather_changes_during_race: checked })
                }
                disabled={disabled}
              />
            </div>

            {!rules.weather_settings.dynamic_weather && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="forced-weather">Forced Weather Condition</Label>
                <Select
                  value={rules.weather_settings.forced_weather || 'clear'}
                  onValueChange={(value: any) => 
                    handleRuleChange('weather_settings', { forced_weather: value })
                  }
                  disabled={disabled}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clear">Clear</SelectItem>
                    <SelectItem value="light_rain">Light Rain</SelectItem>
                    <SelectItem value="heavy_rain">Heavy Rain</SelectItem>
                    <SelectItem value="random">Random</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gear size={20} className="text-muted-foreground" />
            Session Configuration
          </CardTitle>
          <CardDescription>
            Configure race session rules and vehicle settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="parc-ferme">Parc Fermé Rules</Label>
              <Switch
                id="parc-ferme"
                checked={rules.session_settings.parc_ferme}
                onCheckedChange={(checked) =>
                  handleRuleChange('session_settings', { parc_ferme: checked })
                }
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle-damage">Vehicle Damage</Label>
              <Select
                value={rules.session_settings.vehicle_damage}
                onValueChange={(value: any) => 
                  handleRuleChange('session_settings', { vehicle_damage: value })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Disabled</SelectItem>
                  <SelectItem value="reduced">Reduced</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="simulation">Full Simulation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="safety-car">Safety Car</Label>
              <Switch
                id="safety-car"
                checked={rules.session_settings.safety_car}
                onCheckedChange={(checked) =>
                  handleRuleChange('session_settings', { safety_car: checked })
                }
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="virtual-safety-car">Virtual Safety Car</Label>
              <Switch
                id="virtual-safety-car"
                checked={rules.session_settings.virtual_safety_car}
                onCheckedChange={(checked) =>
                  handleRuleChange('session_settings', { virtual_safety_car: checked })
                }
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="formation-lap">Formation Lap</Label>
              <Switch
                id="formation-lap"
                checked={rules.session_settings.formation_lap}
                onCheckedChange={(checked) =>
                  handleRuleChange('session_settings', { formation_lap: checked })
                }
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="dnf-recovery">Allow DNF Recovery</Label>
              <Switch
                id="dnf-recovery"
                checked={rules.allow_dnf_recovery}
                onCheckedChange={(checked) =>
                  handleSimpleRuleChange('allow_dnf_recovery', checked)
                }
                disabled={disabled}
              />
            </div>
          </div>

          {rules.mandatory_pit_stops !== undefined && (
            <div className="space-y-2">
              <Label htmlFor="mandatory-pit-stops">Mandatory Pit Stops</Label>
              <Input
                id="mandatory-pit-stops"
                type="number"
                value={rules.mandatory_pit_stops}
                onChange={(e) => 
                  handleSimpleRuleChange('mandatory_pit_stops', Number(e.target.value))
                }
                disabled={disabled}
                min="0"
                max="5"
                className="w-24"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rules Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightning size={20} className="text-accent" />
            Configuration Summary
          </CardTitle>
          <CardDescription>
            Overview of current league rules and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-medium mb-2">Race Format</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {rules.race_format.qualifying_format.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {rules.race_format.race_distance} distance
                  </Badge>
                </div>
                {rules.race_format.sprint_races_enabled && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Sprint Enabled</Badge>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Driver Aids</h4>
              <div className="space-y-1 text-sm">
                {Object.entries(rules.driver_aids).map(([aid, setting]) => (
                  <div key={aid} className="flex justify-between">
                    <span className="capitalize">{aid.replace('_', ' ')}:</span>
                    <span className="text-muted-foreground capitalize">
                      {setting === 'choice' ? 'Optional' : setting}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Environment</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Weather:</span>
                  <span className="text-muted-foreground">
                    {rules.weather_settings.dynamic_weather ? 'Dynamic' : 'Fixed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Damage:</span>
                  <span className="text-muted-foreground capitalize">
                    {rules.session_settings.vehicle_damage}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Safety Car:</span>
                  <span className="text-muted-foreground">
                    {rules.session_settings.safety_car ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}