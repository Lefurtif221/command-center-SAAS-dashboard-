import { useState, useEffect } from 'react'
import { Inbox, RefreshCw, Bug, Lightbulb, MessageSquare } from 'lucide-react'
import { apiFetch } from '../../utils/api'

const CATEGORY_META = {
  bug: { label: 'Bug', icon: Bug, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  idea: { label: 'Idee', icon: Lightbulb, color: '#2563EB', bg: 'rgba(37,99,235,0.1)' },
  other: { label: 'Autre', icon: MessageSquare, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
}

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const data = await apiFetch('/api/feedback')
      setFeedbacks(data.feedbacks || [])
      setError('')
    } catch (err) {
      setError(err.message || 'Chargement impossible')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="rounded-xl overflow-hidden page-enter" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center gap-2 p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Inbox size={14} style={{ color: '#2563EB' }} />
        <h3 className="text-sm font-display font-medium">Retours utilisateurs</h3>
        {feedbacks && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium ml-1"
            style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>
            {feedbacks.length}
          </span>
        )}
        <button onClick={() => { setLoading(true); load() }} disabled={loading}
          className="ml-auto p-1.5 rounded-lg transition-colors duration-150 disabled:opacity-50"
          style={{ color: 'var(--color-muted)' }}
          aria-label="Recharger">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="p-4 md:p-5">
        {error && (
          <div className="px-3 py-2.5 rounded-lg text-xs mb-3"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B' }}>
            {error}
            <button onClick={() => { setLoading(true); load() }} className="ml-2 underline underline-offset-2 font-medium">Reessayer</button>
          </div>
        )}

        {loading && !feedbacks && (
          <div className="space-y-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--color-bg)' }} />
            ))}
          </div>
        )}

        {feedbacks && feedbacks.length === 0 && (
          <div className="py-10 text-center">
            <Inbox size={30} style={{ color: 'var(--color-muted)' }} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Aucun retour pour le moment</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Les retours des utilisateurs apparaitront ici.</p>
          </div>
        )}

        {feedbacks && feedbacks.length > 0 && (
          <div className="space-y-2.5">
            {feedbacks.map((f) => {
              const meta = CATEGORY_META[f.category] || CATEGORY_META.other
              const Icon = meta.icon
              return (
                <div key={f.id} className="rounded-xl p-3.5 transition-colors duration-150"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: meta.bg, color: meta.color }}>
                      <Icon size={10} /> {meta.label}
                    </span>
                    <span className="text-[11px] font-medium" style={{ color: 'var(--color-text)' }}>{f.name || 'Utilisateur'}</span>
                    <span className="text-[10px] truncate" style={{ color: 'var(--color-muted)' }}>{f.email}</span>
                    <span className="text-[10px] ml-auto shrink-0" style={{ color: 'var(--color-muted)' }}>
                      {f.created_at ? new Date(f.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-text)' }}>{f.message}</p>
                  {f.page && (
                    <p className="text-[10px] mt-1.5" style={{ color: 'var(--color-muted)' }}>Page : {f.page}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
