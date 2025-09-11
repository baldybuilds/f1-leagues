import { useState } from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { LandingPage } from '@/components/LandingPage'
import { AuthModal } from '@/components/auth/AuthModal'
import { Dashboard } from '@/components/Dashboard'
import { Navbar } from '@/components/Navbar'
import { Toaster } from '@/components/ui/sonner'
import { DatabaseStatusBanner } from '@/components/DatabaseStatusBanner'

function AppContent() {
  const { user, loading } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <DatabaseStatusBanner />
      <Navbar />
      {user ? (
        <Dashboard />
      ) : (
        <>
          <LandingPage onGetStarted={() => setShowAuth(true)} />
          {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </>
      )}
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" />
    </AuthProvider>
  )
}

export default App