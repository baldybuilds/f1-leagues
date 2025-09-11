import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScoringSystemSettings } from './ScoringSystemSettings'
import { LeagueRulesSettings } from './LeagueRulesSettings'
import { useLeagueSettings } from '@/hooks/useLeagueSettings'
import { toast } from 'sonner'
import { 
  Gear, 
  Trophy, 
  Flag, 
  ArrowLeft,
  FloppyDisk,
  Clock,
  CheckCircle 
} from '@phosphor-icons/react'

interface Team {
  id: string
  name: string
  game: string
  start_date: string
  end_date: string
  owner_id: string
  user_role?: 'owner' | 'admin' | 'member' | null
}

interface LeagueSettingsPageProps {
  team: Team
  isOwner: boolean
  isAdmin: boolean
  onBack: () => void
}

export function LeagueSettingsPage({ team, isOwner, isAdmin, onBack }: LeagueSettingsPageProps) {
  const { settings, loading, updateScoringSystem, updateRules } = useLeagueSettings(team.id)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pendingScoringSystem, setPendingScoringSystem] = useState(settings?.scoring_system)
  const [pendingRules, setPendingRules] = useState(settings?.rules)

  const canEdit = isOwner || isAdmin

  const handleScoringSystemChange = (newScoringSystem: any) => {
    setPendingScoringSystem(newScoringSystem)
    setHasChanges(true)
  }

  const handleRulesChange = (newRules: any) => {
    setPendingRules(newRules)
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!pendingScoringSystem || !pendingRules) return

    try {
      setSaving(true)
      
      if (pendingScoringSystem !== settings?.scoring_system) {
        await updateScoringSystem(pendingScoringSystem)
      }
      
      if (pendingRules !== settings?.rules) {
        await updateRules(pendingRules)
      }

      setHasChanges(false)
      toast.success('League settings saved successfully')
    } catch (error: any) {
      toast.error('Failed to save settings: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    setPendingScoringSystem(settings?.scoring_system)
    setPendingRules(settings?.rules)
    setHasChanges(false)
    toast.info('Changes discarded')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Gear size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Settings Not Found</h3>
            <p className="text-muted-foreground mb-4">
              Unable to load league settings for this team.
            </p>
            <Button onClick={onBack}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Team
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft size={16} className="mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Flag size={32} className="text-primary" weight="fill" />
                  <Gear size={16} className="text-accent absolute -bottom-1 -right-1" weight="fill" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">League Settings</h1>
                  <p className="text-sm text-muted-foreground">{team.name}</p>
                </div>
              </div>
            </div>
            
            {canEdit && hasChanges && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock size={12} />
                  Unsaved Changes
                </Badge>
                <Button variant="outline" size="sm" onClick={handleDiscard}>
                  Discard
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                  ) : (
                    <FloppyDisk size={16} className="mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}

            {!canEdit && (
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle size={12} />
                Read Only
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy size={20} className="text-primary" />
                League Configuration
              </CardTitle>
              <CardDescription>
                Configure scoring systems, race rules, and league settings for {team.name}.
                {!canEdit && " You have read-only access to these settings."}
              </CardDescription>
            </CardHeader>
          </Card>

          <Tabs defaultValue="scoring" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scoring" className="flex items-center gap-2">
                <Trophy size={16} />
                Scoring System
              </TabsTrigger>
              <TabsTrigger value="rules" className="flex items-center gap-2">
                <Flag size={16} />
                League Rules
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scoring" className="space-y-6">
              <ScoringSystemSettings
                scoringSystem={pendingScoringSystem || settings.scoring_system}
                onChange={handleScoringSystemChange}
                disabled={!canEdit}
              />
            </TabsContent>

            <TabsContent value="rules" className="space-y-6">
              <LeagueRulesSettings
                rules={pendingRules || settings.rules}
                onChange={handleRulesChange}
                disabled={!canEdit}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}