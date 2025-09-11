import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

interface Team {
  id: string
  name: string
  game_version: string
  season_start_date: string
  season_end_date: string
  tracks: string[]
  created_by: string
  created_at: string
  updated_at: string
}

interface DeleteTeamDialogProps {
  team: Team
  open: boolean
  onOpenChange: (open: boolean) => void
  onTeamDeleted: () => void
}

export function DeleteTeamDialog({ team, open, onOpenChange, onTeamDeleted }: DeleteTeamDialogProps) {
  const [teams, setTeams] = useKV<Team[]>('teams', [])
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    
    try {
      // Remove the team from the teams array
      setTeams(currentTeams => currentTeams.filter(t => t.id !== team.id))
      
      // Also clean up related data
      const teamKeys = [
        `team-${team.id}-race-results`,
        `team-${team.id}-members`,
        `team-${team.id}-invites`,
        `team-${team.id}-drivers`
      ]
      
      // Delete related team data
      await Promise.all(teamKeys.map(key => spark.kv.delete(key)))
      
      toast.success('Team deleted successfully')
      onTeamDeleted()
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to delete team')
      console.error('Error deleting team:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Team</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{team.name}"? This action cannot be undone and will 
            permanently remove all team data including race results, driver standings, and member invitations.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Deleting...' : 'Delete Team'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}