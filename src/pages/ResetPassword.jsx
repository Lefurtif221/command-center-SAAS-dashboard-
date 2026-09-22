import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Sparkles, CheckCircle } from 'lucide-react'
import { apiFetch } from '../utils/api'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) navigate('/auth')
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); return }
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères'); return }
    setLoading(true)
    try {
      await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      })
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg noise flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/auth')} className="flex items-center gap-2 text-muted hover:text-text transition-colors text-sm mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /><span>Retour</span>
        </button>

        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
            <Sparkles size={14} className="text-accent" />
          </div>
          <span className="font-display font-semibold tracking-tight text-sm">Personal Place</span>
        </div>

        <h1 className="text-2xl font-display font-semibold tracking-tight mb-2">Nouveau mot de passe</h1>
        <p className="text-sm text-muted mb-8 leading-relaxed">Choisissez un nouveau mot de passe pour votre compte.</p>

        {success ? (
          <div className="glass-strong noise rounded-2xl p-6 text-center shadow-2xl">
            <CheckCircle size={40} className="text-success mx-auto mb-3 block" />
            <h3 className="text-sm font-display font-medium mb-2">Mot de passe réinitialisé !</h3>
            <p className="text-xs text-muted mb-4 leading-relaxed">Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter.</p>
            <button onClick={() => navigate('/auth')} className="px-4 py-2.5 bg-accent text-bg text-sm font-medium rounded-xl hover:bg-[#2563EB] transition-all duration-200 shadow-[0_0_20px_-5px_rgba(37,99,235,0.3)]">
              Se connecter
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-strong noise rounded-2xl p-6 shadow-2xl">
            {error && <div className="mb-4 p-3 bg-accentSec/10 border border-accentSec/20 rounded-xl text-accentSec text-sm">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1.5 font-mono">Nouveau mot de passe</label>
                <input type="password" placeholder="8 caractères minimum" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 glass rounded-xl text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 focus:shadow-[0_0_12px_-4px_rgba(37,99,235,0.2)] transition-all duration-200" required autoFocus />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5 font-mono">Confirmer</label>
                <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 glass rounded-xl text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 focus:shadow-[0_0_12px_-4px_rgba(37,99,235,0.2)] transition-all duration-200" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full mt-4 bg-accent text-bg hover:bg-[#2563EB] font-semibold text-sm py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-[0_0_20px_-5px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_-5px_rgba(37,99,235,0.4)]">
              {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
