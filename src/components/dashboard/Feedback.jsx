import { useState } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { MessageSquare, Send, CheckCircle } from 'lucide-react'
import { apiFetch } from '../../utils/api'

const CATEGORIES = [
  { id: 'idea', label: 'Idee', hint: 'Une amelioration, une fonctionnalite' },
  { id: 'bug', label: 'Bug', hint: "Quelque chose ne marche pas" },
  { id: 'other', label: 'Autre', hint: 'Un avis, une question' },
]

export default function Feedback() {
  const { activeSection } = useDashboard()
  const [category, setCategory] = useState('idea')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!message.trim() || sending) return
    setSending(true)
    setError('')
    try {
      await apiFetch('/api/feedback', {
        method: 'POST',
        body: JSON.stringify({ category, message: message.trim(), page: activeSection }),
      })
      setSent(true)
      setMessage('')
    } catch (err) {
      setError(err.message || 'Envoi impossible pour le moment')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-xl overflow-hidden page-enter" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center gap-2 p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <MessageSquare size={14} style={{ color: '#2563EB' }} />
        <h3 className="text-sm font-display font-medium">Retours &amp; suggestions</h3>
      </div>

      <div className="p-4 md:p-6 max-w-2xl">
        {sent ? (
          <div className="py-10 text-center animate-scale-in">
            <CheckCircle size={32} style={{ color: '#10B981' }} className="mx-auto mb-3" />
            <p className="text-sm font-medium">Merci pour ton retour !</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Il est bien enregistre et sera lu attentivement.</p>
            <button onClick={() => setSent(false)}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200"
              style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.2)' }}>
              Envoyer un autre retour
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs mb-2" style={{ color: 'var(--color-muted)' }}>Type de retour</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setCategory(c.id)}
                    className="p-3 rounded-xl text-left transition-all duration-150"
                    style={{
                      background: category === c.id ? 'rgba(37,99,235,0.08)' : 'var(--color-bg)',
                      border: category === c.id ? '1px solid rgba(37,99,235,0.4)' : '1px solid var(--color-border)',
                    }}>
                    <span className="block text-xs font-medium" style={{ color: category === c.id ? '#2563EB' : 'var(--color-text)' }}>{c.label}</span>
                    <span className="block text-[10px] mt-0.5" style={{ color: 'var(--color-muted)' }}>{c.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs mb-2" style={{ color: 'var(--color-muted)' }}>Ton message</label>
              <textarea
                rows={6}
                maxLength={2000}
                placeholder="Decris ce que tu as vu, ce que tu aimerais, ou ton idee..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm resize-none focus:outline-none transition-all duration-200"
                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px]" style={{ color: '#EF4444' }}>{error}</span>
                <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>{message.length}/2000</span>
              </div>
            </div>

            <button onClick={submit} disabled={!message.trim() || sending}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 flex items-center gap-2 disabled:opacity-50"
              style={{ background: '#2563EB', color: '#FFF' }}>
              <Send size={14} />
              {sending ? 'Envoi en cours...' : 'Envoyer le retour'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
