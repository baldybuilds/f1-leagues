import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Flag, Lightning } from '@phosphor-icons/react'

interface AuthModalProps {
  onClose: () => void
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await signIn(email, password)
    
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome back!')
      onClose()
    }
    
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await signUp(email, password)
    
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Account created! Please check your email to verify.')
      onClose()
    }
    
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Flag size={32} className="text-primary" weight="fill" />
              <Lightning 
                size={16} 
                className="text-accent absolute -top-1 -right-1" 
                weight="fill" 
              />
            </div>
          </div>
          <CardTitle className="text-2xl">Join F1 League Manager</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one to get started
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Creating account...' : 'Sign Up'}
                  </Button>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}