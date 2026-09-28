import { useState, useEffect, useRef } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { Users, X } from 'lucide-react'

export default function InviteToasts() {
  const { invites, setActiveSection } = useDashboard()
  const [toast, setToast] = useState(null)
  const seenRef = useRef(new Set())

  useEffect(() => {
    if (!invites || invites.length === 0) return
    const fresh = invites.filter(i => !seenRef.current.has(i.id))
    invites.forEach(i => seenRef.current.add(i.id))
    if (fresh.length === 0) return

    const inv = fresh[0]
    setToast(inv)
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('Nouvelle invitation', { body: `${inv.team_name} t'invite a rejoindre son equipe` })
      }
    } catch {}
    const t = setTimeout(() => setToast(null), 10000)
    return () => clearTimeout(t)
  }, [invites])

  if (!toast) return null

  return (
    <div className="fixed top-4 right-4 z-[60] w-80 max-w-[calc(100vw-2rem)] animate-toast-in"
      style={{ background: 'var(--color-surface-solid)', border: '1px solid rgba(37,99,235,0.35)', borderRadius: '14px', boxShadow: '0 12px 32px -8px rgba(0,0,0,0.45)' }}>
      <div className="flex items-start gap-3 p-3.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.25)' }}>
          <Users size={16} style={{ color: '#2563EB' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium" style={{ color: '#2563EB' }}>Nouvelle invitation d'equipe</p>
          <p className="text-xs mt-0.5 break-words" style={{ color: 'var(--color-text)' }}>
            «&nbsp;{toast.team_name}&nbsp;» t'invite a rejoindre son equipe.
          </p>
          <div className="flex gap-2 mt-2.5">
            <button onClick={() => { setActiveSection('team'); setToast(null) }}
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors duration-150"
              style={{ background: '#2563EB', color: '#FFF' }}>
              Voir l'invitation
            </button>
            <button onClick={() => setToast(null)}
              className="px-3 py-1.5 rounded-lg text-[11px] transition-colors duration-150"
              style={{ color: 'var(--color-muted)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              Plus tard
            </button>
          </div>
        </div>
        <button onClick={() => setToast(null)} className="p-1 rounded-lg shrink-0" style={{ color: 'var(--color-muted)' }}>
          <X size={14} />
        </button>
      </div>
      <div className="h-0.5" style={{ background: 'linear-gradient(90deg, #2563EB, #10B981)' }} />
    </div>
  )
}
