import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send } from 'lucide-react'
import { apiFetch } from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'

const hhmm = (iso) => {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function TeamChat({ teamId }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    setMessages([])
    setError('')
    if (!teamId) return undefined
    let alive = true
    const load = async () => {
      try {
        const data = await apiFetch(`/api/teams/${teamId}/messages`)
        if (alive) setMessages(data.messages)
      } catch { /* poll silencieux : on garde l'historique affiche */ }
    }
    load()
    const timer = setInterval(load, 10000)
    return () => { alive = false; clearInterval(timer) }
  }, [teamId])

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const send = async () => {
    const content = text.trim()
    if (!content || busy || !teamId) return
    setBusy(true); setError('')
    try {
      const data = await apiFetch(`/api/teams/${teamId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      })
      setMessages(m => [...m, data.message])
      setText('')
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const card = {
    background: 'var(--color-surface-solid)',
    border: '1px solid var(--color-border)',
  }
  const inputStyle = { background: 'var(--color-bg)', border: '1px solid var(--color-border)' }

  return (
    <div className="rounded-xl flex flex-col shrink-0" style={{ ...card, height: 'clamp(320px, 46vh, 460px)' }}>
      <div className="flex items-center gap-2 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <MessageCircle size={14} style={{ color: '#2563EB' }} />
        <h3 className="text-sm font-display font-medium">Discussion</h3>
        <span className="text-[10px] ml-auto" style={{ color: 'var(--color-muted)' }}>
          {teamId ? 'Membres de l\'équipe' : 'Aucune équipe'}
        </span>
      </div>

      {!teamId ? (
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            Sélectionnez une équipe pour discuter avec ses membres.
          </p>
        </div>
      ) : (
        <>
          <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
            {messages.length === 0 && (
              <p className="text-[11px] text-center pt-6" style={{ color: 'var(--color-muted)' }}>
                Pas encore de messages. Lancez la discussion.
              </p>
            )}
            {messages.map(m => {
              const mine = m.sender_id === user?.id
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[85%]">
                    {!mine && (
                      <p className="text-[10px] mb-0.5 truncate" style={{ color: 'var(--color-muted)' }}>{m.name}</p>
                    )}
                    <div
                      className="px-3 py-2 rounded-2xl text-xs whitespace-pre-wrap break-words"
                      style={mine
                        ? { background: '#2563EB', color: '#FFF', borderBottomRightRadius: 6 }
                        : { background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', borderBottomLeftRadius: 6 }}>
                      {m.content}
                    </div>
                    <p className={`text-[9px] mt-0.5 ${mine ? 'text-right' : ''}`} style={{ color: 'var(--color-muted)' }}>
                      {hhmm(m.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {error && (
            <p className="px-3 pb-1 text-[10px]" style={{ color: '#EF4444' }}>{error}</p>
          )}

          <div className="flex items-center gap-2 p-2.5 shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Votre message..."
              maxLength={2000}
              className="flex-1 px-3 py-2 rounded-lg text-xs focus:outline-none"
              style={inputStyle}
            />
            <button
              onClick={send}
              disabled={busy || !text.trim()}
              aria-label="Envoyer le message"
              className="p-2.5 rounded-lg transition-colors duration-150 disabled:opacity-50 shrink-0"
              style={{ background: '#2563EB', color: '#FFF' }}>
              <Send size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
