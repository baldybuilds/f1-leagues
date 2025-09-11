import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { CreateTeamModal } from './team/CreateTeamModal'
import { TeamCard } from './team/TeamCard'
import { DriverStandings } from './team/DriverStandings'
import { InvitesList } from './team/InvitesList'
import { useTeams } from '@/hooks/useTeams'
import { useInvites } from '@/hooks/useInvites'
import { TeamCardSkeleton } from '@/components/ui/loading-skeletons'
import { toast } from 'sonner'
import { Trophy, Users, Flag, Plus, SignOut, Mail, Crown } from '@phosphor-icons/react'

export function Dashboard() {
  const { user, signOut } = useAuth()
  const { teams, loading, refetch } = useTeams()
  const { invites } = useInvites()
  const [showCreateTeam, setShowCreateTeam] = useState(false)

  const ownedTeams = teams?.filter(team => team.user_role === 'owner') || []
  const memberTeams = teams?.filter(team => team.user_role === 'admin' || team.user_role === 'member') || []

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

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out successfully')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Flag size={32} className="text-primary" weight="fill" />
                <Trophy size={16} className="text-accent absolute -top-1 -right-1" weight="fill" />
              </div>
              <div>
                <h1 className="text-xl font-bold">F1 League Manager</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <SignOut size={16} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className={`grid gap-8 ${(teams?.length || 0) > 0 ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
          <div className={(teams?.length || 0) > 0 ? "lg:col-span-2" : ""}>
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
                    Create Team
                  </Button>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <TeamCardSkeleton key={i} />
                    ))}
                  </div>
                ) : (teams?.length || 0) === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <Users size={48} className="text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first F1 team or accept an invite to start competing
                      </p>
                      <Button onClick={() => setShowCreateTeam(true)}>
                        <Plus size={16} className="mr-2" />
                        Create Your First Team
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {ownedTeams.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Crown size={20} className="text-primary" />
                          Teams You Own ({ownedTeams.length})
                        </h3>
                        <div className="grid gap-4">
                          {ownedTeams.map((team) => (
                            <TeamCard 
                              key={team.id} 
                              team={team} 
                              isOwner={true}
                              isAdmin={false}
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
                          Teams You're In ({memberTeams.length})
                        </h3>
                        <div className="grid gap-4">
                          {memberTeams.map((team) => (
                            <TeamCard 
                              key={team.id} 
                              team={team} 
                              isOwner={false}
                              isAdmin={team.user_role === 'admin'}
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
                <h2 className="text-2xl font-semibold">Team Invites</h2>
                <InvitesList />
              </TabsContent>
            </Tabs>
          </div>

          {(teams?.length || 0) > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Global Driver Standings</h2>
              <DriverStandings title="All Drivers" />
            </div>
          )}
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