import { useEffect, useState } from 'react'
import { Bell, X, ArrowRight, Loader2 } from 'lucide-react'
import { subscribeToPush, isPushSupported } from '../../utils/push'

const FLAG = 'pp_push_prompt'
const MAX_TRIES = 120

export default function PushPrompt() {
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isPushSupported() || localStorage.getItem(FLAG)) return
    if (typeof Notification !== 'undefined' && Notification.permission !== 'default') return
    let alive = true
    let timer
    let tries = 0
    const ready = () =>
      !!localStorage.getItem('personalplace_onboarding_seen') &&
      !localStorage.getItem('pp_promo_gmail')
    const poll = () => {
      if (!alive) return
      if (ready()) {
        // après le toast d'installation (14s) pour ne pas les superposer
        timer = setTimeout(() => { if (alive) setShow(true) }, 20000)
        return
      }
      tries += 1
      if (tries < MAX_TRIES) timer = setTimeout(poll, 700)
    }
    poll()
    return () => { alive = false; clearTimeout(timer) }
  }, [])

  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => setShow(false), 16000)
    return () => clearTimeout(t)
  }, [show])

  const dismiss = () => {
    localStorage.setItem(FLAG, String(Date.now()))
    setShow(false)
  }

  const activate = async () => {
    if (loading) return
    setLoading(true)
    setError('')
    try {
      await subscribeToPush()
      localStorage.setItem(FLAG, String(Date.now()))
      setShow(false)
    } catch (err) {
      setError(err.message || 'Activation impossible')
      if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
        localStorage.setItem(FLAG, String(Date.now()))
        setShow(false)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="fixed z-[60] top-16 left-3 right-3 md:top-4 md:left-auto md:right-4 md:w-80 animate-toast-in rounded-2xl p-4 shadow-2xl"
      style={{ background: 'var(--color-surface-solid)', border: '1px solid rgba(16,185,129,0.35)' }}>
      <div className="absolute top-0 left-0 w-full h-[2px] rounded-t-2xl" style={{ background: '#10B981' }} />
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
          <Bell size={16} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold mb-0.5">Rester au courant</p>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Retards, tâches du jour, rappels calendrier et messages d’équipe — directement en notification.
          </p>
          <button onClick={activate} disabled={loading}
            className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium transition-colors disabled:opacity-60"
            style={{ color: '#10B981' }}>
            {loading ? <Loader2 size={12} className="animate-spin" /> : null}
            {loading ? 'Activation…' : <>Activer <ArrowRight size={12} /></>}
          </button>
          {error && <p className="text-[10px] mt-1" style={{ color: '#EF4444' }}>{error}</p>}
        </div>
        <button onClick={dismiss} aria-label="Ne plus afficher"
          className="p-1 shrink-0 rounded-lg transition-colors" style={{ color: 'var(--color-muted)' }}>
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
