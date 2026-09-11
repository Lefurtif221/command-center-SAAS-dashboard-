import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSent(true)
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

        <h1 className="text-2xl font-semibold tracking-tight mb-2">Mot de passe oublié</h1>
        <p className="text-sm text-muted mb-8">Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>

        {sent ? (
          <div className="bg-surface border border-border rounded-lg p-6 text-center">
            <span className="iconify text-success mx-auto mb-3 block" data-icon="lucide:mail-check" data-width="40"></span>
            <h3 className="text-sm font-medium mb-2">Email envoyé !</h3>
            <p className="text-xs text-muted mb-4">Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.</p>
            <button onClick={() => navigate('/auth')} className="px-4 py-2 bg-accent text-bg text-sm font-medium rounded-lg hover:bg-[#33c2ff] transition-colors">
              Retour à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-6">
            {error && <div className="mb-4 p-3 bg-accentSec/10 border border-accentSec/30 rounded-lg text-accentSec text-sm">{error}</div>}
            <div className="mb-4">
              <label className="block text-xs text-muted mb-1.5">Email</label>
              <input type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors" required autoFocus />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-accent text-bg hover:bg-[#33c2ff] font-semibold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50">
              {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
