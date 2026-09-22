import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, MailCheck } from 'lucide-react'
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

        <h1 className="text-2xl font-display font-semibold tracking-tight mb-2">Mot de passe oublié</h1>
        <p className="text-sm text-muted mb-8 leading-relaxed">Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>

        {sent ? (
          <div className="glass-strong noise rounded-2xl p-6 text-center shadow-2xl">
            <MailCheck size={40} className="text-success mx-auto mb-3 block" />
            <h3 className="text-sm font-display font-medium mb-2">Email envoyé !</h3>
            <p className="text-xs text-muted mb-4 leading-relaxed">Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.</p>
            <button onClick={() => navigate('/auth')} className="px-4 py-2.5 bg-accent text-bg text-sm font-medium rounded-xl hover:bg-[#EF4444] transition-all duration-200 shadow-[0_0_20px_-5px_rgba(220,38,38,0.3)]">
              Retour à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-strong noise rounded-2xl p-6 shadow-2xl">
            {error && <div className="mb-4 p-3 bg-accentSec/10 border border-accentSec/20 rounded-xl text-accentSec text-sm">{error}</div>}
            <div className="mb-4">
              <label className="block text-xs text-muted mb-1.5 font-mono">Email</label>
              <input type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 glass rounded-xl text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 focus:shadow-[0_0_12px_-4px_rgba(220,38,38,0.2)] transition-all duration-200" required autoFocus />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-accent text-bg hover:bg-[#EF4444] font-semibold text-sm py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-[0_0_20px_-5px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_-5px_rgba(220,38,38,0.4)]">
              {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
