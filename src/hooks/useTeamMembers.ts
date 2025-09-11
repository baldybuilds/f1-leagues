import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { TeamMember } from '@/types/invites'

export function useTeamMembers(teamId: string | null) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = async () => {
    if (!teamId) return

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          users:user_id(email)
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Map the joined user data
      const membersWithEmails = (data || []).map(member => ({
        ...member,
        user_email: member.users?.email
      }))

      setMembers(membersWithEmails)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching team members:', err)
    } finally {
      setLoading(false)
    }
  }

  const removeMember = async (memberId: string) => {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)

    if (error) throw error
    
    // Refresh members list
    await fetchMembers()
  }

  const updateMemberRole = async (memberId: string, role: 'admin' | 'member') => {
    const { error } = await supabase
      .from('team_members')
      .update({ 
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)

    if (error) throw error
    
    // Refresh members list
    await fetchMembers()
  }

  useEffect(() => {
    if (teamId) {
      fetchMembers()

      // Subscribe to real-time changes for team members
      const subscription = supabase
        .channel(`team_members_${teamId}`)
        .on('postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'team_members',
            filter: `team_id=eq.${teamId}`
          },
          () => {
            fetchMembers()
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [teamId])

  return { 
    members, 
    loading, 
    error, 
    removeMember,
    updateMemberRole,
    refetch: fetchMembers 
  }
}