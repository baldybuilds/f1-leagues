export interface TeamInvite {
  id: string
  team_id: string
  inviter_id: string
  invitee_email: string
  status: 'pending' | 'accepted' | 'declined'
  expires_at: string
  created_at: string
  updated_at: string
  // These will be joined/calculated fields
  team_name?: string
  inviter_email?: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  driver_name: string
  team_name?: string
  car_number?: number
  joined_at: string
  // These will be joined fields
  user_email?: string
}

export interface InviteWithTeam extends TeamInvite {
  team: {
    id: string
    name: string
    game_version: string
    start_date: string
    end_date: string
    created_by: string
  }
}