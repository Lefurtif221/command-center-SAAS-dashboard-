import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle } from 'lucide-react'
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
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caracteres'); return }
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

  const inputStyle = { background: 'var(--color-bg)', border: '1px solid var(--color-border)' }

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/auth')} className="flex items-center gap-2 text-muted hover:text-text transition-colors text-sm mb-8">
          <ArrowLeft size={16} /><span>Retour</span>
        </button>

        <div className="flex items-center gap-2.5 mb-8">
          <img src="/logo.png" alt="Personal Place" className="w-7 h-7 rounded-lg" />
          <span className="font-display font-semibold tracking-tight text-sm">Personal Place</span>
        </div>

        <h1 className="text-2xl font-display font-semibold tracking-tight mb-2">Nouveau mot de passe</h1>
        <p className="text-sm text-muted mb-8 leading-relaxed">Choisissez un nouveau mot de passe pour votre compte.</p>

        {success ? (
          <div className="p-6 text-center rounded-xl" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
            <CheckCircle size={36} className="text-success mx-auto mb-3 block" />
            <h3 className="text-sm font-display font-medium mb-2">Mot de passe reinitialise !</h3>
            <p className="text-xs text-muted mb-4 leading-relaxed">Votre mot de passe a ete mis a jour. Vous pouvez maintenant vous connecter.</p>
            <button onClick={() => navigate('/auth')} className="px-4 py-2.5 text-sm font-medium rounded-lg transition-colors" style={{ background: '#2563EB', color: '#FFF' }}>
              Se connecter
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 rounded-xl" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
            {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--color-muted)' }}>Nouveau mot de passe</label>
                <input type="password" placeholder="8 caracteres minimum" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#2563EB] transition-colors duration-150" style={inputStyle} required autoFocus />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--color-muted)' }}>Confirmer</label>
                <input type="password" placeholder="********" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#2563EB] transition-colors duration-150" style={inputStyle} required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full mt-4 font-medium text-sm py-2.5 rounded-lg transition-colors duration-150 disabled:opacity-50" style={{ background: '#2563EB', color: '#FFF' }}>
              {loading ? 'Reinitialisation...' : 'Reinitialiser le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
