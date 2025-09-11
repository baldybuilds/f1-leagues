import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { TeamInvite, InviteWithTeam } from '@/types/invites'
import { useAuth } from '@/contexts/AuthContext'

export function useInvites() {
  const { user } = useAuth()
  const [invites, setInvites] = useState<InviteWithTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvites = async () => {
    if (!user?.email) return

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('team_invites')
        .select(`
          *,
          team:teams(
            id,
            name,
            game_version,
            season_start_date,
            season_end_date,
            created_by
          )
        `)
        .eq('invitee_email', user.email)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      setInvites(data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching invites:', err)
    } finally {
      setLoading(false)
    }
  }

  const sendInvite = async (teamId: string, inviteeEmail: string) => {
    if (!user?.id) throw new Error('User not authenticated')

    // Check if invite already exists
    const { data: existingInvite } = await supabase
      .from('team_invites')
      .select('id')
      .eq('team_id', teamId)
      .eq('invitee_email', inviteeEmail)
      .eq('status', 'pending')
      .single()

    if (existingInvite) {
      throw new Error('An invite for this email is already pending')
    }

    const { data, error } = await supabase
      .from('team_invites')
      .insert({
        team_id: teamId,
        invited_by: user.id,
        invitee_email: inviteeEmail.toLowerCase(),
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const respondToInvite = async (inviteId: string, status: 'accepted' | 'declined') => {
    if (!user?.id) throw new Error('User not authenticated')

    const { data: invite, error: updateError } = await supabase
      .from('team_invites')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', inviteId)
      .select('team_id')
      .single()

    if (updateError) throw updateError

    // If accepted, add user as team member
    if (status === 'accepted') {
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: invite.team_id,
          user_id: user.id,
          role: 'member'
        })

      if (memberError) throw memberError
    }

    // Refresh invites
    await fetchInvites()
  }

  useEffect(() => {
    if (user?.email) {
      fetchInvites()

      // Subscribe to real-time changes for invites
      const subscription = supabase
        .channel('invites_changes')
        .on('postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'team_invites',
            filter: `invitee_email=eq.${user.email}`
          },
          () => {
            fetchInvites()
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user?.email])

  return { 
    invites, 
    loading, 
    error, 
    sendInvite, 
    respondToInvite,
    refetch: fetchInvites 
  }
}