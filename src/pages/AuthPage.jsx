import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AuthPage() {
  const navigate = useNavigate()
  const { login, signup, renderGoogleButton, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const googleBtnRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (googleBtnRef.current) {
        renderGoogleButton('google-signin-btn')
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [renderGoogleButton])

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(loginForm.email, loginForm.password); navigate('/dashboard') }
    catch { setError('Email ou mot de passe incorrect') }
    finally { setLoading(false) }
  }

  const handleSignup = async (e) => {
    e.preventDefault(); setError('')
    if (signupForm.password !== signupForm.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return }
    if (signupForm.password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères'); return }
    setLoading(true)
    try { await signup(signupForm.name, signupForm.email, signupForm.password); navigate('/dashboard') }
    catch { setError('Une erreur est survenue') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 hero-glow" />
        <div className="absolute inset-0 bg-bg/50" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <button onClick={() => navigate('/')} className="absolute top-8 left-8 flex items-center gap-2 text-muted hover:text-text transition-colors text-sm">
            <span className="iconify" data-icon="lucide:arrow-left" data-width="16"></span><span>Retour</span>
          </button>
          <div className="flex items-center gap-2 mb-12">
            <span className="iconify text-accent" data-icon="lucide:zap" data-width="24"></span>
            <span className="font-medium tracking-tight text-lg">Command Center</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tighter-custom mb-6 leading-tight">
            Bienvenue sur votre<br />espace productif
          </h1>
          <p className="text-muted text-lg mb-8">Connectez tous vos outils et commencez à travailler plus intelligemment.</p>
          <div className="space-y-4">
            {[
              { icon: 'lucide:mail', title: 'Emails intelligents', sub: 'Filtre automatique' },
              { icon: 'lucide:lock', title: 'Données sécurisées', sub: 'Chiffrement de bout en bout' },
              { icon: 'lucide:trending-up', title: 'Investissements', sub: 'Suivi de portfolio intégré' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-surface/50 border border-border rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                  <span className="iconify" data-icon={item.icon} data-width="20"></span>
                </div>
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="iconify text-accent" data-icon="lucide:zap" data-width="20"></span>
            <span className="font-medium tracking-tight text-sm">Command Center</span>
          </div>
          <div className="flex gap-1 p-1 bg-surface border border-border rounded-lg mb-8">
            <button onClick={() => { setActiveTab('login'); setError('') }} className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === 'login' ? 'bg-bg text-text border border-border' : 'text-muted hover:text-text'}`}>Connexion</button>
            <button onClick={() => { setActiveTab('signup'); setError('') }} className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === 'signup' ? 'bg-bg text-text border border-border' : 'text-muted hover:text-text'}`}>Inscription</button>
          </div>
          {error && <div className="mb-6 p-3 bg-accentSec/10 border border-accentSec/30 rounded-lg text-accentSec text-sm">{error}</div>}

          {/* Google Identity Services Button */}
          <div className="mb-4">
            <div id="google-signin-btn" ref={googleBtnRef} className="w-full"></div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1.5">Email</label>
                <input type="email" placeholder="votre@email.com" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors" required />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Mot de passe</label>
                <input type="password" placeholder="••••••••" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors" required />
              </div>
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-muted"><input type="checkbox" defaultChecked /> Se souvenir de moi</label>
                <a href="#" className="text-accent hover:text-accent/80 transition-colors">Mot de passe oublié ?</a>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-accent text-bg hover:bg-[#33c2ff] font-semibold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50">{loading ? 'Connexion...' : 'Se connecter'}</button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1.5">Nom complet</label>
                <input type="text" placeholder="Mouhamadou Touré" value={signupForm.name} onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })} className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors" required />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Email</label>
                <input type="email" placeholder="votre@email.com" value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors" required />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Mot de passe</label>
                <input type="password" placeholder="8 caractères minimum" value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors" required />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Confirmer</label>
                <input type="password" placeholder="••••••••" value={signupForm.confirmPassword} onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })} className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors" required />
              </div>
              <div className="flex items-start gap-2 text-xs">
                <input type="checkbox" required className="mt-0.5" />
                <span className="text-muted">J'accepte les <a href="#" className="text-accent hover:text-accent/80">conditions</a></span>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-accent text-bg hover:bg-[#33c2ff] font-semibold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50">{loading ? 'Création...' : 'Créer mon compte'}</button>
            </form>
          )}
          <p className="mt-6 text-center text-xs text-muted">
            {activeTab === 'login' ? <>Pas encore de compte ? <button onClick={() => setActiveTab('signup')} className="text-accent hover:text-accent/80">Créer un compte</button></> : <>Déjà un compte ? <button onClick={() => setActiveTab('login')} className="text-accent hover:text-accent/80">Se connecter</button></>}
          </p>
        </div>
      </div>
    </div>
  )
}