import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { apiFetch } from '../utils/api'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setSent(true)
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

        <h1 className="text-2xl font-display font-semibold tracking-tight mb-2">Mot de passe oublie</h1>
        <p className="text-sm text-muted mb-8 leading-relaxed">Entrez votre email et nous vous enverrons un lien pour reinitialiser votre mot de passe.</p>

        {sent ? (
          <div className="p-6 text-center rounded-xl" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
            <MailCheck size={36} className="text-success mx-auto mb-3 block" />
            <h3 className="text-sm font-display font-medium mb-2">Email envoye !</h3>
            <p className="text-xs text-muted mb-4 leading-relaxed">Verifiez votre boite de reception et cliquez sur le lien pour reinitialiser votre mot de passe.</p>
            <button onClick={() => navigate('/auth')} className="px-4 py-2.5 text-sm font-medium rounded-lg transition-colors" style={{ background: '#2563EB', color: '#FFF' }}>
              Retour a la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 rounded-xl" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
            {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>{error}</div>}
            <div className="mb-4">
              <label className="block text-xs mb-1.5" style={{ color: 'var(--color-muted)' }}>Email</label>
              <input type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-[#2563EB] transition-colors duration-150" style={inputStyle} required autoFocus />
            </div>
            <button type="submit" disabled={loading} className="w-full font-medium text-sm py-2.5 rounded-lg transition-colors duration-150 disabled:opacity-50" style={{ background: '#2563EB', color: '#FFF' }}>
              {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
