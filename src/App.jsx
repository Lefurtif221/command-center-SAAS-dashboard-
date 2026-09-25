import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider } from './context/AuthContext'
import { DashboardProvider } from './context/DashboardContext'
import LandingPage from './pages/LandingPage'
import { useAuth } from './hooks/useAuth'
import { Component } from 'react'

const AuthPage = lazy(() => import('./pages/AuthPage'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Legal = lazy(() => import('./pages/Legal'))
const TeamInvite = lazy(() => import('./pages/TeamInvite'))

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <p className="text-accentSec text-sm font-medium mb-2">Une erreur est survenue</p>
            <p className="text-muted text-xs mb-4">{this.state.error?.message || 'Erreur inconnue'}</p>
            <button onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
              className="px-4 py-2 bg-accent text-bg text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
              Recharger
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center"><div className="text-muted text-sm">Chargement...</div></div>
  return isAuthenticated ? children : <Navigate to="/auth" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center"><div className="text-muted text-sm">Chargement...</div></div>
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

function AppRoutes() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg flex items-center justify-center"><div className="text-muted text-sm">Chargement...</div></div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/auth/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/auth/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/auth/callback/:service" element={<ProtectedRoute><OAuthCallback /></ProtectedRoute>} />
        <Route path="/team/invite" element={<TeamInvite />} />
        <Route path="/confidentialite" element={<Legal />} />
        <Route path="/conditions" element={<Legal />} />
        <Route path="/contact" element={<Legal />} />
        <Route path="/dashboard/*" element={<ProtectedRoute><DashboardProvider><ErrorBoundary><DashboardPage /></ErrorBoundary></DashboardProvider></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
