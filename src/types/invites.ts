export interface TeamInvite {
  id: string
  team_id: string
  invited_by: string
  invitee_email: string
  invite_code: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  expires_at: string
  created_at: string
  accepted_at: string | null
  updated_at: string
  // These will be joined/calculated fields
  team_name?: string
  inviter_email?: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: 'admin' | 'member'
  created_at: string
  updated_at: string
  // These will be joined fields
  user_email?: string
}

export interface InviteWithTeam extends TeamInvite {
  team: {
    id: string
    name: string
    game_version: string
    season_start_date: string
    season_end_date: string
    created_by: string
  }
}