import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { CreateTeamModal } from './team/CreateTeamModal'
import { TeamCard } from './team/TeamCard'
import { InvitesList } from './team/InvitesList'
import { useTeams } from '@/hooks/useTeams'
import { useInvites } from '@/hooks/useInvites'
import { toast } from 'sonner'
import { Users, Plus, Mail, Crown } from '@phosphor-icons/react'

export function Dashboard() {
  const { user } = useAuth()
  const { teams, loading, refetch } = useTeams()
  const { invites } = useInvites()
  const [showCreateTeam, setShowCreateTeam] = useState(false)

  const ownedTeams = teams?.filter(team => team.created_by === user?.id) || []
  const memberTeams = teams?.filter(team => team.created_by !== user?.id) || []

  const handleTeamCreated = () => {
    refetch()
    setShowCreateTeam(false)
  }

  const handleTeamUpdated = () => {
    refetch()
  }

  const handleTeamDeleted = () => {
    refetch()
  }

  // Safety check - don't render if user is not loaded
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      <div className="container mx-auto px-4 pt-6 pb-8">
        <div className="grid gap-8">
          <div>
            <Tabs defaultValue="teams" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="teams" className="flex items-center gap-2">
                  <Users size={16} />
                  My Teams
                </TabsTrigger>
                <TabsTrigger value="invites" className="flex items-center gap-2">
                  <Mail size={16} />
                  Invites
                  {(invites?.length || 0) > 0 && (
                    <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                      {invites?.length || 0}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="teams" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Your Teams</h2>
                  <Button onClick={() => setShowCreateTeam(true)}>
                    <Plus size={16} className="mr-2" />
                    Create League
                  </Button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (teams?.length || 0) === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <Users size={48} className="text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No leagues yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first F1 league or accept an invite to start competing
                      </p>
                      <Button onClick={() => setShowCreateTeam(true)}>
                        <Plus size={16} className="mr-2" />
                        Create Your First League
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {ownedTeams.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Crown size={20} className="text-primary" />
                          Leagues You Own ({ownedTeams.length})
                        </h3>
                        <div className="grid gap-4">
                          {ownedTeams.map((team) => (
                            <TeamCard 
                              key={team.id} 
                              team={team} 
                              isOwner={true}
                              onTeamUpdated={handleTeamUpdated}
                              onTeamDeleted={handleTeamDeleted}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {memberTeams.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Users size={20} className="text-accent" />
                          Leagues You're In ({memberTeams.length})
                        </h3>
                        <div className="grid gap-4">
                          {memberTeams.map((team) => (
                            <TeamCard 
                              key={team.id} 
                              team={team} 
                              isOwner={false}
                              onTeamUpdated={handleTeamUpdated}
                              onTeamDeleted={handleTeamDeleted}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="invites" className="space-y-6">
                <h2 className="text-2xl font-semibold">League Invites</h2>
                <InvitesList />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {showCreateTeam && (
        <CreateTeamModal
          onClose={() => setShowCreateTeam(false)}
          onTeamCreated={handleTeamCreated}
        />
      )}
    </div>
  )
}