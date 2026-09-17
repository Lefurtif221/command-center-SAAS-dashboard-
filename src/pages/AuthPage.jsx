import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AuthPage() {
  const navigate = useNavigate()
  const { login, signup, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated, navigate])

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(loginForm.email, loginForm.password); navigate('/dashboard') }
    catch (err) { setError(err.message || 'Email ou mot de passe incorrect') }
    finally { setLoading(false) }
  }

  const handleSignup = async (e) => {
    e.preventDefault(); setError('')
    if (signupForm.password !== signupForm.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return }
    if (signupForm.password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères'); return }
    setLoading(true)
    try { await signup(signupForm.name, signupForm.email, signupForm.password); navigate('/dashboard') }
    catch (err) { setError(err.message || 'Une erreur est survenue') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-bg noise flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 hero-glow" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <button onClick={() => navigate('/')} className="absolute top-8 left-8 flex items-center gap-2 text-muted hover:text-text transition-colors text-sm group">
            <span className="iconify group-hover:-translate-x-0.5 transition-transform" data-icon="lucide:arrow-left" data-width="16"></span><span>Retour</span>
          </button>
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <span className="iconify text-accent" data-icon="lucide:sparkles" data-width="16"></span>
            </div>
            <span className="font-display font-semibold tracking-tight text-lg">Personal Place</span>
          </div>
          <h1 className="text-4xl font-display font-semibold tracking-tighter-custom mb-6 leading-[1.05]">
            Bienvenue sur votre<br /><span className="gradient-text">espace productif</span>
          </h1>
          <p className="text-muted text-lg mb-8 leading-relaxed">Connectez tous vos outils et commencez à travailler plus intelligemment.</p>
          <div className="space-y-3">
            {[
              { icon: 'lucide:mail', title: 'Emails intelligents', sub: 'Filtre automatique' },
              { icon: 'lucide:lock', title: 'Données sécurisées', sub: 'Chiffrement de bout en bout' },
              { icon: 'lucide:trending-up', title: 'Investissements', sub: 'Suivi de portfolio intégré' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 glass rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <span className="iconify" data-icon={item.icon} data-width="20"></span>
                </div>
                <div>
                  <p className="font-display font-medium text-sm">{item.title}</p>
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
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
              <span className="iconify text-accent" data-icon="lucide:sparkles" data-width="14"></span>
            </div>
            <span className="font-display font-semibold tracking-tight text-sm">Personal Place</span>
          </div>
          <div className="flex gap-1 p-1 glass rounded-xl mb-8">
            <button onClick={() => { setActiveTab('login'); setError('') }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'login' ? 'bg-accent/10 text-accent shadow-[0_0_12px_-4px_rgba(125,211,252,0.3)]' : 'text-muted hover:text-text hover:bg-white/5'}`}>Connexion</button>
            <button onClick={() => { setActiveTab('signup'); setError('') }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'signup' ? 'bg-accent/10 text-accent shadow-[0_0_12px_-4px_rgba(125,211,252,0.3)]' : 'text-muted hover:text-text hover:bg-white/5'}`}>Inscription</button>
          </div>
          {error && <div className="mb-6 p-3 bg-accentSec/10 border border-accentSec/20 rounded-xl text-accentSec text-sm">{error}</div>}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1.5 font-mono">Email</label>
                <input type="email" placeholder="votre@email.com" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="w-full px-3 py-2.5 glass rounded-xl text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 focus:shadow-[0_0_12px_-4px_rgba(125,211,252,0.2)] transition-all duration-200" required />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5 font-mono">Mot de passe</label>
                <input type="password" placeholder="••••••••" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full px-3 py-2.5 glass rounded-xl text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 focus:shadow-[0_0_12px_-4px_rgba(125,211,252,0.2)] transition-all duration-200" required />
              </div>
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-muted"><input type="checkbox" defaultChecked /> Se souvenir de moi</label>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/auth/forgot-password') }} className="text-accent hover:text-accent/80 transition-colors">Mot de passe oublié ?</a>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-accent text-bg hover:bg-[#8dd8fc] font-semibold text-sm py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-[0_0_20px_-5px_rgba(125,211,252,0.3)] hover:shadow-[0_0_30px_-5px_rgba(125,211,252,0.4)]">{loading ? 'Connexion...' : 'Se connecter'}</button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1.5 font-mono">Nom complet</label>
                <input type="text" placeholder="Mouhamadou Touré" value={signupForm.name} onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })} className="w-full px-3 py-2.5 glass rounded-xl text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 focus:shadow-[0_0_12px_-4px_rgba(125,211,252,0.2)] transition-all duration-200" required />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5 font-mono">Email</label>
                <input type="email" placeholder="votre@email.com" value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} className="w-full px-3 py-2.5 glass rounded-xl text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 focus:shadow-[0_0_12px_-4px_rgba(125,211,252,0.2)] transition-all duration-200" required />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5 font-mono">Mot de passe</label>
                <input type="password" placeholder="8 caractères minimum" value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} className="w-full px-3 py-2.5 glass rounded-xl text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 focus:shadow-[0_0_12px_-4px_rgba(125,211,252,0.2)] transition-all duration-200" required />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5 font-mono">Confirmer</label>
                <input type="password" placeholder="••••••••" value={signupForm.confirmPassword} onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })} className="w-full px-3 py-2.5 glass rounded-xl text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 focus:shadow-[0_0_12px_-4px_rgba(125,211,252,0.2)] transition-all duration-200" required />
              </div>
              <div className="flex items-start gap-2 text-xs">
                <input type="checkbox" required className="mt-0.5" />
                <span className="text-muted">J'accepte les <a href="#" className="text-accent hover:text-accent/80">conditions</a></span>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-accent text-bg hover:bg-[#8dd8fc] font-semibold text-sm py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-[0_0_20px_-5px_rgba(125,211,252,0.3)] hover:shadow-[0_0_30px_-5px_rgba(125,211,252,0.4)]">{loading ? 'Création...' : 'Créer mon compte'}</button>
            </form>
          )}
          <p className="mt-6 text-center text-xs text-muted">
            {activeTab === 'login' ? <>Pas encore de compte ? <button onClick={() => setActiveTab('signup')} className="text-accent hover:text-accent/80 transition-colors">Créer un compte</button></> : <>Déjà un compte ? <button onClick={() => setActiveTab('login')} className="text-accent hover:text-accent/80 transition-colors">Se connecter</button></>}
          </p>
        </div>
      </div>
    </div>
  )
}
