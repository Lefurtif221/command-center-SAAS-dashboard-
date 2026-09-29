import { useEffect, useState } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { Mail, X, ArrowRight, Filter, ListChecks, Sun } from 'lucide-react'
import { apiFetch } from '../../utils/api'

const FLAG = 'pp_promo_gmail'

export default function GmailPromo() {
  const { services, gmailAccounts } = useDashboard()
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const connected = services.gmail.connected || gmailAccounts.length > 0

  useEffect(() => {
    if (connected) {
      setShow(false)
      localStorage.removeItem(FLAG)
      return
    }
    const flag = Number(localStorage.getItem(FLAG) || 0)
    if (!flag) return
    if (Date.now() - flag > 24 * 3600 * 1000) { localStorage.removeItem(FLAG); return }
    const t = setTimeout(() => setShow(true), 700)
    return () => clearTimeout(t)
  }, [connected])

  if (!show) return null

  const dismiss = () => {
    localStorage.removeItem(FLAG)
    setShow(false)
  }

  const connect = async () => {
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch('/api/services/gmail/authorize')
      if (data.url) window.location.href = data.url
      else setError('Redirection vers Google impossible')
    } catch (err) {
      setError(err.message || 'Connexion impossible pour le moment')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={dismiss}>
      <div className="w-full max-w-md rounded-2xl p-5 shadow-2xl animate-scale-in" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB' }}>
            <Mail size={18} />
          </span>
          <button onClick={dismiss} aria-label="Fermer" className="p-1 rounded-lg transition-colors" style={{ color: 'var(--color-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <h4 className="text-base font-display font-semibold mb-1.5">Connecte ta boîte Gmail</h4>
        <p className="text-[12px] leading-relaxed mb-4" style={{ color: 'var(--color-muted)' }}>
          Deux minutes : tu autorises Google, et tes emails arrivent ici — <strong style={{ color: 'var(--color-text)' }}>triés par priorité</strong> par le filtre intelligent.
        </p>

        <div className="space-y-2 mb-4">
          {[
            { icon: Mail, text: 'Les emails importants remontent en haut, le reste attend' },
            { icon: Filter, text: 'Le filtre intelligent sépare le bruit de l’essentiel' },
            { icon: ListChecks, text: 'Ton focus du jour se nourrit de tes vrais emails' },
          ].map((b, i) => (
            <div key={i} className="flex items-start gap-2.5 text-[12px]">
              <b.icon size={14} className="shrink-0 mt-0.5" style={{ color: '#10B981' }} />
              <span style={{ color: 'var(--color-muted)' }}>{b.text}</span>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-3 flex items-start gap-2 mb-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <Sun size={13} className="shrink-0 mt-0.5" style={{ color: '#F59E0B' }} />
          <p className="text-[10px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Google affichera <strong>« App non vérifiée »</strong> : clique <strong>« Paramètres avancés »</strong> puis <strong>« Aller sur Personal Place »</strong>. C’est normal, l’app est en attente de vérification Google.
          </p>
        </div>

        {error && <p className="text-[11px] mb-3" style={{ color: '#EF4444' }}>{error}</p>}

        <div className="flex gap-2">
          <button onClick={connect} disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: '#2563EB', color: '#FFF' }}>
            {loading ? 'Ouverture de Google...' : 'Connecter Gmail'}
            {!loading && <ArrowRight size={14} />}
          </button>
          <button onClick={dismiss}
            className="px-4 py-2.5 rounded-xl text-xs font-medium transition-colors"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
            Plus tard
          </button>
        </div>
      </div>
    </div>
  )
}
