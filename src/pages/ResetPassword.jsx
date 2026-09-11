import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

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
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/auth')} className="flex items-center gap-2 text-muted hover:text-text transition-colors text-sm mb-8">
          <span className="iconify" data-icon="lucide:arrow-left" data-width="16"></span><span>Retour</span>
        </button>

        <div className="flex items-center gap-2 mb-8">
          <span className="iconify text-accent" data-icon="lucide:zap" data-width="20"></span>
          <span className="font-medium tracking-tight text-sm">Personal Place</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight mb-2">Nouveau mot de passe</h1>
        <p className="text-sm text-muted mb-8">Choisissez un nouveau mot de passe pour votre compte.</p>

        {success ? (
          <div className="bg-surface border border-border rounded-lg p-6 text-center">
            <span className="iconify text-success mx-auto mb-3 block" data-icon="lucide:check-circle" data-width="40"></span>
            <h3 className="text-sm font-medium mb-2">Mot de passe réinitialisé !</h3>
            <p className="text-xs text-muted mb-4">Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter.</p>
            <button onClick={() => navigate('/auth')} className="px-4 py-2 bg-accent text-bg text-sm font-medium rounded-lg hover:bg-[#33c2ff] transition-colors">
              Se connecter
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-6">
            {error && <div className="mb-4 p-3 bg-accentSec/10 border border-accentSec/30 rounded-lg text-accentSec text-sm">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1.5">Nouveau mot de passe</label>
                <input type="password" placeholder="8 caractères minimum" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors" required autoFocus />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1.5">Confirmer</label>
                <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full mt-4 bg-accent text-bg hover:bg-[#33c2ff] font-semibold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50">
              {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
