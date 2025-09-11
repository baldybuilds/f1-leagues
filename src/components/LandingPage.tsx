import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Lightning, Users, Flag } from '@phosphor-icons/react'

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Flag size={48} className="text-primary" weight="fill" />
              <Lightning 
                size={24} 
                className="text-accent absolute -top-2 -right-2" 
                weight="fill" 
              />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            F1 League Manager
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Create and manage your Formula 1 fantasy leagues with friends. 
            Track standings, compete globally, and experience the thrill of F1 management.
          </p>
          
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 transition-all duration-200 transform hover:scale-105"
          >
            Get Started
            <Lightning size={20} className="ml-2" weight="fill" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Users size={32} className="text-primary" weight="fill" />
              </div>
              <CardTitle className="text-xl">Team Management</CardTitle>
              <CardDescription>
                Create and customize your F1 teams with unique branding and driver selections
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                <Trophy size={32} className="text-accent" weight="fill" />
              </div>
              <CardTitle className="text-xl">Global Leagues</CardTitle>
              <CardDescription>
                Compete with players worldwide in dynamic league tables and standings
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                <Lightning size={32} className="text-secondary" weight="fill" />
              </div>
              <CardTitle className="text-xl">Real-time Updates</CardTitle>
              <CardDescription>
                Get instant updates on standings, points, and league activities
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-semibold mb-4">Why F1 League Manager?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Built by F1 enthusiasts for F1 enthusiasts. Our platform combines the excitement 
                of Formula 1 racing with the strategy of fantasy sports. Create your dream team, 
                compete with friends, and climb the global leaderboards.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}