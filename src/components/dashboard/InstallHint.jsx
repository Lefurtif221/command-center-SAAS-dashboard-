import { useEffect, useState } from 'react'
import { Smartphone, X, ArrowRight } from 'lucide-react'
import InstallGuide from './InstallGuide'

const FLAG = 'pp_install_hint'
const MAX_TRIES = 120

function isInstalled() {
  try {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true
  } catch { /* matchMedia indisponible */ }
  if (window.navigator.standalone === true) return true
  return false
}

export default function InstallHint() {
  const [show, setShow] = useState(false)
  const [guide, setGuide] = useState(false)

  useEffect(() => {
    if (isInstalled() || localStorage.getItem(FLAG)) return
    let alive = true
    let timer
    let tries = 0
    const ready = () =>
      !!localStorage.getItem('personalplace_onboarding_seen') &&
      !localStorage.getItem('pp_promo_gmail')
    const poll = () => {
      if (!alive) return
      if (ready()) {
        timer = setTimeout(() => { if (alive) setShow(true) }, 1200)
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
    const t = setTimeout(() => setShow(false), 14000)
    return () => clearTimeout(t)
  }, [show])

  const dismiss = () => {
    localStorage.setItem(FLAG, String(Date.now()))
    setShow(false)
  }

  const openGuide = () => {
    localStorage.setItem(FLAG, String(Date.now()))
    setShow(false)
    setGuide(true)
  }

  return (
    <>
      {show && (
        <div className="fixed z-[60] top-16 left-3 right-3 md:top-4 md:left-auto md:right-4 md:w-80 animate-toast-in rounded-2xl p-4 shadow-2xl"
          style={{ background: 'var(--color-surface-solid)', border: '1px solid rgba(37,99,235,0.35)' }}>
          <div className="absolute top-0 left-0 w-full h-[2px] rounded-t-2xl" style={{ background: '#2563EB' }} />
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB' }}>
              <Smartphone size={16} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold mb-0.5">Ajoute-le à ton écran d’accueil</p>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                Personal Place s’ouvre comme une app : plein écran, icône dédiée.
              </p>
              <button onClick={openGuide}
                className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium transition-colors"
                style={{ color: '#2563EB' }}>
                Voir comment <ArrowRight size={12} />
              </button>
            </div>
            <button onClick={dismiss} aria-label="Ne plus afficher"
              className="p-1 shrink-0 rounded-lg transition-colors" style={{ color: 'var(--color-muted)' }}>
              <X size={14} />
            </button>
          </div>
        </div>
      )}
      <InstallGuide open={guide} onClose={() => setGuide(false)} />
    </>
  )
}
