import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { CreateTeamModal } from './team/CreateTeamModal'
import { TeamCard } from './team/TeamCard'
import { DriverStandings } from './team/DriverStandings'
import { useTeams } from '@/hooks/useTeams'
import { TeamCardSkeleton } from '@/components/ui/loading-skeletons'
import { toast } from 'sonner'
import { Trophy, Users, Flag, Plus, SignOut } from '@phosphor-icons/react'

export function Dashboard() {
  const { user, signOut } = useAuth()
  const { teams, loading, refetch } = useTeams()
  const [showCreateTeam, setShowCreateTeam] = useState(false)

  const userTeams = teams.filter(team => team.owner_id === user?.id)

  const handleTeamCreated = () => {
    refetch()
    setShowCreateTeam(false)
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
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
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
            ) : userTeams.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Users size={48} className="text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first F1 team to start competing
                  </p>
                  <Button onClick={() => setShowCreateTeam(true)}>
                    <Plus size={16} className="mr-2" />
                    Create Your First Team
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {userTeams.map((team) => (
                  <TeamCard key={team.id} team={team} isOwner={true} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-6">Global Driver Standings</h2>
            <DriverStandings title="All Drivers" />
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