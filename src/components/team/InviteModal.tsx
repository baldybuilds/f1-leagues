import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useInvites } from '@/hooks/useInvites'
import { toast } from 'sonner'
import { X, UserPlus, Mail } from '@phosphor-icons/react'

interface InviteModalProps {
  teamId: string
  teamName: string
  onClose: () => void
}

export function InviteModal({ teamId, teamName, onClose }: InviteModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { sendInvite } = useInvites()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Please enter an email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address')
      return
    }

    try {
      setLoading(true)
      await sendInvite(teamId, email.trim())
      toast.success(`Invite sent to ${email}`)
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invite')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={20} className="text-primary" />
            Invite to {teamName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail size={16} />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="teammate@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full"
              autoFocus
            />
            <p className="text-sm text-muted-foreground">
              The person will receive an invite to join your team
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !email.trim()}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                <>
                  <UserPlus size={16} className="mr-2" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}