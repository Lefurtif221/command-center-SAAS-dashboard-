import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ArrowLeft, Mail, Lock, Timer, Eye, EyeOff } from 'lucide-react'

export default function AuthPage() {
  const navigate = useNavigate()
  const { login, signup, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
    if (signupForm.password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caracteres'); return }
    setLoading(true)
    try { await signup(signupForm.name, signupForm.email, signupForm.password); navigate('/dashboard') }
    catch (err) { setError(err.message || 'Une erreur est survenue') }
    finally { setLoading(false) }
  }

  const inputStyle = { background: 'var(--color-bg)', border: '1px solid var(--color-border)' }
  const inputFocus = 'focus:outline-none focus:border-[#2563EB] transition-colors duration-150'

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative" style={{ background: 'var(--color-surface-solid)', borderRight: '1px solid var(--color-border)' }}>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <button onClick={() => navigate('/')} className="absolute top-8 left-8 flex items-center gap-2 text-muted hover:text-text transition-colors text-sm">
            <ArrowLeft size={16} /><span>Retour</span>
          </button>
          <div className="flex items-center gap-2.5 mb-12">
            <img src="/logo.png" alt="Personal Place" className="w-8 h-8 rounded-lg" />
            <span className="font-display font-semibold tracking-tight text-lg">Personal Place</span>
          </div>
          <h1 className="text-3xl font-display font-semibold tracking-tighter-custom mb-5 leading-[1.1]">
            Bienvenue sur<br /><span style={{ color: '#2563EB' }}>ton espace productif</span>
          </h1>
          <p className="text-muted mb-8 leading-relaxed max-w-sm">Emails, messages, taches et calendrier dans un seul dashboard.</p>
          <div className="space-y-3">
            {[
              { icon: Mail, title: 'Emails filtres', sub: 'Les importants en premier' },
              { icon: Lock, title: 'Donnees securisees', sub: 'JWT + HTTPS partout' },
              { icon: Timer, title: 'Pomodoro', sub: 'Timer configurable' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <item.icon size={18} style={{ color: '#2563EB' }} className="shrink-0" />
                <div>
                  <p className="font-display font-medium text-sm">{item.title}</p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{item.sub}</p>
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
            <img src="/logo.png" alt="Personal Place" className="w-7 h-7 rounded-lg" />
            <span className="font-display font-semibold tracking-tight text-sm">Personal Place</span>
          </div>
          <div className="flex gap-1 p-1 rounded-xl mb-8" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <button onClick={() => { setActiveTab('login'); setError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${activeTab === 'login' ? '' : 'text-muted hover:text-text'}`}
              style={activeTab === 'login' ? { background: 'var(--color-surface-solid)', color: '#2563EB', border: '1px solid var(--color-border)' } : {}}>
              Connexion
            </button>
            <button onClick={() => { setActiveTab('signup'); setError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${activeTab === 'signup' ? '' : 'text-muted hover:text-text'}`}
              style={activeTab === 'signup' ? { background: 'var(--color-surface-solid)', color: '#2563EB', border: '1px solid var(--color-border)' } : {}}>
              Inscription
            </button>
          </div>
          {error && <div className="mb-6 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>{error}</div>}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--color-muted)' }}>Email</label>
                <input type="email" placeholder="votre@email.com" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-lg text-sm ${inputFocus}`} style={inputStyle} required />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--color-muted)' }}>Mot de passe</label>
                <div className="relative">
                  <input type={showLoginPassword ? 'text' : 'password'} placeholder="********" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className={`w-full px-3 py-2.5 pr-10 rounded-lg text-sm ${inputFocus}`} style={inputStyle} required />
                  <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors">
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2" style={{ color: 'var(--color-muted)' }}><input type="checkbox" defaultChecked /> Se souvenir de moi</label>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/auth/forgot-password') }} style={{ color: '#2563EB' }}>Mot de passe oublie ?</a>
              </div>
              <button type="submit" disabled={loading}
                className="w-full font-medium text-sm py-2.5 rounded-lg transition-colors duration-150 disabled:opacity-50"
                style={{ background: '#2563EB', color: '#FFF' }}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--color-muted)' }}>Nom complet</label>
                <input type="text" placeholder="Ton nom" value={signupForm.name} onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-lg text-sm ${inputFocus}`} style={inputStyle} required />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--color-muted)' }}>Email</label>
                <input type="email" placeholder="votre@email.com" value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-lg text-sm ${inputFocus}`} style={inputStyle} required />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--color-muted)' }}>Mot de passe</label>
                <div className="relative">
                  <input type={showSignupPassword ? 'text' : 'password'} placeholder="8 caracteres minimum" value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    className={`w-full px-3 py-2.5 pr-10 rounded-lg text-sm ${inputFocus}`} style={inputStyle} required />
                  <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors">
                    {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--color-muted)' }}>Confirmer</label>
                <div className="relative">
                  <input type={showConfirmPassword ? 'text' : 'password'} placeholder="********" value={signupForm.confirmPassword} onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    className={`w-full px-3 py-2.5 pr-10 rounded-lg text-sm ${inputFocus}`} style={inputStyle} required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <input type="checkbox" required className="mt-0.5" />
                <span style={{ color: 'var(--color-muted)' }}>J'accepte les <a href="#" style={{ color: '#2563EB' }}>conditions</a></span>
              </div>
              <button type="submit" disabled={loading}
                className="w-full font-medium text-sm py-2.5 rounded-lg transition-colors duration-150 disabled:opacity-50"
                style={{ background: '#2563EB', color: '#FFF' }}>
                {loading ? 'Creation...' : 'Creer mon compte'}
              </button>
            </form>
          )}
          <p className="mt-6 text-center text-xs" style={{ color: 'var(--color-muted)' }}>
            {activeTab === 'login' ? <>Pas encore de compte ? <button onClick={() => setActiveTab('signup')} style={{ color: '#2563EB' }}>Creer un compte</button></> : <>Deja un compte ? <button onClick={() => setActiveTab('login')} style={{ color: '#2563EB' }}>Se connecter</button></>}
          </p>
        </div>
      </div>
    </div>
  )
}
