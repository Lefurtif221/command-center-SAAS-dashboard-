import { X, Bell, Smartphone } from 'lucide-react'
import { INSTALL_STEPS, NOTIF_NOTE, detectPlatform } from '../../data/installSteps'

export default function InstallGuide({ open, onClose }) {
  if (!open) return null
  const cfg = INSTALL_STEPS[detectPlatform()]

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-5 shadow-2xl animate-scale-in" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB' }}>
            <Smartphone size={18} />
          </span>
          <button onClick={onClose} aria-label="Fermer" className="p-1 rounded-lg transition-colors" style={{ color: 'var(--color-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <h4 className="text-base font-display font-semibold mb-1.5">Ajoute Personal Place à ton écran d’accueil</h4>
        <p className="text-[12px] leading-relaxed mb-4" style={{ color: 'var(--color-muted)' }}>
          Sur <strong style={{ color: 'var(--color-text)' }}>{cfg.label}</strong> — avec <strong style={{ color: 'var(--color-text)' }}>{cfg.how}</strong>, {cfg.steps.length} gestes et c’est installé.
        </p>

        <div className="space-y-2 mb-4">
          {cfg.steps.map((s, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-xl p-2.5"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <span className="w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-semibold mt-px"
                style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB' }}>
                {i + 1}
              </span>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>{s}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-3 flex items-start gap-2 mb-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <Bell size={13} className="shrink-0 mt-0.5" style={{ color: '#F59E0B' }} />
          <p className="text-[10px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>{NOTIF_NOTE}</p>
        </div>

        <button onClick={onClose}
          className="w-full px-4 py-2.5 rounded-xl text-xs font-medium transition-colors"
          style={{ background: '#2563EB', color: '#FFF' }}>
          Compris
        </button>
      </div>
    </div>
  )
}
