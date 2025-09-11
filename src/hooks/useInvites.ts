import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface TeamInvite {
  id: string
  team_id: string
  inviter_id: string
  invitee_email: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  expires_at: string
}

interface InviteWithTeam extends TeamInvite {
  team: {
    id: string
    name: string
    game_version: 'F1 24' | 'F1 25'
    start_date: string
    end_date: string
    created_by: string
  }
}

export function useInvites() {
  const { user } = useAuth()
  const [invites, setInvites] = useState<InviteWithTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvites = async () => {
    if (!user?.email) {
      setLoading(false)
      return
    }

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
            start_date,
            end_date,
            created_by
          )
        `)
        .eq('invitee_email', user.email)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        // If tables don't exist, just set empty invites instead of throwing
        console.warn('Invites table not found:', error.message)
        setInvites([])
        setError(null)
        setLoading(false)
        return
      }

      setInvites(data || [])
      setError(null)
    } catch (err: any) {
      console.warn('Error fetching invites:', err.message)
      setInvites([])
      setError(null)
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
        inviter_id: user.id,
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
      .update({ status })
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
          driver_name: user.email?.split('@')[0] || 'Driver'
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