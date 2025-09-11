import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTeamMembers } from '@/hooks/useTeamMembers'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { 
  Users, 
  Crown, 
  UserMinus, 
  MoreVertical,
  Shield,
  User,
  UserPlus
} from '@phosphor-icons/react'
import { InviteModal } from './InviteModal'

interface TeamMembersProps {
  teamId: string
  teamName: string
  isOwner: boolean
  isAdmin: boolean
}

export function TeamMembers({ teamId, teamName, isOwner, isAdmin }: TeamMembersProps) {
  const { user } = useAuth()
  const { members, loading, removeMember, updateMemberRole } = useTeamMembers(teamId)
  const [showInviteModal, setShowInviteModal] = useState(false)

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${memberEmail} from the team?`)) {
      return
    }

    try {
      await removeMember(memberId)
      toast.success(`${memberEmail} has been removed from the team`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove member')
    }
  }

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'member', memberEmail: string) => {
    try {
      await updateMemberRole(memberId, newRole)
      toast.success(`${memberEmail} is now ${newRole === 'admin' ? 'an admin' : 'a member'}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role')
    }
  }

  const canManageMembers = isOwner || isAdmin

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              Team Members ({members.length})
            </CardTitle>
            {canManageMembers && (
              <Button size="sm" onClick={() => setShowInviteModal(true)}>
                <UserPlus size={16} className="mr-2" />
                Invite Member
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {members.map((member) => {
            const isCurrentUser = member.user_id === user?.id
            const canModifyMember = canManageMembers && !isCurrentUser
            
            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {member.role === 'admin' ? (
                      <Shield size={16} className="text-primary" />
                    ) : (
                      <User size={16} className="text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {member.user_email}
                      {isCurrentUser && (
                        <span className="text-muted-foreground ml-2">(You)</span>
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={member.role === 'admin' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {member.role === 'admin' ? (
                          <>
                            <Shield size={12} className="mr-1" />
                            Admin
                          </>
                        ) : (
                          <>
                            <User size={12} className="mr-1" />
                            Member
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>

                {canModifyMember && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {member.role === 'member' ? (
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(member.id, 'admin', member.user_email || '')}
                        >
                          <Shield size={16} className="mr-2" />
                          Make Admin
                        </DropdownMenuItem>
                      ) : isOwner && (
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(member.id, 'member', member.user_email || '')}
                        >
                          <User size={16} className="mr-2" />
                          Remove Admin
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleRemoveMember(member.id, member.user_email || '')}
                        className="text-destructive focus:text-destructive"
                      >
                        <UserMinus size={16} className="mr-2" />
                        Remove from Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )
          })}

          {members.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>No team members yet</p>
              {canManageMembers && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setShowInviteModal(true)}
                >
                  <UserPlus size={16} className="mr-2" />
                  Invite First Member
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showInviteModal && (
        <InviteModal
          teamId={teamId}
          teamName={teamName}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </>
  )
}