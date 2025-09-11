import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useInvites } from '@/hooks/useInvites'
import { toast } from 'sonner'
import { 
  Mail, 
  Check, 
  X, 
  Calendar,
  GameController,
  Users
} from '@phosphor-icons/react'
import { format } from 'date-fns'

export function InvitesList() {
  const { invites, loading, respondToInvite } = useInvites()

  const handleAccept = async (inviteId: string, teamName: string) => {
    try {
      await respondToInvite(inviteId, 'accepted')
      toast.success(`Successfully joined ${teamName}!`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept invite')
    }
  }

  const handleDecline = async (inviteId: string, teamName: string) => {
    try {
      await respondToInvite(inviteId, 'declined')
      toast.success(`Declined invite to ${teamName}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to decline invite')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  if ((invites?.length || 0) === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Mail size={48} className="text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No pending invites</h3>
          <p className="text-muted-foreground">
            You don't have any pending team invites at the moment
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {invites?.map((invite) => (
        <Card key={invite.id} className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{invite.team.name}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <GameController size={14} />
                    {invite.team.game}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {format(new Date(invite.team.start_date), 'MMM dd')} - {format(new Date(invite.team.end_date), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                <Mail size={12} className="mr-1" />
                Pending
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-4">
              You've been invited to join this F1 league team. Accept to start competing!
            </p>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => handleAccept(invite.id, invite.team.name)}
                className="flex-1"
              >
                <Check size={16} className="mr-2" />
                Accept
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleDecline(invite.id, invite.team.name)}
                className="flex-1"
              >
                <X size={16} className="mr-2" />
                Decline
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}